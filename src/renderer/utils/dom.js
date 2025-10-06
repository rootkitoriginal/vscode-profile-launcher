/**
 * DOM Utility Functions
 * Common DOM manipulation and helper functions
 */

/**
 * Show loading overlay
 */
export function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'notification error';
    errorDiv.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">❌</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => {
            errorDiv.remove();
        }, 300);
    }, 5000);
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'notification success';
    successDiv.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => {
            successDiv.remove();
        }, 300);
    }, 5000);
}

/**
 * Get form data as an object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data as key-value pairs
 */
export function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

/**
 * Clear all children of an element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Create element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
export function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}
