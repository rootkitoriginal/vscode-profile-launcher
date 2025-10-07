import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Electron
const mockBrowserWindow = {
    getBounds: jest.fn(() => ({ width: 1200, height: 800, x: 100, y: 100 })),
    isMaximized: jest.fn(() => false),
    isDestroyed: jest.fn(() => false),
    isMinimized: jest.fn(() => false),
    show: jest.fn(),
    close: jest.fn(),
    focus: jest.fn(),
    restore: jest.fn(),
    maximize: jest.fn(),
    minimize: jest.fn(),
    unmaximize: jest.fn(),
    loadFile: jest.fn(() => Promise.resolve()),
    once: jest.fn((event: string, callback: () => void) => {
        if (event === 'ready-to-show') {
            setTimeout(callback, 0);
        }
    }),
    on: jest.fn(),
    webContents: {
        on: jest.fn(),
    },
};

jest.mock('electron', () => ({
    BrowserWindow: jest.fn(() => mockBrowserWindow),
    screen: {
        getAllDisplays: jest.fn(() => [
            {
                workArea: { x: 0, y: 0, width: 1920, height: 1080 },
            },
        ]),
        getPrimaryDisplay: jest.fn(() => ({
            workAreaSize: { width: 1920, height: 1080 },
        })),
    },
    app: {
        getPath: jest.fn((name: string) => {
            if (name === 'userData') return '/tmp/userData';
            return '/tmp';
        }),
    },
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
    readFile: jest.fn(() => Promise.reject(new Error('File not found'))),
    writeFile: jest.fn(() => Promise.resolve()),
}));

import { WindowManager } from '../../src/windows/WindowManager';

describe('WindowManager', () => {
    let windowManager: WindowManager;

    beforeEach(() => {
        windowManager = new WindowManager();
        jest.clearAllMocks();
    });

    describe('createGitHubWindow', () => {
        it('should create a GitHub window', async () => {
            const parentWindow = mockBrowserWindow as any;
            const githubWindow = await windowManager.createGitHubWindow(
                parentWindow,
                'owner',
                'repo'
            );

            expect(githubWindow).toBeDefined();
            expect(mockBrowserWindow.loadFile).toHaveBeenCalled();
        });

        it('should register the window in the manager', async () => {
            const parentWindow = mockBrowserWindow as any;
            await windowManager.createGitHubWindow(parentWindow, 'owner', 'repo');

            expect(windowManager.isWindowOpen('github-window')).toBe(true);
        });
    });

    describe('isWindowOpen', () => {
        it('should return false for non-existent window', () => {
            expect(windowManager.isWindowOpen('non-existent')).toBe(false);
        });

        it('should return true for existing window', async () => {
            const parentWindow = mockBrowserWindow as any;
            await windowManager.createGitHubWindow(parentWindow, 'owner', 'repo');

            expect(windowManager.isWindowOpen('github-window')).toBe(true);
        });
    });

    describe('getWindow', () => {
        it('should return undefined for non-existent window', () => {
            expect(windowManager.getWindow('non-existent')).toBeUndefined();
        });

        it('should return the window for existing window', async () => {
            const parentWindow = mockBrowserWindow as any;
            await windowManager.createGitHubWindow(parentWindow, 'owner', 'repo');

            const window = windowManager.getWindow('github-window');
            expect(window).toBeDefined();
        });
    });

    describe('closeWindow', () => {
        it('should close an existing window', async () => {
            const parentWindow = mockBrowserWindow as any;
            await windowManager.createGitHubWindow(parentWindow, 'owner', 'repo');

            windowManager.closeWindow('github-window');
            expect(mockBrowserWindow.close).toHaveBeenCalled();
        });

        it('should not throw when closing non-existent window', () => {
            expect(() => windowManager.closeWindow('non-existent')).not.toThrow();
        });
    });

    describe('focusWindow', () => {
        it('should focus an existing window', async () => {
            const parentWindow = mockBrowserWindow as any;
            await windowManager.createGitHubWindow(parentWindow, 'owner', 'repo');

            windowManager.focusWindow('github-window');
            expect(mockBrowserWindow.focus).toHaveBeenCalled();
        });

        it('should restore minimized window before focusing', async () => {
            mockBrowserWindow.isMinimized.mockReturnValueOnce(true);
            const parentWindow = mockBrowserWindow as any;
            await windowManager.createGitHubWindow(parentWindow, 'owner', 'repo');

            windowManager.focusWindow('github-window');
            expect(mockBrowserWindow.restore).toHaveBeenCalled();
            expect(mockBrowserWindow.focus).toHaveBeenCalled();
        });
    });
});
