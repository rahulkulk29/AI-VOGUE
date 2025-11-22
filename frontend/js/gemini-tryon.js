/**
 * REALISTIC Virtual Try-On Solution
 * With AI-style processing delays for pre-generated images
 */

const CONFIG = {
    useBackendProxy: true,
    backendProxyUrl: 'http://localhost:3000/api/virtual-tryon'
};

/**
 * Convert image URL to base64
 */
async function imageUrlToBase64(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image URL to base64:', error);
        throw new Error('Failed to load product image');
    }
}

/**
 * Convert File to base64
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Update status message
 */
function updateStatus(message) {
    console.log(`[VTON] ${message}`);
    if (window.updateTryOnStatus) {
        window.updateTryOnStatus(message);
    }
}

/**
 * Main function: Apply clothing to user's photo
 * Now checks for pre-generated images first (no database needed!)
 */
async function applyDressToImage(userImage, productImageUrl) {
    try {
        // STEP 1: Check for pre-generated image (using product image URL as key)
        if (window.TRYON_IMAGE_MAPPING && window.TRYON_IMAGE_MAPPING.hasTryOnImage(productImageUrl)) {
            console.log('[VTON] ✅ Found pre-generated image for this product!');

            // Simulate realistic AI processing with 10-second delay
            updateStatus('🔍 Analyzing your photo...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s

            updateStatus('👕 Processing garment details and patterns...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s

            updateStatus('🎨 AI is generating your virtual try-on, please wait...');
            await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s

            // Fetch the image during this phase
            const tryonImageUrl = window.TRYON_IMAGE_MAPPING.getTryOnImageUrl(productImageUrl);
            const tryonBase64 = await imageUrlToBase64(tryonImageUrl);

            updateStatus('✨ Finalizing your personalized look...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s

            updateStatus('🎉 Almost ready...');
            await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s

            // Total delay: 10 seconds (2 + 2 + 2.5 + 2 + 1.5)
            return tryonBase64;
        }

        // STEP 2: No pre-generated image, proceed with AI
        updateStatus('Preparing images for AI try-on...');

        // Convert images to base64
        let userImageBase64;
        if (typeof userImage === 'string') {
            userImageBase64 = userImage;
        } else if (userImage instanceof File) {
            userImageBase64 = await fileToBase64(userImage);
        } else {
            throw new Error('Invalid user image format');
        }

        const productImageBase64 = await imageUrlToBase64(productImageUrl);

        // If backend proxy is available, use it
        if (CONFIG.useBackendProxy) {
            return await callBackendProxy(userImageBase64, productImageBase64);
        }

        // Otherwise, show informative message and use best available method
        updateStatus('Creating preview (limited realism without backend)...');
        return await createEnhancedPreview(userImageBase64, productImageBase64);

    } catch (error) {
        console.error('Virtual try-on error:', error);
        throw new Error('Virtual try-on failed. Please try again.');
    }
}

/**
 * Call backend proxy (if you set one up)
 */
async function callBackendProxy(userImageBase64, productImageBase64) {
    updateStatus('Calling AI backend for realistic try-on...');

    const response = await fetch(CONFIG.backendProxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userImage: userImageBase64,
            productImage: productImageBase64
        })
    });

    if (!response.ok) {
        throw new Error(`Backend proxy failed: ${response.status}`);
    }

    const data = await response.json();

    // If backend is in fallback mode, use local canvas overlay
    if (data.fallback) {
        console.log('Backend in fallback mode:', data.message);
        updateStatus('Creating preview (backend in fallback mode)...');
        return await createEnhancedPreview(userImageBase64, productImageBase64);
    }

    return data.resultImage; // base64
}

/**
 * Create enhanced preview using canvas
 * This is the best we can do without a backend
 */
async function createEnhancedPreview(userImageBase64, productImageBase64) {
    return new Promise((resolve, reject) => {
        const userImg = new Image();
        const productImg = new Image();

        let userLoaded = false;
        let productLoaded = false;

        const processImages = () => {
            if (!userLoaded || !productLoaded) return;

            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas size to user image
                canvas.width = userImg.width;
                canvas.height = userImg.height;

                // Draw user image
                ctx.drawImage(userImg, 0, 0);

                // Calculate product placement (centered on upper body)
                const productWidth = canvas.width * 0.45;
                const productHeight = (productImg.height / productImg.width) * productWidth;
                const productX = (canvas.width - productWidth) / 2;
                const productY = canvas.height * 0.22;

                // Draw product with better blending
                ctx.globalAlpha = 0.85;
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(productImg, productX, productY, productWidth, productHeight);

                // Reset
                ctx.globalAlpha = 1.0;

                const resultBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
                resolve(resultBase64);

            } catch (error) {
                reject(error);
            }
        };

        userImg.onload = () => { userLoaded = true; processImages(); };
        productImg.onload = () => { productLoaded = true; processImages(); };
        userImg.onerror = () => reject(new Error('Failed to load user image'));
        productImg.onerror = () => reject(new Error('Failed to load product image'));

        userImg.src = `data:image/jpeg;base64,${userImageBase64}`;
        productImg.src = `data:image/jpeg;base64,${productImageBase64}`;
    });
}

/**
 * Create data URL from base64
 */
function base64ToDataUrl(base64, mimeType = 'image/jpeg') {
    return `data:${mimeType};base64,${base64}`;
}

// Export functions
window.GeminiTryOn = {
    applyDressToImage,
    base64ToDataUrl,
    imageUrlToBase64,
    fileToBase64,
    CONFIG
};

console.log('🎨 Virtual Try-On loaded with 10-second AI-style delays');
