import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProfileController } from '../../src/controllers/ProfileController';
import { DatabaseService } from '../../src/services/DatabaseService';

// Mock DatabaseService
jest.mock('../../src/services/DatabaseService');

describe('ProfileController', () => {
    let profileController: ProfileController;
    let mockDbService: jest.Mocked<DatabaseService>;

    beforeEach(() => {
        mockDbService = {
            getAllProfiles: jest.fn(),
            getProfile: jest.fn(),
            createProfile: jest.fn(),
            updateProfile: jest.fn(),
            deleteProfile: jest.fn(),
            updateLastUsed: jest.fn(),
        } as any;

        profileController = new ProfileController(mockDbService);
    });

    describe('getAllProfiles', () => {
        it('should return all profiles from database', async () => {
            const mockProfiles = [{ id: 1, name: 'Test Profile', language: 'javascript' }];
            (mockDbService.getAllProfiles as jest.Mock).mockReturnValue(mockProfiles);

            const result = await profileController.getAllProfiles();

            expect(result).toEqual(mockProfiles);
            expect(mockDbService.getAllProfiles).toHaveBeenCalled();
        });
    });

    describe('getProfile', () => {
        it('should return a specific profile by id', async () => {
            const mockProfile = { id: 1, name: 'Test Profile', language: 'javascript' };
            (mockDbService.getProfile as jest.Mock).mockReturnValue(mockProfile);

            const result = await profileController.getProfile(1);

            expect(result).toEqual(mockProfile);
            expect(mockDbService.getProfile).toHaveBeenCalledWith(1);
        });
    });

    describe('createProfile', () => {
        it('should create a new profile', async () => {
            const newProfile = { name: 'New Profile', language: 'typescript' };
            const createdProfile = { id: 1, ...newProfile };
            (mockDbService.createProfile as jest.Mock).mockReturnValue(createdProfile);

            const result = await profileController.createProfile(newProfile);

            expect(result).toEqual(createdProfile);
            expect(mockDbService.createProfile).toHaveBeenCalledWith(newProfile);
        });
    });

    describe('updateLastUsed', () => {
        it('should update the last used timestamp', async () => {
            (mockDbService.updateLastUsed as jest.Mock).mockReturnValue(undefined);

            await profileController.updateLastUsed(1);

            expect(mockDbService.updateLastUsed).toHaveBeenCalledWith(1);
        });
    });
});
