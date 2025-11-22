// AI VOGUE - Appwrite Configuration and Authentication Service
// Clean, modular, and production-friendly rewrite of your original file.

// Import Appwrite SDK (ESM) - COMMENTED OUT FOR DEBUGGING/OFFLINE MODE
// import { Client, Account, Databases, Storage, Functions, Query } from 'https://cdn.jsdelivr.net/npm/appwrite@14.0.1/+esm';

// MOCK APPWRITE SDK
class Client {
  setEndpoint() { return this; }
  setProject() { return this; }
}
class Account {
  constructor(client) { }
  async get() { throw new Error('User not logged in (Mock)'); }
  async createEmailPasswordSession() { return { $id: 'mock-session' }; }
  async deleteSession() { return {}; }
}
class Databases {
  constructor(client) { }
  async listDocuments() { return { documents: [] }; }
  async createDocument() { return { $id: 'mock-doc' }; }
  async updateDocument() { return { $id: 'mock-doc' }; }
}
class Storage {
  constructor(client) { }
  async createFile() { return { $id: 'mock-file' }; }
  getFileView() { return 'https://placehold.co/400'; }
}
class Functions {
  constructor(client) { }
}
const Query = {
  equal: (k, v) => `equal("${k}", "${v}")`,
  orderDesc: (k) => `orderDesc("${k}")`,
  limit: (n) => `limit(${n})`
};
class ID {
  static unique() { return 'unique-' + Math.random().toString(36).substr(2, 9); }
}

////////////////////////////////////////////////////////////////////////////////
// Config
////////////////////////////////////////////////////////////////////////////////
const APPWRITE_CONFIG = {
  // Appwrite server endpoint & project
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '68dd18860033ab7dffac',

  // Database & collections
  databaseId: '68dd21f50029362dfb7a',
  collections: {
    users: 'users',                 // collection id for users
    orders: 'orders',               // collection id for orders
    wishlist: 'wishlist',           // collection id for wishlist
    addresses: 'addresses',         // collection id for addresses
    user_preferences: 'user_preferences' // user preferences collection
  },

  // Storage
  bucketId: 'avatars',

  // Functions (Appwrite cloud functions)
  functions: {
    geminiProxy: 'gemini-proxy' // name / id of Appwrite function used as fallback / proxy
  },

  // Python Backend Configuration (local dev by default)
  pythonBackend: {
    baseUrl: 'http://localhost:5000', // no trailing slash preferred
    endpoints: {
      recommend: '/api/recommend',
      health: '/health',
      test: '/api/test'
    }
  }
};

////////////////////////////////////////////////////////////////////////////////
// Appwrite initialization
////////////////////////////////////////////////////////////////////////////////
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

////////////////////////////////////////////////////////////////////////////////
// Utility helpers
////////////////////////////////////////////////////////////////////////////////

/**
 * Build a full URL for the python backend endpoints.
 * Ensures no duplicate slashes and that baseUrl exists.
 * @param {string} endpointKey - key from APPWRITE_CONFIG.pythonBackend.endpoints (e.g., 'recommend')
 * @returns {string} full URL
 */
