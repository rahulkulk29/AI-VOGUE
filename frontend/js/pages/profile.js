// AI VOGUE - Profile Page Manager

import { authService, profileService } from '../appwrite-config.js?v=7';

let currentUser = null;
let userProfile = null;

// Profile Manager Class
class ProfileManagerClass {
    constructor() {
        this.currentModal = null;
        this.init();
    }

    async init() {
        // Wait for global auth if available to ensure centralized login state is ready
        if (window.waitForAuth) {
            try { await window.waitForAuth(); } catch (e) { /* no-op */ }
        }

        // Check authentication
        const isAuth = await authService.isAuthenticated();
        if (!isAuth) {
            window.location.href = 'login.html?redirect=profile';
            return;
        }

        // Load user data
        await this.loadUserProfile();
        
        // Initialize modal handlers
        this.initializeModals();
        
        // Load deep link if present
        this.handleDeepLink();
    }

    async loadUserProfile() {
        try {
            currentUser = await authService.getCurrentUser();
            
            if (!currentUser) {
                throw new Error('User not found');
            }

            userProfile = await authService.getUserProfile(currentUser.$id);
            
            if (!userProfile) {
                userProfile = await authService.createUserProfile(
                    currentUser.$id,
                    currentUser.name,
                    currentUser.email
                );
            }

            this.updateProfileUI();
        } catch (error) {
            console.error('Load profile error:', error);
            this.showMessage('Failed to load profile from database. Showing basic account info.', 'error');

            // Fallback: render from auth user so page is usable
            try {
                currentUser = currentUser || await authService.getCurrentUser();
            } catch (_) {}

            if (currentUser) {
                const parts = (currentUser.name || '').split(' ');
                const firstName = parts[0] || '';
                const lastName = parts.slice(1).join(' ') || '';

                userProfile = {
                    firstName,
                    lastName,
                    email: currentUser.email,
                    membershipTier: 'Silver',
                    rewardPoints: 0,
                    avatar: ''
                };
                this.updateProfileUI();
            }
        }
    }

    updateProfileUI() {
        const nameEl = document.getElementById('profile-name');
        if (nameEl) {
            const fallbackName = (userProfile.firstName || userProfile.lastName)
                ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
                : (currentUser?.name || currentUser?.email?.split('@')[0] || 'User');
            nameEl.textContent = fallbackName;
        }

        const emailEl = document.getElementById('profile-email');
        if (emailEl) {
            emailEl.textContent = userProfile.email || currentUser?.email || '';
        }

        const tierEl = document.getElementById('tier-badge');
        if (tierEl) {
            const tier = userProfile.membershipTier || 'Silver';
            tierEl.textContent = `${tier} Member`;
        }

        const pointsEl = document.getElementById('reward-points');
        if (pointsEl) {
            const points = typeof userProfile.rewardPoints === 'number' ? userProfile.rewardPoints : 0;
            pointsEl.textContent = `${points} Points`;
        }

        if (userProfile.avatar) {
            const avatarEl = document.getElementById('profile-avatar');
            if (avatarEl) {
                avatarEl.innerHTML = `<img src="${userProfile.avatar}" alt="Profile">`;
            }
        }
    }

