# GitHub Integration - Separate Window Implementation Plan

## 📋 Overview

Implementação completa de uma janela Electron separada para GitHub Integration, seguindo todo o ciclo de desenvolvimento: Design → Development → Testing → Deployment → Maintenance.

---

## 🎯 Objetivos

### Funcional

- Janela dedicada para gerenciar integração GitHub
- Mais espaço para visualização de repositórios/branches
- Experiência desktop nativa e profissional
- Independência da janela principal

### Técnico

- Arquitetura multi-window no Electron
- Comunicação IPC robusta entre janelas
- Persistência de estado e posicionamento
- Performance otimizada

---

## 📐 Fase 1: Design & Architecture (4-6 horas)

### 1.1 UI/UX Design

#### 1.1.1 Fluxo de Navegação

```
Profile Card (Double Click)
         │
         ├─── Has GitHub Config? ────┐
         │                            │
        YES                          NO
         │                            │
         ▼                            ▼
Repository Manager Window    GitHub Integration Setup Window
(Main View)                  (Configuration)
         │
         ├─── View Issues
         ├─── View Pull Requests
         ├─── View Commits
         ├─── View Branches
         └─── Open Issue ────▶ AI Assistant Window
                              (Chat-style Interface)
```

#### 1.1.2 Repository Manager Window (Main View)

**Trigger**: Duplo clique no profile card quando já tem GitHub configurado

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 📁 rootkitoriginal/vscode-profile-launcher                            [_][□][X]   │
├───────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────────┐  │
│ │ 📊 Overview │ 📋 Issues(3) │ 🔀 PRs (1)   │ 💾 Commits   │ ⚙️ Settings      │  │
│ └─────────────┴──────────────┴──────────────┴──────────────┴──────────────────┘  │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  🌿 Branch: master (default) 🔒                    [🔄 Sync] [📂 Open in VSCode] │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 📊 Repository Statistics                                                 │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  ⭐ 15 stars        👁️ 3 watchers       🍴 2 forks                       │    │
│  │  📝 45 commits     🌿 3 branches        🏷️ 2 releases                    │    │
│  │  📁 125 files      💾 2.5 MB           📅 Updated 2 hours ago           │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 📋 Recent Issues                                     [+ New Issue]       │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  #11 🎨 UI/UX Improvements - Custom Menu System                         │    │
│  │      🏷️ enhancement, feature, frontend  👤 rootkitoriginal  🕒 1h ago   │    │
│  │      [💬 View] [🤖 Open with AI]                                         │    │
│  │                                                                          │    │
│  │  #8  📦 App.js Refactoring - 70% Reduction COMPLETE                     │    │
│  │      🏷️ refactor, architecture          👤 copilot       🕒 2 days ago  │    │
│  │      [💬 View] [🤖 Open with AI]                                         │    │
│  │                                                                          │    │
│  │  #1  🏗️ MVC Architecture Implementation COMPLETE                        │    │
│  │      🏷️ architecture, backend           👤 rootkitoriginal  🕒 5 days   │    │
│  │      [💬 View] [🤖 Open with AI]                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 🔀 Active Pull Requests                              [+ New PR]          │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  #12 ✨ feat: Add comprehensive UI/UX improvements                       │    │
│  │      📊 +1,500 -50 lines  ✅ 3/3 checks  👤 copilot  🕒 Ready to merge   │    │
│  │      [📝 Review] [✅ Merge] [🤖 AI Review]                                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 💾 Recent Commits                                    [View All]          │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  750a6b4  docs: update issue #8 with completion status                  │    │
│  │           👤 rootkitoriginal  🕒 2 hours ago                             │    │
│  │                                                                          │    │
│  │  6fcaf77  Merge pull request #10 from documentation                     │    │
│  │           👤 rootkitoriginal  🕒 5 hours ago                             │    │
│  │                                                                          │    │
│  │  b794b5d  fix: resolve ESLint indentation errors                        │    │
│  │           👤 rootkitoriginal  🕒 6 hours ago                             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

#### 1.1.3 AI Assistant Window (Chat Interface)

**Trigger**: Clique no botão "🤖 Open with AI" em qualquer issue/PR

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 🤖 AI Assistant - Issue #11: UI/UX Improvements                       [_][□][X]   │
├───────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────┐  │
│ │ 📋 Context                                                                   │  │
│ │ Issue: #11 - UI/UX Improvements - Custom Menu System & Enhanced GitHub     │  │
│ │ Status: 🟢 Open | Labels: enhancement, feature, frontend, priority:high    │  │
│ │ Author: @rootkitoriginal | Assigned: @copilot                               │  │
│ └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 💡 Suggested Actions                                                     │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  [📝 Analyze Requirements]  [🏗️ Generate Implementation Plan]           │    │
│  │  [🧪 Create Test Cases]     [📚 Generate Documentation]                 │    │
│  │  [🔍 Review Code Changes]   [✅ Create Checklist]                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 💬 Chat History                                                          │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                          │    │
│  │  🤖 AI Assistant                                               10:30 AM  │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │    │
│  │  │ Olá! Estou analisando a Issue #11 sobre melhorias de UI/UX.     │   │    │
│  │  │                                                                  │   │    │
│  │  │ Identifiquei que o PR #12 já implementou 60% das funcionalidades│   │    │
│  │  │ planejadas. Posso ajudar com:                                   │   │    │
│  │  │                                                                  │   │    │
│  │  │ 1. Implementar a Janela GitHub Separada (4-5 dias)              │   │    │
│  │  │ 2. Criar Sistema de Menu Customizado (2 dias)                   │   │    │
│  │  │ 3. Revisar código existente                                     │   │    │
│  │  │                                                                  │   │    │
│  │  │ O que você gostaria de fazer primeiro?                          │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  │  👤 You                                                        10:32 AM  │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │    │
│  │  │ Vamos implementar a Janela GitHub Separada. Pode criar um       │   │    │
│  │  │ plano detalhado com mockups e código?                           │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  │  🤖 AI Assistant                                               10:33 AM  │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │    │
│  │  │ Perfeito! Criei um plano completo em:                           │   │    │
│  │  │ 📄 docs/features/GITHUB-WINDOW-IMPLEMENTATION.md                │   │    │
│  │  │                                                                  │   │    │
│  │  │ O plano inclui:                                                 │   │    │
│  │  │ ✅ Mockups completos (Main Window + AI Chat)                    │   │    │
│  │  │ ✅ Arquitetura multi-window com IPC                             │   │    │
│  │  │ ✅ Código TypeScript completo                                   │   │    │
│  │  │ ✅ Testes (Unit + Integration + E2E)                            │   │    │
│  │  │ ✅ Build scripts e CI/CD                                        │   │    │
│  │  │                                                                  │   │    │
│  │  │ [📂 Open File] [🚀 Start Implementation]                        │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  │  👤 You                                                        10:35 AM  │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │    │
│  │  │ Ótimo! Vamos começar. Pode criar a branch e os arquivos base?  │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                          │    │
│  │  🤖 AI Assistant                                     ⏳ Typing...       │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 💬 Type your message...                                                  │    │
│  │ ┌────────────────────────────────────────────────────────────────────┐  │    │
│  │ │                                                                     │  │    │
│  │ │  [📎 Attach File]  [💻 Insert Code]  [📸 Screenshot]               │  │    │
│  │ └────────────────────────────────────────────────────────────────────┘  │    │
│  │                                                     [Send Message 🚀]    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ 🎯 Quick Prompts (Context-Aware)                                         │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  💡 "Explique os requisitos desta issue"                                │    │
│  │  🏗️ "Crie um plano de implementação passo a passo"                      │    │
│  │  📝 "Gere uma lista de tarefas (checklist)"                             │    │
│  │  🧪 "Sugira casos de teste para esta feature"                           │    │
│  │  📊 "Analise o impacto desta mudança no projeto"                        │    │
│  │  🔍 "Revise o código relacionado a esta issue"                          │    │
│  │  📚 "Gere documentação para esta funcionalidade"                        │    │
│  │  ⚡ "Identifique possíveis problemas ou edge cases"                     │    │
│  │  🎨 "Sugira melhorias de UX/UI"                                         │    │
│  │  🚀 "Crie um roadmap de desenvolvimento"                                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

