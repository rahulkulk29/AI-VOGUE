/**
 * PSD Editor Library - Advanced PSD Manipulation
 * 
 * This library provides utilities for reading, editing, and writing PSD files
 * using ag-psd library combined with Fabric.js for canvas manipulation.
 * 
 * Features:
 * - Read PSD files and extract layers
 * - Edit individual layers
 * - Add new layers (text, images, shapes)
 * - Apply filters and effects
 * - Export back to PSD format
 * 
 * Dependencies:
 * - Fabric.js (loaded via CDN)
 * - ag-psd (loaded via CDN - use https://cdn.skypack.dev/ag-psd)
 */

class PSDEditor {
    constructor(canvasId) {
        this.canvas = new fabric.Canvas(canvasId);
        this.psdData = null;
        this.layers = [];
        this.history = [];
        this.historyIndex = -1;
    }

    /**
     * Load PSD file from File object or URL
     */
    async loadPSD(source) {
        try {
            let arrayBuffer;

            if (source instanceof File || source instanceof Blob) {
                arrayBuffer = await source.arrayBuffer();
            } else if (typeof source === 'string') {
                // URL
                const response = await fetch(source);
                arrayBuffer = await response.arrayBuffer();
            } else if (source instanceof ArrayBuffer) {
                arrayBuffer = source;
            } else {
                throw new Error('Invalid source type');
            }

            // Get agPsd from window (loaded via CDN)
            const agPsd = window.agPsd;
            if (!agPsd) {
                throw new Error('ag-psd library not loaded. Please include: <script src="https://cdn.skypack.dev/ag-psd"></script>');
            }

            // Parse PSD using ag-psd
            this.psdData = agPsd.readPsd(arrayBuffer, {
                skipLayerImageData: false,
                skipCompositeImageData: false,
                skipThumbnail: true
            });

            console.log('PSD loaded:', this.psdData);

            // Set canvas size
            this.canvas.setWidth(this.psdData.width);
            this.canvas.setHeight(this.psdData.height);

            // Load layers onto canvas
            await this.loadLayers();

            return this.psdData;

        } catch (error) {
            console.error('Error loading PSD:', error);
            throw error;
        }
    }

    /**
     * Load PSD layers onto Fabric.js canvas
     */
    async loadLayers() {
        this.canvas.clear();
        this.layers = [];

        if (!this.psdData || !this.psdData.children) {
            return;
        }

        // Process layers recursively
        for (const layer of this.psdData.children) {
            await this.processLayer(layer);
        }

        this.canvas.renderAll();
        this.saveHistory();
    }

    /**
     * Process individual layer
     */
    async processLayer(layer, parentGroup = null) {
        if (!layer.canvas) return;

        try {
            // Convert layer canvas to data URL
            const dataUrl = layer.canvas.toDataURL();

            // Create Fabric.js image
            const fabricImage = await new Promise((resolve, reject) => {
                fabric.Image.fromURL(dataUrl, (img) => {
                    if (img) resolve(img);
                    else reject(new Error('Failed to load layer image'));
                }, { crossOrigin: 'anonymous' });
            });

            // Set layer properties
            fabricImage.set({
                left: layer.left || 0,
                top: layer.top || 0,
                opacity: (layer.opacity || 255) / 255,
                visible: !layer.hidden,
                selectable: true,
                name: layer.name || 'Layer',
                layerId: layer.id || Date.now(),
                blendMode: this.convertBlendMode(layer.blendMode)
            });

            // Add to canvas or group
            if (parentGroup) {
                parentGroup.addWithUpdate(fabricImage);
            } else {
                this.canvas.add(fabricImage);
            }

            this.layers.push({
                fabricObject: fabricImage,
                psdLayer: layer
            });

            // Process child layers (groups)
            if (layer.children && layer.children.length > 0) {
                const group = new fabric.Group([], {
                    left: layer.left || 0,
                    top: layer.top || 0,
                    name: layer.name || 'Group'
                });

                for (const childLayer of layer.children) {
                    await this.processLayer(childLayer, group);
                }

                this.canvas.add(group);
            }

        } catch (error) {
            console.error('Error processing layer:', layer.name, error);
        }
    }

    /**
     * Convert PSD blend mode to CSS blend mode
     */
    convertBlendMode(psdBlendMode) {
        const blendModes = {
            'normal': 'source-over',
            'multiply': 'multiply',
            'screen': 'screen',
            'overlay': 'overlay',
            'darken': 'darken',
            'lighten': 'lighten',
            'color-dodge': 'color-dodge',
            'color-burn': 'color-burn',
            'hard-light': 'hard-light',
            'soft-light': 'soft-light',
            'difference': 'difference',
            'exclusion': 'exclusion'
        };

        return blendModes[psdBlendMode] || 'source-over';
    }

    /**
     * Add text layer
     */
    addTextLayer(text, options = {}) {
        const textObject = new fabric.IText(text, {
            left: options.left || 100,
            top: options.top || 100,
            fontSize: options.fontSize || 40,
            fontFamily: options.fontFamily || 'Arial',
            fill: options.fill || '#000000',
            fontWeight: options.fontWeight || 'normal',
            fontStyle: options.fontStyle || 'normal',
            textAlign: options.textAlign || 'left',
            name: options.name || 'Text Layer'
        });

        this.canvas.add(textObject);
        this.canvas.setActiveObject(textObject);
        this.saveHistory();

        return textObject;
    }

