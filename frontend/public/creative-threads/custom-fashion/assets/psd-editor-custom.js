/**
 * Custom PSD Editor - Main Application
 * 
 * Full-featured PSD editor using ag-psd + Fabric.js
 * Supports layer management, filters, effects, and export
 */

import * as agPsd from 'https://cdn.skypack.dev/ag-psd';

// Global variables
let canvas;
let psdEditor;
let currentFileId;
let currentOrderId;
let originalFileName;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await initializeEditor();
});

/**
 * Initialize the editor
 */
async function initializeEditor() {
    try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        currentFileId = urlParams.get('fileId');
        currentOrderId = urlParams.get('orderId');
        originalFileName = urlParams.get('fileName') || 'design.psd';

        // Update filename display
        document.getElementById('fileName').textContent = originalFileName;

        // Initialize Fabric.js canvas
        canvas = new fabric.Canvas('psdCanvas', {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff'
        });

        // Initialize PSD Editor library
        psdEditor = new window.PSDEditor('psdCanvas');

        // Set up event listeners
        setupEventListeners();
        setupKeyboardShortcuts();

        // Load PSD file if fileId provided
        if (currentFileId) {
            await loadPSDFromAppwrite(currentFileId);
        } else {
            // Create blank canvas
            hideLoading();
        }

        // Initial layer list update
        updateLayersList();

    } catch (error) {
        console.error('Error initializing editor:', error);
        alert('Error initializing editor: ' + error.message);
        hideLoading();
    }
}

/**
 * Load PSD file from Appwrite Storage
 */
async function loadPSDFromAppwrite(fileId) {
    try {
        showLoading('Loading PSD file...');

        // Get file from Appwrite (assuming customFashionAPI is available)
        const fileUrl = await customFashionAPI.storage.getFileView('deliverables', fileId);

        // Fetch file as blob
        const response = await fetch(fileUrl.href);
        const blob = await response.blob();

        // Load into editor
        await psdEditor.loadPSD(blob);

        // Update layers list
        updateLayersList();

        hideLoading();

    } catch (error) {
        console.error('Error loading PSD:', error);
        alert('Error loading PSD file: ' + error.message);
        hideLoading();
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Canvas selection change
    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', clearPropertiesPanel);
    canvas.on('object:modified', () => {
        updateLayersList();
        psdEditor.saveHistory();
    });

    // Tool buttons
    document.querySelectorAll('.psd-tool').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.psd-tool').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activateTool(btn.dataset.tool);
        });
    });

    // Sidebar tabs
    document.querySelectorAll('.psd-sidebar-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.psd-sidebar-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.psd-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Panel').classList.add('active');
        });
    });
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z - Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
        else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
            e.preventDefault();
            redo();
        }
        // Ctrl/Cmd + D - Duplicate
        else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            duplicateSelected();
        }
        // Delete - Delete selected
        else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            deleteSelected();
        }
        // V - Select tool
        else if (e.key === 'v') {
            activateTool('select');
        }
        // T - Text tool
        else if (e.key === 't') {
            activateTool('text');
        }
        // U - Shape tool
        else if (e.key === 'u') {
            activateTool('shape');
        }
        // C - Crop tool
        else if (e.key === 'c') {
            activateTool('crop');
        }
        // + - Zoom in
        else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoomIn();
        }
        // - - Zoom out
        else if (e.key === '-') {
            e.preventDefault();
            zoomOut();
        }
        // 0 - Reset zoom
        else if (e.key === '0') {
            e.preventDefault();
            resetZoom();
        }
    });
}

/**
 * Activate tool
 */
function activateTool(tool) {
    switch (tool) {
        case 'select':
            canvas.isDrawingMode = false;
            canvas.selection = true;
            break;
        case 'text':
            addTextLayer();
            break;
        case 'shape':
            showShapeMenu();
            break;
        case 'image':
            document.getElementById('imageInput').click();
            break;
        case 'crop':
            enableCropMode();
            break;
    }
}

/**
 * Add text layer
 */
function addTextLayer() {
    const text = prompt('Enter text:', 'Your Text Here');
    if (!text) return;

    psdEditor.addTextLayer(text, {
        left: canvas.width / 2 - 100,
        top: canvas.height / 2 - 20,
        fontSize: 40,
        fontFamily: 'Arial',
        fill: '#000000'
    });

    updateLayersList();
}

/**
 * Show shape menu
 */
function showShapeMenu() {
    const shape = prompt('Enter shape type (rectangle, circle, triangle):', 'rectangle');
    if (!shape) return;

    let shapeObj;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (shape.toLowerCase()) {
        case 'rectangle':
            shapeObj = new fabric.Rect({
                left: centerX - 50,
                top: centerY - 50,
                width: 100,
                height: 100,
                fill: '#91855a',
                name: 'Rectangle'
            });
            break;
        case 'circle':
            shapeObj = new fabric.Circle({
                left: centerX - 50,
                top: centerY - 50,
                radius: 50,
                fill: '#91855a',
                name: 'Circle'
            });
            break;
        case 'triangle':
            shapeObj = new fabric.Triangle({
                left: centerX - 50,
                top: centerY - 50,
                width: 100,
                height: 100,
                fill: '#91855a',
                name: 'Triangle'
            });
            break;
        default:
            alert('Unknown shape type');
            return;
    }

    canvas.add(shapeObj);
    canvas.setActiveObject(shapeObj);
    psdEditor.saveHistory();
    updateLayersList();
}