#### 1.1.4 GitHub Integration Setup Window

**Trigger**: Duplo clique no profile card quando NÃO tem GitHub configurado, ou clique em "⚙️ Settings" > "GitHub"

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Integration Setup                              [_][□][X]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔑 GitHub Token                                      │   │
│  │ ┌───────────────────────────────────────────────┐   │   │
│  │ │ ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx      │   │   │
│  │ └───────────────────────────────────────────────┘   │   │
│  │ [ Validate Token ]                                   │   │
│  │ ✅ Valid - User: @rootkitoriginal                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 Repository Owner                                  │   │
│  │ ┌───────────────────────────────────────────────┐   │   │
│  │ │ 🔽 rootkitoriginal (You)                      │   │   │
│  │ └───────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📁 Repository                                        │   │
│  │ ┌───────────────────────────────────────────────┐   │   │
│  │ │ 🔽 vscode-profile-launcher                    │   │   │
│  │ └───────────────────────────────────────────────┘   │   │
│  │ 🌍 Public • ⭐ 15 stars • Updated 2 hours ago     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🌿 Branch                                            │   │
│  │ ┌───────────────────────────────────────────────┐   │   │
│  │ │ 🔽 master (default)                           │   │   │
│  │ └───────────────────────────────────────────────┘   │   │
│  │ 🔒 Protected • Last commit: 3 hours ago            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📊 Repository Info                                   │   │
│  │ • Default Branch: master                             │   │
│  │ • Last Push: 2025-10-06 22:30:15                    │   │
│  │ • Open Issues: 3                                     │   │
│  │ • Open PRs: 1                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      [Cancel]  [Apply & Close]              │
└─────────────────────────────────────────────────────────────┘
```

#### Dimensões e Comportamento

- **Tamanho Inicial**: 900x700px
- **Tamanho Mínimo**: 600x500px
- **Tamanho Máximo**: Unlimited
- **Redimensionável**: Sim
- **Centralizável**: Sim (primeira vez)
- **Posição Persistente**: Sim
- **Modal**: Não (pode trabalhar com ambas janelas)

### 1.2 Arquitetura Técnica

#### Estrutura de Arquivos

```
src/
├── main.ts                           # Window manager principal
├── windows/
│   ├── WindowManager.ts              # Gerenciamento de janelas
│   ├── GitHubWindow.ts               # Classe específica GitHub
│   └── WindowStateManager.ts         # Persistência de estado
├── renderer/
│   ├── github-window/
│   │   ├── index.html                # HTML da janela
│   │   ├── styles.css                # Estilos específicos
│   │   ├── main.js                   # Lógica principal
│   │   └── components/
│   │       ├── TokenValidator.js     # Componente de validação
│   │       ├── OwnerSelector.js      # Seletor de owner
│   │       ├── RepoSelector.js       # Seletor de repositório
│   │       ├── BranchSelector.js     # Seletor de branch
│   │       └── RepoInfoPanel.js      # Painel de informações
│   └── github-window-preload.ts      # Preload específico
├── services/
│   └── WindowPreferencesService.ts   # Service de preferências
└── types/
    └── window.types.ts               # Tipos TypeScript

tests/
├── e2e/
│   └── github-window.spec.ts         # Testes E2E
└── integration/
    └── window-ipc.test.ts            # Testes de IPC
```

#### Fluxo de Dados (IPC Architecture)

```
┌─────────────────────┐                  ┌─────────────────────┐
│   Main Window       │                  │   GitHub Window     │
│                     │                  │                     │
│  [Open GitHub]      │──────IPC────────▶│  Load Initial Data  │
│                     │    open-github   │                     │
└─────────────────────┘                  └──────────┬──────────┘
                                                    │
                                                    │ IPC
                                                    │ validate-token
                                                    │ get-owners
                                                    │ get-repos
                                                    │ get-branches
                                                    │
                                         ┌──────────▼──────────┐
                                         │   Main Process      │
                                         │                     │
                                         │  GitHubController   │
                                         │  GitHubService      │
                                         │                     │
                                         └──────────┬──────────┘
                                                    │
                                                    │ Response
                                                    │
                                         ┌──────────▼──────────┐
                                         │   GitHub Window     │
                                         │                     │
                                         │  Update UI          │
                                         │                     │
                                         └──────────┬──────────┘
                                                    │
                                                    │ IPC
                                                    │ apply-github-config
                                                    │
┌─────────────────────┐                  ┌──────────▼──────────┐
│   Main Window       │◀─────IPC─────────│   GitHub Window     │
│                     │  github-updated  │                     │
│  Update Profile     │                  │  [Close Window]     │
│                     │                  │                     │
└─────────────────────┘                  └─────────────────────┘
```

---

## � 1.1.5 Integração com Profile Cards

### Comportamento do Duplo Clique

```typescript
// src/renderer/components/ProfileCard.js

function setupProfileCardEvents(profileCard, profile) {
    profileCard.addEventListener('dblclick', async () => {
        if (profile.githubRepo && profile.githubRepo.owner && profile.githubRepo.repo) {
            // TEM configuração GitHub → Abre Repository Manager
            await window.electronAPI.openRepositoryManager(profile.id);
        } else {
            // NÃO TEM configuração → Abre GitHub Setup
            await window.electronAPI.openGitHubSetup(profile.id);
        }
    });

    // Botão "Open in VSCode" continua no menu de contexto (clique direito)
    profileCard.addEventListener('contextmenu', e => {
        e.preventDefault();
        showContextMenu(profile, e.clientX, e.clientY);
    });
}

function showContextMenu(profile, x, y) {
    const menu = [
        { label: '📂 Open in VSCode', action: () => openInVSCode(profile) },
        { label: '✏️ Edit Profile', action: () => editProfile(profile) },
        { label: '🔗 GitHub Manager', action: () => openRepositoryManager(profile) },
        { type: 'separator' },
        { label: '🗑️ Delete', action: () => deleteProfile(profile) },
    ];

    displayContextMenu(menu, x, y);
}
```

### Fluxo Visual

```text
╔═══════════════════════════════════════════════════════════════════╗
║                    PROFILE CARD INTERACTIONS                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────────────────────────────────────┐             ║
║  │  📁 vscode-profile-launcher                     │             ║
║  │  TypeScript Project                             │             ║
║  │                                                  │             ║
║  │  🔗 rootkitoriginal/vscode-profile-launcher     │             ║
║  │  🌿 master • ⭐ 15 stars                         │             ║
║  └─────────────────────────────────────────────────┘             ║
║           │                         │                             ║
║           │ Double Click            │ Right Click                 ║
║           │                         │                             ║
║           ▼                         ▼                             ║
║  ┌─────────────────────┐   ┌───────────────────┐                ║
║  │ Repository Manager  │   │  Context Menu     │                ║
║  │  (GitHub View)      │   │  • Open VSCode    │                ║
║  │                     │   │  • Edit Profile   │                ║
║  │  • Issues           │   │  • GitHub Manager │                ║
║  │  • Pull Requests    │   │  • Delete         │                ║
║  │  • Commits          │   └───────────────────┘                ║
║  │  • Branches         │                                         ║
║  │  • AI Chat          │                                         ║
║  └─────────────────────┘                                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🤖 1.1.6 AI Assistant - Context-Aware Prompts

