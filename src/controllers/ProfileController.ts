import { DatabaseService } from '../services/DatabaseService';
import { Profile, CreateProfileData, UpdateProfileData } from '../types';

/**
 * ProfileController handles all profile-related operations
 * Following the MVC pattern, this controller manages the business logic for profiles
 */
export class ProfileController {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    /**
     * Get all profiles from the database
     */
    async getAllProfiles(): Promise<Profile[]> {
        try {
            return this.dbService.getAllProfiles();
        } catch (error) {
            console.error('Error fetching profiles:', error);
            throw error;
        }
    }

    /**
     * Get a single profile by ID
     */
    async getProfile(id: number): Promise<Profile | null> {
        try {
            return this.dbService.getProfile(id);
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    /**
     * Create a new profile
     */
    async createProfile(profileData: CreateProfileData): Promise<Profile> {
        try {
            console.log('🎯 ProfileController.createProfile called with:', profileData);
            
            // Validate profile data
            if (!profileData.name || !profileData.language) {
                throw new Error('Profile name and language are required');
            }

            const result = this.dbService.createProfile(profileData);
            console.log('✅ ProfileController.createProfile success:', result);
            return result;
        } catch (error) {
            console.error('❌ ProfileController.createProfile error:', error);
            throw error;
        }
    }

    /**
     * Update an existing profile
     */
    async updateProfile(id: number, profileData: UpdateProfileData): Promise<Profile | null> {
        try {
            console.log('🎯 ProfileController.updateProfile called with id:', id, 'data:', profileData);
            
            // Validate profile data - name is required if provided
            if (profileData.name !== undefined && (!profileData.name || profileData.name.trim() === '')) {
                throw new Error('Profile name cannot be empty');
            }

            // Validate language if provided
            if (profileData.language !== undefined && (!profileData.language || profileData.language.trim() === '')) {
                throw new Error('Profile language cannot be empty');
            }

            const result = this.dbService.updateProfile(id, profileData);
            console.log('✅ ProfileController.updateProfile success:', result);
            return result;
        } catch (error) {
            console.error('❌ ProfileController.updateProfile error:', error);
            throw error;
        }
    }

    /**
     * Delete a profile
     */
    async deleteProfile(id: number): Promise<boolean> {
        try {
            return this.dbService.deleteProfile(id);
        } catch (error) {
            console.error('Error deleting profile:', error);
            throw error;
        }
    }

    /**
     * Update the last used timestamp for a profile
     */
    async updateLastUsed(id: number): Promise<void> {
        try {
            this.dbService.updateLastUsed(id);
        } catch (error) {
            console.error('Error updating last used:', error);
            throw error;
        }
    }

    /**
     * Search profiles by name or language
     */
    async searchProfiles(query: string): Promise<Profile[]> {
        try {
            const allProfiles = this.dbService.getAllProfiles();
            const lowerQuery = query.toLowerCase();
            
            return allProfiles.filter(profile => 
                profile.name.toLowerCase().includes(lowerQuery) ||
                profile.language.toLowerCase().includes(lowerQuery) ||
                (profile.description && profile.description.toLowerCase().includes(lowerQuery))
            );
        } catch (error) {
            console.error('Error searching profiles:', error);
            throw error;
        }
    }

    /**
     * Filter profiles by language
     */
    async filterByLanguage(language: string): Promise<Profile[]> {
        try {
            const allProfiles = this.dbService.getAllProfiles();
            
            if (!language || language === 'all') {
                return allProfiles;
            }
            
            return allProfiles.filter(profile => 
                profile.language.toLowerCase() === language.toLowerCase()
            );
        } catch (error) {
            console.error('Error filtering profiles:', error);
            throw error;
        }
    }
}
