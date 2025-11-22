// Shared product detail logic for pants-product.html, shirts-product.html, shoes-product.html
// Uses localStorage to read the product selected from listing pages.

(function () {
  function getStoredProduct() {
    try {
      const raw = localStorage.getItem('vogue_selected_product_detail');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.product) return null;
      return parsed;
    } catch (e) {
      console.error('Error reading stored product detail:', e);
      return null;
    }
  }

  function formatPrice(value) {
    const n = Number(value) || 0;
    if (!n) return '';
    return `₹${n.toLocaleString()}`;
  }

  const TRYON_IMAGE_DATABASE_ID = '691f5e22003701939eb8';
  const TRYON_IMAGE_COLLECTION_ID = 'faces';

  async function getTryOnUserId() {
    const existing = localStorage.getItem('vogue_tryon_user_id');
    if (existing) return existing;

    let userId = null;
    try {
      if (window.authService) {
        const user = await window.authService.getCurrentUser();
        if (user && user.$id) {
          userId = user.$id;
        }
      }
    } catch (e) {
      console.error('Error getting current user for try-on:', e);
    }

    if (!userId) {
      userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    }
    try {
      localStorage.setItem('vogue_tryon_user_id', userId);
    } catch (e) {
      console.error('Error storing try-on user id:', e);
    }
    return userId;
  }

  function showFaceUploadModal() {
    return new Promise(function (resolve) {
      const existingModal = document.querySelector('.face-upload-modal');
      if (existingModal) {
        existingModal.remove();
      }

      const overlay = document.createElement('div');
      overlay.className = 'face-upload-modal';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(0,0,0,0.6)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '9999';

      const dialog = document.createElement('div');
      dialog.style.background = '#fff';
      dialog.style.padding = '20px';
      dialog.style.borderRadius = '12px';
      dialog.style.maxWidth = '400px';
      dialog.style.width = '90%';
      dialog.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';

      const title = document.createElement('h3');
      title.textContent = 'Upload a front-facing photo';

      const info = document.createElement('p');
      info.textContent = 'Please upload a clear, straight face image under 1mb.';

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      const errorEl = document.createElement('div');
      errorEl.style.color = 'red';
      errorEl.style.marginTop = '8px';
      errorEl.style.fontSize = '0.85rem';

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '10px';
      btnRow.style.marginTop = '16px';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className = 'btn btn-secondary';

      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Upload & Continue';
      uploadBtn.className = 'btn btn-primary';

      function cleanup() {
        overlay.remove();
      }

      cancelBtn.onclick = function () {
        cleanup();
        resolve(null);
      };

      uploadBtn.onclick = function () {
        const file = input.files && input.files[0];
        if (!file) {
          errorEl.textContent = 'Please select an image file.';
          return;
        }
        if (!file.type || file.type.indexOf('image/') !== 0) {
          errorEl.textContent = 'File must be an image.';
          return;
        }
        if (file.size > 1024 * 1024) {
          errorEl.textContent = 'Image must be smaller than 1 MB.';
          return;
        }
        errorEl.textContent = '';
        cleanup();
        resolve(file);
      };

      dialog.appendChild(title);
      dialog.appendChild(info);
      dialog.appendChild(input);
      dialog.appendChild(errorEl);
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(uploadBtn);
      dialog.appendChild(btnRow);
      overlay.appendChild(dialog);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          cleanup();
          resolve(null);
        }
      });

      document.body.appendChild(overlay);
    });
  }

  async function handleTryNow() {
    try {
      const storage = window.storage;
      const databases = window.databases;
      const APPWRITE_CONFIG = window.APPWRITE_CONFIG;

      if (!storage || !databases || !APPWRITE_CONFIG) {
        console.error('Appwrite client not available for try-on.');
        return;
      }

      // Check if user already uploaded a photo
      const existingFileId = localStorage.getItem('vogue_face_image_file_id');
      let userImageFile = null;
      let fileId = existingFileId;

      if (!existingFileId) {
        // Prompt user to upload photo
        const file = await showFaceUploadModal();
        if (!file) {
          return;
        }

        // Save to Appwrite storage
        const fileRes = await storage.createFile(
          APPWRITE_CONFIG.bucketId,
          'unique()',
          file
        );
        fileId = fileRes.$id;

        const userId = await getTryOnUserId();

        try {
          await databases.createDocument(
            TRYON_IMAGE_DATABASE_ID,
            TRYON_IMAGE_COLLECTION_ID,
            'unique()',
            {
              userId: userId,
              fileId: fileRes.$id,
              size: file.size,
              mimeType: file.type || '',
              createdAt: new Date().toISOString()
            }
          );
        } catch (e) {
          console.error('Error saving try-on image metadata:', e);
        }

        try {
          localStorage.setItem('vogue_face_image_file_id', fileRes.$id);
        } catch (e) {
          console.error('Error storing face image id:', e);
        }

        userImageFile = file;
      }

      // Get the product image URL
      const stored = getStoredProduct();
      if (!stored || !stored.product) {
        console.error('No product selected for try-on');
        return;
      }
      const productImageUrl = stored.product.image || stored.product.image_url;
      if (!productImageUrl) {
        console.error('Product has no image');
        return;
      }

      // Show modal with loading state
      await showTryOnModalWithLoading();

      // If we don't have the file object, we need to fetch it from storage
      if (!userImageFile && fileId) {
        try {
          const url = storage.getFileView(APPWRITE_CONFIG.bucketId, fileId);
          const response = await fetch(url);
          const blob = await response.blob();
          userImageFile = new File([blob], 'user-photo.jpg', { type: blob.type });
        } catch (e) {
          console.error('Error fetching user image from storage:', e);
          showTryOnError('Failed to load your photo. Please try again.');
          return;
        }
      }

      // Call Gemini API to apply dress to image
      if (window.GeminiTryOn && window.GeminiTryOn.applyDressToImage) {
        try {
          updateTryOnStatus('Applying clothing to your photo... This may take a moment.');

          const resultBase64 = await window.GeminiTryOn.applyDressToImage(
            userImageFile,
            productImageUrl
          );

          // Display the result
          const resultDataUrl = window.GeminiTryOn.base64ToDataUrl(resultBase64);
          displayTryOnResult(resultDataUrl);

        } catch (apiError) {
          console.error('Gemini API error:', apiError);
          showTryOnError('Unable to generate try-on image. ' + apiError.message);
        }
      } else {
        console.error('Gemini TryOn module not loaded');
        showTryOnError('Virtual try-on feature is not available. Please refresh the page.');
      }

    } catch (e) {
      console.error('Error during try-on flow:', e);
      showTryOnError('An unexpected error occurred. Please try again.');
    }
  }

  async function handleReuploadFace() {
    try {
      const storage = window.storage;
      const databases = window.databases;
      const APPWRITE_CONFIG = window.APPWRITE_CONFIG;
      const Query = window.Query;

      if (!storage || !databases || !APPWRITE_CONFIG || !Query) {
        console.error('Appwrite client not available for reupload.');
        return;
      }

      const oldFileId = localStorage.getItem('vogue_face_image_file_id');
      const userId = await getTryOnUserId();

      const file = await showFaceUploadModal();
      if (!file) {
        return;
      }

      const fileRes = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        'unique()',
        file
      );

      if (oldFileId) {
        try {
          await storage.deleteFile(APPWRITE_CONFIG.bucketId, oldFileId);
        } catch (e) {
          console.error('Error deleting old face image file:', e);
        }
      }

      try {
        const docs = await databases.listDocuments(
          TRYON_IMAGE_DATABASE_ID,
          TRYON_IMAGE_COLLECTION_ID,
          [Query.equal('userId', userId)]
        );
        if (docs && docs.documents && docs.documents.length) {
          for (const doc of docs.documents) {
            try {
              await databases.deleteDocument(
                TRYON_IMAGE_DATABASE_ID,
                TRYON_IMAGE_COLLECTION_ID,
                doc.$id
              );
            } catch (err) {
              console.error('Error deleting old face metadata document:', err);
            }
          }
        }
      } catch (e) {
        console.error('Error querying old face metadata documents:', e);
      }

      try {
        await databases.createDocument(
          TRYON_IMAGE_DATABASE_ID,
          TRYON_IMAGE_COLLECTION_ID,
          'unique()',
          {
            userId: userId,
            fileId: fileRes.$id,
            size: file.size,
            mimeType: file.type || '',
            createdAt: new Date().toISOString()
          }
        );
      } catch (e) {
        console.error('Error saving new try-on image metadata:', e);
      }

      try {
        localStorage.setItem('vogue_face_image_file_id', fileRes.$id);
      } catch (e) {
        console.error('Error storing new face image id:', e);
      }

      await showFacePreviewOnPage(fileRes.$id);
    } catch (e) {
      console.error('Error during reupload face flow:', e);
    }
  }

  async function showFacePreviewOnPage(fileId) {
    try {
      const storage = window.storage;
      const APPWRITE_CONFIG = window.APPWRITE_CONFIG;

      if (!storage || !APPWRITE_CONFIG) {
        console.error('Appwrite storage not available for preview.');
        return;
      }

      const url = storage.getFileView(APPWRITE_CONFIG.bucketId, fileId);
      const pageImg = document.getElementById('tryOnImage');
      const status = document.getElementById('tryOnStatus');
      const wrapper = document.getElementById('tryOnPreview');
      const modal = document.querySelector('.try-on-modal');
      const modalImg = document.getElementById('tryOnModalImage');

      // Update inline preview image but keep it hidden so main layout is not affected
      if (pageImg) {
        pageImg.src = url;
        pageImg.alt = 'Your uploaded try-on photo';
      }
      if (status) {
        status.textContent = '';
      }
      if (wrapper) {
        wrapper.style.display = 'none';
      }

      // Show image inside the Try-On modal
      if (modalImg) {
        modalImg.src = url;
        modalImg.alt = 'Your uploaded try-on photo';
        modalImg.style.display = 'block';
      }
      if (modal) {
        modal.style.display = 'flex';
      }
    } catch (e) {
      console.error('Error showing face preview on page:', e);
      const status = document.getElementById('tryOnStatus');
      if (status) {
        status.textContent = 'Error loading your photo. Please try again.';
      }
    }
  }

  /**
   * Show try-on modal with loading state
   */
  async function showTryOnModalWithLoading() {
    const modal = document.querySelector('.try-on-modal');
    const modalImg = document.getElementById('tryOnModalImage');
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');

    if (modal) {
      modal.style.display = 'flex';
    }

    if (modalImg) {
      modalImg.style.display = 'none';
    }

    // Add loading spinner to avatar placeholder
    if (avatarPlaceholder) {
      const existingSpinner = avatarPlaceholder.querySelector('.loading-spinner');
      if (existingSpinner) {
        existingSpinner.remove();
      }

      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      spinner.style.cssText = `
        border: 4px solid #f3f3f3;
        border-top: 4px solid #333;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      `;

      const statusText = document.createElement('p');
      statusText.id = 'tryOnLoadingStatus';
      statusText.textContent = 'Preparing your virtual try-on...';
      statusText.style.cssText = 'text-align: center; color: #666; margin-top: 10px;';

      avatarPlaceholder.appendChild(spinner);
      avatarPlaceholder.appendChild(statusText);

      // Add CSS animation if not already present
      if (!document.getElementById('spinner-animation')) {
        const style = document.createElement('style');
        style.id = 'spinner-animation';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  /**
   * Update try-on status message
   */
  function updateTryOnStatus(message) {
    const statusEl = document.getElementById('tryOnLoadingStatus');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  /**
   * Display try-on result image
   */
  function displayTryOnResult(imageDataUrl) {
    const modalImg = document.getElementById('tryOnModalImage');
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');

    // Remove loading spinner
    if (avatarPlaceholder) {
      const spinner = avatarPlaceholder.querySelector('.loading-spinner');
      const status = document.getElementById('tryOnLoadingStatus');
      if (spinner) spinner.remove();
      if (status) status.remove();
    }

    // Show result image
    if (modalImg) {
      modalImg.src = imageDataUrl;
      modalImg.alt = 'Virtual try-on result';
      modalImg.style.display = 'block';
      modalImg.style.maxWidth = '100%';
      modalImg.style.height = 'auto';
    }
  }

  /**
   * Show error message in try-on modal
   */
  function showTryOnError(errorMessage) {
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');

    // Remove loading spinner
    if (avatarPlaceholder) {
      const spinner = avatarPlaceholder.querySelector('.loading-spinner');
      const status = document.getElementById('tryOnLoadingStatus');
      if (spinner) spinner.remove();
      if (status) status.remove();

      // Add error message
      const errorEl = document.createElement('div');
      errorEl.className = 'tryon-error';
      errorEl.style.cssText = `
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        color: #c33;
        text-align: center;
      `;
      errorEl.innerHTML = `
        <p style="margin: 0 0 10px;"><strong>⚠️ Error</strong></p>
        <p style="margin: 0;">${errorMessage}</p>
      `;

      avatarPlaceholder.appendChild(errorEl);
    }
  }


  function initDetailPage() {
    const stored = getStoredProduct();
    if (!stored) {
      console.warn('No stored product detail found in localStorage');
      return;
    }
    const { category, product } = stored;

    // Update title
    const titleText = product.title || product.name || product.brand || 'Product';
    document.querySelectorAll('.product-title').forEach(el => { el.textContent = titleText; });

    // Update breadcrumb last segment if present
    const bcTitle = document.querySelector('.breadcrumb .product-title');
    if (bcTitle) bcTitle.textContent = titleText;

    // Update price
    const priceEl = document.querySelector('.product-price');
    if (priceEl) {
      const formatted = formatPrice(product.price);
      if (formatted) priceEl.textContent = formatted;
    }

    // Update main image
    const imgEl = document.querySelector('.main-image');
    const imgUrl = product.image || product.image_url;
    if (imgEl && imgUrl) {
      imgEl.src = imgUrl;
      imgEl.alt = titleText;
    }

    // Wire Buy Now button to external ecommerce link
    const buyBtn = document.querySelector('.btn-buy');
    if (buyBtn && (product.link || product.product_link)) {
      const targetLink = product.link || product.product_link;
      buyBtn.onclick = function (e) {
        e.preventDefault();
        window.open(targetLink, '_blank');
      };
    }

    // Wire Try On modal close behavior
    const tryOnModal = document.querySelector('.try-on-modal');
    if (tryOnModal) {
      const closeBtn = tryOnModal.querySelector('.close-modal');
      const overlay = tryOnModal.querySelector('.modal-overlay');
      const closeModal = function () {
        tryOnModal.style.display = 'none';
      };
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
      if (overlay) {
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) closeModal();
        });
      }
    }

    const reuploadBtn = document.getElementById('reuploadFaceBtn');
    if (reuploadBtn) {
      reuploadBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleReuploadFace();
      });
    }

    // Wire Try Now button to try-on flow, reusing the same product payload
    const tryBtn = document.querySelector('.btn-try');
    if (tryBtn) {
      tryBtn.onclick = function (e) {
        e.preventDefault();
        try {
          localStorage.setItem('vogue_selected_product', JSON.stringify(product));
        } catch (err) {
          console.error('Error storing product for try-on:', err);
        }
        handleTryNow();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailPage);
  } else {
    initDetailPage();
  }
})();
