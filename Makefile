# NPS SaaS - Makefile
# Scripts de automação para desenvolvimento e deploy

.PHONY: help setup dev build test deploy clean

# Variáveis
NODE_VERSION := 18
AWS_REGION := us-east-1
STAGE := dev

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Função para imprimir mensagens coloridas
define print_status
	@echo "$(BLUE)[INFO]$(NC) $1"
endef

define print_success
	@echo "$(GREEN)[SUCCESS]$(NC) $1"
endef

define print_warning
	@echo "$(YELLOW)[WARNING]$(NC) $1"
endef

define print_error
	@echo "$(RED)[ERROR]$(NC) $1"
endef

# Ajuda
help: ## Mostra esta ajuda
	@echo "NPS SaaS - Scripts de Automação"
	@echo ""
	@echo "Comandos disponíveis:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# Setup inicial
setup: ## Configura o ambiente de desenvolvimento
	@$(call print_status,Configurando ambiente de desenvolvimento...)
	@./scripts/setup.sh
	@$(call print_success,Ambiente configurado com sucesso!)

# Desenvolvimento
dev: ## Inicia o ambiente de desenvolvimento
	@$(call print_status,Iniciando ambiente de desenvolvimento...)
	@./scripts/dev.sh all

dev-backend: ## Inicia apenas o backend
	@$(call print_status,Iniciando backend...)
	@./scripts/dev.sh backend

dev-frontend: ## Inicia apenas o frontend
	@$(call print_status,Iniciando frontend...)
	@./scripts/dev.sh frontend

# Build
build: ## Faz build de todos os projetos
	@$(call print_status,Fazendo build de todos os projetos...)
	@cd nps-backend && npm run build
	@cd nps-frontend && npm run build
	@$(call print_success,Build concluído!)

build-backend: ## Faz build do backend
	@$(call print_status,Fazendo build do backend...)
	@cd nps-backend && npm run build
	@$(call print_success,Build do backend concluído!)

build-frontend: ## Faz build do frontend
	@$(call print_status,Fazendo build do frontend...)
	@cd nps-frontend && npm run build
	@$(call print_success,Build do frontend concluído!)

# Testes
test: ## Executa todos os testes
	@$(call print_status,Executando todos os testes...)
	@cd nps-backend && npm test
	@cd nps-frontend && npm test
	@$(call print_success,Todos os testes passaram!)

test-backend: ## Executa testes do backend
	@$(call print_status,Executando testes do backend...)
	@cd nps-backend && npm test
	@$(call print_success,Testes do backend concluídos!)

test-frontend: ## Executa testes do frontend
	@$(call print_status,Executando testes do frontend...)
	@cd nps-frontend && npm test
	@$(call print_success,Testes do frontend concluídos!)

test-coverage: ## Executa testes com cobertura
	@$(call print_status,Executando testes com cobertura...)
	@cd nps-backend && npm run test:coverage
	@cd nps-frontend && npm run test:coverage
	@$(call print_success,Testes com cobertura concluídos!)

# Linting
lint: ## Executa linting em todos os projetos
	@$(call print_status,Executando linting...)
	@cd nps-backend && npm run lint
	@cd nps-frontend && npm run lint
	@$(call print_success,Linting concluído!)

lint-fix: ## Executa linting e corrige problemas
	@$(call print_status,Executando linting e correções...)
	@cd nps-backend && npm run lint:fix
	@cd nps-frontend && npm run lint:fix
	@$(call print_success,Linting e correções concluídos!)

# Deploy
deploy: ## Faz deploy completo
	@$(call print_status,Fazendo deploy completo...)
	@./scripts/deploy.sh all $(STAGE)

deploy-infra: ## Faz deploy da infraestrutura
	@$(call print_status,Fazendo deploy da infraestrutura...)
	@./scripts/deploy.sh infra $(STAGE)

deploy-backend: ## Faz deploy do backend
	@$(call print_status,Fazendo deploy do backend...)
	@./scripts/deploy.sh backend $(STAGE)

