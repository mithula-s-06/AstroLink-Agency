/**
 * Image Upload Utility for Admin Panel
 * Handles uploading and managing images for missions
 */

class ImageUploadManager {
    constructor() {
        this.uploadInProgress = false;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    }

    /**
     * Upload image for a specific entity type
     * @param {File} file - Image file to upload
     * @param {string} entityType - Type: 'missions'
     * @returns {Promise<Object>} - { success, imageUrl, filename, message }
     */
    async uploadImage(file, entityType) {
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Validate entity type
        const validTypes = ['missions'];
        if (!validTypes.includes(entityType)) {
            return { success: false, message: 'Invalid entity type' };
        }

        if (this.uploadInProgress) {
            return { success: false, message: 'Upload already in progress' };
        }

        try {
            this.uploadInProgress = true;
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`/api/uploads/${entityType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { 
                    success: false, 
                    message: errorData.message || 'Upload failed' 
                };
            }

            const data = await response.json();
            return {
                success: true,
                imageUrl: data.imageUrl,
                filename: data.filename,
                message: data.message
            };

        } catch (error) {
            console.error('Error uploading image:', error);
            return { 
                success: false, 
                message: `Upload error: ${error.message}` 
            };
        } finally {
            this.uploadInProgress = false;
        }
    }

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @returns {Object} - { valid, message }
     */
    validateFile(file) {
        if (!file) {
            return { valid: false, message: 'No file selected' };
        }

        if (file.size > this.maxFileSize) {
            return { 
                valid: false, 
                message: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)` 
            };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                message: 'Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)' 
            };
        }

        return { valid: true };
    }

    /**
     * Delete image
     * @param {string} entityType - Type: 'missions'
     * @param {string} filename - Filename to delete
     * @returns {Promise<Object>} - { success, message }
     */
    async deleteImage(entityType, filename) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/uploads/${entityType}/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { 
                    success: false, 
                    message: errorData.message || 'Delete failed' 
                };
            }

            const data = await response.json();
            return { success: true, message: data.message };

        } catch (error) {
            console.error('Error deleting image:', error);
            return { 
                success: false, 
                message: `Delete error: ${error.message}` 
            };
        }
    }

    /**
     * Create image upload input element
     * @param {Function} onImageSelected - Callback when image is selected
     * @returns {HTMLInputElement}
     */
    createImageInput(onImageSelected) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                onImageSelected(file);
            }
        });

        return input;
    }

    /**
     * Get image preview element
     * @param {string} imageUrl - URL of the image
     * @param {string} altText - Alt text for image
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {HTMLElement}
     */
    createImagePreview(imageUrl, altText = 'Preview', maxWidth = 200) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin: 10px 0;
            position: relative;
            display: inline-block;
            max-width: ${maxWidth}px;
        `;

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = altText;
        img.style.cssText = `
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            border: 1px solid #ddd;
        `;

        container.appendChild(img);
        return container;
    }

    /**
     * Create image viewer modal
     * @param {string} imageUrl - URL of the image
     * @param {string} title - Title of the image
     */
    createImageViewer(imageUrl, title = 'Image Viewer') {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            cursor: pointer;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 90%;
            max-height: 90vh;
            overflow: auto;
            position: relative;
            cursor: auto;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        `;

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: #1e3a8a;
            margin: 0;
            font-size: 1.3rem;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 30px;
            height: 30px;
        `;

        closeBtn.onclick = () => modal.remove();
        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.cssText = `
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        `;

        container.appendChild(header);
        container.appendChild(img);
        modal.appendChild(container);
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        document.body.appendChild(modal);
    }
}

// Create global instance
const imageUploadManager = new ImageUploadManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageUploadManager;
}
