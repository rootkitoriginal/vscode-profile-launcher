/**
 * Application State Management
 * Centralized state for the VS Code Profile Launcher application
 * PR #14 - Atualizado com validação de integridade
 */
import { eventBus, EventTypes } from '../../utils/eventBus';

class AppState {
    constructor() {
        this.profiles = [];
        this.currentProfile = null;
        this.isEditMode = false;
        this.monacoEditor = null;
        this.aiProviders = [];
        this.appConfig = {};
        this.githubIssues = [];
        this.githubBranches = [];
        this.githubRepos = [];
        this.githubAuthStatus = {
            isAuthenticated: false,
            username: null,
            avatar: null,
            token: null,
        };
        this.listeners = {};

        // Conexão com EventBus para sincronização de estado
        this._connectEventBus();
    }

    // Conexão com EventBus
    _connectEventBus() {
        // GitHub Authentication
        eventBus.on(EventTypes.GITHUB_AUTH_SUCCESS, data => {
            this.githubAuthStatus = {
                isAuthenticated: true,
                username: data.username,
                avatar: data.avatar,
                token: data.token,
            };
            this.notify('github:auth:updated', this.githubAuthStatus);
        });

        eventBus.on(EventTypes.GITHUB_REPOS_LOADED, repos => {
            this.githubRepos = repos;
            this.notify('github:repos:updated', repos);
        });

        // Outros eventos do sistema
        eventBus.on(EventTypes.PROFILE_UPDATE, profile => {
            if (this.currentProfile && this.currentProfile.id === profile.id) {
                this.currentProfile = profile;
                this.notify('current-profile:updated', profile);
            }
        });
    }

    // Profile management
    setProfiles(profiles) {
        this.profiles = profiles;
        this.notify('profiles:updated', profiles);
        eventBus.emit(EventTypes.PROFILE_LOAD, profiles);
    }

    getProfiles() {
        return this.profiles;
    }

    setCurrentProfile(profile) {
        this.currentProfile = profile;
        this.notify('profile:selected', profile);
    }

    getCurrentProfile() {
        return this.currentProfile;
    }

    setEditMode(isEdit) {
        this.isEditMode = isEdit;
        this.notify('editMode:changed', isEdit);
    }

    isInEditMode() {
        return this.isEditMode;
    }

    // Monaco Editor
    setMonacoEditor(editor) {
        this.monacoEditor = editor;
    }

    getMonacoEditor() {
        return this.monacoEditor;
    }

    // AI Providers
    setAIProviders(providers) {
        this.aiProviders = providers;
        this.notify('aiProviders:updated', providers);
    }

    getAIProviders() {
        return this.aiProviders;
    }

    // App Config
    setAppConfig(config) {
        this.appConfig = config;
        this.notify('config:updated', config);
    }

    getAppConfig() {
        return this.appConfig;
    }

    // GitHub data
    setGitHubIssues(issues) {
        this.githubIssues = issues;
        this.notify('github:issues:updated', issues);
    }

    getGitHubIssues() {
        return this.githubIssues;
    }

    setGitHubBranches(branches) {
        this.githubBranches = branches;
        this.notify('github:branches:updated', branches);
    }

    getGitHubBranches() {
        return this.githubBranches;
    }

    setGitHubRepos(repos) {
        this.githubRepos = repos;
        this.notify('github-repos:updated', repos);
        eventBus.emit(EventTypes.GITHUB_REPOS_LOADED, repos);
    }

    getGitHubRepos() {
        return this.githubRepos;
    }

    setGitHubAuthStatus(status) {
        this.githubAuthStatus = status;
        this.notify('github-auth:updated', status);

        if (status.isAuthenticated) {
            eventBus.emit(EventTypes.GITHUB_AUTH_SUCCESS, status);
        } else {
            eventBus.emit(EventTypes.GITHUB_AUTH_FAILURE, status);
        }
    }

    getGitHubAuthStatus() {
        return this.githubAuthStatus;
    }

    // Observer pattern
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    notify(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (err) {
                console.error(`Error in listener for event ${event}:`, err);
            }
        });
    }

    // Reset state
    reset() {
        this.profiles = [];
        this.currentProfile = null;
        this.isEditMode = false;
        this.monacoEditor = null;
        this.aiProviders = [];
        this.appConfig = {};
        this.githubIssues = [];
        this.githubBranches = [];
        this.githubRepos = [];
        this.githubAuthStatus = {
            isAuthenticated: false,
            username: null,
            avatar: null,
            token: null,
        };
    }

    // Validação de integridade do estado - Adicionado no PR #14
    validateStateIntegrity() {
        console.log('Validando integridade do estado da aplicação...');

        // Verificação dos objetos principais
        const stateKeys = [
            'profiles',
            'currentProfile',
            'isEditMode',
            'monacoEditor',
            'aiProviders',
            'appConfig',
            'githubIssues',
            'githubBranches',
            'githubRepos',
            'githubAuthStatus',
        ];

        const report = {
            timestamp: new Date().toISOString(),
            totalKeys: stateKeys.length,
            validKeys: 0,
            invalidKeys: [],
            details: {},
        };

        for (const key of stateKeys) {
            const exists = this.hasOwnProperty(key);
            report.details[key] = { exists };

            if (exists) {
                report.validKeys++;

                // Verificações específicas para cada tipo de dado
                if (key === 'profiles') {
                    report.details[key].isArray = Array.isArray(this[key]);
                    report.details[key].count = this[key].length;
                } else if (key === 'githubAuthStatus') {
                    report.details[key].isAuthenticated = this[key].isAuthenticated;
                }
            } else {
                report.invalidKeys.push(key);
            }
        }

        console.log(
            `Estado contém ${report.validKeys}/${report.totalKeys} chaves principais`,
            report
        );
        return report;
    }
}

// Criar instância única do estado da aplicação
const appState = new AppState();

// Exportar para uso em outros módulos
export default appState;

// Exportar função de validação para diagnósticos
export function validateStateIntegrity() {
    return appState.validateStateIntegrity();
}
