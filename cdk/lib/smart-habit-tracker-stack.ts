import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as path from 'path';

export class SmartHabitTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Amazon DynamoDB Table
    const habitTable = new dynamodb.Table(this, 'SmartHabitsTable', {
      tableName: 'SmartHabitsTracker',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Fully Serverless
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Easy cleanup after hackathon testing
    });

    // 2. AWS Lambda Function for Express Backend API
    const apiLambda = new lambda.Function(this, 'HabitTrackerApiFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'src/lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend'), {
        exclude: ['node_modules', '.env']
      }),
      memorySize: 512,
      timeout: cdk.Duration.seconds(15),
      environment: {
        DYNAMODB_TABLE_NAME: habitTable.tableName,
        USE_LOCAL_MOCK: 'false',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    });

    // Grant Lambda permissions to read/write DynamoDB
    habitTable.grantReadWriteData(apiLambda);

    // 3. Amazon API Gateway REST API
    const api = new apigateway.LambdaRestApi(this, 'HabitTrackerApiGateway', {
      handler: apiLambda,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // 4. Amazon S3 Bucket for Frontend Static Web Hosting
    const websiteBucket = new s3.Bucket(this, 'HabitTrackerFrontendBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false, // Secure access via CloudFront OAI
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 5. Amazon CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'HabitTrackerCloudFront', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // SPA Routing fallback
        }
      ]
    });

    // Stack Outputs for Easy Hackathon Demo Verification
    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: habitTable.tableName,
      description: 'DynamoDB Table Name'
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway Endpoint URL'
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Frontend Web App URL'
    });
  }
}