### Prompt Categories

#### 1. **Analysis & Planning** 📊

```text
Prompts voltados para análise e planejamento:

• "Analise os requisitos desta issue e identifique dependências"
• "Crie um plano de implementação com estimativas de tempo"
• "Identifique possíveis riscos técnicos"
• "Sugira uma arquitetura para esta funcionalidade"
• "Compare diferentes abordagens para resolver este problema"
• "Estime o esforço necessário em horas/dias"
```

#### 2. **Code Generation** 💻

```text
Prompts para geração de código:

• "Gere o código base para esta funcionalidade"
• "Crie testes unitários para o código proposto"
• "Implemente a validação de entrada necessária"
• "Crie os tipos TypeScript adequados"
• "Gere o componente React/Vue correspondente"
• "Adicione tratamento de erros robusto"
```

#### 3. **Review & Quality** 🔍

```text
Prompts de revisão e qualidade:

• "Revise o código desta PR e sugira melhorias"
• "Identifique possíveis bugs ou edge cases"
• "Verifique se há problemas de performance"
• "Analise a cobertura de testes"
• "Sugira refatorações para melhorar legibilidade"
• "Verifique conformidade com padrões de código"
```

#### 4. **Documentation** 📚

```text
Prompts de documentação:

• "Gere documentação completa para esta API"
• "Crie um README detalhado"
• "Documente os casos de uso principais"
• "Gere exemplos de código comentados"
• "Crie diagrams de arquitetura (Mermaid)"
• "Escreva um guia de migração"
```

#### 5. **Testing & Debugging** 🧪

```text
Prompts de testes e debugging:

• "Crie casos de teste para esta funcionalidade"
• "Gere testes E2E com Playwright"
• "Sugira cenários de teste que podem falhar"
• "Analise este erro e sugira correção"
• "Crie mocks para as dependências externas"
• "Gere dados de teste realistas"
```

#### 6. **Deployment & DevOps** 🚀

```text
Prompts de deploy e DevOps:

• "Crie pipeline CI/CD para esta mudança"
• "Gere scripts de build otimizados"
• "Configure monitoring e alertas"
• "Crie estratégia de rollback"
• "Documente o processo de deploy"
• "Configure ambientes de staging"
```

#### 7. **Communication** 💬

```text
Prompts de comunicação:

• "Resuma as mudanças para o changelog"
• "Gere release notes profissionais"
• "Crie comentários para code review"
• "Escreva uma mensagem de commit descritiva"
• "Prepare apresentação técnica da feature"
• "Responda perguntas técnicas do time"
```

### Dynamic Prompt Generation

```typescript
// src/services/AIPromptService.ts

interface ContextData {
    issue?: GitHubIssue;
    pullRequest?: GitHubPR;
    commit?: GitHubCommit;
    file?: FileContent;
    repository?: Repository;
}

class AIPromptService {
    /**
     * Gera prompts contextuais baseado no tipo de item
     */
    generateContextualPrompts(context: ContextData): Prompt[] {
        const prompts: Prompt[] = [];

        if (context.issue) {
            prompts.push(...this.getIssuePrompts(context.issue));
        }

        if (context.pullRequest) {
            prompts.push(...this.getPRPrompts(context.pullRequest));
        }

        if (context.commit) {
            prompts.push(...this.getCommitPrompts(context.commit));
        }

        // Adiciona prompts genéricos sempre disponíveis
        prompts.push(...this.getGenericPrompts());

        return prompts;
    }

    private getIssuePrompts(issue: GitHubIssue): Prompt[] {
        const prompts = [
            {
                icon: '💡',
                text: 'Explique os requisitos desta issue',
                action: async () => {
                    return await this.ai.chat(
                        `Analise a issue #${issue.number} e explique:
            1. Requisitos funcionais
            2. Requisitos não-funcionais
            3. Critérios de aceitação
            4. Dependências
            
            Issue: ${issue.title}
            Body: ${issue.body}`
                    );
                },
            },
            {
                icon: '🏗️',
                text: 'Crie um plano de implementação passo a passo',
                action: async () => {
                    return await this.ai.chat(
                        `Crie um plano detalhado de implementação para:
            Issue #${issue.number}: ${issue.title}
            
            O plano deve incluir:
            1. Fases de desenvolvimento (design, dev, test, deploy)
            2. Arquivos a criar/modificar
            3. Estimativa de tempo por fase
            4. Riscos e mitigações
            5. Critérios de sucesso
            
            Contexto: ${issue.body}`
                    );
                },
            },
            {
                icon: '📝',
                text: 'Gere uma lista de tarefas (checklist)',
                action: async () => {
                    return await this.ai.chat(
                        `Crie uma checklist detalhada de tarefas para implementar:
            Issue #${issue.number}: ${issue.title}
            
            Formato:
            - [ ] Tarefa 1
            - [ ] Tarefa 2
            ...
            
            Inclua tarefas de: design, código, testes, docs, deploy`
                    );
                },
            },
            {
                icon: '🧪',
                text: 'Sugira casos de teste para esta feature',
                action: async () => {
                    return await this.ai.chat(
                        `Sugira casos de teste completos para:
            Issue #${issue.number}: ${issue.title}
            
            Tipos de teste:
            1. Unit tests
            2. Integration tests
            3. E2E tests
            4. Edge cases
            5. Performance tests
            
            Para cada teste, forneça:
            - Nome do teste
            - Cenário
            - Dados de entrada
            - Resultado esperado`
                    );
                },
            },
        ];

        // Adiciona prompts específicos baseado em labels
        if (issue.labels.includes('bug')) {
            prompts.push({
                icon: '🐛',
                text: 'Analise o bug e sugira correção',
                action: async () => {
                    return await this.ai.chat(
                        `Analise o bug reportado em:
            Issue #${issue.number}: ${issue.title}
            
            Identifique:
            1. Causa raiz provável
            2. Arquivos potencialmente afetados
            3. Solução sugerida com código
            4. Testes para evitar regressão`
                    );
                },
            });
        }

        if (issue.labels.includes('enhancement')) {
            prompts.push({
                icon: '✨',
                text: 'Sugira melhorias adicionais',
                action: async () => {
                    return await this.ai.chat(
                        `Baseado na enhancement proposta em:
            Issue #${issue.number}: ${issue.title}
            
            Sugira:
            1. Melhorias complementares
            2. Features relacionadas
            3. Otimizações possíveis
            4. Integrações úteis`
                    );
                },
            });
        }

        return prompts;
    }

    private getPRPrompts(pr: GitHubPR): Prompt[] {
        return [
            {
                icon: '🔍',
                text: 'Revise esta Pull Request',
                action: async () => {
                    return await this.ai.chat(
                        `Faça uma revisão completa da PR #${pr.number}:
            
            Analise:
            1. Qualidade do código
            2. Padrões de projeto
            3. Performance
            4. Segurança
            5. Testes adequados
            6. Documentação
            
            Diff: ${pr.diff}`
                    );
                },
            },
            {
                icon: '📋',
                text: 'Gere checklist de review',
                action: async () => {
                    return await this.ai.chat(
                        `Crie uma checklist de review para PR #${pr.number}:
            
            Categorias:
            - [ ] Código
            - [ ] Testes
            - [ ] Documentação
            - [ ] Performance
            - [ ] Segurança`
                    );
                },
            },
            {
                icon: '✅',
                text: 'Aprove esta PR com comentários',
                action: async () => {
                    // Gera comentários de aprovação automáticos
                    const comments = await this.ai.chat(
                        `Gere comentários construtivos para aprovar PR #${pr.number}.
            Destaque pontos positivos e sugestões menores.`
                    );

                    // Envia para GitHub
                    await this.github.approvePR(pr.number, comments);
                },
            },
        ];
    }

    private getGenericPrompts(): Prompt[] {
        return [
            {
                icon: '❓',
                text: 'Responda uma pergunta personalizada',
                action: async (userQuestion: string) => {
                    return await this.ai.chat(userQuestion);
                },
            },
            {
                icon: '🎨',
                text: 'Sugira melhorias de UX/UI',
                action: async () => {
                    return await this.ai.chat(
                        `Analise a interface atual e sugira melhorias de UX/UI:
            1. Usabilidade
            2. Acessibilidade
            3. Feedback visual
            4. Performance percebida`
                    );
                },
            },
        ];
    }
}
```