/**
 * Handle image upload
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        await psdEditor.addImageLayer(e.target.result, {
            left: 100,
            top: 100,
            name: file.name
        });
        updateLayersList();
    };
    reader.readAsDataURL(file);
}

/**
 * Enable crop mode
 */
function enableCropMode() {
    alert('Crop mode: Select an object and use the handles to crop. Press Enter to apply.');
    // TODO: Implement proper crop functionality
}

/**
 * Update layers list
 */
function updateLayersList() {
    const layersList = document.getElementById('layersList');
    const layers = psdEditor.getLayerList();

    layersList.innerHTML = '';

    layers.reverse().forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = 'psd-layer-item';
        if (canvas.getActiveObject() === layer.object) {
            layerItem.classList.add('active');
        }

        const icon = getLayerIcon(layer.type);

        layerItem.innerHTML = `
            <button class="psd-layer-visibility" onclick="toggleLayerVisibility(${layers.length - 1 - index})">
                <i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>
            </button>
            <div class="psd-layer-thumbnail">
                ${icon}
            </div>
            <div class="psd-layer-info">
                <div class="psd-layer-name">${layer.name}</div>
                <div class="psd-layer-type">${layer.type}</div>
            </div>
        `;

        layerItem.addEventListener('click', (e) => {
            if (!e.target.closest('.psd-layer-visibility')) {
                canvas.setActiveObject(layer.object);
                canvas.renderAll();
                updateLayersList();
                updatePropertiesPanel();
            }
        });

        layersList.appendChild(layerItem);
    });
}

/**
 * Get layer icon based on type
 */
function getLayerIcon(type) {
    const icons = {
        'i-text': '<i class="fas fa-font"></i>',
        'text': '<i class="fas fa-font"></i>',
        'image': '<i class="fas fa-image"></i>',
        'rect': '<i class="fas fa-square"></i>',
        'circle': '<i class="fas fa-circle"></i>',
        'triangle': '<i class="fas fa-play" style="transform: rotate(-90deg);"></i>',
        'group': '<i class="fas fa-layer-group"></i>'
    };
    return icons[type] || '<i class="fas fa-layer-group"></i>';
}

/**
 * Toggle layer visibility
 */
window.toggleLayerVisibility = function (index) {
    const layers = psdEditor.getLayerList();
    const layer = layers[index];
    psdEditor.toggleLayerVisibility(layer.object);
    updateLayersList();
};

/**
 * Update properties panel
 */
function updatePropertiesPanel() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    document.getElementById('opacitySlider').value = (activeObject.opacity || 1) * 100;
    document.getElementById('opacityValue').textContent = Math.round((activeObject.opacity || 1) * 100) + '%';
    document.getElementById('posXInput').value = Math.round(activeObject.left);
    document.getElementById('posYInput').value = Math.round(activeObject.top);
    document.getElementById('widthInput').value = Math.round(activeObject.width * activeObject.scaleX);
    document.getElementById('heightInput').value = Math.round(activeObject.height * activeObject.scaleY);
    document.getElementById('rotationSlider').value = activeObject.angle || 0;
    document.getElementById('rotationValue').textContent = Math.round(activeObject.angle || 0) + '°';
}

/**
 * Clear properties panel
 */
function clearPropertiesPanel() {
    document.getElementById('opacitySlider').value = 100;
    document.getElementById('opacityValue').textContent = '100%';
    document.getElementById('posXInput').value = '';
    document.getElementById('posYInput').value = '';
    document.getElementById('widthInput').value = '';
    document.getElementById('heightInput').value = '';
    document.getElementById('rotationSlider').value = 0;
    document.getElementById('rotationValue').textContent = '0°';
}

/**
 * Update opacity
 */
window.updateOpacity = function (value) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    psdEditor.setLayerOpacity(activeObject, value / 100);
    document.getElementById('opacityValue').textContent = value + '%';
};

/**
 * Update position
 */
window.updatePosition = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const x = parseFloat(document.getElementById('posXInput').value);
    const y = parseFloat(document.getElementById('posYInput').value);

    if (!isNaN(x)) activeObject.set('left', x);
    if (!isNaN(y)) activeObject.set('top', y);

    activeObject.setCoords();
    canvas.renderAll();
    psdEditor.saveHistory();
};

/**
 * Update size
 */
window.updateSize = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const width = parseFloat(document.getElementById('widthInput').value);
    const height = parseFloat(document.getElementById('heightInput').value);

    if (!isNaN(width)) {
        activeObject.scaleX = width / activeObject.width;
    }
    if (!isNaN(height)) {
        activeObject.scaleY = height / activeObject.height;
    }

    activeObject.setCoords();
    canvas.renderAll();
    psdEditor.saveHistory();
};

