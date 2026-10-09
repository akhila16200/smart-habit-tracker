# ⚡ Smart Habit & Micro-Goal Accountability Tracker

> **Built for AWS Hackathon** | Serverless Architecture with Amazon DynamoDB, AWS Lambda, API Gateway, CloudFront, & AWS CDK.

A full-stack, responsive habit tracking application that breaks down ambitious goals into actionable daily micro-tasks, calculates active check-in streaks, tracks 30-day consistency heatmaps, and provides AI-powered micro-goal recommendations.

---

## 🌐 Live Demo

👉 **Try the Live Application:** [https://dcmhqyfag1olo.cloudfront.net](https://dcmhqyfag1olo.cloudfront.net)

---

## 🌟 Key Features

- **Micro-Goal Breakdown**: Deconstruct large habits into clear 2-3 minute sub-tasks to eliminate friction.
- **Streak & Momentum Tracking**: Real-time streak calculation algorithm (current vs. peak best streak).
- **Amazon DynamoDB Integration**: Fast, serverless single-table design with AWS SDK v3 (with built-in local fallback mode for instant out-of-the-box local testing).
- **Glassmorphic Modern UI**: Built with React, Vite, glassmorphism, micro-animations, and celebration confetti effects.
- **AI Micro-Goal Auto-Breakdown**: Intelligent assistant suggestion engine for habit sub-tasks.
- **Fitness Tracker Webhook Integration**: Incoming `POST /api/webhook/fitness` metrics auto-evaluate micro-goal thresholds (steps, workouts, hydration) and auto-check in habits to maintain streaks.
- **30-Day Activity Heatmap & Badges**: GitHub-style habit activity matrix and milestone achievement badges.
- **Infrastructure as Code (AWS CDK)**: Complete TypeScript CDK stack to deploy DynamoDB, Lambda, API Gateway, S3, and CloudFront.

---

## 🏗️ Architecture Overview

```
[ Frontend SPA (React + Vite) ]
               │
               ▼  (HTTP / REST API)
[ Amazon API Gateway ]
               │
               ▼
[ AWS Lambda (Node.js + Express API) ]
               │
               ▼
[ Amazon DynamoDB (SmartHabitsTracker Table) ]
```

### AWS Services Used
1. **Amazon DynamoDB**: Key-value single-table design (`PK: USER#<id>`, `SK: HABIT#<id>`) for serverless scale.
2. **AWS Lambda**: Serverless execution of Node.js / Express API via `@vendia/serverless-express`.
3. **Amazon API Gateway**: Public REST API interface routing requests to Lambda.
4. **Amazon S3 & CloudFront**: Global CDN static web hosting for the React SPA.
5. **AWS CDK (TypeScript)**: Complete infrastructure as code definition.

---

## 🚀 Quickstart: Running Locally

You can run the full-stack app locally in a single step!

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Backend & Frontend Concurrently
```bash
npm run dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### ⌚ Fitness Tracker Webhook Integration

Send activity metrics from wearables (Fitbit, Apple Health, Garmin) to auto-fulfill micro-goals & streaks:

```bash
curl -X POST http://localhost:5000/api/webhook/fitness \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER#default",
    "provider": "Fitbit",
    "metrics": {
      "steps": 8500,
      "activeMinutes": 30,
      "workoutsCompleted": 1,
      "waterMl": 1000
    }
  }'
```

> **Note**: The backend automatically runs in **Local Mock Mode** if AWS credentials or a live DynamoDB table are not present, so you can test all features immediately without pre-configuring AWS CLI!

---

## ☁️ Deploying to AWS using AWS CDK

### Prerequisites
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- AWS CDK CLI installed (`npm install -g aws-cdk`)

### Step 1: Build Frontend for Production
```bash
npm run build:frontend
```

### Step 2: Synthesize & Deploy Stack
```bash
# Navigate to cdk folder
cd cdk

# Synthesize CloudFormation template
npm run cdk synth

# Deploy to your AWS account
npm run cdk deploy
```

Upon completion, AWS CDK will output:
- `ApiGatewayUrl`: Endpoint URL for your Express API Lambda.
- `CloudFrontUrl`: Live public URL for your web dashboard.
- `DynamoDBTableName`: Name of your live DynamoDB table (`SmartHabitsTracker`).

---

## 📂 Project Structure

```
Smart Habit Tracker/
├── backend/
│   ├── src/
│   │   ├── config/dynamodb.js        # AWS SDK v3 DynamoDB client & local mock fallback
│   │   ├── controllers/              # Habit CRUD & Analytics controllers
│   │   ├── routes/                   # Express API routes
│   │   ├── services/                 # Habit streak engine & AI micro-goal breakdown
│   │   ├── app.js                    # Express app definition
│   │   ├── lambda.js                 # AWS Lambda adapter
│   │   └── server.js                 # Standalone Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Glassmorphic UI components (Cards, Heatmap, Badges, Stats)
│   │   ├── context/HabitContext.jsx  # React application state & confetti triggers
│   │   ├── services/api.js           # API fetch client
│   │   ├── styles/index.css          # Design system & glassmorphism theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── cdk/
│   ├── bin/app.ts                    # CDK entry point
│   ├── lib/smart-habit-tracker-stack.ts # DynamoDB + Lambda + API Gateway + S3 + CloudFront stack
│   ├── cdk.json
│   └── package.json
├── package.json                      # Root npm scripts
└── README.md
```

---

## 📄 License
MIT - Created for AWS Hackathon.
