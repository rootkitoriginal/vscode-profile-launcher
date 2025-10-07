import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

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
}
