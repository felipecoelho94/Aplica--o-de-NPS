terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "nps-saas"
}

# Local values
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# DynamoDB Table - Single Table Design
resource "aws_dynamodb_table" "nps_table" {
  name           = "${var.project_name}-table-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name     = "GSI1"
    hash_key = "GSI1PK"
    range_key = "GSI1SK"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  point_in_time_recovery {
    enabled = true
  }

  tags = local.common_tags
}

# S3 Bucket para assets
resource "aws_s3_bucket" "nps_assets" {
  bucket = "${var.project_name}-assets-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = local.common_tags
}

resource "aws_s3_bucket_versioning" "nps_assets" {
  bucket = aws_s3_bucket.nps_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "nps_assets" {
  bucket = aws_s3_bucket.nps_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "nps_assets" {
  bucket = aws_s3_bucket.nps_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT", "DELETE"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}

# SQS Queue para envios
resource "aws_sqs_queue" "send_queue" {
  name                       = "${var.project_name}-send-queue-${var.environment}"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 1209600

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.send_dlq.arn
    maxReceiveCount     = 3
  })

  tags = local.common_tags
}

# Dead Letter Queue
resource "aws_sqs_queue" "send_dlq" {
  name                      = "${var.project_name}-send-dlq-${var.environment}"
  message_retention_seconds = 1209600

  tags = local.common_tags
}

# Cognito User Pool
resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.project_name}-user-pool-${var.environment}"

  username_attributes = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  tags = local.common_tags
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "${var.project_name}-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]

  callback_urls = [
    "http://localhost:3000/auth/callback",
    "https://${var.domain_name}/auth/callback"
  ]

  logout_urls = [
    "http://localhost:3000/auth/logout",
    "https://${var.domain_name}/auth/logout"
  ]

  depends_on = [aws_cognito_user_pool.user_pool]
}

# IAM Role para Lambda API
resource "aws_iam_role" "lambda_api_role" {
  name = "${var.project_name}-lambda-api-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# IAM Policy para Lambda API
resource "aws_iam_role_policy" "lambda_api_policy" {
  name = "${var.project_name}-lambda-api-policy-${var.environment}"
  role = aws_iam_role.lambda_api_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.nps_table.arn,
          "${aws_dynamodb_table.nps_table.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.nps_assets.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.send_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:nps-saas/*"
      }
    ]
  })
}

# IAM Role para Lambda Worker
resource "aws_iam_role" "lambda_worker_role" {
  name = "${var.project_name}-lambda-worker-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# IAM Policy para Lambda Worker
resource "aws_iam_role_policy" "lambda_worker_policy" {
  name = "${var.project_name}-lambda-worker-policy-${var.environment}"
  role = aws_iam_role.lambda_worker_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = aws_sqs_queue.send_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.nps_table.arn
      }
    ]
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/lambda/${var.project_name}-api-${var.environment}"
  retention_in_days = 14

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "worker_logs" {
  name              = "/aws/lambda/${var.project_name}-worker-${var.environment}"
  retention_in_days = 14

  tags = local.common_tags
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "api_errors" {
  alarm_name          = "${var.project_name}-api-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors API Lambda errors"

  dimensions = {
    FunctionName = "${var.project_name}-api-${var.environment}"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "${var.project_name}-dlq-messages-${var.environment}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfVisibleMessages"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors messages in Dead Letter Queue"

  dimensions = {
    QueueName = aws_sqs_queue.send_dlq.name
  }

  tags = local.common_tags
}

# Outputs
output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.nps_table.name
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.nps_assets.bucket
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = aws_sqs_queue.send_queue.url
}

output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.user_pool.id
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.user_pool_client.id
}

output "lambda_api_role_arn" {
  description = "Lambda API role ARN"
  value       = aws_iam_role.lambda_api_role.arn
}

output "lambda_worker_role_arn" {
  description = "Lambda Worker role ARN"
  value       = aws_iam_role.lambda_worker_role.arn
}