    initializeModals() {
        // Wait for DOM to be ready
        const initializeCards = () => {
            const menuCards = document.querySelectorAll('.profile-menu-card, [data-modal]');
            console.log('Found modal triggers:', menuCards.length);
            
            menuCards.forEach(card => {
                // Remove existing listeners to prevent duplicates
                card.removeEventListener('click', this.handleModalClick);
                
                // Add new listener
                card.addEventListener('click', this.handleModalClick.bind(this));
            });
        };

        // Initialize immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeCards);
        } else {
            initializeCards();
        }
    }

    handleModalClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const modalType = e.currentTarget.getAttribute('data-modal');
        console.log('Opening modal:', modalType);
        
        if (modalType) {
            this.openModal(modalType);
        }
    }

    async openModal(type) {
        await this.closeModal();

        const modal = await this.createModal(type);
        
        if (!modal) return;

        const container = document.getElementById('profile-modals-container');
        container.innerHTML = modal;

        // Use requestAnimationFrame for proper DOM rendering
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const modalEl = document.querySelector('.profile-modal');
                const overlayEl = document.querySelector('.profile-modal-overlay');
                
                if (modalEl) modalEl.classList.add('active');
                if (overlayEl) overlayEl.classList.add('active');
            });
        });

        this.currentModal = type;
        window.location.hash = type;
        this.attachModalListeners(type);
    }

    async createModal(type) {
        switch (type) {
            case 'profile-info':
                return this.createProfileInfoModal();
            case 'orders':
                return await this.createOrdersModal();
            case 'wishlist':
                return await this.createWishlistModal();
            case 'edit-profile':
                return this.createEditProfileModal();
            case 'addresses':
                return await this.createAddressesModal();
            case 'privacy':
                return this.createPrivacyModal();
            default:
                return null;
        }
    }

    createProfileInfoModal() {
        return `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">Profile Information</h2>
                    <button class="profile-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-content">
                    <div class="profile-form-group">
                        <label class="profile-form-label">Full Name</label>
                        <div class="profile-form-input" style="background: white; cursor: default;">
                            ${userProfile.firstName} ${userProfile.lastName}
                        </div>
                    </div>
                    
                    <div class="profile-form-group">
                        <label class="profile-form-label">Email Address</label>
                        <div class="profile-form-input" style="background: white; cursor: default;">
                            ${userProfile.email}
                        </div>
                    </div>
                    
                    <div class="profile-form-group">
                        <label class="profile-form-label">Phone Number</label>
                        <div class="profile-form-input" style="background: white; cursor: default;">
                            ${userProfile.phone || 'Not provided'}
                        </div>
                    </div>
                    
                    <div class="profile-form-group">
                        <label class="profile-form-label">Membership Tier</label>
                        <div class="profile-form-input" style="background: white; cursor: default;">
                            ${userProfile.membershipTier}
                        </div>
                    </div>
                    
                    <div class="profile-form-group">
                        <label class="profile-form-label">Reward Points</label>
                        <div class="profile-form-input" style="background: white; cursor: default;">
                            ${userProfile.rewardPoints} Points
                        </div>
                    </div>
                    
                    <div class="profile-form-group">
                        <label class="profile-form-label">Member Since</label>
                        <div class="profile-form-input" style="background: white; cursor: default;">
                            ${new Date(userProfile.$createdAt || userProfile.createdAt || Date.now()).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async createOrdersModal() {
        const orders = await profileService.getOrders(currentUser.$id);
        
        let ordersHTML = '';
        
        if (orders.length === 0) {
            ordersHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h3 class="empty-state-title">No Orders Yet</h3>
                    <p class="empty-state-description">Start shopping to see your orders here</p>
                    <button class="profile-form-btn" onclick="window.location.href='categories.html'">
                        Browse Products
                    </button>
                </div>
            `;
        } else {
            ordersHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.orderId}</span>
                        <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p>Date: ${new Date(order.$createdAt).toLocaleDateString()}</p>
                        <p>Items: ${order.itemCount}</p>
                    </div>
                    <div class="order-total">Total: $${order.total.toFixed(2)}</div>
                </div>
            `).join('');
        }

        return `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">My Orders</h2>
                    <button class="profile-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-content">
                    ${ordersHTML}
                </div>
            </div>
        `;
    }

    async createWishlistModal() {
        const wishlist = await profileService.getWishlist(currentUser.$id);
        
        let wishlistHTML = '';
        
        if (wishlist.length === 0) {
            wishlistHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h3 class="empty-state-title">No Items in Wishlist</h3>
                    <p class="empty-state-description">Save items you love for later</p>
                    <button class="profile-form-btn" onclick="window.location.href='categories.html'">
                        Browse Products
                    </button>
                </div>
            `;
        } else {
            wishlistHTML = wishlist.map(item => `
                <div class="wishlist-card">
                    <img src="${item.productImage}" alt="${item.productName}" class="wishlist-image">
                    <div class="wishlist-info">
                        <h4 class="wishlist-title">${item.productName}</h4>
                        <p class="wishlist-price">$${item.productPrice}</p>
                        <div class="wishlist-actions">
                            <button class="wishlist-btn" onclick="window.ProfileManager.removeFromWishlist('${item.$id}')">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            <button class="wishlist-btn">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        return `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">Wishlist</h2>
                    <button class="profile-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-content">
                    ${wishlistHTML}
                </div>
            </div>
        `;
    }

    createEditProfileModal() {
        return `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">Edit Profile</h2>
                    <button class="profile-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-content">
                    <form id="edit-profile-form">
                        <div class="profile-form-group">
                            <label class="profile-form-label">First Name</label>
                            <input type="text" class="profile-form-input" name="firstName" 
                                   value="${userProfile.firstName}" required>
                        </div>
                        
                        <div class="profile-form-group">
                            <label class="profile-form-label">Last Name</label>
                            <input type="text" class="profile-form-input" name="lastName" 
                                   value="${userProfile.lastName}" required>
                        </div>
                        
                        <div class="profile-form-group">
                            <label class="profile-form-label">Phone Number</label>
                            <input type="tel" class="profile-form-input" name="phone" 
                                   value="${userProfile.phone || ''}" placeholder="+1 (555) 123-4567">
                        </div>
                        
                        <div class="profile-form-group">
                            <label class="profile-form-label">
                                <input type="checkbox" name="newsletter" 
                                       ${userProfile.newsletter ? 'checked' : ''}>
                                Subscribe to newsletter
                            </label>
                        </div>
                        
                        <button type="submit" class="profile-form-btn">
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    async createAddressesModal() {
        const addresses = await profileService.getAddresses(currentUser.$id);
        
        let addressesHTML = '';
        
        if (addresses.length === 0) {
            addressesHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <h3 class="empty-state-title">No Saved Addresses</h3>
                    <p class="empty-state-description">Add delivery addresses for faster checkout</p>
                </div>
            `;
        } else {
            addressesHTML = addresses.map(addr => `
                <div class="address-card ${addr.isDefault ? 'default' : ''}">
                    ${addr.isDefault ? '<span class="address-tag">Default</span>' : ''}
                    <div class="address-name">${addr.name}</div>
                    <div class="address-details">
                        ${addr.street}<br>
                        ${addr.city}, ${addr.state} ${addr.zipCode}<br>
                        ${addr.country}<br>
                        Phone: ${addr.phone}
                    </div>
                    <div class="address-actions">
                        <button class="wishlist-btn">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="wishlist-btn" onclick="window.ProfileManager.deleteAddress('${addr.$id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }

        return `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">Saved Addresses</h2>
                    <button class="profile-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-content">
                    ${addressesHTML}
                    <button class="profile-form-btn" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Add New Address
                    </button>
                </div>
            </div>
        `;
    }

    createPrivacyModal() {
        return `
            <div class="profile-modal-overlay"></div>
            <div class="profile-modal">
                <div class="profile-modal-header">
                    <h2 class="profile-modal-title">Privacy Center</h2>
                    <button class="profile-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="profile-modal-content">
                    <div class="privacy-item">
                        <div class="privacy-header">
                            <div>
                                <div class="privacy-title">Email Notifications</div>
                                <p class="privacy-description">Receive updates about orders and promotions</p>
                            </div>
                            <div class="privacy-toggle active" onclick="this.classList.toggle('active')">
                                <div class="privacy-toggle-slider"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="privacy-item">
                        <div class="privacy-header">
                            <div>
                                <div class="privacy-title">SMS Notifications</div>
                                <p class="privacy-description">Get text updates about your orders</p>
                            </div>
                            <div class="privacy-toggle" onclick="this.classList.toggle('active')">
                                <div class="privacy-toggle-slider"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="privacy-item">
                        <div class="privacy-header">
                            <div>
                                <div class="privacy-title">Marketing Communications</div>
                                <p class="privacy-description">Receive personalized product recommendations</p>
                            </div>
                            <div class="privacy-toggle active" onclick="this.classList.toggle('active')">
                                <div class="privacy-toggle-slider"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-form-group" style="margin-top: 2rem;">
                        <button class="profile-form-btn" style="background: var(--color-gray-medium);">
                            <i class="fas fa-download"></i> Download My Data
                        </button>
                    </div>
                    
                    <div class="profile-form-group">
                        <button class="profile-form-btn" style="background: #dc3545;">
                            <i class="fas fa-exclamation-triangle"></i> Delete My Account
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachModalListeners(type) {
        // Remove existing listeners to prevent duplicates
        document.removeEventListener('keydown', this.handleEscKey);
        
        // Add escape key listener
        document.addEventListener('keydown', this.handleEscKey.bind(this));

        // Attach specific modal listeners
        if (type === 'edit-profile') {
            const form = document.getElementById('edit-profile-form');
            if (form) {
                form.removeEventListener('submit', this.handleEditProfile);
                form.addEventListener('submit', this.handleEditProfile.bind(this));
            }
        }

        // Add click outside to close functionality
        const overlay = document.querySelector('.profile-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', async (e) => {
                if (e.target === overlay) {
                    await this.closeModal();
                }
            });
        }

        // Add close button functionality
        const closeBtn = document.querySelector('.profile-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.closeModal();
            });
        }
    }

    handleEscKey(e) {
        if (e.key === 'Escape' && this.currentModal) {
            this.closeModal();
        }
    }

    closeModal() {
        return new Promise((resolve) => {
            const modalEl = document.querySelector('.profile-modal');
            const overlayEl = document.querySelector('.profile-modal-overlay');
            
            if (!modalEl || !overlayEl) {
                resolve();
                return;
            }

            modalEl.classList.remove('active');
            overlayEl.classList.remove('active');

            setTimeout(() => {
                const container = document.getElementById('profile-modals-container');
                if (container) container.innerHTML = '';
                
                this.currentModal = null;
                if (window.location.hash) {
                    history.pushState('', document.title, window.location.pathname);
                }
                resolve();
            }, 450); // Slightly longer than CSS transition
        });
    }

    handleDeepLink() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.openModal(hash);
        }
    }

    async handleEditProfile(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const data = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            phone: formData.get('phone').trim(),
            newsletter: formData.get('newsletter') === 'on'
        };

        // Validate required fields
        if (!data.firstName || !data.lastName) {
            this.showMessage('First name and last name are required', 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            // Update profile in database
            const updatedProfile = await authService.updateProfile(currentUser.$id, data);
            
            // Update local profile data
            userProfile = { ...userProfile, ...data };
            
            // Update UI immediately
            this.updateProfileUI();
            
            this.showMessage('Profile updated successfully!', 'success');
            
            // Close modal after delay
            setTimeout(async () => {
                await this.closeModal();
            }, 1500);

        } catch (error) {
            console.error('Update profile error:', error);
            
            let errorMessage = 'Failed to update profile. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
            
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    async removeFromWishlist(itemId) {
        if (!confirm('Remove this item from wishlist?')) return;

        try {
            await profileService.removeFromWishlist(itemId);
            this.showMessage('Item removed from wishlist', 'success');
            
            // Refresh wishlist modal
            this.openModal('wishlist');
        } catch (error) {
            console.error('Remove wishlist error:', error);
            this.showMessage('Failed to remove item', 'error');
        }
    }

    async deleteAddress(addressId) {
        if (!confirm('Delete this address?')) return;

        try {
            await profileService.deleteAddress(addressId);
            this.showMessage('Address deleted', 'success');
            
            // Refresh addresses modal
            this.openModal('addresses');
        } catch (error) {
            console.error('Delete address error:', error);
            this.showMessage('Failed to delete address', 'error');
        }
    }

    async uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                this.showMessage('Uploading avatar...', 'info');
                
                const avatarUrl = await authService.uploadAvatar(file);
                await authService.updateProfile(currentUser.$id, { avatar: avatarUrl.href });
                
                userProfile.avatar = avatarUrl.href;
                this.updateProfileUI();
                
                this.showMessage('Avatar updated successfully!', 'success');
            } catch (error) {
                console.error('Upload avatar error:', error);
                this.showMessage('Failed to upload avatar', 'error');
            }
        };
        
        input.click();
    }

    async logout() {
        if (!confirm('Are you sure you want to sign out?')) return;
        
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Failed to logout', 'error');
        }
    }

    showMessage(message, type = 'info') {
        const existing = document.querySelector('.profile-message');
        if (existing) existing.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `profile-message profile-message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 8px;
            z-index: 9999;
            box-shadow: var(--shadow-medium);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 4000);
    }
}

// Initialize ProfileManager when DOM is ready
const ProfileManager = new ProfileManagerClass();

// Make ProfileManager globally accessible
window.ProfileManager = ProfileManager;

export { ProfileManager };
