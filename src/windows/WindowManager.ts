import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
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
    async createGitHubWindow(
        parentWindow: BrowserWindow,
        owner?: string,
        repo?: string
    ): Promise<BrowserWindow> {
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
            minWidth: 900,
            minHeight: 600,
            parent: undefined,
            modal: false,
            show: false,
            title: owner && repo ? `GitHub - ${owner}/${repo}` : 'GitHub Repository Manager',
            backgroundColor: '#0d1117',
            webPreferences: {
                preload: path.join(__dirname, 'preload-github-window.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
            },
            autoHideMenuBar: true,
        });

        // Carrega conteúdo com query params
        const htmlPath = path.join(__dirname, '../../src/renderer/github-window/index.html');
        if (owner && repo) {
            await githubWindow.loadFile(htmlPath, {
                query: { owner, repo },
            });
        } else {
            await githubWindow.loadFile(htmlPath);
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
            width: 1200,
            height: 800,
            x: Math.floor((width - 1200) / 2),
            y: Math.floor((height - 800) / 2),
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
