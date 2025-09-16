# NPS SaaS - Infraestrutura

Este diretório contém a infraestrutura como código para o SaaS NPS, com suporte tanto para Serverless Framework quanto Terraform.

## Opções de Deploy

### 1. Serverless Framework (Recomendado)

O Serverless Framework é a opção principal e mais simples para deploy.

#### Pré-requisitos
- Node.js 18+
- AWS CLI configurado
- Serverless Framework

#### Instalação
```bash
npm install
```

#### Deploy
```bash
# Deploy para desenvolvimento
npm run deploy:dev

# Deploy para produção
npm run deploy:prod

# Deploy customizado
sls deploy --stage staging --region us-west-2
```

#### Comandos Úteis
```bash
# Executar localmente
npm run offline

# Ver logs
npm run logs
npm run logs:worker

# Remover stack
npm run remove
```

### 2. Terraform (Opcional)

Terraform oferece mais controle e flexibilidade para configurações complexas.

#### Pré-requisitos
- Terraform >= 1.0
- AWS CLI configurado

#### Configuração
```bash
# Copiar arquivo de variáveis
cp terraform.tfvars.example terraform.tfvars

# Editar variáveis
nano terraform.tfvars
```

#### Deploy
```bash
cd terraform

# Inicializar
terraform init

# Planejar
terraform plan

# Aplicar
terraform apply
```

## Recursos AWS Criados

### DynamoDB
- **Tabela**: `nps-app-table-{stage}`
- **Design**: Single-table design
- **Índices**: GSI1 para consultas secundárias
- **Streams**: Habilitado para processamento em tempo real

### S3
- **Bucket**: `nps-assets-{stage}-{account-id}`
- **Uso**: Armazenamento de assets e arquivos
- **Versionamento**: Habilitado
- **CORS**: Configurado para frontend

### SQS
- **Queue Principal**: `nps-send-queue-{stage}`
- **DLQ**: `nps-send-dlq-{stage}`
- **Retry**: 3 tentativas antes de ir para DLQ

### Cognito
- **User Pool**: `nps-user-pool-{stage}`
- **Client**: `nps-client-{stage}`
- **Auth**: Email + senha
- **Callback URLs**: Localhost e produção

### CloudWatch
- **Log Groups**: Para API e Worker
- **Alarms**: Erros da API e mensagens na DLQ
- **Retention**: 14 dias

## Variáveis de Ambiente

### Obrigatórias
- `AWS_REGION`: Região AWS
- `JWT_SECRET`: Chave secreta para JWT
- `ZENDESK_API_TOKEN`: Token da API do Zendesk
- `ZENDESK_SUBDOMAIN`: Subdomínio do Zendesk
- `SUNCO_API_TOKEN`: Token da API do Sunshine Conversations

### Opcionais
- `STAGE`: Ambiente (dev, staging, prod)
- `DOMAIN_NAME`: Domínio personalizado

## Estrutura de Dados DynamoDB

### Single Table Design

| PK | SK | GSI1PK | GSI1SK | Entity | Dados |
|----|----|--------|--------|--------|-------|
| TENANT#123 | METADATA | TENANT#123 | METADATA | Tenant | {name, settings} |
| TENANT#123 | SURVEY#456 | SURVEY#456 | CREATED#2024-01-01 | Survey | {title, questions} |
| TENANT#123 | SEND#789 | SEND#789 | CREATED#2024-01-01 | Send | {surveyId, status} |
| TENANT#123 | RESPONSE#101 | RESPONSE#101 | CREATED#2024-01-01 | Response | {surveyId, answers} |

## Monitoramento

### CloudWatch Alarms
- **API Errors**: Alerta quando há mais de 5 erros em 10 minutos
- **DLQ Messages**: Alerta quando há mensagens na Dead Letter Queue

### Logs
- **API**: `/aws/lambda/nps-api-{stage}`
- **Worker**: `/aws/lambda/nps-worker-{stage}`

## Troubleshooting

### Problemas Comuns

1. **Erro de permissões IAM**
   - Verificar se o usuário AWS tem permissões adequadas
   - Executar `aws sts get-caller-identity`

2. **Falha no deploy do DynamoDB**
   - Verificar se a tabela já existe
   - Verificar limites de tabelas na região

3. **Erro de CORS no S3**
   - Verificar configuração CORS no bucket
   - Verificar domínios permitidos

### Comandos de Debug

```bash
# Verificar status da stack
sls info

# Ver logs em tempo real
sls logs -f api --tail

# Testar função localmente
sls invoke local -f api --data '{"httpMethod": "GET", "path": "/health"}'
```

## Próximos Passos

1. Configurar domínio personalizado (opcional)
2. Configurar SSL/TLS
3. Configurar backup automático do DynamoDB
4. Implementar monitoramento avançado
5. Configurar alertas por email/SMS