---

## �💻 Fase 2: Development (8-12 horas)

### 2.1 Window Manager Implementation

#### `src/windows/WindowManager.ts`

```typescript
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { WindowStateManager } from './WindowStateManager';

export class WindowManager {
    private windows: Map<string, BrowserWindow> = new Map();
    private stateManager: WindowStateManager;

    constructor() {
        this.stateManager = new WindowStateManager();
    }

    /**
     * Cria janela GitHub com estado persistente
     */
    async createGitHubWindow(parentWindow: BrowserWindow): Promise<BrowserWindow> {
        // Carrega estado anterior ou usa defaults
        const state = await this.stateManager.loadState('github-window');
        const defaultState = this.getDefaultGitHubWindowState();
        const windowState = { ...defaultState, ...state };

        // Valida posição (pode estar fora da tela se monitor mudou)
        const validatedState = this.validateWindowPosition(windowState);

        const githubWindow = new BrowserWindow({
            width: validatedState.width,
            height: validatedState.height,
            x: validatedState.x,
            y: validatedState.y,
            minWidth: 600,
            minHeight: 500,
            parent: parentWindow,
            modal: false,
            show: false, // Mostra depois de carregar
            title: 'GitHub Integration',
            backgroundColor: '#1e1e1e',
            webPreferences: {
                preload: path.join(__dirname, '../renderer/github-window-preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
            },
            autoHideMenuBar: true,
            icon: path.join(__dirname, '../../assets/icon.png'),
        });

        // Carrega conteúdo
        if (process.env.NODE_ENV === 'development') {
            await githubWindow.loadFile(
                path.join(__dirname, '../renderer/github-window/index.html')
            );
            githubWindow.webContents.openDevTools({ mode: 'detach' });
        } else {
            await githubWindow.loadFile(
                path.join(__dirname, '../renderer/github-window/index.html')
            );
        }

        // Setup de event listeners
        this.setupWindowEventListeners(githubWindow, 'github-window');

        // Mostra janela quando pronto
        githubWindow.once('ready-to-show', () => {
            githubWindow.show();
            if (validatedState.isMaximized) {
                githubWindow.maximize();
            }
        });

        // Registra janela
        this.windows.set('github-window', githubWindow);

        return githubWindow;
    }

    /**
     * Setup de listeners para persistência de estado
     */
    private setupWindowEventListeners(window: BrowserWindow, windowId: string): void {
        // Salva estado ao mover
        window.on('move', () => {
            this.saveWindowState(window, windowId);
        });

        // Salva estado ao redimensionar
        window.on('resize', () => {
            this.saveWindowState(window, windowId);
        });

        // Salva estado ao maximizar/restaurar
        window.on('maximize', () => {
            this.saveWindowState(window, windowId);
        });

        window.on('unmaximize', () => {
            this.saveWindowState(window, windowId);
        });

        // Limpa referência ao fechar
        window.on('closed', () => {
            this.windows.delete(windowId);
        });

        // Previne reload acidental (Ctrl+R)
        window.webContents.on('before-input-event', (event, input) => {
            if (input.control && input.key.toLowerCase() === 'r') {
                event.preventDefault();
            }
        });
    }

    /**
     * Salva estado atual da janela
     */
    private async saveWindowState(window: BrowserWindow, windowId: string): Promise<void> {
        if (window.isDestroyed()) return;

        const bounds = window.getBounds();
        const state = {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized: window.isMaximized(),
        };

        await this.stateManager.saveState(windowId, state);
    }

    /**
     * Valida se posição da janela está visível
     */
    private validateWindowPosition(state: any): any {
        const displays = screen.getAllDisplays();
        const windowBounds = {
            x: state.x,
            y: state.y,
            width: state.width,
            height: state.height,
        };

        // Verifica se janela está em algum display
        const isVisible = displays.some(display => {
            const displayBounds = display.workArea;
            return (
                windowBounds.x >= displayBounds.x &&
                windowBounds.y >= displayBounds.y &&
                windowBounds.x + windowBounds.width <= displayBounds.x + displayBounds.width &&
                windowBounds.y + windowBounds.height <= displayBounds.y + displayBounds.height
            );
        });

        if (!isVisible) {
            // Retorna para centro da tela primária
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;
            return {
                ...state,
                x: Math.floor((width - state.width) / 2),
                y: Math.floor((height - state.height) / 2),
            };
        }

        return state;
    }

    /**
     * Estado default da janela GitHub
     */
    private getDefaultGitHubWindowState() {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        return {
            width: 900,
            height: 700,
            x: Math.floor((width - 900) / 2),
            y: Math.floor((height - 700) / 2),
            isMaximized: false,
        };
    }

    /**
     * Obtém janela por ID
     */
    getWindow(windowId: string): BrowserWindow | undefined {
        return this.windows.get(windowId);
    }

    /**
     * Fecha janela por ID
     */
    closeWindow(windowId: string): void {
        const window = this.windows.get(windowId);
        if (window && !window.isDestroyed()) {
            window.close();
        }
    }

    /**
     * Foca janela por ID
     */
    focusWindow(windowId: string): void {
        const window = this.windows.get(windowId);
        if (window && !window.isDestroyed()) {
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }
    }

    /**
     * Verifica se janela está aberta
     */
    isWindowOpen(windowId: string): boolean {
        const window = this.windows.get(windowId);
        return window !== undefined && !window.isDestroyed();
    }
}
```

#### `src/windows/WindowStateManager.ts`

```typescript
import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

interface WindowState {
    width: number;
    height: number;
    x: number;
    y: number;
    isMaximized: boolean;
}

export class WindowStateManager {
    private stateFile: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.stateFile = path.join(userDataPath, 'window-states.json');
    }

    /**
     * Carrega estado salvo da janela
     */
    async loadState(windowId: string): Promise<Partial<WindowState> | null> {
        try {
            const data = await fs.readFile(this.stateFile, 'utf-8');
            const states = JSON.parse(data);
            return states[windowId] || null;
        } catch (error) {
            // Arquivo não existe ou erro de leitura
            return null;
        }
    }

    /**
     * Salva estado da janela
     */
    async saveState(windowId: string, state: WindowState): Promise<void> {
        try {
            let states: Record<string, WindowState> = {};

            try {
                const data = await fs.readFile(this.stateFile, 'utf-8');
                states = JSON.parse(data);
            } catch {
                // Arquivo não existe, usa objeto vazio
            }

            states[windowId] = state;

            await fs.writeFile(this.stateFile, JSON.stringify(states, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save window state:', error);
        }
    }

    /**
     * Remove estado salvo
     */
    async deleteState(windowId: string): Promise<void> {
        try {
            const data = await fs.readFile(this.stateFile, 'utf-8');
            const states = JSON.parse(data);
            delete states[windowId];

            await fs.writeFile(this.stateFile, JSON.stringify(states, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to delete window state:', error);
        }
    }

    /**
     * Limpa todos os estados
     */
    async clearAll(): Promise<void> {
        try {
            await fs.unlink(this.stateFile);
        } catch (error) {
            // Arquivo não existe, ignora
        }
    }
}
```

### 2.2 IPC Communication

