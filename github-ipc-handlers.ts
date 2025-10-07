// Implementar novos handlers IPC para diagnóstico, após o bloco existente

// Adicionar após os handlers existentes
ipcMain.handle('github-window-ping', async () => {
    return 'pong';
});

ipcMain.handle('github-window-ready', async () => {
    console.log('GitHub Window reported ready');
    return true;
});

ipcMain.handle('github-is-configured', async () => {
    await this.initGitHubManager();
    return !!this.githubManager && this.githubManager.isConfigured();
});

ipcMain.handle('github-get-auth-status', async () => {
    await this.initGitHubManager();
    try {
        if (!this.githubManager) {
            return { isAuthenticated: false };
        }
        const status = await this.githubManager.getAuthStatus();
        return status;
    } catch (error: any) {
        console.error('Failed to get GitHub auth status:', error);
        return { isAuthenticated: false, error: error.message };
    }
});

ipcMain.handle('run-diagnostics', async () => {
    try {
        // Importar função de diagnóstico
        const { runDiagnostics } = require('./utils/diagnostics');
        const report = await runDiagnostics();
        return { success: true, report };
    } catch (error: any) {
        console.error('Error running diagnostics:', error);
        return { success: false, error: error.message };
    }
});
