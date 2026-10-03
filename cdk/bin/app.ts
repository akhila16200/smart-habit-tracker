#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SmartHabitTrackerStack } from '../lib/smart-habit-tracker-stack';

const app = new cdk.App();
new SmartHabitTrackerStack(app, 'SmartHabitTrackerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID || '702828430021',
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  description: 'Smart Habit & Micro-Goal Accountability Tracker Stack for AWS Hackathon',
});