#### `src/main.ts` - Handlers IPC

```typescript
import { ipcMain, BrowserWindow } from 'electron';
import { WindowManager } from './windows/WindowManager';

// Instância global do WindowManager
const windowManager = new WindowManager();

/**
 * Handler para abrir janela GitHub
 */
ipcMain.handle('open-github-window', async event => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender);
    if (!senderWindow) return { success: false, error: 'No parent window' };

    try {
        // Verifica se já está aberta
        if (windowManager.isWindowOpen('github-window')) {
            windowManager.focusWindow('github-window');
            return { success: true, focused: true };
        }

        // Cria nova janela
        const githubWindow = await windowManager.createGitHubWindow(senderWindow);
        return { success: true, windowId: githubWindow.id };
    } catch (error) {
        console.error('Failed to open GitHub window:', error);
        return { success: false, error: error.message };
    }
});

/**
 * Handler para fechar janela GitHub
 */
ipcMain.handle('close-github-window', async () => {
    windowManager.closeWindow('github-window');
    return { success: true };
});

/**
 * Handler para aplicar configurações GitHub
 */
ipcMain.handle('apply-github-config', async (event, config) => {
    // Envia para janela principal
    const mainWindow = windowManager.getWindow('main');
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('github-config-updated', config);
    }

    // Fecha janela GitHub
    windowManager.closeWindow('github-window');

    return { success: true };
});

/**
 * Handler para obter configuração atual
 */
ipcMain.handle('get-current-github-config', async (event, profileId) => {
    // Obtém do profile controller
    const profile = await profileController.getProfile(profileId);
    return {
        success: true,
        config: profile.githubRepo,
    };
});
```

#### `src/renderer/github-window-preload.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// API exposta para renderer process
contextBridge.exposeInMainWorld('githubWindowAPI', {
    // GitHub operations
    validateToken: (token: string) => ipcRenderer.invoke('validate-github-token', token),

    getOwners: (token: string) => ipcRenderer.invoke('get-github-owners', token),

    getRepositories: (token: string, owner: string) =>
        ipcRenderer.invoke('get-github-repositories', { token, owner }),

    getBranches: (token: string, owner: string, repo: string) =>
        ipcRenderer.invoke('get-github-branches', { token, owner, repo }),

    // Window operations
    closeWindow: () => ipcRenderer.invoke('close-github-window'),

    applyConfig: (config: any) => ipcRenderer.invoke('apply-github-config', config),

    getCurrentConfig: (profileId: number) =>
        ipcRenderer.invoke('get-current-github-config', profileId),

    // Events
    onConfigRequest: (callback: (profileId: number) => void) => {
        ipcRenderer.on('request-github-config', (_event, profileId) => {
            callback(profileId);
        });
    },
});

// TypeScript declarations
declare global {
    interface Window {
        githubWindowAPI: {
            validateToken: (token: string) => Promise<any>;
            getOwners: (token: string) => Promise<any>;
            getRepositories: (token: string, owner: string) => Promise<any>;
            getBranches: (token: string, owner: string, repo: string) => Promise<any>;
            closeWindow: () => Promise<void>;
            applyConfig: (config: any) => Promise<any>;
            getCurrentConfig: (profileId: number) => Promise<any>;
            onConfigRequest: (callback: (profileId: number) => void) => void;
        };
    }
}
```

### 2.3 Frontend Implementation

#### `src/renderer/github-window/index.html`

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"
        />
        <title>GitHub Integration</title>
        <link rel="stylesheet" href="styles.css" />
    </head>
    <body>
        <div class="github-window">
            <header class="window-header">
                <h1>🔗 GitHub Integration</h1>
                <p class="subtitle">Connect your profile to a GitHub repository</p>
            </header>

            <main class="window-content">
                <!-- Token Section -->
                <section class="section token-section">
                    <h2>🔑 GitHub Token</h2>
                    <div class="input-group">
                        <input
                            type="password"
                            id="github-token"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            autocomplete="off"
                        />
                        <button id="validate-token-btn" class="btn-primary">Validate Token</button>
                    </div>
                    <div id="token-status" class="status-message"></div>
                </section>

                <!-- Owner Section -->
                <section class="section owner-section" style="display: none;">
                    <h2>👤 Repository Owner</h2>
                    <select id="owner-select" disabled>
                        <option value="">Select owner...</option>
                    </select>
                </section>

                <!-- Repository Section -->
                <section class="section repo-section" style="display: none;">
                    <h2>📁 Repository</h2>
                    <select id="repo-select" disabled>
                        <option value="">Select repository...</option>
                    </select>
                    <div id="repo-info" class="repo-info"></div>
                </section>

                <!-- Branch Section -->
                <section class="section branch-section" style="display: none;">
                    <h2>🌿 Branch</h2>
                    <select id="branch-select" disabled>
                        <option value="">Select branch...</option>
                    </select>
                    <div id="branch-info" class="branch-info"></div>
                </section>

                <!-- Summary Section -->
                <section class="section summary-section" style="display: none;">
                    <h2>📊 Configuration Summary</h2>
                    <div id="config-summary" class="config-summary"></div>
                </section>
            </main>

            <footer class="window-footer">
                <button id="cancel-btn" class="btn-secondary">Cancel</button>
                <button id="apply-btn" class="btn-primary" disabled>Apply & Close</button>
            </footer>

            <!-- Loading Overlay -->
            <div id="loading-overlay" class="loading-overlay" style="display: none;">
                <div class="spinner"></div>
                <p id="loading-message">Loading...</p>
            </div>
        </div>

        <script src="main.js"></script>
    </body>
</html>
```

#### `src/renderer/github-window/main.js`

```javascript
// State management
const state = {
    token: '',
    validatedUser: null,
    owners: [],
    selectedOwner: null,
    repositories: [],
    selectedRepo: null,
    branches: [],
    selectedBranch: null,
    profileId: null,
};

// DOM Elements
const elements = {
    tokenInput: document.getElementById('github-token'),
    validateBtn: document.getElementById('validate-token-btn'),
    tokenStatus: document.getElementById('token-status'),
    ownerSection: document.querySelector('.owner-section'),
    ownerSelect: document.getElementById('owner-select'),
    repoSection: document.querySelector('.repo-section'),
    repoSelect: document.getElementById('repo-select'),
    repoInfo: document.getElementById('repo-info'),
    branchSection: document.querySelector('.branch-section'),
    branchSelect: document.getElementById('branch-select'),
    branchInfo: document.getElementById('branch-info'),
    summarySection: document.querySelector('.summary-section'),
    configSummary: document.getElementById('config-summary'),
    cancelBtn: document.getElementById('cancel-btn'),
    applyBtn: document.getElementById('apply-btn'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingMessage: document.getElementById('loading-message'),
};

// Initialization
async function init() {
    setupEventListeners();

    // Recebe configuração atual se estiver editando
    window.githubWindowAPI.onConfigRequest(async profileId => {
        state.profileId = profileId;
        await loadCurrentConfig(profileId);
    });
}

// Event Listeners
function setupEventListeners() {
    elements.validateBtn.addEventListener('click', handleValidateToken);
    elements.ownerSelect.addEventListener('change', handleOwnerChange);
    elements.repoSelect.addEventListener('change', handleRepoChange);
    elements.branchSelect.addEventListener('change', handleBranchChange);
    elements.cancelBtn.addEventListener('click', handleCancel);
    elements.applyBtn.addEventListener('click', handleApply);

    // Auto-validate on paste
    elements.tokenInput.addEventListener('paste', () => {
        setTimeout(() => handleValidateToken(), 100);
    });
}

// Token validation
async function handleValidateToken() {
    const token = elements.tokenInput.value.trim();

    if (!token) {
        showError(elements.tokenStatus, 'Please enter a GitHub token');
        return;
    }

    showLoading('Validating token...');

    try {
        const result = await window.githubWindowAPI.validateToken(token);

        if (result.success) {
            state.token = token;
            state.validatedUser = result.user;

            showSuccess(elements.tokenStatus, `✅ Valid - User: @${result.user.login}`);

            // Load owners
            await loadOwners();
        } else {
            showError(elements.tokenStatus, `❌ ${result.error}`);
        }
    } catch (error) {
        showError(elements.tokenStatus, `❌ Validation failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Load owners
