/**
 * Monaco Editor Component
 * Wrapper for Monaco Editor integration
 */

export class MonacoEditor {
    constructor(containerId = 'codeEditor') {
        this.containerId = containerId;
        this.editor = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Monaco Editor library
     * @returns {Promise<void>}
     */
    static async initialize() {
        return new Promise(resolve => {
            if (window.monaco) {
                resolve();
                return;
            }

            require.config({
                paths: {
                    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
                },
            });

            require(['vs/editor/editor.main'], () => {
                resolve();
            });
        });
    }

    /**
     * Create Monaco Editor instance
     * @param {string} language - Programming language
     * @param {string} value - Initial code value
     * @returns {Object} Monaco editor instance
     */
    create(language = 'typescript', value = '') {
        if (!window.monaco) {
            console.error('Monaco Editor not initialized. Call MonacoEditor.initialize() first.');
            return null;
        }

        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id "${this.containerId}" not found`);
            return null;
        }

        // Dispose existing editor if any
        if (this.editor) {
            this.editor.dispose();
        }

        this.editor = monaco.editor.create(container, {
            value: value,
            language: this.getMonacoLanguage(language),
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            wordWrap: 'on',
        });

        // Update hidden textarea when editor content changes
        this.editor.onDidChangeModelContent(() => {
            const codeTemplate = document.getElementById('codeTemplate');
            if (codeTemplate) {
                codeTemplate.value = this.editor.getValue();
            }
        });

        this.isInitialized = true;
        return this.editor;
    }

    /**
     * Get Monaco language identifier from human-readable language name
     * @param {string} language - Language name
     * @returns {string} Monaco language identifier
     */
    getMonacoLanguage(language) {
        const languageMap = {
            TypeScript: 'typescript',
            JavaScript: 'javascript',
            Python: 'python',
            Go: 'go',
            Rust: 'rust',
            'C#': 'csharp',
            Java: 'java',
            'C++': 'cpp',
            PHP: 'php',
            Ruby: 'ruby',
        };

        return languageMap[language] || 'plaintext';
    }

    /**
     * Get current editor value
     * @returns {string} Editor content
     */
    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    /**
     * Set editor value
     * @param {string} value - New content
     */
    setValue(value) {
        if (this.editor) {
            this.editor.setValue(value);
        }
    }

    /**
     * Update editor language
     * @param {string} language - New language
     */
    setLanguage(language) {
        if (this.editor) {
            const model = this.editor.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, this.getMonacoLanguage(language));
            }
        }
    }

    /**
     * Dispose editor instance
     */
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
            this.isInitialized = false;
        }
    }

    /**
     * Get editor instance
     * @returns {Object|null} Monaco editor instance
     */
    getEditor() {
        return this.editor;
    }
}
