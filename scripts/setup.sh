#!/bin/bash

# NPS SaaS - Setup Script
# Este script configura o ambiente de desenvolvimento local

set -e

echo "🚀 Configurando ambiente de desenvolvimento do NPS SaaS..."

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

# Verificar se o Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versão 18+ é necessário. Versão atual: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) encontrado"
}

# Verificar se o AWS CLI está instalado
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI não está instalado. Será necessário para deploy."
        print_warning "Instale em: https://aws.amazon.com/cli/"
    else
        print_success "AWS CLI encontrado"
    fi
}

# Verificar se o Serverless Framework está instalado
check_serverless() {
    if ! command -v serverless &> /dev/null; then
        print_warning "Serverless Framework não está instalado. Instalando globalmente..."
        npm install -g serverless
    else
        print_success "Serverless Framework encontrado"
    fi
}

# Instalar dependências do backend
install_backend() {
    print_status "Instalando dependências do backend..."
    cd nps-backend
    
    if [ ! -f package.json ]; then
        print_error "package.json não encontrado em nps-backend/"
        exit 1
    fi
    
    npm install
    print_success "Dependências do backend instaladas"
    cd ..
}

# Instalar dependências do frontend
install_frontend() {
    print_status "Instalando dependências do frontend..."
    cd nps-frontend
    
    if [ ! -f package.json ]; then
        print_error "package.json não encontrado em nps-frontend/"
        exit 1
    fi
    
    npm install
    print_success "Dependências do frontend instaladas"
    cd ..
}

# Instalar dependências da infraestrutura
install_infra() {
    print_status "Instalando dependências da infraestrutura..."
    cd nps-infra
    
    if [ ! -f package.json ]; then
        print_error "package.json não encontrado em nps-infra/"
        exit 1
    fi
    
    npm install
    print_success "Dependências da infraestrutura instaladas"
    cd ..
}

# Criar arquivos de ambiente
create_env_files() {
    print_status "Criando arquivos de ambiente..."
    
    # Backend .env
    if [ ! -f nps-backend/.env ]; then
        cp nps-backend/env.example nps-backend/.env
        print_success "Arquivo .env criado para o backend"
    else
        print_warning "Arquivo .env já existe no backend"
    fi
    
    # Frontend .env
    if [ ! -f nps-frontend/.env ]; then
        cat > nps-frontend/.env << EOF
VITE_API_URL=http://localhost:3000
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
EOF
        print_success "Arquivo .env criado para o frontend"
    else
        print_warning "Arquivo .env já existe no frontend"
    fi
    
    # Terraform .tfvars
    if [ ! -f nps-infra/terraform/terraform.tfvars ]; then
        cp nps-infra/terraform/terraform.tfvars.example nps-infra/terraform/terraform.tfvars
        print_success "Arquivo terraform.tfvars criado"
    else
        print_warning "Arquivo terraform.tfvars já existe"
    fi
}

# Verificar estrutura de pastas
check_structure() {
    print_status "Verificando estrutura de pastas..."
    
    required_dirs=("nps-backend" "nps-frontend" "nps-infra")
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            print_error "Diretório $dir não encontrado"
            exit 1
        fi
    done
    
    print_success "Estrutura de pastas verificada"
}

# Mostrar próximos passos
show_next_steps() {
    echo ""
    echo "🎉 Configuração concluída com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo ""
    echo "1. Configure as variáveis de ambiente:"
    echo "   - Edite nps-backend/.env com suas configurações"
    echo "   - Edite nps-frontend/.env com a URL da API"
    echo "   - Edite nps-infra/terraform/terraform.tfvars com suas configurações AWS"
    echo ""
    echo "2. Configure o AWS CLI:"
    echo "   aws configure"
    echo ""
    echo "3. Deploy da infraestrutura:"
    echo "   cd nps-infra && npm run deploy:dev"
    echo ""
    echo "4. Execute o backend localmente:"
    echo "   cd nps-backend && npm run dev"
    echo ""
    echo "5. Execute o frontend localmente:"
    echo "   cd nps-frontend && npm run dev"
    echo ""
    echo "📚 Documentação completa em README.md"
    echo ""
}

# Executar verificações e instalações
main() {
    echo "🔧 Iniciando configuração do ambiente de desenvolvimento..."
    echo ""
    
    check_node
    check_aws_cli
    check_serverless
    check_structure
    install_backend
    install_frontend
    install_infra
    create_env_files
    show_next_steps
}

# Executar script principal
main "$@"
