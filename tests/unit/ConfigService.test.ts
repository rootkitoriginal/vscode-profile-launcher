import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Electron
jest.mock('electron', () => ({
    app: {
        getPath: jest.fn((name: string) => {
            if (name === 'userData') return '/tmp/userData';
            if (name === 'temp') return '/tmp';
            return '/tmp';
        }),
    },
}));

import { ConfigService } from '../../src/services/ConfigService';

describe('ConfigService', () => {
    let configService: ConfigService;

    beforeEach(() => {
        configService = ConfigService.getInstance();
    });

    describe('getInstance', () => {
        it('should return a singleton instance', () => {
            const instance1 = ConfigService.getInstance();
            const instance2 = ConfigService.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('get and set', () => {
        it('should get and set configuration values', () => {
            configService.set('testKey', 'testValue');
            const value = configService.get('testKey');

            expect(value).toBe('testValue');
        });
    });

    describe('createProfileSlug', () => {
        it('should create a valid slug from profile name', () => {
            const slug = configService.createProfileSlug('My Test Profile');

            expect(slug).toBe('my-test-profile');
        });

        it('should handle special characters', () => {
            const slug = configService.createProfileSlug('Test@Profile#123!');

            expect(slug).toMatch(/^[a-z0-9-]+$/);
        });
    });

    describe('validation methods', () => {
        it('should validate Gemini API key presence', () => {
            configService.set('geminiApiKey', 'test-key');
            expect(configService.hasValidGeminiKey()).toBe(true);

            configService.set('geminiApiKey', '');
            expect(configService.hasValidGeminiKey()).toBe(false);
        });

        it('should validate OpenAI API key presence', () => {
            configService.set('openaiApiKey', 'test-key');
            expect(configService.hasValidOpenaiKey()).toBe(true);

            configService.set('openaiApiKey', '');
            expect(configService.hasValidOpenaiKey()).toBe(false);
        });
    });
});
