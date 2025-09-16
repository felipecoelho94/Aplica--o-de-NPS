variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "nps-saas"
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
  default     = ""
}

variable "zendesk_api_token" {
  description = "Zendesk API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "zendesk_subdomain" {
  description = "Zendesk subdomain"
  type        = string
  default     = ""
}

variable "sunco_api_token" {
  description = "Sunshine Conversations API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
