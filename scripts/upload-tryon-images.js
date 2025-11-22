/**
 * Upload Try-On Images to Appwrite
 * 
 * This script uploads your 5 try-on images to Appwrite
 * and generates the mapping configuration automatically.
 * 
 * Usage:
 * 1. Copy your 5 images to this directory and rename them:
 *    - black_shirt.png
 *    - pink_shirt.png
 *    - plaid_shirt.png
 *    - camo_shirt.png
 *    - striped_shirt.png
 * 
 * 2. Run: node upload-tryon-images.js
 */

const { Client, Storage, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// Appwrite Configuration
const APPWRITE_CONFIG = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: '68dd18860033ab7dffac',
    apiKey: 'YOUR_API_KEY_HERE', // Get from Appwrite Console → Settings → API Keys
    bucketId: 'product-tryons'
};

// Image files to upload
const IMAGES_TO_UPLOAD = [
    {
        filename: 'black_shirt.png',
        description: 'Black Shirt Try-On',
        productImageUrl: 'PASTE_BLACK_SHIRT_PRODUCT_URL_HERE'
    },
    {
        filename: 'pink_shirt.png',
        description: 'Pink Shirt Try-On',
        productImageUrl: 'PASTE_PINK_SHIRT_PRODUCT_URL_HERE'
    },
    {
        filename: 'plaid_shirt.png',
        description: 'Plaid Shirt Try-On',
        productImageUrl: 'PASTE_PLAID_SHIRT_PRODUCT_URL_HERE'
    },
    {
        filename: 'camo_shirt.png',
        description: 'Camo Shirt Try-On',
        productImageUrl: 'PASTE_CAMO_SHIRT_PRODUCT_URL_HERE'
    },
    {
        filename: 'striped_shirt.png',
        description: 'Striped Shirt Try-On',
        productImageUrl: 'PASTE_STRIPED_SHIRT_PRODUCT_URL_HERE'
    }
];

async function uploadImages() {
    console.log('🚀 Starting upload to Appwrite...\n');

    // Initialize Appwrite
    const client = new Client()
        .setEndpoint(APPWRITE_CONFIG.endpoint)
        .setProject(APPWRITE_CONFIG.projectId)
        .setKey(APPWRITE_CONFIG.apiKey);

    const storage = new Storage(client);

    const mapping = {};
    const uploadedFiles = [];

    for (const imageInfo of IMAGES_TO_UPLOAD) {
        try {
            const filePath = path.join(__dirname, imageInfo.filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${imageInfo.filename} - Skipping`);
                continue;
            }

            console.log(`📤 Uploading ${imageInfo.description}...`);

            // Upload to Appwrite
            const file = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                filePath
            );

            console.log(`   ✅ Uploaded! File ID: ${file.$id}`);

            // Add to mapping
            mapping[imageInfo.productImageUrl] = file.$id;
            uploadedFiles.push({
                description: imageInfo.description,
                fileId: file.$id,
                productUrl: imageInfo.productImageUrl
            });

        } catch (error) {
            console.error(`   ❌ Error uploading ${imageInfo.filename}:`, error.message);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Upload Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Generate mapping code
    console.log('📋 Copy this mapping to tryon-image-mapping.js:\n');
    console.log('imageMap: {');
    for (const [productUrl, fileId] of Object.entries(mapping)) {
        console.log(`    '${productUrl}': '${fileId}',`);
    }
    console.log('}');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save to file
    const mappingFile = path.join(__dirname, 'generated-mapping.json');
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`💾 Mapping saved to: ${mappingFile}\n`);

    return uploadedFiles;
}

// Run the upload
uploadImages()
    .then(files => {
        console.log(`\n🎉 Successfully uploaded ${files.length} images!`);
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Upload failed:', error);
        process.exit(1);
    });
