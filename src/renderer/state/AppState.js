/**
 * Application State Management
 * Centralized state for the VS Code Profile Launcher application
 */

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
        this.listeners = {};
    }

    // Profile management
    setProfiles(profiles) {
        this.profiles = profiles;
        this.notify('profiles:updated', profiles);
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

    // Event system for reactive updates
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    notify(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
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
    }
}

// Export singleton instance
const appState = new AppState();
