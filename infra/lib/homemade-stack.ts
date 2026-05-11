import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'

/**
 * Homemade web stack.
 *
 * Public subnets only (no NAT — saves ~$32/mo). Fargate task is assigned a
 * public IP so it can pull from ECR and reach Neon directly. ALB sits in
 * front and is the only thing exposed publicly.
 *
 * HTTPS is terminated at Cloudflare for now. ALB listens on plain port 80.
 * Cloudflare proxies homemade.education to the ALB. Upgrade to "Full (strict)"
 * SSL with a Cloudflare Origin Certificate before launch.
 */
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

    // The Clerk webhook signing secret exists in Secrets Manager (as
    // `homemade/clerk-webhook-secret`) but is intentionally NOT referenced in
    // the task definition until the webhook endpoint is wired up in Clerk's
    // dashboard. Adding it as an ECS secret reference triggered the deployment
    // circuit breaker because CFN updates the IAM policy in parallel with the
    // task replacement, and new tasks could start trying to pull the secret
    // before the IAM grant had landed. When you're ready to enable the
    // webhook, put the real signing value into the existing secret and
    // re-add the reference here in a follow-up deploy.

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

    // Explicit IAM grant on the Cloudflare secrets. The `ecs.Secret.from...`
    // calls below auto-grant the same permissions, but having them spelled
    // out here means a future first-time secret addition can be safely landed
    // in two deploys: (1) add the inline grant alone — pure IAM update, no
    // task replacement; (2) add the secret reference to the task definition
    // — IAM grant is already in place, so the ECS deployment circuit breaker
    // doesn't race the policy update. See Phase 2d note above and Phase 2e in
    // BUILD_PROGRESS.md.
    taskDef.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          cloudflareApiTokenSecret.secretArn,
          `${cloudflareApiTokenSecret.secretArn}-*`,
          cloudflareAccountIdSecret.secretArn,
          `${cloudflareAccountIdSecret.secretArn}-*`,
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
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
        CLOUDFLARE_IMAGES_DELIVERY_HASH:
          process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH ?? '',
      },
      secrets: {
        SPLASH_PASSWORD: ecs.Secret.fromSecretsManager(splashSecret),
        DATABASE_URL: ecs.Secret.fromSecretsManager(databaseSecret),
        CLERK_SECRET_KEY: ecs.Secret.fromSecretsManager(clerkSecret),
        CLOUDFLARE_API_TOKEN: ecs.Secret.fromSecretsManager(cloudflareApiTokenSecret),
        CLOUDFLARE_ACCOUNT_ID: ecs.Secret.fromSecretsManager(cloudflareAccountIdSecret),
        // CLERK_WEBHOOK_SIGNING_SECRET intentionally omitted (see above)
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
    // ALB — public, HTTP only (Cloudflare in front for HTTPS)
    // ────────────────────────────────────────────────────────────────
    const alb = new elbv2.ApplicationLoadBalancer(this, 'WebAlb', {
      loadBalancerName: 'homemade-web',
      vpc,
      internetFacing: true,
    })

    const listener = alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: true,
    })

    listener.addTargets('WebTargets', {
      targetGroupName: 'homemade-web',
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
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
  }
}
