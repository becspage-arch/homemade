import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions'

/**
 * Homemade web stack.
 *
 * Public subnets only (no NAT — saves ~$32/mo). Fargate task is assigned a
 * public IP so it can pull from ECR and reach Neon directly. ALB sits in
 * front and is the only thing exposed publicly.
 *
 * HTTPS: Cloudflare runs in Full (strict) mode. It connects to the ALB over
 * HTTPS:443, presenting a Cloudflare Origin Certificate that was imported
 * into ACM (ARN supplied via the `ORIGIN_CERT_ARN` env var at deploy time).
 *
 * Three deploy stages for the SSL migration (Flexible → Full strict):
 *   Stage 1 (no env): HTTP:80 only, target-group forward. The original
 *     Flexible-mode topology.
 *   Stage 2 (ORIGIN_CERT_ARN set): adds HTTPS:443 listener while KEEPING
 *     HTTP:80 forwarding to the target group. This is the overlap window —
 *     flip Cloudflare from Flexible to Full (strict) during this stage so
 *     CF connects on 443 from then on.
 *   Stage 3 (ORIGIN_CERT_ARN + HTTP_PORT_80_REDIRECT=1): once Cloudflare is
 *     on Full strict, replace the HTTP:80 forward with a 301 → HTTPS:443
 *     redirect. This is the final hardened state. Doing this BEFORE the
 *     Cloudflare flip would cause an infinite redirect loop in Flexible
 *     mode (CF would pass the 301 back to the browser, which would come
 *     back through CF on 443, which proxies to ALB on 80 again).
 */
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} env var is required for cdk deploy. ` +
        `These values land directly in the ECS task definition; an empty ` +
        `value would silently break production. Check .env.credentials.`,
    )
  }
  return value
}

export class HomemadeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ────────────────────────────────────────────────────────────────
    // VPC — public subnets only, no NAT
    // ────────────────────────────────────────────────────────────────
    const vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: 'homemade',
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    })

    // ────────────────────────────────────────────────────────────────
    // ECR — image registry for the web app
    // ────────────────────────────────────────────────────────────────
    const webRepo = new ecr.Repository(this, 'WebRepo', {
      repositoryName: 'homemade/web',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          rulePriority: 1,
          description: 'Keep last 10 tagged images',
          maxImageCount: 10,
          tagStatus: ecr.TagStatus.TAGGED,
          tagPatternList: ['*'],
        },
        {
          rulePriority: 2,
          description: 'Expire untagged images after 7 days',
          maxImageAge: cdk.Duration.days(7),
          tagStatus: ecr.TagStatus.UNTAGGED,
        },
      ],
    })

    // ────────────────────────────────────────────────────────────────
    // Secrets — pulled at container start from Secrets Manager
    // The secrets themselves are created via AWS CLI before first deploy.
    // ────────────────────────────────────────────────────────────────
    const splashSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SplashSecret',
      'homemade/splash-password',
    )
    const databaseSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'DatabaseSecret',
      'homemade/database-url',
    )
    const clerkSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'ClerkSecret',
      'homemade/clerk-secret-key',
    )
    const cloudflareApiTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'CloudflareApiTokenSecret',
      'homemade/cloudflare-api-token',
    )
    const cloudflareAccountIdSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'CloudflareAccountIdSecret',
      'homemade/cloudflare-account-id',
    )
    // Stored under a name that doesn't end in "-secret". The old name
    // `homemade/clerk-webhook-secret` hit an AWS Secrets Manager parser bug:
    // when a secret's name ends in something that looks like a random suffix
    // (e.g. "-secret"), the no-suffix ARN form (which ECS Fargate uses for
    // `valueFrom`) returns ResourceNotFoundException — surfaced upstream as
    // an opaque AccessDeniedException. Renaming to a tail that can't be
    // confused with a suffix fixes the lookup. See BUILD_PROGRESS pre-launch
    // notes for the full debug story.
    const clerkWebhookSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'ClerkWebhookSecret',
      'homemade/clerk-webhook-signing-secret-v2',
    )
    // R2 access credentials. Stored manually in Secrets Manager by Rebecca
    // (Cloudflare dashboard → R2 → Manage R2 API Tokens). Mounted with the
    // same two-step CFN pattern as the Clerk webhook secret: IAM grant lands
    // first, then `MOUNT_R2_SECRETS=1` flips the secrets references on.
    const r2AccessKeyIdSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'R2AccessKeyIdSecret',
      'homemade/r2-access-key-id',
    )
    const r2SecretAccessKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'R2SecretAccessKeySecret',
      'homemade/r2-secret-access-key',
    )

    // The Clerk webhook signing secret is wired in two deploys to avoid the
    // CFN circuit breaker race (IAM grant landing in parallel with task
    // replacement → new tasks try to pull the secret before the grant exists).
    // Deploy 1: this stack — adds the explicit IAM grant on the execution
    //           role (see addToExecutionRolePolicy below). No task
    //           replacement, IAM lands cleanly.
    // Deploy 2: flip `MOUNT_CLERK_WEBHOOK_SECRET=1` at deploy time — the
    //           container's `secrets:` block adds the env reference. Task
    //           replacement happens, but IAM is already in place.
    const mountClerkWebhookSecret = process.env.MOUNT_CLERK_WEBHOOK_SECRET === '1'

    // Same two-step pattern for R2:
    // Deploy 1: this stack adds the IAM grant on the execution role.
    // Deploy 2: `MOUNT_R2_SECRETS=1` adds the actual env references.
    const mountR2Secrets = process.env.MOUNT_R2_SECRETS === '1'

    // ────────────────────────────────────────────────────────────────
    // CloudWatch — task logs
    // ────────────────────────────────────────────────────────────────
    const logGroup = new logs.LogGroup(this, 'WebLogs', {
      logGroupName: '/homemade/web',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // ────────────────────────────────────────────────────────────────
    // ECS — cluster + task def + service
    // ────────────────────────────────────────────────────────────────
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'homemade',
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    })

    const taskDef = new ecs.FargateTaskDefinition(this, 'WebTask', {
      family: 'homemade-web',
      memoryLimitMiB: 512,
      cpu: 256,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    })

    // Explicit IAM grant on the Cloudflare + Clerk-webhook secrets. The L2
    // `ecs.Secret.fromSecretsManager` calls below auto-grant the same
    // permissions, but having them spelled out here means a first-time secret
    // addition can be safely landed in two deploys: (1) add the inline grant
    // alone — pure IAM update, no task replacement; (2) add the secret
    // reference to the task definition — IAM grant is already in place, so
    // the ECS deployment circuit breaker doesn't race the policy update.
    //
    // IMPORTANT: the resource pattern must use `-??????` (exactly six chars
    // matching the Secrets Manager random suffix), NOT `-*`. ECS Fargate
    // calls Secrets Manager with the no-suffix ARN form, and IAM matches
    // resource patterns against the *canonical* suffixed ARN. The `-*` form
    // failed to grant access in testing even though it should be a superset
    // — only the `-??????` form actually works. This matches CDK's L2 auto-
    // generated grant pattern.
    taskDef.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `${cloudflareApiTokenSecret.secretArn}-??????`,
          `${cloudflareAccountIdSecret.secretArn}-??????`,
          `${clerkWebhookSecret.secretArn}-??????`,
          `${r2AccessKeyIdSecret.secretArn}-??????`,
          `${r2SecretAccessKeySecret.secretArn}-??????`,
        ],
      }),
    )

    taskDef.addContainer('web', {
      containerName: 'web',
      image: ecs.ContainerImage.fromEcrRepository(webRepo, 'latest'),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'web', logGroup }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requireEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
        // Legacy Cloudflare Images delivery hash. Required for any pre-R2
        // Media rows still in the database; new uploads use R2 + Image
        // Transformations and ignore this value.
        CLOUDFLARE_IMAGES_DELIVERY_HASH: requireEnv('CLOUDFLARE_IMAGES_DELIVERY_HASH'),
        // R2 bucket configuration. Public delivery URL is the custom domain
        // attached to the R2 bucket; transform origin is the zone Cloudflare
        // serves /cdn-cgi/image/ from. Defaults match the production setup
        // so they're safe to omit, but pinning them keeps the prod task
        // definition explicit.
        R2_BUCKET: 'homemade-media',
        R2_PUBLIC_BASE_URL: 'https://media.homemade.education',
        CDN_IMAGE_TRANSFORM_ORIGIN: 'https://homemade.education',
      },
      secrets: {
        SPLASH_PASSWORD: ecs.Secret.fromSecretsManager(splashSecret),
        DATABASE_URL: ecs.Secret.fromSecretsManager(databaseSecret),
        CLERK_SECRET_KEY: ecs.Secret.fromSecretsManager(clerkSecret),
        CLOUDFLARE_API_TOKEN: ecs.Secret.fromSecretsManager(cloudflareApiTokenSecret),
        CLOUDFLARE_ACCOUNT_ID: ecs.Secret.fromSecretsManager(cloudflareAccountIdSecret),
        ...(mountClerkWebhookSecret
          ? { CLERK_WEBHOOK_SIGNING_SECRET: ecs.Secret.fromSecretsManager(clerkWebhookSecret) }
          : {}),
        ...(mountR2Secrets
          ? {
              R2_ACCESS_KEY_ID: ecs.Secret.fromSecretsManager(r2AccessKeyIdSecret),
              R2_SECRET_ACCESS_KEY: ecs.Secret.fromSecretsManager(r2SecretAccessKeySecret),
            }
          : {}),
      },
      portMappings: [{ containerPort: 3000, protocol: ecs.Protocol.TCP }],
      essential: true,
      healthCheck: {
        command: ['CMD-SHELL', 'wget -qO- http://127.0.0.1:3000/healthz || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    })

    // Desired count is env-controllable so the very first `cdk deploy` can run
    // with 0 tasks (infra-only), then we push an image to ECR and scale up.
    const desiredCount = process.env.WEB_DESIRED_COUNT
      ? parseInt(process.env.WEB_DESIRED_COUNT, 10)
      : 1

    const service = new ecs.FargateService(this, 'WebService', {
      serviceName: 'homemade-web',
      cluster,
      taskDefinition: taskDef,
      desiredCount,
      assignPublicIp: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      circuitBreaker: { rollback: true },
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
    })

    // ────────────────────────────────────────────────────────────────
    // ALB — HTTPS:443 with Cloudflare Origin Cert, HTTP:80 → HTTPS redirect.
    //
    // The cert is imported into ACM separately (Cloudflare Origin Certs can't
    // go through ACM's automatic validation). Pass the imported cert's ARN at
    // deploy time via `ORIGIN_CERT_ARN`. If unset, the stack falls back to
    // HTTP-only — useful for re-bootstrapping or rolling back.
    // ────────────────────────────────────────────────────────────────
    const alb = new elbv2.ApplicationLoadBalancer(this, 'WebAlb', {
      loadBalancerName: 'homemade-web',
      vpc,
      internetFacing: true,
    })

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'WebTargetGroup', {
      targetGroupName: 'homemade-web',
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/healthz',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(15),
    })
    // The existing target group in CFN was nested under the old HttpListener
    // construct path; preserve its logical ID so this refactor doesn't trigger
    // a replacement (which would fail on name collision since the target
    // group's name is fixed to "homemade-web").
    ;(targetGroup.node.defaultChild as cdk.CfnResource).overrideLogicalId(
      'WebAlbHttpListenerWebTargetsGroupFC6895C7',
    )
    targetGroup.addTarget(service)

    const originCertArn = process.env.ORIGIN_CERT_ARN
    const httpPort80Redirect = process.env.HTTP_PORT_80_REDIRECT === '1'

    if (originCertArn) {
      const originCert = acm.Certificate.fromCertificateArn(
        this,
        'OriginCert',
        originCertArn,
      )

      alb.addListener('HttpsListener', {
        port: 443,
        protocol: elbv2.ApplicationProtocol.HTTPS,
        certificates: [originCert],
        defaultTargetGroups: [targetGroup],
        open: true,
      })
    }

    // HTTP:80 listener — defined under the original `HttpListener` construct
    // ID so CFN updates the existing port-80 listener in place rather than
    // destroying + recreating it. Default action depends on stage:
    //   - Stage 1/2: forward to target group (keep site reachable, especially
    //     while Cloudflare is still in Flexible mode and is the one hitting
    //     port 80).
    //   - Stage 3: redirect to HTTPS:443 (Cloudflare is on Full strict now,
    //     so it never hits port 80; this catches stray direct-ALB requests).
    alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: true,
      ...(originCertArn && httpPort80Redirect
        ? {
            defaultAction: elbv2.ListenerAction.redirect({
              protocol: 'HTTPS',
              port: '443',
              permanent: true,
            }),
          }
        : {
            defaultTargetGroups: [targetGroup],
          }),
    })

    // ────────────────────────────────────────────────────────────────
    // Alarms — SNS topic with email subscription, three CloudWatch alarms.
    //
    // Goal: SOMETHING wakes someone when the site is down. Thresholds are
    // intentionally conservative and can be tuned once we have real traffic.
    // ────────────────────────────────────────────────────────────────
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: 'homemade-alarms',
      displayName: 'Homemade alarms',
    })
    alarmTopic.addSubscription(
      new snsSubscriptions.EmailSubscription('rebecca@homemade.education'),
    )
    cdk.Tags.of(alarmTopic).add('Project', 'Homemade')

    const alarmAction = new cloudwatchActions.SnsAction(alarmTopic)

    const elb5xxAlarm = new cloudwatch.Alarm(this, 'Alb5xxAlarm', {
      alarmName: 'homemade-web-alb-5xx',
      alarmDescription:
        'ALB-originated 5xx responses (target-side OR ALB-side) over 5 in any 5-minute window.',
      metric: new cloudwatch.MathExpression({
        expression: 'elb5xx + target5xx',
        usingMetrics: {
          elb5xx: new cloudwatch.Metric({
            namespace: 'AWS/ApplicationELB',
            metricName: 'HTTPCode_ELB_5XX_Count',
            dimensionsMap: { LoadBalancer: alb.loadBalancerFullName },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
          target5xx: new cloudwatch.Metric({
            namespace: 'AWS/ApplicationELB',
            metricName: 'HTTPCode_Target_5XX_Count',
            dimensionsMap: { LoadBalancer: alb.loadBalancerFullName },
            statistic: 'Sum',
            period: cdk.Duration.minutes(1),
          }),
        },
        period: cdk.Duration.minutes(1),
      }),
      threshold: 5,
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    })
    elb5xxAlarm.addAlarmAction(alarmAction)
    cdk.Tags.of(elb5xxAlarm).add('Project', 'Homemade')

    const unhealthyTargetAlarm = new cloudwatch.Alarm(this, 'TargetUnhealthyAlarm', {
      alarmName: 'homemade-web-targets-unhealthy',
      alarmDescription: 'Healthy host count on the target group dropped below 1.',
      metric: targetGroup.metrics.healthyHostCount({
        period: cdk.Duration.minutes(1),
        statistic: 'Minimum',
      }),
      threshold: 1,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    })
    unhealthyTargetAlarm.addAlarmAction(alarmAction)
    cdk.Tags.of(unhealthyTargetAlarm).add('Project', 'Homemade')

    const runningTaskCountAlarm = new cloudwatch.Alarm(this, 'EcsRunningTaskAlarm', {
      alarmName: 'homemade-web-running-task-count',
      alarmDescription:
        'ECS service is running fewer tasks than desired for 5 consecutive minutes.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ECS',
        metricName: 'RunningTaskCount',
        dimensionsMap: {
          ClusterName: cluster.clusterName,
          ServiceName: service.serviceName,
        },
        statistic: 'Minimum',
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1,
      evaluationPeriods: 5,
      datapointsToAlarm: 5,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    })
    runningTaskCountAlarm.addAlarmAction(alarmAction)
    cdk.Tags.of(runningTaskCountAlarm).add('Project', 'Homemade')

    // ────────────────────────────────────────────────────────────────
    // Outputs
    // ────────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'Point Cloudflare DNS at this',
      exportName: 'HomemadeAlbDnsName',
    })
    new cdk.CfnOutput(this, 'EcrRepoUri', {
      value: webRepo.repositoryUri,
      description: 'Push images here',
      exportName: 'HomemadeEcrRepoUri',
    })
    new cdk.CfnOutput(this, 'ClusterName', { value: cluster.clusterName })
    new cdk.CfnOutput(this, 'ServiceName', { value: service.serviceName })
    new cdk.CfnOutput(this, 'LogGroupName', { value: logGroup.logGroupName })
    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS topic for site-up alarms',
      exportName: 'HomemadeAlarmTopicArn',
    })
  }
}
