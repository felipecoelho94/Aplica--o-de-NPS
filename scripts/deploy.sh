#!/bin/bash

# NPS SaaS - Deploy Script
# Este script faz deploy da aplicação para diferentes ambientes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se AWS CLI está configurado
check_aws() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI não está instalado"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI não está configurado. Execute 'aws configure' primeiro."
        exit 1
    fi
    
    print_success "AWS CLI configurado corretamente"
}

# Deploy da infraestrutura
deploy_infra() {
    local stage=$1
    print_status "Fazendo deploy da infraestrutura para $stage..."
    
    cd nps-infra
    
    # Verificar se as dependências estão instaladas
    if [ ! -d node_modules ]; then
        print_status "Instalando dependências da infraestrutura..."
        npm install
    fi
    
    # Deploy com Serverless Framework
    print_status "Executando serverless deploy..."
    npm run deploy:$stage
    
    print_success "Infraestrutura deployada com sucesso para $stage"
    cd ..
}

# Deploy do backend
deploy_backend() {
    local stage=$1
    print_status "Fazendo deploy do backend para $stage..."
    
    cd nps-backend
    
    # Verificar se as dependências estão instaladas
    if [ ! -d node_modules ]; then
        print_status "Instalando dependências do backend..."
        npm install
    fi
    
    # Build do backend
    print_status "Fazendo build do backend..."
    npm run build
    
    # Deploy com Serverless Framework
    print_status "Executando serverless deploy..."
    npm run deploy:$stage
    
    print_success "Backend deployado com sucesso para $stage"
    cd ..
}

# Deploy do frontend
deploy_frontend() {
    local stage=$1
    print_status "Fazendo deploy do frontend para $stage..."
    
    cd nps-frontend
    
    # Verificar se as dependências estão instaladas
    if [ ! -d node_modules ]; then
        print_status "Instalando dependências do frontend..."
        npm install
    fi
    
    # Build do frontend
    print_status "Fazendo build do frontend..."
    npm run build
    
    # Deploy para S3 (simulado)
    print_status "Fazendo upload para S3..."
    # Aqui você adicionaria o comando real de upload para S3
    # aws s3 sync dist/ s3://your-bucket-name --delete
    
    print_success "Frontend deployado com sucesso para $stage"
    cd ..
}

# Deploy completo
deploy_all() {
    local stage=$1
    print_status "Fazendo deploy completo para $stage..."
    
    check_aws
    deploy_infra $stage
    deploy_backend $stage
    deploy_frontend $stage
    
    print_success "Deploy completo realizado com sucesso para $stage"
}

# Rollback
rollback() {
    local stage=$1
    print_status "Fazendo rollback para $stage..."
    
    cd nps-infra
    
    # Rollback com Serverless Framework
    print_status "Executando serverless rollback..."
    npx serverless rollback --stage $stage
    
    print_success "Rollback realizado com sucesso para $stage"
    cd ..
}

# Mostrar status dos deployments
show_status() {
    local stage=$1
    print_status "Mostrando status dos deployments para $stage..."
    
    cd nps-infra
    
    # Mostrar status do Serverless
    print_status "Status da infraestrutura:"
    npx serverless info --stage $stage
    
    cd ../nps-backend
    
    # Mostrar status do backend
    print_status "Status do backend:"
    npx serverless info --stage $stage
    
    cd ..
}

# Mostrar ajuda
show_help() {
    echo "Uso: $0 [comando] [ambiente]"
    echo ""
    echo "Comandos:"
    echo "  infra      Deploy apenas da infraestrutura"
    echo "  backend    Deploy apenas do backend"
    echo "  frontend   Deploy apenas do frontend"
    echo "  all        Deploy completo (padrão)"
    echo "  rollback   Rollback para versão anterior"
    echo "  status     Mostra status dos deployments"
    echo "  help       Mostra esta ajuda"
    echo ""
    echo "Ambientes:"
    echo "  dev        Desenvolvimento (padrão)"
    echo "  staging    Staging"
    echo "  prod       Produção"
    echo ""
    echo "Exemplos:"
    echo "  $0 all dev          # Deploy completo para desenvolvimento"
    echo "  $0 backend prod     # Deploy apenas do backend para produção"
    echo "  $0 rollback dev     # Rollback para desenvolvimento"
    echo "  $0 status prod      # Status da produção"
    echo ""
}

# Função principal
main() {
    local command=${1:-all}
    local stage=${2:-dev}
    
    # Validar ambiente
    if [[ ! "$stage" =~ ^(dev|staging|prod)$ ]]; then
        print_error "Ambiente inválido: $stage. Use dev, staging ou prod."
        exit 1
    fi
    
    # Confirmar deploy para produção
    if [ "$stage" = "prod" ]; then
        print_warning "⚠️  Você está fazendo deploy para PRODUÇÃO!"
        read -p "Tem certeza? (digite 'yes' para confirmar): " confirm
        if [ "$confirm" != "yes" ]; then
            print_status "Deploy cancelado"
            exit 0
        fi
    fi
    
    case "$command" in
        "infra")
            check_aws
            deploy_infra $stage
            ;;
        "backend")
            check_aws
            deploy_backend $stage
            ;;
        "frontend")
            check_aws
            deploy_frontend $stage
            ;;
        "all")
            deploy_all $stage
            ;;
        "rollback")
            check_aws
            rollback $stage
            ;;
        "status")
            show_status $stage
            ;;
        "help")
            show_help
            ;;
        *)
            print_error "Comando inválido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Executar script principal
main "$@"
