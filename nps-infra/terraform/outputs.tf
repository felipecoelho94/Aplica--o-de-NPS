output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.nps_table.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.nps_table.arn
}

output "s3_bucket_name" {
  description = "S3 bucket name for assets"
  value       = aws_s3_bucket.nps_assets.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.nps_assets.arn
}

output "sqs_queue_url" {
  description = "SQS queue URL for sending messages"
  value       = aws_sqs_queue.send_queue.url
}

output "sqs_queue_arn" {
  description = "SQS queue ARN"
  value       = aws_sqs_queue.send_queue.arn
}

output "sqs_dlq_url" {
  description = "SQS Dead Letter Queue URL"
  value       = aws_sqs_queue.send_dlq.url
}

output "sqs_dlq_arn" {
  description = "SQS Dead Letter Queue ARN"
  value       = aws_sqs_queue.send_dlq.arn
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.user_pool.id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.user_pool.arn
}

output "cognito_user_pool_client_id" {
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

output "cloudwatch_log_groups" {
  description = "CloudWatch log groups"
  value = {
    api    = aws_cloudwatch_log_group.api_logs.name
    worker = aws_cloudwatch_log_group.worker_logs.name
  }
}

output "cloudwatch_alarms" {
  description = "CloudWatch alarms"
  value = {
    api_errors = aws_cloudwatch_metric_alarm.api_errors.arn
    dlq_messages = aws_cloudwatch_metric_alarm.dlq_messages.arn
  }
}