/**
 * Update rotation
 */
window.updateRotation = function (value) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.set('angle', parseFloat(value));
    activeObject.setCoords();
    canvas.renderAll();
    document.getElementById('rotationValue').textContent = value + '°';
    psdEditor.saveHistory();
};

/**
 * Apply filter
 */
window.applyFilter = function (filterType) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type === 'i-text' || activeObject.type === 'text') {
        alert('Please select an image layer to apply filters');
        return;
    }

    let options = {};

    // Prompt for filter values
    switch (filterType) {
        case 'brightness':
            const brightness = prompt('Enter brightness value (-1 to 1):', '0.1');
            if (brightness === null) return;
            options = { brightness: parseFloat(brightness) };
            break;
        case 'contrast':
            const contrast = prompt('Enter contrast value (-1 to 1):', '0.1');
            if (contrast === null) return;
            options = { contrast: parseFloat(contrast) };
            break;
        case 'saturation':
            const saturation = prompt('Enter saturation value (-1 to 1):', '0.1');
            if (saturation === null) return;
            options = { saturation: parseFloat(saturation) };
            break;
        case 'blur':
            const blur = prompt('Enter blur value (0 to 1):', '0.1');
            if (blur === null) return;
            options = { blur: parseFloat(blur) };
            break;
    }

    psdEditor.applyFilter(filterType, options);
};

/**
 * Clear all filters
 */
window.clearFilters = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (activeObject.filters) {
        activeObject.filters = [];
        activeObject.applyFilters();
        canvas.renderAll();
        psdEditor.saveHistory();
    }
};

/**
 * Undo
 */
window.undo = function () {
    psdEditor.undo();
    updateLayersList();
    updateUndoRedoButtons();
};

/**
 * Redo
 */
window.redo = function () {
    psdEditor.redo();
    updateLayersList();
    updateUndoRedoButtons();
};

/**
 * Update undo/redo buttons
 */
function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = psdEditor.historyIndex <= 0;
    document.getElementById('redoBtn').disabled = psdEditor.historyIndex >= psdEditor.history.length - 1;
}

/**
 * Delete selected
 */
window.deleteSelected = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    if (confirm('Delete selected layer?')) {
        psdEditor.removeLayer(activeObject);
        updateLayersList();
    }
};

/**
 * Duplicate selected
 */
window.duplicateSelected = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    psdEditor.duplicateLayer(activeObject);
    updateLayersList();
};

/**
 * Bring to front
 */
window.bringToFront = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.bringToFront(activeObject);
    canvas.renderAll();
    psdEditor.saveHistory();
    updateLayersList();
};

/**
 * Send to back
 */
window.sendToBack = function () {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.sendToBack(activeObject);
    canvas.renderAll();
    psdEditor.saveHistory();
    updateLayersList();
};

/**
 * Zoom in
 */
window.zoomIn = function () {
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 1.1);
};

/**
 * Zoom out
 */
window.zoomOut = function () {
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom / 1.1);
};

/**
 * Reset zoom
 */
window.resetZoom = function () {
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.renderAll();
};

/**
 * Export file
 */
window.exportFile = function (format) {
    let dataUrl;
    let fileName;

    if (format === 'png') {
        dataUrl = psdEditor.exportToPNG();
        fileName = originalFileName.replace(/\.psd$/i, '.png');
    } else if (format === 'jpeg') {
        dataUrl = psdEditor.exportToJPEG(0.9);
        fileName = originalFileName.replace(/\.psd$/i, '.jpg');
    }

    // Download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
};

/**
 * Save and upload PSD
 */
window.saveAndUpload = async function () {
    try {
        showLoading('Saving PSD file...');

        // Export to PSD
        const psdBuffer = await psdEditor.exportToPSD();
        const blob = new Blob([psdBuffer], { type: 'application/octet-stream' });
        const file = new File([blob], originalFileName, { type: 'application/octet-stream' });

        // Upload to Appwrite
        showLoading('Uploading to server...');
        const uploadedFile = await customFashionAPI.uploadDeliverable(
            currentOrderId,
            file,
            (progress) => {
                showLoading(`Uploading... ${progress}%`);
            }
        );

        alert('✅ PSD file saved and uploaded successfully!');

        // Redirect back to order page
        window.location.href = `order.html?id=${currentOrderId}`;

    } catch (error) {
        console.error('Error saving PSD:', error);
        alert('Error saving PSD: ' + error.message);
        hideLoading();
    }
};

/**
 * Close editor
 */
window.closeEditor = function () {
    if (confirm('Are you sure you want to close? Unsaved changes will be lost.')) {
        if (currentOrderId) {
            window.location.href = `order.html?id=${currentOrderId}`;
        } else {
            window.history.back();
        }
    }
};

/**
 * Show loading overlay
 */
function showLoading(text = 'Loading...') {
    document.getElementById('loadingOverlay').classList.remove('hidden');
    document.getElementById('loadingText').textContent = text;
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Make PSDEditor available globally
window.PSDEditor = window.PSDEditor || class { };
