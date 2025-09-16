# 🚀 Instruções para Configuração dos Repositórios - NPS SaaS

## 📋 Resumo da Última Etapa

A estrutura do projeto foi separada em 3 repositórios distintos:

1. **nps-backend-repo** - Backend TypeScript + Fastify
2. **nps-frontend-repo** - Frontend React + Vite + Tailwind  
3. **nps-infra-repo** - Infraestrutura como Código

## 🔧 Próximos Passos para Configuração

### 1. Criar Repositórios no GitHub

Acesse https://github.com/new e crie os seguintes repositórios:

#### nps-backend
- **Nome**: `nps-backend`
- **Descrição**: `Backend do SaaS NPS - TypeScript + Fastify + AWS Lambda`
- **Visibilidade**: Privado
- **README**: Não inicializar (já temos)

#### nps-frontend  
- **Nome**: `nps-frontend`
- **Descrição**: `Frontend do SaaS NPS - React + Vite + Tailwind CSS`
- **Visibilidade**: Privado
- **README**: Não inicializar (já temos)

#### nps-infra
- **Nome**: `nps-infra`
- **Descrição**: `Infraestrutura do SaaS NPS - Serverless + Terraform`
- **Visibilidade**: Privado
- **README**: Não inicializar (já temos)

### 2. Configurar Repositórios Locais

Execute os seguintes comandos para cada repositório:

#### Backend
```bash
cd nps-backend-repo
git remote add origin https://github.com/felipecoelho94/nps-backend.git
git branch -M main
git push -u origin main
```

#### Frontend
```bash
cd nps-frontend-repo
git init
git add .
git commit -m "feat: initial frontend setup - React + Vite + Tailwind"
git remote add origin https://github.com/felipecoelho94/nps-frontend.git
git branch -M main
git push -u origin main
```

#### Infraestrutura
```bash
cd nps-infra-repo
git init
git add .
git commit -m "feat: initial infrastructure setup - Serverless + Terraform"
git remote add origin https://github.com/felipecoelho94/nps-infra.git
git branch -M main
git push -u origin main
```

### 3. Configurar Branch Protection Rules

Para cada repositório, configure as seguintes regras:

#### Main Branch
- ✅ Require a pull request before merging
- ✅ Require approvals: 2
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging

#### Dev Branch
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### 4. Configurar Secrets do GitHub

Para cada repositório, adicione os seguintes secrets:

#### Backend e Infraestrutura
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `JWT_SECRET`
- `ZENDESK_API_TOKEN`
- `ZENDESK_SUBDOMAIN`
- `SUNCO_API_TOKEN`
- `SUNCO_APP_ID`

#### Frontend
- `DEV_API_URL`
- `PROD_API_URL`
- `DEV_S3_BUCKET`
- `PROD_S3_BUCKET`
- `DEV_CLOUDFRONT_DISTRIBUTION_ID`
- `PROD_CLOUDFRONT_DISTRIBUTION_ID`

### 5. Configurar Environments

Crie os seguintes environments em cada repositório:

- `development` - Deploy automático da branch `dev`
- `staging` - Deploy automático da branch `staging`
- `production` - Deploy manual da branch `main`

## 📊 Status Atual

### ✅ Concluído
- [x] Estrutura do projeto separada em 3 repositórios
- [x] Backend commitado localmente
- [x] Workflows do GitHub Actions configurados
- [x] Documentação completa criada
- [x] Scripts de automação prontos

### 🔄 Em Andamento
- [ ] Criação dos repositórios no GitHub
- [ ] Push dos repositórios para o GitHub
- [ ] Configuração de branch protection
- [ ] Configuração de secrets
- [ ] Configuração de environments

## 🎯 Resultado Final

Após completar estes passos, você terá:

1. **3 repositórios separados** no GitHub
2. **CI/CD configurado** para cada repositório
3. **Branch protection** ativado
4. **Secrets configurados** para deploy
5. **Environments** configurados para diferentes estágios

## 🚀 Comandos Rápidos

Para facilitar, execute estes comandos em sequência:

```bash
# Backend
cd nps-backend-repo
git remote add origin https://github.com/felipecoelho94/nps-backend.git
git branch -M main
git push -u origin main

# Frontend
cd ../nps-frontend-repo
git init
git add .
git commit -m "feat: initial frontend setup - React + Vite + Tailwind"
git remote add origin https://github.com/felipecoelho94/nps-frontend.git
git branch -M main
git push -u origin main

# Infraestrutura
cd ../nps-infra-repo
git init
git add .
git commit -m "feat: initial infrastructure setup - Serverless + Terraform"
git remote add origin https://github.com/felipecoelho94/nps-infra.git
git branch -M main
git push -u origin main
```

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md) - Visão técnica do sistema
- [Deploy](docs/DEPLOYMENT.md) - Guia de deploy
- [Setup Git](docs/GIT_SETUP.md) - Configuração detalhada dos repositórios
- [Contribuição](CONTRIBUTING.md) - Guia de contribuição

---

**🎉 Projeto NPS SaaS - Estrutura Completa Entregue!**

Todos os componentes estão prontos para serem configurados no GitHub e iniciar o desenvolvimento.
