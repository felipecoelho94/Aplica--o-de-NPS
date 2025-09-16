# Guia de Contribuição - NPS SaaS

Obrigado por considerar contribuir com o projeto NPS SaaS! Este documento fornece diretrizes e informações para contribuidores.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Deploy](#deploy)

## 🤝 Como Contribuir

### 1. Fork e Clone

1. Faça um fork do repositório
2. Clone seu fork localmente:
   ```bash
   git clone https://github.com/seu-usuario/nps-saas.git
   cd nps-saas
   ```

### 2. Configurar Branch

1. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. Configure o upstream:
   ```bash
   git remote add upstream https://github.com/organizacao/nps-saas.git
   ```

### 3. Desenvolvimento

1. Siga os [padrões de código](#padrões-de-código)
2. Escreva testes para suas mudanças
3. Execute os testes localmente
4. Faça commits descritivos

### 4. Pull Request

1. Push para sua branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```

2. Abra um Pull Request no GitHub
3. Preencha o template do PR
4. Aguarde a revisão

## 🛠 Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- AWS CLI configurado
- Git
- Docker (opcional)

### Setup Automático

```bash
# Execute o script de setup
./scripts/setup.sh
```

### Setup Manual

#### Backend

```bash
cd nps-backend
npm install
cp env.example .env
# Edite o arquivo .env com suas configurações
npm run dev
```

#### Frontend

```bash
cd nps-frontend
npm install
cp .env.example .env
# Edite o arquivo .env com suas configurações
npm run dev
```

#### Infraestrutura

```bash
cd nps-infra
npm install
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edite o arquivo terraform.tfvars
```

## 📝 Padrões de Código

### TypeScript/JavaScript

- Use ESLint e Prettier
- Siga as convenções do projeto
- Documente funções complexas
- Use nomes descritivos para variáveis e funções

### React

- Use componentes funcionais
- Hooks para gerenciamento de estado
- Props tipadas com TypeScript
- Componentes reutilizáveis

### CSS

- Use Tailwind CSS
- Classes utilitárias quando possível
- Componentes customizados para padrões repetitivos
- Design responsivo

### Commits

Use o padrão Conventional Commits:

```
tipo(escopo): descrição

Corpo da mensagem (opcional)

Rodapé (opcional)
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemplos:
- `feat(auth): adiciona login com Google`
- `fix(api): corrige validação de email`
- `docs(readme): atualiza instruções de instalação`

## 🔄 Processo de Pull Request

### 1. Antes de Abrir o PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passam localmente
- [ ] Documentação atualizada se necessário
- [ ] Branch atualizada com main

### 2. Template do PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Código revisado
- [ ] Sem conflitos

## Screenshots (se aplicável)
Adicione screenshots para mudanças na UI

## Testes
Descreva como testar as mudanças
```

### 3. Revisão

- Mantenha o PR focado em uma funcionalidade
- Responda aos comentários dos revisores
- Faça as correções solicitadas
- Mantenha o histórico de commits limpo

## 📁 Estrutura do Projeto

```
nps-saas/
├── nps-backend/          # Backend TypeScript + Fastify
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── services/     # Lógica de negócio
│   │   ├── middleware/   # Middlewares
│   │   └── types/        # Tipos TypeScript
│   └── tests/            # Testes do backend
├── nps-frontend/         # Frontend React + Vite
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── services/     # Serviços de API
│   │   └── stores/       # Estado global
│   └── tests/            # Testes do frontend
├── nps-infra/            # Infraestrutura como código
│   ├── serverless.yml    # Serverless Framework
│   └── terraform/        # Terraform
└── scripts/              # Scripts de automação
```

## 🧪 Testes

### Backend

```bash
cd nps-backend
npm test                 # Executar testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
```

### Frontend

```bash
cd nps-frontend
npm test                 # Executar testes
npm run test:ui         # Interface visual
npm run test:coverage   # Com cobertura
```

### Cobertura Mínima

- Backend: 80%
- Frontend: 70%

## 🚀 Deploy

### Desenvolvimento

```bash
./scripts/deploy.sh all dev
```

### Produção

```bash
./scripts/deploy.sh all prod
```

### Rollback

```bash
./scripts/deploy.sh rollback prod
```

## 🐛 Reportar Bugs

Use o template de issue do GitHub:

1. **Título**: Descrição clara do bug
2. **Descrição**: Passos para reproduzir
3. **Ambiente**: OS, versão do Node.js, etc.
4. **Screenshots**: Se aplicável
5. **Logs**: Logs de erro relevantes

## 💡 Sugerir Funcionalidades

Use o template de feature request:

1. **Título**: Nome da funcionalidade
2. **Descrição**: Problema que resolve
3. **Solução**: Como implementar
4. **Alternativas**: Outras opções consideradas

## 📞 Suporte

- **Documentação**: README.md
- **Issues**: GitHub Issues
- **Discussões**: GitHub Discussions
- **Email**: suporte@nps-saas.com

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

Obrigado a todos os contribuidores que ajudam a tornar este projeto melhor!

---

**Lembre-se**: Contribuições são bem-vindas! Seja respeitoso e construtivo nas discussões.
