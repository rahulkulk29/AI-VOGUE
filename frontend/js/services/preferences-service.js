// Prism AI - Preferences Service with Appwrite Integration
// Handles CRUD operations for user preferences with offline fallback

import { databases, account, APPWRITE_CONFIG, authService } from '../appwrite-config.js';
import { ID, Query } from 'https://cdn.jsdelivr.net/npm/appwrite@14.0.1/+esm';

class PrismPreferencesService {
    constructor() {
        this.collectionId = APPWRITE_CONFIG.collections.user_preferences;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        
        this.setupOnlineListener();
    }

    /**
     * Setup online/offline event listeners
     */
    setupOnlineListener() {
        window.addEventListener('online', () => {
            console.log('Connection restored. Syncing queued data...');
            this.isOnline = true;
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost. Switching to offline mode...');
            this.isOnline = false;
        });
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            return await account.get();
        } catch (error) {
            console.error('User not authenticated:', error);
            return null;
        }
    }

    /**
     * Save user preferences to Appwrite (Create or Update)
     * @param {Object} preferences - User preference data
     * @returns {Promise<Object>} Saved preferences document
     */
    async savePreferences(preferences) {
        // Quick check: if not authenticated, save to guest localStorage immediately
        const isAuth = await authService.isAuthenticated();
        if (!isAuth) {
            console.log('💾 Guest mode: Saving preferences to localStorage');
            this.saveToLocalStorage('guest', {
                ...preferences,
                userId: 'guest',
                updatedAt: new Date().toISOString()
            });
            return {
                success: true,
                savedTo: 'localStorage',
                message: 'Preferences saved locally. Login to sync across devices.'
            };
        }

        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const user = await this.getCurrentUser();
                if (!user) {
                    throw new Error('User must be authenticated to save preferences');
                }

                // Prepare preference data
                // Convert arrays to comma-separated strings for Appwrite
                const preferenceData = {
                    userId: user.$id,
                    skinType: preferences.skinType || '',
                    skinConcern: preferences.skinConcern || '',
                    hairType: preferences.hairType || '',
                    hairTexture: preferences.hairTexture || '',
                    hairConcern: preferences.hairConcern || '',
                    stylePreference: preferences.stylePreference || '',
                    skincareBudget: preferences.skincareBudget || '',
                    fashionBudget: preferences.fashionBudget || '',
                    shoppingFrequency: preferences.shoppingFrequency || '',
                    occasions: preferences.occasions || '',
                    ageRange: preferences.ageRange || '',
                    // Convert arrays to comma-separated strings for Appwrite STRING fields
                    allergens: Array.isArray(preferences.allergens) 
                        ? preferences.allergens.join(',') 
                        : (preferences.allergens || ''),
                    preferredIngredients: Array.isArray(preferences.preferredIngredients)
                        ? preferences.preferredIngredients.join(',')
                        : (preferences.preferredIngredients || ''),
                    avoidIngredients: Array.isArray(preferences.avoidIngredients)
                        ? preferences.avoidIngredients.join(',')
                        : (preferences.avoidIngredients || ''),
                    updatedAt: new Date().toISOString()
                };

                // Check if preferences already exist
                const existing = await this.getPreferences(user.$id, true);

                let result;
                if (existing && existing.$id) {
                    // Update existing document
                    result = await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        this.collectionId,
                        existing.$id,
                        preferenceData
                    );
                    console.log('✅ Preferences updated successfully');
                } else {
                    // Create new document
                    result = await databases.createDocument(
                        APPWRITE_CONFIG.databaseId,
                        this.collectionId,
                        ID.unique(),
                        preferenceData
                    );
                    console.log('✅ Preferences created successfully');
                }

                // Normalize result (convert strings back to arrays)
                const normalizedResult = this.normalizePreferences(result);

                // Update cache with normalized data
                this.updateCache(user.$id, normalizedResult);

                // Save to localStorage as backup with normalized data
                this.saveToLocalStorage(user.$id, normalizedResult);

                return normalizedResult;

            } catch (error) {
                attempt++;
                console.error(`Save preferences attempt ${attempt} failed:`, error);

                if (attempt >= maxRetries) {
                    // Fall back to localStorage
                    console.warn('Saving to localStorage as fallback');
                    const user = await this.getCurrentUser();
                    if (user) {
                        this.saveToLocalStorage(user.$id, {
                            ...preferences,
                            userId: user.$id,
                            updatedAt: new Date().toISOString()
                        });
                        
                        // Queue for later sync
                        this.queueForSync(user.$id, preferences);
                    }
                    throw new Error('Failed to save preferences to database. Saved locally.');
                }

                // Exponential backoff
                await this.delay(1000 * Math.pow(2, attempt));
            }
        }
    }

    /**
     * Get user preferences from Appwrite
     * @param {string} userId - User ID (optional, uses current user if not provided)
     * @param {boolean} skipCache - Skip cache and fetch from database
     * @returns {Promise<Object|null>} User preferences or null
     */
    async getPreferences(userId = null, skipCache = false) {
        try {
            // Quick check: if not authenticated, return guest localStorage immediately
            const isAuth = await authService.isAuthenticated();
            if (!isAuth) {
                const guestPrefs = this.getFromLocalStorage('guest');
                if (guestPrefs) {
                    console.log('📖 Guest mode: Loading preferences from localStorage');
                }
                return guestPrefs;
            }

            const user = userId ? { $id: userId } : await this.getCurrentUser();
            if (!user) {
                console.warn('No user found for preferences retrieval');
                return this.getFromLocalStorage('guest');
            }

            // Check cache first
            if (!skipCache && this.isCacheValid(user.$id)) {
                console.log('📦 Returning cached preferences');
                return this.cache.get(user.$id).data;
            }

            // Fetch from database
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                [Query.equal('userId', user.$id)]
            );

            if (response.documents.length > 0) {
                const preferences = response.documents[0];
                // Convert comma-separated strings back to arrays
                const normalizedPrefs = this.normalizePreferences(preferences);
                this.updateCache(user.$id, normalizedPrefs);
                this.saveToLocalStorage(user.$id, normalizedPrefs);
                console.log('✅ Preferences loaded from database');
                return normalizedPrefs;
            }

            // No preferences found in database, check localStorage
            return this.getFromLocalStorage(user.$id);

        } catch (error) {
            console.error('Error fetching preferences:', error);
            
            // Fallback to localStorage
            const isAuth = await authService.isAuthenticated();
            if (!isAuth) {
                return this.getFromLocalStorage('guest');
            }
            
            const user = userId ? { $id: userId } : await this.getCurrentUser();
            if (user) {
                console.warn('⚠️ Falling back to localStorage');
                return this.getFromLocalStorage(user.$id);
            }
            
            return this.getFromLocalStorage('guest');
        }
    }

    /**
     * Update a specific preference field
     * @param {string} field - Field name to update
     * @param {any} value - New value
     * @returns {Promise<Object>} Updated preferences
     */
    async updatePreference(field, value) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('User must be authenticated');
            }

            const existing = await this.getPreferences(user.$id, true);
            if (!existing || !existing.$id) {
                throw new Error('No existing preferences found. Please complete onboarding first.');
            }

            const updateData = {
                [field]: value,
                updatedAt: new Date().toISOString()
            };

            const result = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                this.collectionId,
                existing.$id,
                updateData
            );

            // Update cache
            this.updateCache(user.$id, result);
            this.saveToLocalStorage(user.$id, result);

            return result;

        } catch (error) {
            console.error('Error updating preference:', error);
            throw error;
        }
    }

    /**
     * Delete user preferences
     * @returns {Promise<boolean>} Success status
     */
    async deletePreferences() {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                throw new Error('User must be authenticated');
            }

            const existing = await this.getPreferences(user.$id, true);
            if (existing && existing.$id) {
                await databases.deleteDocument(
                    APPWRITE_CONFIG.databaseId,
                    this.collectionId,
                    existing.$id
                );
            }

            // Clear cache and localStorage
            this.cache.delete(user.$id);
            localStorage.removeItem(`prism_preferences_${user.$id}`);

            console.log('Preferences deleted successfully');
            return true;

        } catch (error) {
            console.error('Error deleting preferences:', error);
            throw error;
        }
    }

    /**
     * Cache management
     */
    updateCache(userId, data) {
        this.cache.set(userId, {
            data: data,
            timestamp: Date.now()
        });
    }

    isCacheValid(userId) {
        if (!this.cache.has(userId)) return false;
        const cached = this.cache.get(userId);
        return (Date.now() - cached.timestamp) < this.cacheExpiry;
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * LocalStorage fallback methods
     */
    saveToLocalStorage(userId, data) {
        try {
            localStorage.setItem(`prism_preferences_${userId}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    getFromLocalStorage(userId) {
        try {
            const data = localStorage.getItem(`prism_preferences_${userId}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Offline sync queue management
     */
    queueForSync(userId, data) {
        this.syncQueue.push({
            userId: userId,
            data: data,
            timestamp: Date.now()
        });
        
        // Save queue to localStorage
        try {
            localStorage.setItem('prism_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Error saving sync queue:', error);
        }
    }

    async syncOfflineData() {
        if (!this.isOnline || this.syncQueue.length === 0) return;

        console.log(`Syncing ${this.syncQueue.length} queued items...`);

        while (this.syncQueue.length > 0) {
            const item = this.syncQueue.shift();
            try {
                await this.savePreferences(item.data);
                console.log('Synced item successfully');
            } catch (error) {
                console.error('Failed to sync item:', error);
                // Re-queue if failed
                this.syncQueue.push(item);
                break;
            }
        }

        // Update localStorage queue
        try {
            localStorage.setItem('prism_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Error updating sync queue:', error);
        }
    }

    /**
     * Utility: Delay function for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Normalize preferences from database
     * Converts comma-separated strings to arrays for internal use
     */
    normalizePreferences(preferences) {
        if (!preferences) return null;
        
        return {
            ...preferences,
            // Convert string fields back to arrays
            allergens: preferences.allergens 
                ? (typeof preferences.allergens === 'string' 
                    ? preferences.allergens.split(',').filter(Boolean) 
                    : preferences.allergens)
                : [],
            preferredIngredients: preferences.preferredIngredients
                ? (typeof preferences.preferredIngredients === 'string'
                    ? preferences.preferredIngredients.split(',').filter(Boolean)
                    : preferences.preferredIngredients)
                : [],
            avoidIngredients: preferences.avoidIngredients
                ? (typeof preferences.avoidIngredients === 'string'
                    ? preferences.avoidIngredients.split(',').filter(Boolean)
                    : preferences.avoidIngredients)
                : []
        };
    }

    /**
     * Format preferences for display
     */
    formatPreferencesForDisplay(preferences) {
        if (!preferences) return null;

        return {
            'Skin Type': this.capitalizeFirst(preferences.skinType),
            'Skin Concern': this.capitalizeFirst(preferences.skinConcern),
            'Hair Type': this.capitalizeFirst(preferences.hairType),
            'Hair Texture': this.capitalizeFirst(preferences.hairTexture),
            'Hair Concern': this.capitalizeFirst(preferences.hairConcern),
            'Style': this.capitalizeFirst(preferences.stylePreference),
            'Skincare Budget': this.formatBudget(preferences.skincareBudget),
            'Fashion Budget': this.formatBudget(preferences.fashionBudget),
            'Shopping Frequency': this.capitalizeFirst(preferences.shoppingFrequency),
            'Occasions': this.capitalizeFirst(preferences.occasions),
            'Age Range': this.formatAgeRange(preferences.ageRange)
        };
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }

    formatBudget(budget) {
        const budgetMap = {
            'budget': 'Budget-Friendly',
            'mid': 'Mid-Range',
            'premium': 'Premium',
            'luxury': 'Luxury'
        };
        return budgetMap[budget] || budget;
    }

    formatAgeRange(range) {
        const rangeMap = {
            'teens': '13-19',
            'twenties': '20-29',
            'thirties': '30-39',
            'forties': '40-49',
            'fifties': '50-59',
            'sixty-plus': '60+'
        };
        return rangeMap[range] || range;
    }
}

// Export singleton instance
export const preferencesService = new PrismPreferencesService();
