#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { HomemadeStack } from '../lib/homemade-stack'

const app = new cdk.App()

new HomemadeStack(app, 'HomemadeStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'eu-west-2',
  },
  description: 'Homemade web app — VPC, ECS Fargate, ALB, ECR',
})