function getPythonUrl(endpointKey) {
  const backend = APPWRITE_CONFIG.pythonBackend || {};
  const base = (backend.baseUrl || '').replace(/\/+$/, ''); // remove trailing slash
  const endpoints = backend.endpoints || {};
  const path = endpoints[endpointKey] || '';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Safe helper to extract the first document from a query result.
 * @param {object} listResult - result returned from databases.listDocuments
 * @returns {object|null} document or null
 */
function firstDocument(listResult) {
  if (!listResult) return null;
  if (Array.isArray(listResult.documents) && listResult.documents.length) {
    return listResult.documents[0];
  }
  return null;
}

////////////////////////////////////////////////////////////////////////////////
// Authentication Service
////////////////////////////////////////////////////////////////////////////////
class AuthService {
  // Get current user (returns null on failure)
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.debug('Get current user error (no session?):', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Register new user and create profile document
  async register(email, password, name) {
    try {
      const response = await account.create('unique()', email, password, name);
      console.log('Registration successful:', response);

      // Auto login after registration (creates email/password session)
      await account.createEmailPasswordSession(email, password);

      // Create user profile document in DB
      await this.createUserProfile(response.$id, name, email);

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user (returns session or current user if already logged in)
  async login(email, password) {
    try {
      // If already logged in, return current user object
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        console.log('Already logged in:', currentUser);
        return currentUser;
      }

      const session = await account.createEmailPasswordSession(email, password);
      console.log('Login successful:', session);
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user (deletes current session)
  async logout() {
    try {
      await account.deleteSession('current');
      console.log('Logout successful');
      // Optionally redirect after logout
      if (typeof window !== 'undefined') {
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Create user profile document (id: unique(), stores userId field)
  async createUserProfile(userId, name = '', email = '') {
    try {
      const [firstName, ...lastParts] = (name || '').trim().split(' ');
      const lastName = lastParts.join(' ');

      const baseData = {
        userId,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        avatar: 'https://placehold.co/160x160/png',
        membershipTier: 'Silver',
        rewardPoints: 0,
        newsletter: true,
        createdAt: new Date().toISOString()
      };

      try {
        const profile = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.users,
          'unique()',
          baseData
        );
        return profile;
      } catch (err) {
        // If schema rejects avatar placeholder, retry without avatar field
        const message = (err && err.message) ? String(err.message).toLowerCase() : '';
        if (message.includes('avatar') || message.includes('schema')) {
          const { avatar, ...withoutAvatar } = baseData;
          const profile = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.users,
            'unique()',
            withoutAvatar
          );
          return profile;
        }
        throw err;
      }
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  }

  // Update user profile (looks up doc by userId and updates it)
  async updateProfile(userId, data = {}) {
    try {
      const list = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      const doc = firstDocument(list);
      if (!doc) throw new Error('Profile not found for update');

      const updated = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        doc.$id,
        data
      );
      return updated;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get user profile by userId
  async getUserProfile(userId) {
    try {
      const list = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.users,
        [Query.equal('userId', userId), Query.limit(1)]
      );
      return firstDocument(list);
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Upload avatar file to storage and return a view URL
  async uploadAvatar(file) {
    try {
      // createFile returns a file object containing $id
      const response = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        'unique()',
        file
      );

      // getFileView returns a URL for viewing the file
      // Some SDK versions provide a helper that returns a signed URL or a path.
      // We'll attempt to call getFileView with the bucketId and fileId.
      let fileUrl;
      try {
        fileUrl = storage.getFileView(APPWRITE_CONFIG.bucketId, response.$id);
      } catch (e) {
        // Fallback: return the response object if getFileView not available
        console.warn('Could not obtain file view URL (SDK variation):', e);
        fileUrl = response;
      }

      return fileUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// ProfileService (orders, wishlist, addresses)
////////////////////////////////////////////////////////////////////////////////
class ProfileService {
  // Get user orders (descending by createdAt)
  async getOrders(userId) {
    try {
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.orders,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      return res.documents || [];
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  // Get wishlist entries for a user
  async getWishlist(userId) {
    try {
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.wishlist,
        [Query.equal('userId', userId)]
      );
      return res.documents || [];
    } catch (error) {
      console.error('Get wishlist error:', error);
      return [];
    }
  }

  // Add product to wishlist
  async addToWishlist(userId, productId, productData = {}) {
    try {
      const item = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.wishlist,
        'unique()',
        {
          userId,
          productId,
          productName: productData.name || '',
          productPrice: productData.price || 0,
          productImage: productData.image || '',
          addedAt: new Date().toISOString()
        }
      );
      return item;
    } catch (error) {
      console.error('Add to wishlist error:', error);
      throw error;
    }
  }

  // Remove wishlist item by doc id
  async removeFromWishlist(itemId) {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.wishlist,
        itemId
      );
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      throw error;
    }
  }

  // Get saved addresses for a user
  async getAddresses(userId) {
    try {
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.addresses,
        [Query.equal('userId', userId)]
      );
      return res.documents || [];
    } catch (error) {
      console.error('Get addresses error:', error);
      return [];
    }
  }

  // Add an address
  async addAddress(userId, addressData = {}) {
    try {
      const address = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.addresses,
        'unique()',
        {
          userId,
          ...addressData,
          createdAt: new Date().toISOString()
        }
      );
      return address;
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  }

  // Update address by document id
  async updateAddress(addressId, addressData = {}) {
    try {
      const updated = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.addresses,
        addressId,
        addressData
      );
      return updated;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }

  // Delete address by document id
  async deleteAddress(addressId) {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.addresses,
        addressId
      );
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// Instantiate services and exports
////////////////////////////////////////////////////////////////////////////////
const authService = new AuthService();
const profileService = new ProfileService();

// Attach to window for global access
window.authService = authService;
window.profileService = profileService;
window.APPWRITE_CONFIG = APPWRITE_CONFIG;
window.account = account;
window.databases = databases;
window.storage = storage;
window.functions = functions;
window.getPythonUrl = getPythonUrl;
window.ID = ID;
window.Query = Query;

console.log('✅ Appwrite Config Loaded (Global Mode)');
