// Appwrite Configuration for Prism AI 3.0
// Saves user profiles to Appwrite, with fallback to temp-ID if unavailable

import { Client, Databases, ID } from 'https://cdn.jsdelivr.net/npm/appwrite@13.0.1/+esm';

const APPWRITE_CONFIG = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: '68dd18860033ab7dffac',
    databaseId: '68dd21f50029362dfb7a',
    collectionId: 'user_profiles'
};

const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

export const AppwriteService = {
    async saveProfile(profileData) {
        try {
            // Try to save to Appwrite
            const docId = ID.unique();
            const document = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                docId,
                {
                    skinType: profileData.skinType || '',
                    skinConcerns: profileData.skinConcerns || [],
                    hairType: profileData.hairType || '',
                    hairThickness: profileData.hairThickness || '',
                    scalpType: profileData.scalpType || '',
                    hairConcerns: profileData.hairConcerns || [],
                    clothingStyles: profileData.clothingStyles || [],
                    skincareBudgetMin: profileData.skincareBudget?.min || 200,
                    skincareBudgetMax: profileData.skincareBudget?.max || 1000,
                    haircareBudgetMin: profileData.haircareBudget?.min || 200,
                    haircareBudgetMax: profileData.haircareBudget?.max || 800,
                    fashionBudgetMin: profileData.fashionBudget?.min || 500,
                    fashionBudgetMax: profileData.fashionBudget?.max || 3000
                }
            );
            console.log('✅ Profile saved to Appwrite:', document.$id);
            return document.$id;
        } catch (error) {
            // Fallback: use temp ID so chat still works without Appwrite
            console.warn('⚠️ Appwrite save failed, using temporary profile. Chat will still work!', error.message);
            localStorage.removeItem('prism-ai-user-id');
            const tempUserId = 'temp-' + Date.now();
            return tempUserId;
        }
    },

    async updateProfile(userId, profileData) {
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                userId,
                profileData
            );
            return userId;
        } catch (error) {
            console.warn('⚠️ Profile update failed:', error.message);
            return userId;
        }
    },

    async getProfile(userId) {
        try {
            if (!userId || userId.startsWith('temp-')) return null;
            const doc = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                userId
            );
            return doc;
        } catch (error) {
            console.warn('⚠️ Profile fetch failed:', error.message);
            return null;
        }
    },

    isConfigured() {
        return true;
    }
};
