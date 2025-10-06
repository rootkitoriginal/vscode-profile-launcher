/**
 * ProfileCard Component
 * Renders a profile card in the grid
 */

import { formatDate, escapeHtml } from '../utils/formatters.js';

export class ProfileCard {
    /**
     * Create a profile card element
     * @param {Object} profile - Profile data
     * @param {Object} handlers - Event handlers
     * @param {Function} handlers.onLaunch - Handler for profile launch
     * @param {Function} handlers.onContextMenu - Handler for context menu
     * @param {Function} handlers.onMenuClick - Handler for menu button click
     * @returns {HTMLElement} Profile card element
     */
    static create(profile, handlers = {}) {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.dataset.profileId = profile.id;
        
        const lastUsed = profile.lastUsed 
            ? `Last used: ${formatDate(profile.lastUsed)}`
            : `Created: ${formatDate(profile.createdAt)}`;
        
        const aiInfo = profile.aiProvider 
            ? `<span class="ai-badge">${profile.aiProvider.toUpperCase()}</span>` 
            : '';
        
        card.innerHTML = `
            <div class="profile-header">
                <h3 class="profile-name">${escapeHtml(profile.name)}${aiInfo}</h3>
                <button class="profile-menu" data-profile-id="${profile.id}">⋮</button>
            </div>
            <div class="profile-language">${escapeHtml(profile.language)}</div>
            ${profile.description ? `<div class="profile-description">${escapeHtml(profile.description)}</div>` : ''}
            ${profile.workspacePath ? `<div class="profile-path">${escapeHtml(profile.workspacePath)}</div>` : ''}
            <div class="profile-footer">
                <span>${lastUsed}</span>
            </div>
        `;
        
        // Attach event handlers
        if (handlers.onLaunch) {
            card.addEventListener('dblclick', () => handlers.onLaunch(profile));
        }
        
        if (handlers.onContextMenu) {
            card.addEventListener('contextmenu', (e) => handlers.onContextMenu(e, profile));
        }
        
        const menuBtn = card.querySelector('.profile-menu');
        if (menuBtn && handlers.onMenuClick) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handlers.onMenuClick(e, profile);
            });
        }
        
        return card;
    }

    /**
     * Render multiple profile cards into a container
     * @param {HTMLElement} container - Container element
     * @param {Array} profiles - Array of profile objects
     * @param {Object} handlers - Event handlers
     */
    static renderGrid(container, profiles, handlers = {}) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        container.innerHTML = '';
        
        if (profiles.length === 0) {
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }
        
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        profiles.forEach(profile => {
            const card = ProfileCard.create(profile, handlers);
            container.appendChild(card);
        });
    }
}
