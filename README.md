# VS Code Profile Launcher

Um launcher inteligente de profiles do VS Code construído com Electron, TypeScript, SQLite e integração com IA (Gemini e OpenAI). Permite criar, gerenciar e lançar profiles personalizados do VS Code com configurações específicas para diferentes linguagens de programação.

## 🚀 Características

### Core Features
- **Gestão de Profiles**: Crie, edite e delete profiles do VS Code
- **Interface Moderna**: Design inspirado no VS Code com tema escuro
- **Filtros e Pesquisa**: Encontre profiles rapidamente por nome ou linguagem
- **Lançamento Rápido**: Duplo-clique para abrir o VS Code com configurações específicas

### Integração com IA
- **Google Gemini**: Suporte completo à API do Gemini (1.0 Pro, 1.5 Flash, 1.5 Pro)
- **OpenAI**: Integração com GPT-3.5 Turbo, GPT-4 e GPT-4 Turbo
- **Geração de Templates**: Gere templates de código personalizados usando IA
- **Configuração por Profile**: Cada profile pode ter seu próprio provedor e modelo de IA

### Editor de Código
- **Monaco Editor**: Editor de código integrado (mesmo usado no VS Code)
- **Syntax Highlighting**: Suporte para múltiplas linguagens
- **Templates Personalizados**: Crie templates específicos para cada profile

### Configurações Avançadas
- **Variáveis de Ambiente**: Configure variáveis específicas por profile
- **Caminhos de Workspace**: Defina diretórios de trabalho padrão
- **Gerenciamento de Chaves API**: Interface segura para configurar credenciais

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Electron, TypeScript, Node.js
- **Banco de Dados**: SQLite (better-sqlite3)
- **Editor**: Monaco Editor
- **IA APIs**: Google Generative AI, OpenAI API
- **Build Tools**: TypeScript Compiler, Electron Builder

## 📦 Instalação

### Pré-requisitos
- Node.js (v18 ou superior)
- VS Code instalado e acessível via linha de comando (`code`)
- Git

### Passos de Instalação

1. **Clone o repositório**:
   ```bash
   git clone <repository-url>
   cd vscode-profile-launcher
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione suas chaves de API:
   ```env
   GEMINI_API_KEY=sua_chave_gemini_aqui
   OPENAI_API_KEY=sua_chave_openai_aqui
   ```

4. **Compile o projeto**:
   ```bash
   npm run build
   ```

5. **Execute em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🔧 Configuração das APIs de IA

### Google Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. Adicione a chave no arquivo `.env` ou nas configurações do app

### OpenAI
1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma nova chave de API
3. Adicione a chave no arquivo `.env` ou nas configurações do app

## 🎯 Como Usar

### Criando um Profile

1. **Clique em "New Profile"** na barra superior
2. **Preencha as informações básicas**:
   - Nome do profile
   - Linguagem principal
   - Descrição (opcional)
   - Caminho do workspace (opcional)

3. **Configure a IA (opcional)**:
   - Selecione o provedor (Gemini ou OpenAI)
   - Escolha o modelo desejado
   - Gere templates de código automaticamente

4. **Adicione variáveis de ambiente** se necessário

5. **Personalize o template de código** usando o Monaco Editor

6. **Salve o profile**

### Lançando o VS Code

- **Duplo-clique** em qualquer profile para abrir o VS Code
- O VS Code será aberto com:
  - Profile específico
  - Workspace configurado (se definido)
  - Extensões otimizadas
  - Performance melhorada

### Gerenciando Profiles

- **Editar**: Clique com o botão direito → "Edit Profile"
- **Deletar**: Clique com o botão direito → "Delete Profile"
- **Filtrar**: Use a barra de pesquisa ou filtro por linguagem
- **Visualizar**: Veja informações como última utilização e configuração de IA

## 📁 Estrutura do Projeto

O projeto segue o padrão arquitetural **MVC (Model-View-Controller)** para melhor organização e manutenibilidade.

```
vscode-profile-launcher/
├── src/
│   ├── controllers/         # Controllers MVC (lógica de negócio)
│   │   ├── ProfileController.ts
│   │   ├── SettingsController.ts
│   │   ├── AIController.ts
│   │   └── GitHubController.ts
│   ├── models/              # Models MVC (modelos de dados)
│   │   └── Profile.ts
│   ├── services/            # Serviços externos
│   │   ├── DatabaseService.ts
│   │   ├── ConfigService.ts
│   │   ├── AIService.ts
│   │   └── GitHubService.ts
│   ├── views/               # Views MVC (componentes UI)
│   │   ├── components/
│   │   └── pages/
│   ├── utils/               # Utilitários
│   ├── types.ts             # Definições de tipos TypeScript
│   ├── main.ts              # Processo principal do Electron
│   ├── preload.ts           # Script de preload (segurança)
│   └── renderer/
│       ├── index.html       # Interface principal
│       ├── styles.css       # Estilos CSS
│       └── app.js           # Lógica do frontend
├── docs/                    # Documentação
│   ├── architecture/        # Documentação de arquitetura
│   ├── api/                 # Documentação de APIs
│   ├── guides/              # Guias
│   └── tech/                # Documentação técnica
├── scripts/                 # Scripts auxiliares
│   ├── build/
│   ├── deploy/
│   └── utils/
├── tests/                   # Testes
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── dist/                    # Arquivos compilados
├── .env                     # Variáveis de ambiente
├── package.json             # Configurações do projeto
└── tsconfig.json           # Configurações do TypeScript
```

Para mais detalhes sobre a arquitetura MVC, consulte [docs/architecture/MVC-ARCHITECTURE.md](docs/architecture/MVC-ARCHITECTURE.md).

## 🔨 Scripts de Build

```bash
# Desenvolvimento
npm run dev              # Inicia em modo desenvolvimento com hot reload
npm run build:watch     # Compila TypeScript em modo watch

# Produção
npm run build           # Compila TypeScript
npm run start           # Inicia a aplicação compilada
npm run pack            # Cria pacote para distribuição
npm run dist            # Cria executável para distribuição
```

## 🌟 Recursos Avançados

### Templates de Código
- Templates padrão para TypeScript, JavaScript, Python, Go, Rust, C#, Java, C++, PHP, Ruby
- Geração automática via IA baseada na descrição do projeto
- Editor Monaco integrado com syntax highlighting
- Salvamento automático de templates personalizados

### Integração com VS Code
- Lançamento otimizado com flags de performance
- Suporte a VS Code e VS Code Insiders
- Criação automática de profiles isolados
- Desabilitação de extensões desnecessárias para melhor performance

### Segurança
- Context isolation habilitado
- Node integration desabilitado no renderer
- Armazenamento seguro de chaves API
- Sanitização de inputs do usuário

## 🐛 Solução de Problemas

### VS Code não abre
- Verifique se o comando `code` está disponível no PATH
- Configure o comando correto nas configurações (Settings → General)
- Para VS Code Insiders, use `code-insiders`

### Erro de API de IA
- Verifique se as chaves de API estão corretas
- Confirme se há créditos/quota disponível nas plataformas
- Teste a conectividade com a internet

### Banco de dados corrompido
- Delete o arquivo `profiles.db` em `~/.config/vscode-profile-launcher/`
- Reinicie a aplicação (um novo banco será criado)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Electron](https://electronjs.org/) - Framework para aplicações desktop
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Editor de código
- [Google Generative AI](https://ai.google.dev/) - API do Gemini
- [OpenAI](https://openai.com/) - APIs de IA
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3) - Driver SQLite

---

**Desenvolvido com ❤️ para desenvolvedores que amam produtividade e código limpo.**