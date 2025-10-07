/**
 * EventBus para gerenciamento centralizado de eventos
 * Parte do PR #14: Implement GitHub Repository Manager
 */

export class EventBus {
    private events: Record<string, Function[]>;

    constructor() {
        this.events = {};
    }

    /**
     * Registra um listener para um evento específico
     * @param event Nome do evento
     * @param callback Função callback a ser chamada quando o evento ocorrer
     * @returns Função para remover o listener
     */
    public on(event: string, callback: Function): Function {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        // Retorna função para remover o listener
        return () => this.off(event, callback);
    }

    /**
     * Remove um listener específico de um evento
     * @param event Nome do evento
     * @param callback Função callback a ser removida
     */
    public off(event: string, callback: Function): void {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * Emite um evento com dados opcionais
     * @param event Nome do evento
     * @param data Dados a serem passados para os callbacks
     */
    public emit(event: string, data?: any): void {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Erro ao executar callback para evento ${event}:`, error);
            }
        });
    }

    /**
     * Emite um evento e aguarda que todos os listeners sejam executados
     * @param event Nome do evento
     * @param data Dados a serem passados para os callbacks
     * @returns Promise que resolve quando todos os listeners forem executados
     */
    public async emitAsync(event: string, data?: any): Promise<void> {
        if (!this.events[event]) return;

        const promises = this.events[event].map(callback => {
            try {
                const result = callback(data);
                return result instanceof Promise ? result : Promise.resolve(result);
            } catch (error) {
                console.error(`Erro ao executar callback async para evento ${event}:`, error);
                return Promise.reject(error);
            }
        });

        await Promise.all(promises);
    }

    /**
     * Remove todos os listeners de um evento específico
     * @param event Nome do evento
     */
    public clearEvent(event: string): void {
        delete this.events[event];
    }

    /**
     * Remove todos os listeners de todos os eventos
     */
    public clearAll(): void {
        this.events = {};
    }

    /**
     * Verifica se existem listeners para um evento específico
     * @param event Nome do evento
     * @returns true se existirem listeners, false caso contrário
     */
    public hasListeners(event: string): boolean {
        return !!this.events[event] && this.events[event].length > 0;
    }

    /**
     * Obtém a contagem de listeners para um evento específico
     * @param event Nome do evento
     * @returns Número de listeners registrados para o evento
     */
    public listenerCount(event: string): number {
        return this.events[event]?.length || 0;
    }

    /**
     * Lista todos os eventos registrados
     * @returns Array com os nomes dos eventos
     */
    public eventNames(): string[] {
        return Object.keys(this.events);
    }
}

// Instância global do EventBus
export const eventBus = new EventBus();

// Tipos de eventos para a aplicação
export enum EventTypes {
    // Eventos de GitHub
    GITHUB_AUTH_SUCCESS = 'github:auth:success',
    GITHUB_AUTH_FAILURE = 'github:auth:failure',
    GITHUB_REPOS_LOADED = 'github:repos:loaded',
    GITHUB_REPOS_ERROR = 'github:repos:error',

    // Eventos de Janelas
    WINDOW_GITHUB_READY = 'window:github:ready',
    WINDOW_GITHUB_CLOSE = 'window:github:close',

    // Eventos de Perfil
    PROFILE_SAVE = 'profile:save',
    PROFILE_LOAD = 'profile:load',
    PROFILE_UPDATE = 'profile:update',

    // Eventos de Configuração
    SETTINGS_SAVE = 'settings:save',
    SETTINGS_LOAD = 'settings:load',

    // Eventos de IA
    AI_GENERATE_START = 'ai:generate:start',
    AI_GENERATE_COMPLETE = 'ai:generate:complete',
    AI_GENERATE_ERROR = 'ai:generate:error',

    // Eventos de Sistema
    SYSTEM_READY = 'system:ready',
    SYSTEM_ERROR = 'system:error',
}
