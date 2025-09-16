# 🚀 SaaS NPS - Sistema de Pesquisas NPS Integrado ao Zendesk

Sistema completo de envio de pesquisas NPS integrado ao Zendesk com suporte a WhatsApp (via Sunshine Conversations) e envio por e-mail. Desenvolvido com arquitetura serverless moderna e escalável.

## ✨ Funcionalidades

- 📊 **Dashboard NPS**: Métricas e insights em tempo real
- 📝 **Criação de Pesquisas**: Interface intuitiva para criar pesquisas personalizadas
- 📧 **Envio por E-mail**: Integração com AWS SES
- 💬 **WhatsApp**: Envio via Sunshine Conversations
- 🎫 **Integração Zendesk**: Criação automática de tickets
- 📈 **Relatórios**: Análise detalhada de respostas
- 🔐 **Multi-tenant**: Suporte a múltiplos clientes
- 🚀 **Serverless**: Arquitetura escalável e econômica

## 🏗 Arquitetura

- **Backend**: TypeScript + Fastify + AWS Lambda
- **Frontend**: React + Vite + Tailwind CSS
- **Infraestrutura**: AWS (DynamoDB, S3, SQS, API Gateway, Cognito)
- **Integrações**: Zendesk, Sunshine Conversations (WhatsApp)
- **CI/CD**: GitHub Actions
- **IaC**: Serverless Framework + Terraform

## 📁 Estrutura do Projeto

```
nps-saas/
├── nps-infra/          # Infraestrutura como Código
│   ├── serverless.yml  # Serverless Framework
│   └── terraform/      # Terraform (opcional)
├── nps-backend/        # Backend TypeScript + Fastify
│   ├── src/
│   │   ├── routes/     # Rotas da API
│   │   ├── services/   # Lógica de negócio
│   │   ├── middleware/ # Middlewares
│   │   └── workers/    # Workers assíncronos
│   └── tests/          # Testes
├── nps-frontend/       # Frontend React + Vite
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── pages/      # Páginas
│   │   ├── services/   # Serviços de API
│   │   └── stores/     # Estado global
│   └── tests/          # Testes
├── docs/              # Documentação
├── scripts/           # Scripts de automação
└── .github/           # GitHub Actions
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- AWS CLI configurado
- Git

### Setup Automático

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nps-saas.git
cd nps-saas

# Execute o script de setup
./scripts/setup.sh

# Inicie o ambiente de desenvolvimento
./scripts/dev.sh
```

### Setup Manual

#### 1. Infraestrutura
```bash
cd nps-infra
npm install
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edite terraform.tfvars com suas configurações
npm run deploy:dev
```

#### 2. Backend
```bash
cd nps-backend
npm install
cp env.example .env
# Edite .env com suas configurações
npm run dev
```

#### 3. Frontend
```bash
cd nps-frontend
npm install
cp .env.example .env
# Edite .env com suas configurações
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

#### Backend
```bash
# AWS Configuration
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=nps-app-table-dev
S3_BUCKET_NAME=nps-assets-dev
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Integrations
ZENDESK_API_TOKEN=your-zendesk-token
ZENDESK_SUBDOMAIN=your-subdomain
SUNCO_API_TOKEN=your-sunco-token
SUNCO_APP_ID=your-app-id
```

#### Frontend
```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
```

## 🛠 Scripts Disponíveis

### Desenvolvimento
```bash
make dev              # Inicia ambiente completo
make dev-backend      # Apenas backend
make dev-frontend     # Apenas frontend
```

### Build e Testes
```bash
make build            # Build de todos os projetos
make test             # Executa todos os testes
make test-coverage    # Testes com cobertura
make lint             # Linting do código
```

### Deploy
```bash
make deploy           # Deploy para desenvolvimento
make deploy-prod      # Deploy para produção
make rollback         # Rollback para versão anterior
```

### Utilitários
```bash
make clean            # Limpa arquivos temporários
make check            # Verifica configuração
make status           # Status dos deployments
```

## 📊 Funcionalidades Principais

### Dashboard
- Métricas NPS em tempo real
- Gráficos de distribuição (Promotores, Passivos, Detratores)
- Taxa de resposta
- Pesquisas recentes

### Criação de Pesquisas
- Interface drag-and-drop
- Múltiplos tipos de pergunta (NPS, Texto, Avaliação, Múltipla Escolha)
- Templates personalizáveis
- Configuração de canais de envio

### Envio e Coleta
- Envio por e-mail via AWS SES
- Envio por WhatsApp via Sunshine Conversations
- Criação automática de tickets no Zendesk
- Processamento assíncrono com SQS

### Análise e Relatórios
- Cálculo automático do score NPS
- Filtros por período e canal
- Exportação de dados
- Dashboards personalizáveis

## 🔧 Integrações

### Zendesk
- Criação automática de tickets
- Sincronização de dados
- Webhooks para eventos

### WhatsApp (Sunshine Conversations)
- Envio de mensagens proativas
- Templates aprovados
- Processamento de respostas

### AWS SES
- Envio de e-mails transacionais
- Templates personalizáveis
- Rastreamento de entrega

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md) - Visão técnica do sistema
- [Deploy](docs/DEPLOYMENT.md) - Guia de deploy
- [Contribuição](CONTRIBUTING.md) - Como contribuir
- [Setup Git](docs/GIT_SETUP.md) - Configuração dos repositórios

## 🧪 Testes

```bash
# Backend
cd nps-backend
npm test
npm run test:coverage

# Frontend
cd nps-frontend
npm test
npm run test:coverage

# Infraestrutura
cd nps-infra
npm test
```

## 🚀 Deploy

### Desenvolvimento
```bash
make deploy STAGE=dev
```

### Produção
```bash
make deploy-prod
```

### Rollback
```bash
make rollback STAGE=prod
```

## 🔒 Segurança

- Autenticação JWT
- Autorização baseada em roles
- Isolamento de dados por tenant
- Validação de entrada
- Rate limiting
- Criptografia em trânsito e em repouso

## 📈 Monitoramento

- CloudWatch Logs
- Métricas customizadas
- Alertas automáticos
- Health checks
- Tracing distribuído com X-Ray

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Fastify](https://fastify.io/) - Framework web rápido
- [React](https://reactjs.org/) - Biblioteca para interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [AWS](https://aws.amazon.com/) - Serviços de nuvem
- [Serverless Framework](https://serverless.com/) - Framework serverless

## 📞 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/nps-saas/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/nps-saas/discussions)
- **Email**: suporte@nps-saas.com

---

**Desenvolvido com ❤️ para melhorar a experiência dos clientes através do feedback NPS**
