#!/bin/bash

# NPS SaaS - Development Script
# Este script executa o ambiente de desenvolvimento local

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

# Função para matar processos em background
cleanup() {
    print_status "Parando serviços..."
    jobs -p | xargs -r kill
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar se os serviços estão rodando
check_services() {
    print_status "Verificando se os serviços estão rodando..."
    
    # Verificar se o backend está rodando
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend já está rodando em http://localhost:3000"
    else
        print_warning "Backend não está rodando"
    fi
    
    # Verificar se o frontend está rodando
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend já está rodando em http://localhost:5173"
    else
        print_warning "Frontend não está rodando"
    fi
}

# Executar backend
start_backend() {
    print_status "Iniciando backend..."
    cd nps-backend
    
    # Verificar se .env existe
    if [ ! -f .env ]; then
        print_error "Arquivo .env não encontrado no backend. Execute ./scripts/setup.sh primeiro."
        exit 1
    fi
    
    # Instalar dependências se necessário
    if [ ! -d node_modules ]; then
        print_status "Instalando dependências do backend..."
        npm install
    fi
    
    # Executar backend em background
    npm run dev &
    BACKEND_PID=$!
    
    # Aguardar backend iniciar
    print_status "Aguardando backend iniciar..."
    sleep 5
    
    # Verificar se backend iniciou
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend iniciado com sucesso (PID: $BACKEND_PID)"
    else
        print_error "Falha ao iniciar backend"
        exit 1
    fi
    
    cd ..
}

# Executar frontend
start_frontend() {
    print_status "Iniciando frontend..."
    cd nps-frontend
    
    # Verificar se .env existe
    if [ ! -f .env ]; then
        print_error "Arquivo .env não encontrado no frontend. Execute ./scripts/setup.sh primeiro."
        exit 1
    fi
    
    # Instalar dependências se necessário
    if [ ! -d node_modules ]; then
        print_status "Instalando dependências do frontend..."
        npm install
    fi
    
    # Executar frontend em background
    npm run dev &
    FRONTEND_PID=$!
    
    # Aguardar frontend iniciar
    print_status "Aguardando frontend iniciar..."
    sleep 5
    
    # Verificar se frontend iniciou
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend iniciado com sucesso (PID: $FRONTEND_PID)"
    else
        print_error "Falha ao iniciar frontend"
        exit 1
    fi
    
    cd ..
}

# Mostrar status dos serviços
show_status() {
    echo ""
    echo "🎉 Ambiente de desenvolvimento iniciado!"
    echo ""
    echo "📱 Serviços disponíveis:"
    echo "   Backend API: http://localhost:3000"
    echo "   Frontend:    http://localhost:5173"
    echo "   API Docs:    http://localhost:3000/docs"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "   - Para parar: Ctrl+C"
    echo "   - Logs do backend: tail -f nps-backend/logs/app.log"
    echo "   - Logs do frontend: verifique o terminal"
    echo ""
    echo "📚 Documentação: README.md"
    echo ""
}

# Executar apenas backend
backend_only() {
    print_status "Iniciando apenas o backend..."
    start_backend
    show_status
    wait
}

# Executar apenas frontend
frontend_only() {
    print_status "Iniciando apenas o frontend..."
    start_frontend
    show_status
    wait
}

# Executar ambos os serviços
start_all() {
    print_status "Iniciando ambiente completo..."
    start_backend
    start_frontend
    show_status
    wait
}

# Mostrar ajuda
show_help() {
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  backend    Inicia apenas o backend"
    echo "  frontend   Inicia apenas o frontend"
    echo "  all        Inicia backend e frontend (padrão)"
    echo "  status     Mostra status dos serviços"
    echo "  help       Mostra esta ajuda"
    echo ""
}

# Função principal
main() {
    case "${1:-all}" in
        "backend")
            backend_only
            ;;
        "frontend")
            frontend_only
            ;;
        "all")
            start_all
            ;;
        "status")
            check_services
            ;;
        "help")
            show_help
            ;;
        *)
            print_error "Opção inválida: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar script principal
main "$@"
