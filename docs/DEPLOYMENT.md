# Guia de Deploy - NPS SaaS

Este documento fornece instruções detalhadas para fazer deploy do sistema NPS SaaS em diferentes ambientes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Deploy da Infraestrutura](#deploy-da-infraestrutura)
- [Deploy do Backend](#deploy-do-backend)
- [Deploy do Frontend](#deploy-do-frontend)
- [Configuração de Domínio](#configuração-de-domínio)
- [Verificação do Deploy](#verificação-do-deploy)
- [Troubleshooting](#troubleshooting)

## 🛠 Pré-requisitos

### Software Necessário

- **Node.js 18+**: [Download](https://nodejs.org/)
- **AWS CLI**: [Instalação](https://aws.amazon.com/cli/)
- **Serverless Framework**: `npm install -g serverless`
- **Terraform** (opcional): [Download](https://terraform.io/)

### Conta AWS

- Conta AWS ativa
- Usuário IAM com permissões adequadas
- Região preferida: `us-east-1`

### Permissões IAM Necessárias

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "s3:*",
        "sqs:*",
        "ses:*",
        "cognito-idp:*",
        "cloudformation:*",
        "iam:*",
        "logs:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## ⚙️ Configuração Inicial

### 1. Configurar AWS CLI

```bash
aws configure
```

Informe:
- Access Key ID
- Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 2. Verificar Configuração

```bash
aws sts get-caller-identity
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Application Secrets
JWT_SECRET=your-super-secret-jwt-key
ZENDESK_API_TOKEN=your-zendesk-token
ZENDESK_SUBDOMAIN=your-subdomain
SUNCO_API_TOKEN=your-sunco-token
SUNCO_APP_ID=your-app-id

# Environment
STAGE=dev
```

## 🏗 Deploy da Infraestrutura

### Opção 1: Serverless Framework (Recomendado)

```bash
cd nps-infra

# Instalar dependências
npm install

# Deploy para desenvolvimento
npm run deploy:dev

# Deploy para produção
npm run deploy:prod
```

### Opção 2: Terraform

```bash
cd nps-infra/terraform

# Inicializar Terraform
terraform init

# Planejar deploy
terraform plan -var-file="terraform.tfvars"

# Aplicar mudanças
terraform apply -var-file="terraform.tfvars"
```

### Verificar Deploy da Infraestrutura

```bash
# Listar stacks do CloudFormation
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Verificar recursos criados
aws dynamodb list-tables
aws s3 ls
aws sqs list-queues
```

## 🚀 Deploy do Backend

### 1. Configurar Variáveis

Edite `nps-backend/.env`:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# AWS Configuration
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=nps-app-table-prod
S3_BUCKET_NAME=nps-assets-prod-123456789
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/nps-send-queue-prod

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Integrations
ZENDESK_API_TOKEN=your-zendesk-token
ZENDESK_SUBDOMAIN=your-subdomain
SUNCO_API_TOKEN=your-sunco-token
SUNCO_APP_ID=your-app-id

# API Configuration
API_BASE_URL=https://api.nps-saas.com
CORS_ORIGINS=https://app.nps-saas.com
```

### 2. Deploy

```bash
cd nps-backend

# Instalar dependências
npm install

# Build da aplicação
npm run build

# Deploy para desenvolvimento
npm run deploy:dev

# Deploy para produção
npm run deploy:prod
```

### 3. Verificar Deploy do Backend

```bash
# Listar funções Lambda
aws lambda list-functions

# Testar API
curl https://api.nps-saas.com/health

# Verificar logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/nps"
```

## 🎨 Deploy do Frontend

### 1. Configurar Variáveis

Edite `nps-frontend/.env`:

```bash
# API Configuration
VITE_API_URL=https://api.nps-saas.com

# Cognito Configuration
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your-client-id

# Environment
VITE_ENV=production
```

### 2. Build e Deploy

```bash
cd nps-frontend

# Instalar dependências
npm install

# Build da aplicação
npm run build

# Deploy para S3
aws s3 sync dist/ s3://nps-assets-prod-123456789 --delete

# Invalidar CloudFront (se configurado)
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 3. Configurar S3 para Hosting

```bash
# Configurar bucket para hosting estático
aws s3 website s3://nps-assets-prod-123456789 --index-document index.html --error-document index.html

# Configurar política de bucket
aws s3api put-bucket-policy --bucket nps-assets-prod-123456789 --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nps-assets-prod-123456789/*"
    }
  ]
}'
```

## 🌐 Configuração de Domínio

### 1. Configurar Route 53

```bash
# Criar hosted zone
aws route53 create-hosted-zone --name nps-saas.com --caller-reference $(date +%s)

# Obter nameservers
aws route53 get-hosted-zone --id YOUR_HOSTED_ZONE_ID
```

### 2. Configurar CloudFront

```bash
# Criar distribuição CloudFront
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### 3. Configurar SSL

- Use AWS Certificate Manager
- Configure certificado para `*.nps-saas.com`
- Aplique ao CloudFront e API Gateway

## ✅ Verificação do Deploy

### 1. Testes de Saúde

```bash
# API Health
curl https://api.nps-saas.com/health

# Frontend
curl https://app.nps-saas.com

# Database
aws dynamodb describe-table --table-name nps-app-table-prod
```

### 2. Testes Funcionais

```bash
# Teste de autenticação
curl -X POST https://api.nps-saas.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Teste de criação de pesquisa
curl -X POST https://api.nps-saas.com/v1/surveys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Survey","questions":[]}'
```

### 3. Monitoramento

```bash
# Verificar métricas do CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=nps-api-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Permissões IAM

```bash
# Verificar permissões
aws sts get-caller-identity

# Verificar políticas anexadas
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

#### 2. Erro de Deploy do Lambda

```bash
# Verificar logs do CloudFormation
aws cloudformation describe-stack-events --stack-name nps-saas-prod

# Verificar logs do Lambda
aws logs get-log-events --log-group-name /aws/lambda/nps-api-prod --log-stream-name YOUR_STREAM
```

#### 3. Erro de Conectividade com DynamoDB

```bash
# Verificar tabela
aws dynamodb describe-table --table-name nps-app-table-prod

# Testar conexão
aws dynamodb scan --table-name nps-app-table-prod --limit 1
```

#### 4. Erro de CORS

```bash
# Verificar configuração do API Gateway
aws apigateway get-rest-apis

# Verificar configuração CORS
aws apigateway get-cors --rest-api-id YOUR_API_ID
```

### Logs e Debugging

#### 1. Logs do Backend

```bash
# Logs em tempo real
aws logs tail /aws/lambda/nps-api-prod --follow

# Logs específicos
aws logs filter-log-events \
  --log-group-name /aws/lambda/nps-api-prod \
  --filter-pattern "ERROR"
```

#### 2. Logs do Frontend

```bash
# Logs do CloudFront
aws logs describe-log-groups --log-group-name-prefix "/aws/cloudfront"
```

#### 3. Métricas de Performance

```bash
# Latência da API
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Latency \
  --dimensions Name=ApiName,Value=nps-saas-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 300 \
  --statistics Average
```

## 🔄 Rollback

### 1. Rollback do Backend

```bash
cd nps-backend

# Listar versões
aws lambda list-versions-by-function --function-name nps-api-prod

# Rollback para versão anterior
aws lambda update-alias \
  --function-name nps-api-prod \
  --name LIVE \
  --function-version PREVIOUS_VERSION
```

### 2. Rollback do Frontend

```bash
# Restaurar versão anterior do S3
aws s3 sync s3://nps-assets-prod-123456789-backup/ s3://nps-assets-prod-123456789/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 3. Rollback da Infraestrutura

```bash
cd nps-infra

# Rollback do Serverless
serverless rollback --stage prod

# Rollback do Terraform
cd terraform
terraform plan -destroy
terraform destroy
```

## 📊 Monitoramento Pós-Deploy

### 1. Configurar Alertas

```bash
# Alerta de erro
aws cloudwatch put-metric-alarm \
  --alarm-name "NPS API Errors" \
  --alarm-description "Alerta para erros na API" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=nps-api-prod
```

### 2. Dashboard do CloudWatch

```bash
# Criar dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "NPS SaaS Production" \
  --dashboard-body file://dashboard.json
```

### 3. Health Checks

```bash
# Configurar health check
aws route53 create-health-check \
  --caller-reference $(date +%s) \
  --health-check-config Type=HTTPS,ResourcePath=/health,FullyQualifiedDomainName=api.nps-saas.com
```

## 📚 Próximos Passos

1. **Configurar Monitoramento**: Alertas e dashboards
2. **Configurar Backup**: Backup automático do DynamoDB
3. **Configurar SSL**: Certificados SSL para domínio
4. **Configurar CDN**: CloudFront para frontend
5. **Configurar Logs**: Centralização de logs
6. **Configurar Segurança**: WAF e outras proteções

---

Este guia deve ser suficiente para fazer deploy completo do sistema NPS SaaS. Para dúvidas específicas, consulte a documentação da AWS ou abra uma issue no repositório.
