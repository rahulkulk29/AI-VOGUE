// Appwrite Configuration for Prism AI 3.0
// BYPASS MODE - Chat works without Appwrite

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
        // BYPASS: Just use temp ID, don't try Appwrite
        console.warn('⚠️ Appwrite bypassed. Using temporary profile. Chat will work!');

        // Clear any old IDs
        localStorage.removeItem('prism-ai-user-id');

        const tempUserId = 'temp-' + Date.now();
        return tempUserId;
    },

    async updateProfile(userId, profileData) {
        return userId;
    },

    async getProfile(userId) {
        return null;
    },

    isConfigured() {
        return true;
    }
};