deploy-frontend: ## Faz deploy do frontend
	@$(call print_status,Fazendo deploy do frontend...)
	@./scripts/deploy.sh frontend $(STAGE)

deploy-prod: ## Faz deploy para produção
	@$(call print_warning,⚠️  Fazendo deploy para PRODUÇÃO!)
	@read -p "Tem certeza? (digite 'yes' para confirmar): " confirm && [ "$$confirm" = "yes" ]
	@$(MAKE) deploy STAGE=prod

# Rollback
rollback: ## Faz rollback para versão anterior
	@$(call print_status,Fazendo rollback...)
	@./scripts/deploy.sh rollback $(STAGE)

# Status
status: ## Mostra status dos deployments
	@$(call print_status,Mostrando status...)
	@./scripts/deploy.sh status $(STAGE)

# Limpeza
clean: ## Limpa arquivos temporários
	@$(call print_status,Limpando arquivos temporários...)
	@cd nps-backend && npm run clean
	@cd nps-frontend && rm -rf dist
	@cd nps-infra && rm -rf .serverless
	@$(call print_success,Limpeza concluída!)

clean-all: ## Limpa tudo (node_modules, dist, etc.)
	@$(call print_status,Limpando tudo...)
	@cd nps-backend && rm -rf node_modules dist
	@cd nps-frontend && rm -rf node_modules dist
	@cd nps-infra && rm -rf node_modules .serverless
	@$(call print_success,Limpeza completa concluída!)

# Instalação de dependências
install: ## Instala dependências de todos os projetos
	@$(call print_status,Instalando dependências...)
	@cd nps-backend && npm install
	@cd nps-frontend && npm install
	@cd nps-infra && npm install
	@$(call print_success,Dependências instaladas!)

install-backend: ## Instala dependências do backend
	@$(call print_status,Instalando dependências do backend...)
	@cd nps-backend && npm install
	@$(call print_success,Dependências do backend instaladas!)

install-frontend: ## Instala dependências do frontend
	@$(call print_status,Instalando dependências do frontend...)
	@cd nps-frontend && npm install
	@$(call print_success,Dependências do frontend instaladas!)

install-infra: ## Instala dependências da infraestrutura
	@$(call print_status,Instalando dependências da infraestrutura...)
	@cd nps-infra && npm install
	@$(call print_success,Dependências da infraestrutura instaladas!)

# Verificações
check: ## Verifica se tudo está configurado corretamente
	@$(call print_status,Verificando configuração...)
	@node --version | grep -q "v$(NODE_VERSION)" || ($(call print_error,Node.js versão $(NODE_VERSION) é necessária) && exit 1)
	@aws --version > /dev/null 2>&1 || ($(call print_warning,AWS CLI não encontrado) && exit 1)
	@serverless --version > /dev/null 2>&1 || ($(call print_warning,Serverless Framework não encontrado) && exit 1)
	@$(call print_success,Configuração verificada!)

# Logs
logs-backend: ## Mostra logs do backend
	@$(call print_status,Mostrando logs do backend...)
	@cd nps-backend && npm run logs

logs-frontend: ## Mostra logs do frontend
	@$(call print_status,Mostrando logs do frontend...)
	@cd nps-frontend && npm run dev

# Docker (opcional)
docker-build: ## Constrói imagens Docker
	@$(call print_status,Construindo imagens Docker...)
	@docker build -t nps-backend ./nps-backend
	@docker build -t nps-frontend ./nps-frontend
	@$(call print_success,Imagens Docker construídas!)

docker-run: ## Executa aplicação com Docker
	@$(call print_status,Executando aplicação com Docker...)
	@docker-compose up -d
	@$(call print_success,Aplicação executando com Docker!)

docker-stop: ## Para aplicação Docker
	@$(call print_status,Parando aplicação Docker...)
	@docker-compose down
	@$(call print_success,Aplicação Docker parada!)

# Desenvolvimento completo
dev-full: setup dev ## Setup completo e desenvolvimento

# Deploy completo
deploy-full: build test deploy ## Build, teste e deploy

# Padrão
.DEFAULT_GOAL := help