async function loadOwners() {
    showLoading('Loading owners...');

    try {
        const result = await window.githubWindowAPI.getOwners(state.token);

        if (result.success) {
            state.owners = result.owners;

            // Populate dropdown
            elements.ownerSelect.innerHTML = '<option value="">Select owner...</option>';
            result.owners.forEach(owner => {
                const option = document.createElement('option');
                option.value = owner.login;
                option.textContent = `${owner.login}${owner.type === 'User' ? ' (You)' : ' (Org)'}`;
                option.dataset.type = owner.type;
                elements.ownerSelect.appendChild(option);
            });

            // Enable and show
            elements.ownerSelect.disabled = false;
            elements.ownerSection.style.display = 'block';
        } else {
            showError(elements.tokenStatus, `Failed to load owners: ${result.error}`);
        }
    } catch (error) {
        showError(elements.tokenStatus, `Failed to load owners: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Owner change
async function handleOwnerChange() {
    const ownerLogin = elements.ownerSelect.value;

    if (!ownerLogin) {
        resetFrom('repo');
        return;
    }

    state.selectedOwner = state.owners.find(o => o.login === ownerLogin);

    await loadRepositories(ownerLogin);
}

// Load repositories
async function loadRepositories(owner) {
    showLoading('Loading repositories...');
    resetFrom('repo');

    try {
        const result = await window.githubWindowAPI.getRepositories(state.token, owner);

        if (result.success) {
            state.repositories = result.repositories;

            // Populate dropdown
            elements.repoSelect.innerHTML = '<option value="">Select repository...</option>';
            result.repositories.forEach(repo => {
                const option = document.createElement('option');
                option.value = repo.name;
                option.textContent = repo.name;
                option.dataset.info = JSON.stringify(repo);
                elements.repoSelect.appendChild(option);
            });

            // Enable and show
            elements.repoSelect.disabled = false;
            elements.repoSection.style.display = 'block';
        } else {
            showError(elements.repoInfo, `Failed to load repositories: ${result.error}`);
        }
    } catch (error) {
        showError(elements.repoInfo, `Failed to load repositories: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Repository change
async function handleRepoChange() {
    const repoName = elements.repoSelect.value;

    if (!repoName) {
        resetFrom('branch');
        return;
    }

    state.selectedRepo = state.repositories.find(r => r.name === repoName);

    // Show repo info
    showRepoInfo(state.selectedRepo);

    await loadBranches(state.selectedOwner.login, repoName);
}

// Show repository info
function showRepoInfo(repo) {
    const visibility = repo.private ? '🔒 Private' : '🌍 Public';
    const stars = `⭐ ${repo.stargazers_count} stars`;
    const updated = new Date(repo.updated_at).toLocaleString();

    elements.repoInfo.innerHTML = `
    <div class="repo-details">
      <span>${visibility}</span>
      <span>${stars}</span>
      <span>Updated: ${updated}</span>
    </div>
  `;
}

// Load branches
async function loadBranches(owner, repo) {
    showLoading('Loading branches...');
    resetFrom('branch');

    try {
        const result = await window.githubWindowAPI.getBranches(state.token, owner, repo);

        if (result.success) {
            state.branches = result.branches;

            // Populate dropdown
            elements.branchSelect.innerHTML = '<option value="">Select branch...</option>';
            result.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.name;
                option.textContent = branch.name;
                if (branch.name === state.selectedRepo.default_branch) {
                    option.textContent += ' (default)';
                }
                option.dataset.info = JSON.stringify(branch);
                elements.branchSelect.appendChild(option);
            });

            // Enable and show
            elements.branchSelect.disabled = false;
            elements.branchSection.style.display = 'block';
        } else {
            showError(elements.branchInfo, `Failed to load branches: ${result.error}`);
        }
    } catch (error) {
        showError(elements.branchInfo, `Failed to load branches: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Branch change
function handleBranchChange() {
    const branchName = elements.branchSelect.value;

    if (!branchName) {
        elements.applyBtn.disabled = true;
        elements.summarySection.style.display = 'none';
        return;
    }

    state.selectedBranch = state.branches.find(b => b.name === branchName);

    // Show branch info
    showBranchInfo(state.selectedBranch);

    // Show summary
    showSummary();

    // Enable apply button
    elements.applyBtn.disabled = false;
}

// Show branch info
function showBranchInfo(branch) {
    const protection = branch.protected ? '🔒 Protected' : '🔓 Unprotected';
    const lastCommit = new Date(branch.commit.commit.author.date).toLocaleString();

    elements.branchInfo.innerHTML = `
    <div class="branch-details">
      <span>${protection}</span>
      <span>Last commit: ${lastCommit}</span>
    </div>
  `;
}

// Show configuration summary
function showSummary() {
    elements.configSummary.innerHTML = `
    <div class="summary-grid">
      <div class="summary-item">
        <strong>Owner:</strong>
        <span>${state.selectedOwner.login}</span>
      </div>
      <div class="summary-item">
        <strong>Repository:</strong>
        <span>${state.selectedRepo.name}</span>
      </div>
      <div class="summary-item">
        <strong>Branch:</strong>
        <span>${state.selectedBranch.name}</span>
      </div>
      <div class="summary-item">
        <strong>Full Path:</strong>
        <span>${state.selectedOwner.login}/${state.selectedRepo.name}@${state.selectedBranch.name}</span>
      </div>
    </div>
  `;

    elements.summarySection.style.display = 'block';
}

// Reset sections from a point
function resetFrom(section) {
    if (section === 'owner' || section === 'repo' || section === 'branch') {
        elements.repoSection.style.display = 'none';
        elements.repoSelect.innerHTML = '<option value="">Select repository...</option>';
        elements.repoSelect.disabled = true;
        elements.repoInfo.innerHTML = '';
    }

    if (section === 'branch') {
        elements.branchSection.style.display = 'none';
        elements.branchSelect.innerHTML = '<option value="">Select branch...</option>';
        elements.branchSelect.disabled = true;
        elements.branchInfo.innerHTML = '';
    }

    elements.summarySection.style.display = 'none';
    elements.applyBtn.disabled = true;
}

// Handle apply
async function handleApply() {
    const config = {
        owner: state.selectedOwner.login,
        repo: state.selectedRepo.name,
        branch: state.selectedBranch.name,
        token: state.token,
    };

    showLoading('Applying configuration...');

    try {
        const result = await window.githubWindowAPI.applyConfig(config);

        if (result.success) {
            // Window will be closed by main process
        } else {
            showError(elements.configSummary, `Failed to apply: ${result.error}`);
            hideLoading();
        }
    } catch (error) {
        showError(elements.configSummary, `Failed to apply: ${error.message}`);
        hideLoading();
    }
}

// Handle cancel
async function handleCancel() {
    await window.githubWindowAPI.closeWindow();
}

// Load current config
async function loadCurrentConfig(profileId) {
    showLoading('Loading current configuration...');

    try {
        const result = await window.githubWindowAPI.getCurrentConfig(profileId);

        if (result.success && result.config) {
            // Pre-fill form
            // Implementation here...
        }
    } catch (error) {
        console.error('Failed to load config:', error);
    } finally {
        hideLoading();
    }
}

// UI Helpers
function showLoading(message) {
    elements.loadingMessage.textContent = message;
    elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

function showSuccess(element, message) {
    element.className = 'status-message success';
    element.textContent = message;
    element.style.display = 'block';
}

function showError(element, message) {
    element.className = 'status-message error';
    element.textContent = message;
    element.style.display = 'block';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
```

---

## 🧪 Fase 3: Testing (4-6 horas)

### 3.1 Unit Tests

#### `tests/unit/WindowManager.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BrowserWindow } from 'electron';
import { WindowManager } from '../../src/windows/WindowManager';

describe('WindowManager', () => {
    let windowManager: WindowManager;
    let mockParentWindow: BrowserWindow;

    beforeEach(() => {
        windowManager = new WindowManager();
        mockParentWindow = new BrowserWindow({ show: false });
    });

    afterEach(() => {
        mockParentWindow.close();
    });

    describe('createGitHubWindow', () => {
        it('should create a new GitHub window', async () => {
            const githubWindow = await windowManager.createGitHubWindow(mockParentWindow);

            expect(githubWindow).toBeInstanceOf(BrowserWindow);
            expect(githubWindow.getTitle()).toBe('GitHub Integration');

            githubWindow.close();
        });

        it('should apply default dimensions', async () => {
            const githubWindow = await windowManager.createGitHubWindow(mockParentWindow);
            const bounds = githubWindow.getBounds();

            expect(bounds.width).toBe(900);
            expect(bounds.height).toBe(700);

            githubWindow.close();
        });

        it('should restore previous window state', async () => {
            // First window
            const window1 = await windowManager.createGitHubWindow(mockParentWindow);
            window1.setBounds({ x: 100, y: 100, width: 800, height: 600 });
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for save
            window1.close();

            // Second window should restore position
            const window2 = await windowManager.createGitHubWindow(mockParentWindow);
            const bounds = window2.getBounds();

            expect(bounds.x).toBe(100);
            expect(bounds.y).toBe(100);
            expect(bounds.width).toBe(800);
            expect(bounds.height).toBe(600);

            window2.close();
        });
    });

    describe('isWindowOpen', () => {
        it('should return true when window is open', async () => {
            const githubWindow = await windowManager.createGitHubWindow(mockParentWindow);

            expect(windowManager.isWindowOpen('github-window')).toBe(true);

            githubWindow.close();
        });

        it('should return false when window is closed', async () => {
            const githubWindow = await windowManager.createGitHubWindow(mockParentWindow);
            githubWindow.close();

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(windowManager.isWindowOpen('github-window')).toBe(false);
        });
    });

    describe('focusWindow', () => {
        it('should focus existing window', async () => {
            const githubWindow = await windowManager.createGitHubWindow(mockParentWindow);
            githubWindow.blur();

            windowManager.focusWindow('github-window');

            expect(githubWindow.isFocused()).toBe(true);

            githubWindow.close();
        });

        it('should restore minimized window', async () => {
            const githubWindow = await windowManager.createGitHubWindow(mockParentWindow);
            githubWindow.minimize();

            windowManager.focusWindow('github-window');

            expect(githubWindow.isMinimized()).toBe(false);

            githubWindow.close();
        });
    });
});
```

### 3.2 Integration Tests

#### `tests/integration/github-window-ipc.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { BrowserWindow, ipcMain } from 'electron';
import { app } from 'electron';

describe('GitHub Window IPC', () => {
    let mainWindow: BrowserWindow;
    let githubWindow: BrowserWindow;

    beforeAll(async () => {
        await app.whenReady();
        mainWindow = new BrowserWindow({ show: false });
    });

    afterAll(() => {
        mainWindow.close();
    });

    it('should open GitHub window via IPC', async () => {
        const result = await mainWindow.webContents.executeJavaScript(`
      window.electronAPI.openGitHubWindow()
    `);

        expect(result.success).toBe(true);
        expect(result.windowId).toBeDefined();
    });

    it('should validate token via IPC', async () => {
        // Mock token
        const token = 'ghp_test_token';

        const result = await githubWindow.webContents.executeJavaScript(`
      window.githubWindowAPI.validateToken('${token}')
    `);

        expect(result).toHaveProperty('success');
    });

    it('should apply config and close window', async () => {
        const config = {
            owner: 'testuser',
            repo: 'testrepo',
            branch: 'main',
            token: 'ghp_test',
        };

        const result = await githubWindow.webContents.executeJavaScript(`
      window.githubWindowAPI.applyConfig(${JSON.stringify(config)})
    `);

        expect(result.success).toBe(true);

        // Wait for window to close
        await new Promise(resolve => setTimeout(resolve, 500));

        expect(githubWindow.isDestroyed()).toBe(true);
    });
});
```

### 3.3 E2E Tests

#### `tests/e2e/github-window.spec.ts`

```typescript
import { test, expect, _electron as electron } from '@playwright/test';

test.describe('GitHub Window', () => {
    let electronApp;
    let mainWindow;

    test.beforeAll(async () => {
        electronApp = await electron.launch({ args: ['.'] });
        mainWindow = await electronApp.firstWindow();
    });

    test.afterAll(async () => {
        await electronApp.close();
    });

    test('should open GitHub window', async () => {
        // Click button to open GitHub window
        await mainWindow.click('#github-settings-btn');

        // Wait for new window
        const githubWindow = await electronApp.waitForEvent('window');

        // Verify window title
        const title = await githubWindow.title();
        expect(title).toBe('GitHub Integration');
    });

    test('should validate token and load data', async () => {
        const githubWindow = await electronApp.waitForEvent('window');

        // Enter token
        await githubWindow.fill('#github-token', process.env.GITHUB_TEST_TOKEN);
        await githubWindow.click('#validate-token-btn');

        // Wait for validation
        await githubWindow.waitForSelector('.status-message.success');

        // Verify owner dropdown is populated
        const ownerOptions = await githubWindow.locator('#owner-select option').count();
        expect(ownerOptions).toBeGreaterThan(1);
    });

    test('should complete full flow', async () => {
        const githubWindow = await electronApp.waitForEvent('window');

        // Validate token
        await githubWindow.fill('#github-token', process.env.GITHUB_TEST_TOKEN);
        await githubWindow.click('#validate-token-btn');
        await githubWindow.waitForSelector('.status-message.success');

        // Select owner
        await githubWindow.selectOption('#owner-select', { index: 1 });
        await githubWindow.waitForSelector('#repo-select:not([disabled])');

        // Select repository
        await githubWindow.selectOption('#repo-select', { index: 1 });
        await githubWindow.waitForSelector('#branch-select:not([disabled])');

        // Select branch
        await githubWindow.selectOption('#branch-select', { index: 1 });
        await githubWindow.waitForSelector('#apply-btn:not([disabled])');

        // Verify summary is shown
        const summary = await githubWindow.locator('.summary-section').isVisible();
        expect(summary).toBe(true);

        // Apply configuration
        await githubWindow.click('#apply-btn');

        // Verify window closes
        await expect(githubWindow).toBeHidden();
    });

    test('should persist window position', async () => {
        // Open window first time
        await mainWindow.click('#github-settings-btn');
        let githubWindow = await electronApp.waitForEvent('window');

        // Move window
        await githubWindow.evaluate(() => {
            window.moveTo(200, 200);
        });

        await githubWindow.close();

        // Open window second time
        await mainWindow.click('#github-settings-btn');
        githubWindow = await electronApp.waitForEvent('window');

        // Verify position was restored
        const bounds = await githubWindow.evaluate(() => ({
            x: window.screenX,
            y: window.screenY,
        }));

        expect(bounds.x).toBe(200);
        expect(bounds.y).toBe(200);
    });
});
```

---

## 📦 Fase 4: Build & Deployment (2-3 horas)

### 4.1 Build Configuration

#### Atualizar `package.json`

```json
{
    "build": {
        "extraResources": [
            {
                "from": "src/renderer/github-window",
                "to": "renderer/github-window",
                "filter": ["**/*"]
            }
        ],
        "files": ["dist/**/*", "src/renderer/github-window/**/*", "assets/**/*"]
    }
}
```

#### Atualizar `tsconfig.json`

```json
{
    "include": ["src/**/*", "src/renderer/github-window-preload.ts"],
    "exclude": ["src/renderer/github-window/**/*.js"]
}
```

### 4.2 Scripts de Build

#### `scripts/build-github-window.sh`

```bash
#!/bin/bash

# Build GitHub Window assets
echo "📦 Building GitHub Window..."

# Create dist directory
mkdir -p dist/renderer/github-window

# Copy HTML
cp src/renderer/github-window/index.html dist/renderer/github-window/

# Copy CSS
cp src/renderer/github-window/styles.css dist/renderer/github-window/

# Minify JavaScript
echo "🔧 Minifying JavaScript..."
npx terser src/renderer/github-window/main.js \
  --compress \
  --mangle \
  --output dist/renderer/github-window/main.js

# Copy assets
if [ -d "src/renderer/github-window/assets" ]; then
  cp -r src/renderer/github-window/assets dist/renderer/github-window/
fi

echo "✅ GitHub Window built successfully!"
```

### 4.3 CI/CD Integration

#### Atualizar `.github/workflows/build.yml`

```yaml
name: Build and Test

on:
    push:
        branches: [master, develop]
    pull_request:
        branches: [master]

jobs:
    test:
        runs-on: ${{ matrix.os }}
        strategy:
            matrix:
                os: [ubuntu-latest, windows-latest, macos-latest]

        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '18'
                  cache: 'npm'

            - name: Install dependencies
              run: npm ci

            - name: Run linter
              run: npm run lint

            - name: Run unit tests
              run: npm run test:unit

            - name: Run integration tests
              run: npm run test:integration

            - name: Build TypeScript
              run: npm run build

            - name: Build GitHub Window
              run: bash scripts/build-github-window.sh

            - name: Run E2E tests
              run: npm run test:e2e
              env:
                  GITHUB_TEST_TOKEN: ${{ secrets.GITHUB_TEST_TOKEN }}

            - name: Build Electron app
              run: npm run dist

            - name: Upload artifacts
              uses: actions/upload-artifact@v3
              with:
                  name: app-${{ matrix.os }}
                  path: dist/
```

---

## 📚 Fase 5: Documentation (2-3 horas)

### 5.1 User Documentation

#### `docs/guides/github-window-guide.md`

```markdown
# GitHub Integration Window - User Guide

## Opening the GitHub Window

1. Click the **Settings** button (⚙️) in the main window
2. Navigate to the **GitHub Integration** section
3. Click **Open GitHub Window**

## Configuring GitHub Integration

### Step 1: Validate Token

1. Paste your GitHub Personal Access Token
2. Click **Validate Token**
3. Wait for confirmation (✅ Valid - User: @username)

### Step 2: Select Owner

1. Choose from the dropdown:
    - Your personal account (@username)
    - Organizations you belong to

### Step 3: Select Repository

1. Choose a repository from the list
2. View repository details (visibility, stars, last update)

### Step 4: Select Branch

1. Choose a branch from the list
2. View branch protection status and last commit

### Step 5: Review & Apply

1. Check the configuration summary
2. Click **Apply & Close**

## Window Features

### Window Positioning

- The window remembers its position and size
- Resize and move freely
- Position persists between sessions

### Keyboard Shortcuts

- `Esc` - Close window (same as Cancel)
- `Ctrl+W` - Close window
- `Ctrl+Enter` - Apply configuration (when ready)

## Troubleshooting

### Token validation fails

- Ensure token has correct permissions: `repo`, `read:org`
- Check token hasn't expired
- Verify internet connection

### Repositories not loading

- Check if owner has public repositories
- Verify token has access to private repos (if applicable)

### Window appears off-screen

- Delete `window-states.json` in app data folder
- Restart application
```

### 5.2 Developer Documentation

#### `docs/architecture/github-window-architecture.md`

```markdown
# GitHub Window Architecture

## Overview

Multi-window architecture using Electron's BrowserWindow API with IPC communication.

## Components

### Main Process

- **WindowManager**: Manages window lifecycle
- **WindowStateManager**: Persists window state
- **IPC Handlers**: Process GitHub API requests

### Renderer Process

- **github-window/main.js**: Frontend logic
- **GitHub Components**: Modular UI components
- **State Management**: Local state for form data

## Communication Flow
```

Main Window → IPC → Main Process → GitHub API
Main Process → IPC → GitHub Window → UI Update
GitHub Window → IPC → Main Process → Main Window

````

## State Persistence

Window state saved to: `{userData}/window-states.json`

Structure:
```json
{
  "github-window": {
    "width": 900,
    "height": 700,
    "x": 100,
    "y": 100,
    "isMaximized": false
  }
}
````

## Security

- Context isolation enabled
- Sandboxing enabled
- No Node.js in renderer
- All APIs through preload script

## Performance

- Lazy window creation
- Debounced state saving (500ms)
- Cached GitHub API responses
- Optimized re-renders

````

---

## 🔄 Fase 6: Maintenance & Monitoring (Ongoing)

### 6.1 Error Monitoring

```typescript
// src/windows/WindowManager.ts
private setupErrorMonitoring(window: BrowserWindow): void {
  window.webContents.on('crashed', (event, killed) => {
    console.error('GitHub window crashed', { killed });
    // Send to error tracking service
  });

  window.on('unresponsive', () => {
    console.warn('GitHub window unresponsive');
    // Show dialog to user
  });
}
````

### 6.2 Performance Monitoring

```typescript
// Track window lifecycle metrics
private trackWindowMetrics(windowId: string): void {
  const startTime = Date.now();

  window.once('ready-to-show', () => {
    const loadTime = Date.now() - startTime;
    // Send to analytics
    console.log(`Window ${windowId} loaded in ${loadTime}ms`);
  });
}
```

### 6.3 User Feedback

```typescript
// Collect user feedback on window experience
window.webContents.on('did-finish-load', () => {
    // Track successful loads
});

window.on('closed', () => {
    // Track if user completed flow or cancelled
});
```

---

## 📊 Summary

### Time Estimates

| Fase                     | Tempo Estimado  | Complexidade |
| ------------------------ | --------------- | ------------ |
| 1. Design & Architecture | 4-6 horas       | Média        |
| 2. Development           | 8-12 horas      | Alta         |
| 3. Testing               | 4-6 horas       | Média        |
| 4. Build & Deployment    | 2-3 horas       | Baixa        |
| 5. Documentation         | 2-3 horas       | Baixa        |
| 6. Maintenance (ongoing) | -               | -            |
| **TOTAL**                | **20-30 horas** | **Alta**     |

### Deliverables

✅ Janela separada funcional
✅ Comunicação IPC robusta
✅ Persistência de estado
✅ Testes completos (unit + integration + E2E)
✅ Build automatizado
✅ CI/CD integrado
✅ Documentação completa
✅ Monitoring e error tracking

### Success Criteria

- [ ] Window opens in < 500ms
- [ ] State persistence works 100%
- [ ] All IPC handlers tested
- [ ] E2E tests pass on all platforms
- [ ] Build succeeds on Ubuntu, Windows, macOS
- [ ] Documentation complete
- [ ] Code coverage > 80%

---

**Status**: 📋 **PLANNED**
**Estimated Start**: TBD
**Estimated Completion**: 4-5 dias de trabalho
**Dependencies**: PR #12 merged
