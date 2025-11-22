/**
 * Try-On Image Mapping
 * Maps product image URLs to pre-generated try-on images in Appwrite
 * 
 * NO DATABASE NEEDED - Uses product image URL as identifier
 */

const TRYON_IMAGE_MAPPING = {
    // Appwrite Configuration
    appwrite: {
        endpoint: 'https://nyc.cloud.appwrite.io/v1',
        projectId: '68dd18860033ab7dffac',
        bucketId: 'avatars' // User is using 'avatars' bucket for try-on images
    },

    // Mapping: Product Image URL → Try-On Image File ID
    imageMap: {
        // ===== SHIRTS =====

        // Black Shirt
        'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/u/p/e/-original-imahfjy4kwgd32gj.jpeg?q=70': '69214e31000bfd420e16',

        // Pink Shirt
        'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/q/h/z/-original-imagnp3gsgqa4svn.jpeg?q=70': '69214e52002a2e26023b',

        // Blue Checks Shirt
        'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/u/e/g/3xl-232519-the-souled-store-original-imagt6xwwnqby4ag.jpeg?q=70': '69214e380026c4a90e6b',

        // Pattern Shirt (Camo)
        'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/l/l/s/xxl-mfs-14254-r-mufti-original-imagtdzqpvpsbr67.jpeg?q=70': '69214e40002cd8317f78',

        // Vertical Striped Shirt
        'https://rukminim2.flixcart.com/image/612/612/xif0q/shirt/a/4/v/-original-imahfmzphmsfbjyh.jpeg?q=70': '69214e5f000b3b7fbc30',

        // ===== PANTS =====

        // Black Jogger
        'https://rukminim2.flixcart.com/image/612/612/xif0q/track-pant/m/q/p/m-1jg-jog-cargo-blk-jugular-original-imah39gyftqgytkr.jpeg?q=70': '6921c2db00112af7ee5e',

        // Black Plain
        'https://rukminim2.flixcart.com/image/612/612/xif0q/track-pant/i/0/y/xl-8112-paralians-original-imahccyeteq7sxve.jpeg?q=70': '6921c2e4000f7a7dffe5',

        // Cream Jogger
        'https://rukminim2.flixcart.com/image/612/612/xif0q/track-pant/s/d/g/34-1223-wflknpnjog-03-the-indian-garage-co-original-imahctzhzmyqhya3.jpeg?q=70': '6921c2ed003968391b74',

        // Lycra
        'https://rukminim2.flixcart.com/image/612/612/xif0q/track-pant/s/k/l/xl-ic-pt220s050-indiclub-original-imah3hmfhctsjhjm.jpeg?q=70': '6921c2f60013357243aa',

        // Black Strip
        'https://rukminim2.flixcart.com/image/612/612/xif0q/track-pant/z/y/u/l-2067-paralians-original-imaheqgsvyugxbaa.jpeg?q=70': '6921c3040004cca915b6'
    },

    /**
     * Get try-on image URL for a product
     * @param {string} productImageUrl - The product's main image URL
     * @returns {string|null} - Try-on image URL or null if not found
     */
    getTryOnImageUrl(productImageUrl) {
        const fileId = this.imageMap[productImageUrl];

        if (!fileId) {
            console.log('[TRYON] No pre-generated image for:', productImageUrl);
            return null;
        }

        // Generate Appwrite file view URL
        const url = `${this.appwrite.endpoint}/storage/buckets/${this.appwrite.bucketId}/files/${fileId}/view?project=${this.appwrite.projectId}`;

        console.log('[TRYON] ✅ Found pre-generated image:', url);
        return url;
    },

    /**
     * Check if product has a pre-generated try-on image
     * @param {string} productImageUrl - The product's main image URL
     * @returns {boolean}
     */
    hasTryOnImage(productImageUrl) {
        return !!this.imageMap[productImageUrl];
    },

    /**
     * Add a new mapping (for admin use)
     * @param {string} productImageUrl - The product's main image URL
     * @param {string} tryonFileId - Appwrite file ID for try-on image
     */
    addMapping(productImageUrl, tryonFileId) {
        this.imageMap[productImageUrl] = tryonFileId;
        console.log('[TRYON] Added mapping:', productImageUrl, '→', tryonFileId);
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.TRYON_IMAGE_MAPPING = TRYON_IMAGE_MAPPING;
}

// Also export as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TRYON_IMAGE_MAPPING;
}
