# Configuração dos Repositórios Git - NPS SaaS

Este documento fornece instruções para configurar os repositórios Git e as políticas de branch para o projeto NPS SaaS.

## 📋 Índice

- [Estrutura de Repositórios](#estrutura-de-repositórios)
- [Criação dos Repositórios](#criação-dos-repositórios)
- [Configuração de Branch Protection](#configuração-de-branch-protection)
- [Templates de PR e Issue](#templates-de-pr-e-issue)
- [GitHub Actions](#github-actions)
- [CODEOWNERS](#codeowners)

## 🏗 Estrutura de Repositórios

O projeto será dividido em 3 repositórios principais:

1. **nps-backend**: Backend TypeScript + Fastify
2. **nps-frontend**: Frontend React + Vite + Tailwind
3. **nps-infra**: Infraestrutura como código (Serverless + Terraform)

## 🔧 Criação dos Repositórios

### 1. Criar Repositórios no GitHub

```bash
# Criar repositórios via GitHub CLI (se disponível)
gh repo create nps-backend --private --description "Backend do SaaS NPS - TypeScript + Fastify"
gh repo create nps-frontend --private --description "Frontend do SaaS NPS - React + Vite + Tailwind"
gh repo create nps-infra --private --description "Infraestrutura do SaaS NPS - Serverless + Terraform"

# Ou criar manualmente no GitHub:
# 1. Acesse https://github.com/new
# 2. Crie cada repositório com as configurações apropriadas
```

### 2. Configurar Repositórios Locais

```bash
# Para cada repositório, execute:

# nps-backend
cd nps-backend
git init
git add .
git commit -m "feat: initial backend setup"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nps-backend.git
git push -u origin main

# nps-frontend
cd nps-frontend
git init
git add .
git commit -m "feat: initial frontend setup"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nps-frontend.git
git push -u origin main

# nps-infra
cd nps-infra
git init
git add .
git commit -m "feat: initial infrastructure setup"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nps-infra.git
git push -u origin main
```

## 🌿 Configuração de Branch Protection

### 1. Branch Protection Rules

Para cada repositório, configure as seguintes regras:

#### Main Branch
- ✅ Require a pull request before merging
- ✅ Require approvals: 2
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Do not allow bypassing the above settings

#### Dev Branch
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### 2. Status Checks Obrigatórios

Configure os seguintes status checks para cada repositório:

#### Backend
- `test` - Testes unitários
- `lint` - Linting do código
- `type-check` - Verificação de tipos
- `build` - Build da aplicação

#### Frontend
- `test` - Testes unitários
- `lint` - Linting do código
- `type-check` - Verificação de tipos
- `build` - Build da aplicação

#### Infraestrutura
- `validate` - Validação do Terraform
- `plan` - Planejamento do Terraform
- `test` - Testes da infraestrutura

## 📝 Templates de PR e Issue

### 1. Template de Pull Request

Crie o arquivo `.github/pull_request_template.md` em cada repositório:

```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação (mudança apenas na documentação)
- [ ] Refatoração (mudança que não corrige bug nem adiciona funcionalidade)
- [ ] Performance (mudança que melhora performance)
- [ ] Teste (adição ou correção de testes)

## Checklist
- [ ] Meu código segue as diretrizes de estilo do projeto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei partes do código que são difíceis de entender
- [ ] Fiz as mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção é eficaz ou que minha funcionalidade funciona
- [ ] Testes novos e existentes passam localmente com minhas mudanças
- [ ] Qualquer mudança dependente foi mergeada e publicada

## Screenshots (se aplicável)
Adicione screenshots para ajudar a explicar seu problema ou solução.

## Testes
Descreva os testes que você executou para verificar suas mudanças.

## Contexto Adicional
Adicione qualquer outro contexto sobre o problema aqui.
```

### 2. Template de Issue

Crie o arquivo `.github/issue_template.md` em cada repositório:

```markdown
## Descrição do Problema
Uma descrição clara e concisa do problema.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
Uma descrição clara e concisa do que você esperava que acontecesse.

## Screenshots
Se aplicável, adicione screenshots para ajudar a explicar seu problema.

## Ambiente
- OS: [ex: Windows, macOS, Linux]
- Navegador: [ex: Chrome, Safari, Firefox]
- Versão: [ex: 22]
- Node.js: [ex: 18.17.0]

## Contexto Adicional
Adicione qualquer outro contexto sobre o problema aqui.
```

## 🤖 GitHub Actions

### 1. Configurar Secrets

Para cada repositório, configure os seguintes secrets:

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

### 2. Configurar Environments

Crie os seguintes environments em cada repositório:

- `development` - Ambiente de desenvolvimento
- `staging` - Ambiente de homologação
- `production` - Ambiente de produção

### 3. Configurar Branch Rules

Para cada environment, configure:

- **development**: Deploy automático da branch `dev`
- **staging**: Deploy automático da branch `staging`
- **production**: Deploy manual da branch `main`

## 👥 CODEOWNERS

Crie o arquivo `CODEOWNERS` na raiz de cada repositório:

```gitignore
# Global owners
* @team-backend @team-frontend @team-infra

# Backend specific
nps-backend/ @team-backend

# Frontend specific
nps-frontend/ @team-frontend

# Infrastructure specific
nps-infra/ @team-infra

# Documentation
docs/ @team-backend @team-frontend @team-infra

# GitHub Actions
.github/ @team-backend @team-frontend @team-infra
```

## 🔄 Workflow de Desenvolvimento

### 1. Estrutura de Branches

```
main (produção)
├── dev (desenvolvimento)
│   ├── feature/nova-funcionalidade
│   ├── bugfix/correcao-bug
│   └── hotfix/correcao-critica
└── staging (homologação)
```

### 2. Convenções de Nome

- **feature/**: `feature/nome-da-funcionalidade`
- **bugfix/**: `bugfix/descricao-do-bug`
- **hotfix/**: `hotfix/descricao-da-correcao`
- **chore/**: `chore/descricao-da-tarefa`

### 3. Processo de Merge

1. Criar branch a partir de `dev`
2. Desenvolver funcionalidade
3. Criar Pull Request para `dev`
4. Após aprovação, merge para `dev`
5. Deploy automático para desenvolvimento
6. Após testes, criar PR de `dev` para `main`
7. Deploy manual para produção

## 📊 Configuração de Notificações

### 1. Webhooks

Configure webhooks para integração com:

- Slack/Discord para notificações
- Jira para rastreamento de issues
- Sentry para monitoramento de erros

### 2. Branch Protection

Configure notificações para:

- Falhas nos status checks
- Pull requests abertos
- Merges para main
- Deployments

## 🛠 Scripts de Automação

### 1. Script de Setup

```bash
#!/bin/bash
# scripts/setup-repos.sh

# Criar repositórios
gh repo create nps-backend --private
gh repo create nps-frontend --private
gh repo create nps-infra --private

# Configurar branch protection
gh api repos/:owner/:repo/branches/main/protection --method PUT --input protection-rules.json

# Configurar secrets
gh secret set AWS_ACCESS_KEY_ID --body "$AWS_ACCESS_KEY_ID"
gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY"
# ... outros secrets
```

### 2. Script de Deploy

```bash
#!/bin/bash
# scripts/deploy-repos.sh

# Deploy para desenvolvimento
gh workflow run deploy-dev.yml --repo nps-backend
gh workflow run deploy-dev.yml --repo nps-frontend
gh workflow run deploy-dev.yml --repo nps-infra

# Deploy para produção
gh workflow run deploy-prod.yml --repo nps-backend
gh workflow run deploy-prod.yml --repo nps-frontend
gh workflow run deploy-prod.yml --repo nps-infra
```

## 📚 Próximos Passos

1. **Criar Repositórios**: Execute os comandos de criação
2. **Configurar Branch Protection**: Configure as regras de proteção
3. **Configurar Secrets**: Adicione todas as variáveis de ambiente
4. **Configurar Environments**: Configure os ambientes de deploy
5. **Testar Workflow**: Teste o processo completo de PR
6. **Configurar Notificações**: Configure alertas e notificações
7. **Documentar Processo**: Documente o workflow para a equipe

## 🔍 Verificação

Para verificar se tudo está configurado corretamente:

```bash
# Verificar repositórios
gh repo list

# Verificar branch protection
gh api repos/:owner/:repo/branches/main/protection

# Verificar secrets
gh secret list

# Verificar workflows
gh workflow list
```

---

Esta configuração garante um workflow de desenvolvimento robusto e seguro para o projeto NPS SaaS.