    /**
     * Add image layer
     */
    async addImageLayer(imageSource, options = {}) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(imageSource, (img) => {
                if (!img) {
                    reject(new Error('Failed to load image'));
                    return;
                }

                img.set({
                    left: options.left || 100,
                    top: options.top || 100,
                    scaleX: options.scaleX || 1,
                    scaleY: options.scaleY || 1,
                    name: options.name || 'Image Layer'
                });

                this.canvas.add(img);
                this.canvas.setActiveObject(img);
                this.saveHistory();

                resolve(img);
            }, { crossOrigin: 'anonymous' });
        });
    }

    /**
     * Apply filter to active layer
     */
    applyFilter(filterType, options = {}) {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || !activeObject.filters) return;

        let filter;

        switch (filterType) {
            case 'brightness':
                filter = new fabric.Image.filters.Brightness({
                    brightness: options.brightness || 0.1
                });
                break;
            case 'contrast':
                filter = new fabric.Image.filters.Contrast({
                    contrast: options.contrast || 0.1
                });
                break;
            case 'saturation':
                filter = new fabric.Image.filters.Saturation({
                    saturation: options.saturation || 0.1
                });
                break;
            case 'blur':
                filter = new fabric.Image.filters.Blur({
                    blur: options.blur || 0.1
                });
                break;
            case 'grayscale':
                filter = new fabric.Image.filters.Grayscale();
                break;
            case 'sepia':
                filter = new fabric.Image.filters.Sepia();
                break;
            case 'invert':
                filter = new fabric.Image.filters.Invert();
                break;
            default:
                console.warn('Unknown filter type:', filterType);
                return;
        }

        activeObject.filters.push(filter);
        activeObject.applyFilters();
        this.canvas.renderAll();
        this.saveHistory();
    }

    /**
     * Remove layer
     */
    removeLayer(layer) {
        this.canvas.remove(layer);
        this.layers = this.layers.filter(l => l.fabricObject !== layer);
        this.saveHistory();
    }

    /**
     * Save current state to history
     */
    saveHistory() {
        const state = JSON.stringify(this.canvas.toJSON(['name', 'layerId']));

        // Remove future states if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(state);
        this.historyIndex++;

        // Limit history to 50 states
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    /**
     * Undo
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
            });
        }
    }

    /**
     * Redo
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.canvas.loadFromJSON(state, () => {
                this.canvas.renderAll();
            });
        }
    }

    /**
     * Export to PSD
     */
    async exportToPSD() {
        try {
            // Get agPsd from window (loaded via CDN)
            const agPsd = window.agPsd;
            if (!agPsd) {
                throw new Error('ag-psd library not loaded');
            }

            // Create new PSD structure
            const psd = {
                width: this.canvas.width,
                height: this.canvas.height,
                children: []
            };

            // Convert Fabric.js objects back to PSD layers
            const objects = this.canvas.getObjects();

            for (const obj of objects) {
                const layer = await this.fabricObjectToPSDLayer(obj);
                if (layer) {
                    psd.children.push(layer);
                }
            }

            // Write PSD using ag-psd
            const arrayBuffer = agPsd.writePsd(psd, {
                generateThumbnail: true,
                trimImageData: false
            });

            return arrayBuffer;

        } catch (error) {
            console.error('Error exporting to PSD:', error);
            throw error;
        }
    }

    /**
     * Convert Fabric.js object to PSD layer
     */
    async fabricObjectToPSDLayer(obj) {
        // Create canvas for this layer
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = obj.width * obj.scaleX;
        layerCanvas.height = obj.height * obj.scaleY;
        const ctx = layerCanvas.getContext('2d');

        // Render object to canvas
        obj.render(ctx);

        return {
            name: obj.name || 'Layer',
            opacity: Math.round((obj.opacity || 1) * 255),
            hidden: !obj.visible,
            left: obj.left,
            top: obj.top,
            canvas: layerCanvas
        };
    }

    /**
     * Export to PNG
     */
    exportToPNG() {
        return this.canvas.toDataURL({
            format: 'png',
            quality: 1
        });
    }

    /**
     * Export to JPEG
     */
    exportToJPEG(quality = 0.9) {
        return this.canvas.toDataURL({
            format: 'jpeg',
            quality: quality
        });
    }

    /**
     * Get layer list
     */
    getLayerList() {
        return this.canvas.getObjects().map((obj, index) => ({
            id: obj.layerId || index,
            name: obj.name || `Layer ${index + 1}`,
            type: obj.type,
            visible: obj.visible !== false,
            opacity: obj.opacity || 1,
            locked: !obj.selectable,
            object: obj
        }));
    }

    /**
     * Toggle layer visibility
     */
    toggleLayerVisibility(layer) {
        layer.visible = !layer.visible;
        this.canvas.renderAll();
        this.saveHistory();
    }

    /**
     * Set layer opacity
     */
    setLayerOpacity(layer, opacity) {
        layer.opacity = opacity;
        this.canvas.renderAll();
        this.saveHistory();
    }

    /**
     * Duplicate layer
     */
    duplicateLayer(layer) {
        layer.clone((cloned) => {
            cloned.set({
                left: layer.left + 10,
                top: layer.top + 10,
                name: layer.name + ' Copy'
            });
            this.canvas.add(cloned);
            this.saveHistory();
        });
    }

    /**
     * Merge layers
     */
    async mergeLayers(layers) {
        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const ctx = tempCanvas.getContext('2d');

        // Render each layer
        for (const layer of layers) {
            layer.render(ctx);
        }

        // Create new image from merged result
        const dataUrl = tempCanvas.toDataURL();
        const mergedImage = await this.addImageLayer(dataUrl, {
            name: 'Merged Layer'
        });

        // Remove original layers
        layers.forEach(layer => this.canvas.remove(layer));

        this.saveHistory();
        return mergedImage;
    }
}

// Export for use in other scripts
window.PSDEditor = PSDEditor;
