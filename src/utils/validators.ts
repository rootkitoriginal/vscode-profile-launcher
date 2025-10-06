/**
 * Validation utility functions
 */

/**
 * Validates if a string is not empty
 */
export function isNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a string is a valid profile name
 */
export function isValidProfileName(name: string): boolean {
    if (!isNonEmptyString(name)) {
        return false;
    }

    // Profile name should be between 1 and 100 characters
    if (name.length > 100) {
        return false;
    }

    // Only allow alphanumeric, spaces, dashes, and underscores
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    return validPattern.test(name);
}

/**
 * Validates if a path exists and is accessible
 */
export function isValidPath(path: string): boolean {
    if (!isNonEmptyString(path)) {
        return false;
    }

    // Basic path validation - more thorough checking should be done in the service layer
    return path.length > 0 && !path.includes('..'); // Prevent path traversal
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitizes a string by removing potentially harmful characters
 */
export function sanitizeString(value: string): string {
    return value.replace(/[<>]/g, '');
}

/**
 * Validates GitHub repository format (owner/repo)
 */
export function isValidGitHubRepo(repo: string): boolean {
    const repoPattern = /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_\.]+$/;
    return repoPattern.test(repo);
}
