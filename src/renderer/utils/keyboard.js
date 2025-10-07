/**
 * Keyboard Shortcuts Manager
 * Handles global keyboard shortcuts for the application
 */

export class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
    }

    /**
     * Register a keyboard shortcut
     * @param {string} key - Key combination (e.g., 'ctrl+n', 'ctrl+shift+p')
     * @param {Function} handler - Handler function to call
     * @param {string} description - Description of what the shortcut does
     */
    register(key, handler, description = '') {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.set(normalizedKey, { handler, description });
    }

    /**
     * Unregister a keyboard shortcut
     * @param {string} key - Key combination
     */
    unregister(key) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.delete(normalizedKey);
    }

    /**
     * Initialize keyboard event listener
     */
    initialize() {
        document.addEventListener('keydown', e => {
            if (!this.enabled) return;

            // Don't trigger shortcuts when typing in inputs/textareas
            if (this.isTypingContext(e.target)) {
                // Allow Escape even in typing contexts
                if (e.key !== 'Escape') {
                    return;
                }
            }

            const keyCombo = this.getKeyCombo(e);
            const shortcut = this.shortcuts.get(keyCombo);

            if (shortcut) {
                e.preventDefault();
                shortcut.handler(e);
            }
        });
    }

    /**
     * Check if user is typing in an input context
     */
    isTypingContext(element) {
        const tagName = element.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' || element.contentEditable === 'true';
    }

    /**
     * Get key combination from keyboard event
     */
    getKeyCombo(event) {
        const parts = [];

        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');

        const key = event.key.toLowerCase();
        parts.push(key);

        return parts.join('+');
    }

    /**
     * Normalize key combination string
     */
    normalizeKey(key) {
        const parts = key.toLowerCase().split('+');
        const modifiers = ['ctrl', 'alt', 'shift'].filter(mod => parts.includes(mod));
        const mainKey = parts.find(part => !modifiers.includes(part));

        return [...modifiers, mainKey].join('+');
    }

    /**
     * Enable keyboard shortcuts
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable keyboard shortcuts
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Get all registered shortcuts
     */
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
            key,
            description: data.description,
        }));
    }
}

// Create singleton instance
const keyboardManager = new KeyboardManager();
export default keyboardManager;
