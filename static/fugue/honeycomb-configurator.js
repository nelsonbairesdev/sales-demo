class HoneycombConfigurator {
    constructor() {
        this.hexSize = 30;
        this.hexSpacing = 10;
        this.backgroundColor = '#ffffff'; // Default white background
        this.backgroundColors = [
            { name: 'White', value: '#ffffff' },
            { name: 'Light Gray', value: '#f8fafc' },
            { name: 'Dark Gray', value: '#374151' },
            { name: 'Black', value: '#000000' },
            { name: 'Blue', value: '#1e3a8a' },
            { name: 'Green', value: '#064e3b' },
            { name: 'Purple', value: '#581c87' }
        ];
        // Color system with themed palettes
        this.colorPalettes = {
            payment: {
                name: 'Payment Flow',
                description: 'Professional colors for payment processing flows',
                colors: [
                    { hex: '#2563eb', name: 'Primary Blue', accessibility: 'high' },
                    { hex: '#10b981', name: 'Success Green', accessibility: 'high' },
                    { hex: '#f59e0b', name: 'Warning Amber', accessibility: 'medium' },
                    { hex: '#ef4444', name: 'Error Red', accessibility: 'high' },
                    { hex: '#6366f1', name: 'Action Purple', accessibility: 'high' }
                ]
            },
            banking: {
                name: 'Banking & Finance',
                description: 'Trustworthy colors for financial institutions',
                colors: [
                    { hex: '#1e40af', name: 'Trust Blue', accessibility: 'high' },
                    { hex: '#059669', name: 'Growth Green', accessibility: 'high' },
                    { hex: '#dc6803', name: 'Investment Gold', accessibility: 'high' },
                    { hex: '#7c2d12', name: 'Premium Brown', accessibility: 'high' },
                    { hex: '#4c1d95', name: 'Luxury Purple', accessibility: 'high' }
                ]
            },
            ecommerce: {
                name: 'E-commerce',
                description: 'Vibrant colors for online shopping experiences',
                colors: [
                    { hex: '#3b82f6', name: 'Shop Blue', accessibility: 'high' },
                    { hex: '#22c55e', name: 'Add to Cart', accessibility: 'high' },
                    { hex: '#f97316', name: 'Sale Orange', accessibility: 'high' },
                    { hex: '#e11d48', name: 'Hot Deal', accessibility: 'high' },
                    { hex: '#a855f7', name: 'Premium', accessibility: 'high' }
                ]
            },
            accessible: {
                name: 'High Contrast',
                description: 'WCAG AAA compliant colors for maximum accessibility',
                colors: [
                    { hex: '#1f2937', name: 'Dark Gray', accessibility: 'max' },
                    { hex: '#065f46', name: 'Dark Green', accessibility: 'max' },
                    { hex: '#92400e', name: 'Dark Orange', accessibility: 'max' },
                    { hex: '#991b1b', name: 'Dark Red', accessibility: 'max' },
                    { hex: '#581c87', name: 'Dark Purple', accessibility: 'max' }
                ]
            }
        };

        this.selectedPalette = 'payment';
        this.colors = this.colorPalettes[this.selectedPalette].colors.map(c => c.hex);
        this.defaultColor = this.colors[0]; // Default to first color in palette

        // Built-in Iconoir icons (expanded set)
        this.builtInIcons = [
            { id: 'iconoir-bank', name: 'Bank', category: 'finance' },
            { id: 'iconoir-credit-card', name: 'Credit Card', category: 'finance' },
            { id: 'iconoir-shopping-cart', name: 'Shopping Cart', category: 'commerce' },
            { id: 'iconoir-lock', name: 'Security', category: 'security' },
            { id: 'iconoir-dollar', name: 'Payment', category: 'finance' },
            { id: 'iconoir-user', name: 'Customer', category: 'people' },
            { id: 'iconoir-shield', name: 'Protection', category: 'security' },
            { id: 'iconoir-phone', name: 'Mobile', category: 'communication' },
            { id: 'iconoir-check', name: 'Verify', category: 'status' },
            { id: 'iconoir-network', name: 'Network', category: 'technology' },
            { id: 'iconoir-send', name: 'Transfer', category: 'communication' },
            { id: 'iconoir-wallet', name: 'Wallet', category: 'finance' }
        ];

        // Custom icons (loaded from server and user uploads)
        this.customIcons = [];

        // Combined icon list
        this.icons = [...this.builtInIcons];

        // Icon search and management
        this.iconSearchQuery = '';
        this.selectedIconCategory = 'all';
        this.hexGridData = [];
        this.nextId = 1;
        this.animationSpeed = 1000;
        this.isAnimating = false;
        this.animationStopped = false;

        // Cache for background hexes optimization
        this.backgroundHexCache = [];
        this.lastPrimaryCoords = '';

        // Professional drag & drop and selection system
        this.selectedNodes = new Set(); // Support multi-selection
        this.dragState = {
            isDragging: false,
            draggedNodes: [],
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 }
        };
        this.snapGrid = true;
        this.snapDistance = 5; // pixels for snap tolerance

        this.initializeEventListeners();
        this.updateBackgroundColor();
        this.renderBackgroundColorOptions();
        this.renderColorPalettes();
        this.loadCustomIcons();
        this.renderCustomIconsList();
        this.renderHexGrid();
    }

    async loadCustomIcons() {
        try {
            const response = await fetch('https://modopayments.github.io/sales-demo/img/icons/icons.json');
            const iconData = await response.json();

            for (const icon of iconData) {
                // Fetch each custom icon SVG
                try {
                    const svgResponse = await fetch(`https://modopayments.github.io/sales-demo${icon.path}`);
                    const svgContent = await svgResponse.text();

                    // Parse SVG and add to custom icons
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                    const svgElement = svgDoc.querySelector('svg');

                    if (svgElement) {
                        const customIcon = {
                            id: `custom-${icon.name}`,
                            name: icon.name.charAt(0).toUpperCase() + icon.name.slice(1),
                            category: 'custom',
                            type: 'custom',
                            svgContent: svgElement.innerHTML,
                            viewBox: svgElement.getAttribute('viewBox') || '0 0 24 24'
                        };

                        this.customIcons.push(customIcon);
                        this.addIconToSVGDefs(customIcon);
                    }
                } catch (error) {
                    console.warn(`Failed to load custom icon ${icon.name}:`, error);
                }
            }

            this.updateIconsList();
        } catch (error) {
            console.warn('Failed to load custom icons:', error);
        }
    }

    addIconToSVGDefs(icon) {
        const defs = document.querySelector('svg defs');
        const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
        symbol.setAttribute('id', icon.id);
        symbol.setAttribute('viewBox', icon.viewBox);
        symbol.innerHTML = icon.svgContent;
        defs.appendChild(symbol);
    }

    updateIconsList() {
        this.icons = [...this.builtInIcons, ...this.customIcons];
        this.renderCustomIconsList();
    }

    handleIconUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.includes('svg')) {
            alert('Please upload an SVG file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const svgContent = e.target.result;
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svgElement = svgDoc.querySelector('svg');

                if (!svgElement) {
                    alert('Invalid SVG file.');
                    return;
                }

                // Generate unique name from filename
                const fileName = file.name.replace('.svg', '');
                const iconName = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

                // Check if icon name already exists
                const existingIcon = this.customIcons.find(icon =>
                    icon.id === `custom-${iconName}` || icon.name.toLowerCase() === fileName.toLowerCase()
                );

                if (existingIcon) {
                    const overwrite = confirm(`An icon named "${fileName}" already exists. Do you want to replace it?`);
                    if (!overwrite) return;

                    // Remove existing icon
                    this.removeCustomIcon(existingIcon.id);
                }

                const customIcon = {
                    id: `custom-${iconName}`,
                    name: fileName.charAt(0).toUpperCase() + fileName.slice(1),
                    category: 'custom',
                    type: 'custom',
                    svgContent: svgElement.innerHTML,
                    viewBox: svgElement.getAttribute('viewBox') || '0 0 24 24',
                    uploaded: true
                };

                this.customIcons.push(customIcon);
                this.addIconToSVGDefs(customIcon);
                this.updateIconsList();

                // Clear file input
                event.target.value = '';

                // Show success message
                this.showMessage(`Icon "${customIcon.name}" uploaded successfully!`, 'success');

            } catch (error) {
                console.error('Error processing SVG:', error);
                alert('Error processing SVG file. Please ensure it\'s a valid SVG.');
            }
        };

        reader.readAsText(file);
    }

    removeCustomIcon(iconId) {
        // Remove from custom icons array
        this.customIcons = this.customIcons.filter(icon => icon.id !== iconId);

        // Remove from SVG defs
        const symbol = document.querySelector(`#${iconId}`);
        if (symbol) {
            symbol.remove();
        }

        // Update any nodes using this icon to use a default icon
        this.hexGridData.forEach(node => {
            if (node.icon === iconId) {
                node.icon = this.builtInIcons[0].id; // Use first built-in icon as fallback
            }
        });

        this.updateIconsList();
        this.renderNodeList(); // Re-render to update any affected nodes
    }

    renderCustomIconsList() {
        const container = document.getElementById('customIconsList');
        if (!container) return;

        container.innerHTML = '';

        if (this.customIcons.length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-500">No custom icons uploaded</p>';
            return;
        }

        this.customIcons.forEach(icon => {
            const iconItem = document.createElement('div');
            iconItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded-md';

            iconItem.innerHTML = `
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <use href="#${icon.id}"></use>
                </svg>
                <span class="text-sm">${icon.name}</span>
              </div>
              <button onclick="configurator.removeCustomIcon('${icon.id}')" 
                      class="text-red-500 hover:text-red-700 text-xs"
                      title="Remove icon">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            `;

            container.appendChild(iconItem);
        });
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white text-sm transition-all duration-300 transform translate-x-0 ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(full)';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }

    toggleIconSelector(nodeId) {
        const dropdown = document.getElementById(`iconSelector-${nodeId}`);
        const allDropdowns = document.querySelectorAll('.icon-selector-dropdown');

        // Close all other dropdowns
        allDropdowns.forEach(dd => {
            if (dd.id !== `iconSelector-${nodeId}`) {
                dd.classList.add('hidden');
            }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('hidden');

        if (!dropdown.classList.contains('hidden')) {
            this.populateIconOptions(nodeId);
        }
    }

    populateIconOptions(nodeId, searchQuery = '') {
        const container = document.getElementById(`iconOptions-${nodeId}`);
        container.innerHTML = '';

        const filteredIcons = this.icons.filter(icon => {
            const matchesSearch = !searchQuery ||
                icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                icon.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });

        // Group icons by category
        const categories = [...new Set(filteredIcons.map(icon => icon.category))].sort();

        categories.forEach(category => {
            const categoryIcons = filteredIcons.filter(icon => icon.category === category);

            if (categoryIcons.length > 0) {
                // Add category header
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'icon-category-header';
                categoryHeader.textContent = category;
                container.appendChild(categoryHeader);

                // Add icons in this category
                categoryIcons.forEach(icon => {
                    const option = document.createElement('div');
                    option.className = 'icon-option flex items-center space-x-2';

                    const currentNode = this.hexGridData.find(n => n.id === nodeId);
                    if (currentNode && currentNode.icon === icon.id) {
                        option.classList.add('selected');
                    }

                    option.innerHTML = `
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <use href="#${icon.id}"></use>
                  </svg>
                  <span class="text-sm">${icon.name}</span>
                  ${icon.type === 'custom' ? '<span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Custom</span>' : ''}
                `;

                    option.addEventListener('click', () => {
                        this.selectIcon(nodeId, icon.id);
                    });

                    container.appendChild(option);
                });
            }
        });
    }

    filterIcons(nodeId, searchQuery) {
        this.populateIconOptions(nodeId, searchQuery);
    }

    selectIcon(nodeId, iconId) {
        this.updateNode(nodeId, 'icon', iconId);

        // Close dropdown
        const dropdown = document.getElementById(`iconSelector-${nodeId}`);
        dropdown.classList.add('hidden');

        // Re-render node list to update button display
        this.renderNodeList();
    }

    // Close dropdowns when clicking outside
    handleDocumentClick(event) {
        const iconSelectors = document.querySelectorAll('.icon-selector-container');
        let clickedInside = false;

        iconSelectors.forEach(container => {
            if (container.contains(event.target)) {
                clickedInside = true;
            }
        });

        if (!clickedInside) {
            document.querySelectorAll('.icon-selector-dropdown').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }

        // Handle selection clearing for professional drag & drop system
        const clickedOnHexagon = event.target.closest('.hexagon[data-type="primary"]');
        const clickedOnSidebar = event.target.closest('.controls-sidebar');
        const clickedOnContextMenu = event.target.closest('.context-menu');
        const svg = document.getElementById('hexSvg');

        // Hide context menu if clicked outside
        if (!clickedOnContextMenu) {
            this.hideContextMenu();
        }

        // Clear selection if clicked on empty SVG area (not on hexagon or sidebar)
        if (!clickedOnHexagon && !clickedOnSidebar && svg && svg.contains(event.target)) {
            this.clearSelection();
        }
    }

    updateBackgroundColor() {
        const hexCanvas = document.getElementById('hexCanvas');
        hexCanvas.style.setProperty('--hex-grid-bg', this.backgroundColor);
    }

    // Get background hex colors that work with the current background
    getBackgroundHexColors() {
        // Handle each background color specifically for better contrast
        switch (this.backgroundColor) {
            case '#ffffff': // White
                return {
                    layer1: '#f8fafc',
                    layer2: '#f1f5f9',
                    stroke1: '#e2e8f0',
                    stroke2: '#e5e7eb'
                };

            case '#f8fafc': // Light Gray
                return {
                    layer1: '#f1f5f9',
                    layer2: '#e2e8f0',
                    stroke1: '#d1d5db',
                    stroke2: '#9ca3af'
                };

            case '#374151': // Dark Gray
                return {
                    layer1: '#4b5563',
                    layer2: '#6b7280',
                    stroke1: '#9ca3af',
                    stroke2: '#d1d5db'
                };

            case '#000000': // Black
                return {
                    layer1: '#1f2937',
                    layer2: '#374151',
                    stroke1: '#4b5563',
                    stroke2: '#6b7280'
                };

            case '#1e3a8a': // Blue
                return {
                    layer1: '#1e40af',
                    layer2: '#2563eb',
                    stroke1: '#3b82f6',
                    stroke2: '#60a5fa'
                };

            case '#064e3b': // Green
                return {
                    layer1: '#065f46',
                    layer2: '#047857',
                    stroke1: '#059669',
                    stroke2: '#10b981'
                };

            case '#581c87': // Purple
                return {
                    layer1: '#6b21a8',
                    layer2: '#7c3aed',
                    stroke1: '#8b5cf6',
                    stroke2: '#a78bfa'
                };

            default:
                // Fallback for any other colors
                return {
                    layer1: '#f8fafc',
                    layer2: '#f1f5f9',
                    stroke1: '#e2e8f0',
                    stroke2: '#e5e7eb'
                };
        }
    }

    renderBackgroundColorOptions() {
        const container = document.getElementById('backgroundColorOptions');
        container.innerHTML = '';

        this.backgroundColors.forEach(bgColor => {
            const colorOption = document.createElement('div');
            colorOption.className = `w-8 h-8 rounded border-2 cursor-pointer transition-all duration-200 ${this.backgroundColor === bgColor.value ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                }`;
            colorOption.style.backgroundColor = bgColor.value;
            colorOption.title = bgColor.name;
            colorOption.addEventListener('click', () => {
                this.backgroundColor = bgColor.value;
                this.updateBackgroundColor();
                this.renderBackgroundColorOptions();
                // Clear cache to force regeneration with new colors
                this.backgroundHexCache = [];
                this.lastPrimaryCoords = '';
                this.renderHexGrid(); // Re-render to update background hex colors
            });
            container.appendChild(colorOption);
        });
    }

    renderColorPalettes() {
        this.renderPaletteSelector();
        this.renderCurrentPalette();
    }

    renderPaletteSelector() {
        const selector = document.getElementById('paletteSelector');
        if (!selector) return;

        selector.innerHTML = '';

        Object.keys(this.colorPalettes).forEach(paletteKey => {
            const palette = this.colorPalettes[paletteKey];
            const option = document.createElement('option');
            option.value = paletteKey;
            option.textContent = palette.name;
            option.selected = paletteKey === this.selectedPalette;
            selector.appendChild(option);
        });

        selector.addEventListener('change', (e) => {
            this.selectPalette(e.target.value);
        });
    }

    renderCurrentPalette() {
        const container = document.getElementById('colorPaletteGrid');
        const description = document.getElementById('paletteDescription');

        if (!container || !description) return;

        container.innerHTML = '';
        const currentPalette = this.colorPalettes[this.selectedPalette];

        description.textContent = currentPalette.description;

        currentPalette.colors.forEach((colorData, index) => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch-enhanced';
            colorSwatch.style.backgroundColor = colorData.hex;

            // Mark as selected if it's the default color
            if (colorData.hex === this.defaultColor) {
                colorSwatch.classList.add('selected');
            }

            // Accessibility badge
            const accessibilityBadge = document.createElement('div');
            accessibilityBadge.className = `accessibility-badge accessibility-${colorData.accessibility}`;
            accessibilityBadge.textContent = colorData.accessibility === 'max' ? 'A' : colorData.accessibility === 'high' ? '✓' : '!';

            // Color name tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'color-name-tooltip';
            tooltip.textContent = `${colorData.name}${colorData.hex === this.defaultColor ? ' (Default)' : ''}`;

            colorSwatch.appendChild(accessibilityBadge);
            colorSwatch.appendChild(tooltip);

            colorSwatch.addEventListener('click', () => {
                this.selectColor(colorData.hex);
            });

            container.appendChild(colorSwatch);
        });
    }

    selectPalette(paletteKey) {
        this.selectedPalette = paletteKey;
        this.colors = this.colorPalettes[paletteKey].colors.map(c => c.hex);

        // Set default color to first color in new palette
        this.defaultColor = this.colors[0];

        this.renderCurrentPalette();
        this.renderNodeList(); // Update node configurations
    }

    getCurrentPalette() {
        return this.colorPalettes[this.selectedPalette];
    }

    selectColor(colorHex) {
        // Set as default color for new nodes
        this.defaultColor = colorHex;

        // Re-render to show visual feedback
        this.renderCurrentPalette();

        // Show feedback message
        const colorData = this.getCurrentPalette().colors.find(c => c.hex === colorHex);
        const colorName = colorData ? colorData.name : colorHex;
        this.showMessage(`Default color set to ${colorName}`, 'success');
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return null;
    }

    // Color accessibility helper
    getContrastRatio(color1, color2) {
        // Simplified contrast calculation
        const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;
            return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    initializeEventListeners() {
        document.getElementById('addNodeBtn').addEventListener('click', () => this.addNode());
        document.getElementById('playFlowBtn').addEventListener('click', () => this.playFlow());
        document.getElementById('stopFlowBtn').addEventListener('click', () => this.stopFlow());
        document.getElementById('exportPngBtn').addEventListener('click', () => this.exportPNG());
        document.getElementById('exportCodeBtn').addEventListener('click', () => this.exportCode());
        document.getElementById('importCodeBtn').addEventListener('click', () => document.getElementById('codeUpload').click());
        document.getElementById('codeUpload').addEventListener('change', (e) => this.handleCodeImport(e));
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());

        // Add document click handler for closing dropdowns
        document.addEventListener('click', (e) => this.handleDocumentClick(e));

        // Professional drag & drop event listeners
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Prevent default drag behavior on images and other elements
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }

    // Axial coordinate system helpers for flat-top (horizontal) hexagons
    axialToPixel(q, r) {
        // Flat-top hexagon coordinate conversion
        const x = this.hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = this.hexSize * (3 / 2 * r);
        return { x: x + 400, y: y + 300 };
    }

    pixelToAxial(x, y) {
        // Flat-top hexagon pixel to axial conversion
        const q = (Math.sqrt(3) / 3 * (x - 400) - 1 / 3 * (y - 300)) / this.hexSize;
        const r = (2 / 3 * (y - 300)) / this.hexSize;
        return { q: Math.round(q), r: Math.round(r) };
    }

    generateHexagonPath(centerX, centerY, size) {
        const points = [];
        // Start from the right-most point and go clockwise for flat-top orientation
        for (let i = 0; i < 6; i++) {
            // Add π/6 (30°) offset for flat-top hexagons (horizontal orientation)
            const angle = (Math.PI / 3) * i + (Math.PI / 6);
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return `M ${points.join(' L ')} Z`;
    }

    addNode() {
        let q, r;

        if (this.hexGridData.length === 0) {
            // First node at origin
            q = 0;
            r = 0;
        } else {
            // Get position of last node
            const lastNode = this.hexGridData[this.hexGridData.length - 1];

            // Adjacent positions in hexagonal grid (6 neighbors)
            const adjacentPositions = [
                { q: lastNode.q + 1, r: lastNode.r },     // Right
                { q: lastNode.q - 1, r: lastNode.r },     // Left
                { q: lastNode.q, r: lastNode.r + 1 },     // Down-right
                { q: lastNode.q, r: lastNode.r - 1 },     // Up-left
                { q: lastNode.q + 1, r: lastNode.r - 1 }, // Up-right
                { q: lastNode.q - 1, r: lastNode.r + 1 }  // Down-left
            ];

            // Find first available adjacent position
            const occupiedPositions = new Set(this.hexGridData.map(node => `${node.q},${node.r}`));

            let foundPosition = null;
            for (const pos of adjacentPositions) {
                if (!occupiedPositions.has(`${pos.q},${pos.r}`)) {
                    foundPosition = pos;
                    break;
                }
            }

            // If no adjacent position is free, place at random nearby position
            if (foundPosition) {
                q = foundPosition.q;
                r = foundPosition.r;
            } else {
                q = lastNode.q + Math.floor(Math.random() * 3) - 1;
                r = lastNode.r + Math.floor(Math.random() * 3) - 1;
            }
        }

        this.createNodeAt(q, r);
    }

    createNodeAt(q, r) {
        const color = this.defaultColor || this.colors[Math.floor(Math.random() * this.colors.length)];
        const icon = this.icons[Math.floor(Math.random() * this.icons.length)];

        const node = {
            id: `node-${this.nextId++}`,
            q: q,
            r: r,
            type: 'primary',
            color: color,
            icon: icon.id,
            name: `Node ${this.nextId - 1}`
        };

        this.hexGridData.push(node);
        this.renderHexGrid();
        this.renderNodeList();
    }

    convertBackgroundToNode(q, r) {
        // Check if position is already occupied
        const occupiedPositions = this.hexGridData.map(node => `${node.q},${node.r}`);
        if (occupiedPositions.includes(`${q},${r}`)) {
            return;
        }

        this.createNodeAt(q, r);
    }

    removeNode(nodeId) {
        this.hexGridData = this.hexGridData.filter(node => node.id !== nodeId);
        this.renderHexGrid();
        this.renderNodeList();
    }

    updateNode(nodeId, property, value) {
        const node = this.hexGridData.find(n => n.id === nodeId);
        if (node) {
            node[property] = value;
            this.renderHexGrid();
            if (property === 'name') {
                this.renderNodeList();
            }
        }
    }

    editNodeName(nodeId) {
        const nameElement = document.getElementById(`nodeName-${nodeId}`);
        const currentName = nameElement.textContent;

        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'font-medium text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
        input.style.width = '100%';

        // Replace the h3 with input
        nameElement.style.display = 'none';
        nameElement.parentElement.insertBefore(input, nameElement);

        // Focus and select all text
        input.focus();
        input.select();

        // Handle Enter key and blur events
        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                this.updateNode(nodeId, 'name', newName);
            }
            input.remove();
            nameElement.style.display = 'block';
        };

        const cancelEdit = () => {
            input.remove();
            nameElement.style.display = 'block';
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });

        input.addEventListener('blur', saveEdit);
    }

    moveNode(nodeId, direction) {
        const node = this.hexGridData.find(n => n.id === nodeId);
        if (!node) return;

        const directions = {
            'up': { q: 0, r: -1 },
            'down': { q: 0, r: 1 },
            'left': { q: -1, r: 0 },
            'right': { q: 1, r: 0 },
            'up-left': { q: -1, r: -1 },
            'up-right': { q: 1, r: -1 }
        };

        if (directions[direction]) {
            node.q += directions[direction].q;
            node.r += directions[direction].r;
            this.renderHexGrid();
        }
    }

    moveNodeUp(nodeId) {
        const currentIndex = this.hexGridData.findIndex(node => node.id === nodeId);
        if (currentIndex > 0) {
            const currentNode = this.hexGridData[currentIndex];
            const previousNode = this.hexGridData[currentIndex - 1];

            // Swap grid positions (q, r coordinates)
            const tempQ = currentNode.q;
            const tempR = currentNode.r;
            currentNode.q = previousNode.q;
            currentNode.r = previousNode.r;
            previousNode.q = tempQ;
            previousNode.r = tempR;

            // Swap array positions
            [this.hexGridData[currentIndex - 1], this.hexGridData[currentIndex]] =
                [this.hexGridData[currentIndex], this.hexGridData[currentIndex - 1]];

            this.renderHexGrid();
            this.renderNodeList();
        }
    }

    moveNodeDown(nodeId) {
        const currentIndex = this.hexGridData.findIndex(node => node.id === nodeId);
        if (currentIndex < this.hexGridData.length - 1) {
            const currentNode = this.hexGridData[currentIndex];
            const nextNode = this.hexGridData[currentIndex + 1];

            // Swap grid positions (q, r coordinates)
            const tempQ = currentNode.q;
            const tempR = currentNode.r;
            currentNode.q = nextNode.q;
            currentNode.r = nextNode.r;
            nextNode.q = tempQ;
            nextNode.r = tempR;

            // Swap array positions
            [this.hexGridData[currentIndex], this.hexGridData[currentIndex + 1]] =
                [this.hexGridData[currentIndex + 1], this.hexGridData[currentIndex]];

            this.renderHexGrid();
            this.renderNodeList();
        }
    }

    // Drag and drop handlers
    handleDragStart(e) {
        this.draggedElement = e.target;
        this.draggedIndex = parseInt(e.target.getAttribute('data-node-index'));
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Add visual feedback
        const targetElement = e.currentTarget;
        if (targetElement !== this.draggedElement && !targetElement.classList.contains('drag-over')) {
            // Remove drag-over class from all elements
            document.querySelectorAll('.node-item').forEach(el => el.classList.remove('drag-over'));
            targetElement.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const targetElement = e.currentTarget;
        const targetIndex = parseInt(targetElement.getAttribute('data-node-index'));

        if (targetIndex !== this.draggedIndex && targetIndex !== null && this.draggedIndex !== null) {
            const draggedNode = this.hexGridData[this.draggedIndex];
            const targetNode = this.hexGridData[targetIndex];

            // If we're inserting between nodes, we need to handle position swapping differently
            if (Math.abs(targetIndex - this.draggedIndex) === 1) {
                // Adjacent swap - swap grid positions
                const tempQ = draggedNode.q;
                const tempR = draggedNode.r;
                draggedNode.q = targetNode.q;
                draggedNode.r = targetNode.r;
                targetNode.q = tempQ;
                targetNode.r = tempR;
            } else {
                // Non-adjacent move - shift positions
                const draggedQ = draggedNode.q;
                const draggedR = draggedNode.r;

                if (this.draggedIndex < targetIndex) {
                    // Moving down: shift all nodes between draggedIndex and targetIndex up
                    for (let i = this.draggedIndex; i < targetIndex; i++) {
                        this.hexGridData[i].q = this.hexGridData[i + 1].q;
                        this.hexGridData[i].r = this.hexGridData[i + 1].r;
                    }
                } else {
                    // Moving up: shift all nodes between targetIndex and draggedIndex down
                    for (let i = this.draggedIndex; i > targetIndex; i--) {
                        this.hexGridData[i].q = this.hexGridData[i - 1].q;
                        this.hexGridData[i].r = this.hexGridData[i - 1].r;
                    }
                }

                // Place dragged node at target position
                targetNode.q = draggedQ;
                targetNode.r = draggedR;
            }

            // Reorder the array
            this.hexGridData.splice(this.draggedIndex, 1);
            this.hexGridData.splice(targetIndex, 0, draggedNode);

            this.renderHexGrid();
            this.renderNodeList();
        }

        // Clean up all classes
        this.cleanupDragState();
    }

    handleDragEnd(e) {
        this.cleanupDragState();
    }

    cleanupDragState() {
        // Reset all visual feedback
        const nodeElements = document.querySelectorAll('.node-item');
        nodeElements.forEach(element => {
            element.classList.remove('dragging', 'drag-over');
        });
        this.draggedElement = null;
        this.draggedIndex = null;
    }

    renderHexGrid() {
        const svg = document.getElementById('hexSvg');
        svg.innerHTML = '';

        // Generate background hexagons
        const backgroundHexes = this.generateBackgroundHexagons();

        // Render all hexagons
        [...backgroundHexes, ...this.hexGridData].forEach(hex => {
            const { x, y } = this.axialToPixel(hex.q, hex.r);
            const hexGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            hexGroup.setAttribute('class', 'hexagon');
            hexGroup.setAttribute('data-id', hex.id);
            hexGroup.setAttribute('data-type', hex.type);
            hexGroup.setAttribute('data-q', hex.q);
            hexGroup.setAttribute('data-r', hex.r);

            // Add click handler for background hexes
            if (hex.type === 'background') {
                hexGroup.style.cursor = 'pointer';
                hexGroup.addEventListener('click', () => this.convertBackgroundToNode(hex.q, hex.r));
            }

            // Hexagon shape
            const hexPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            hexPath.setAttribute('d', this.generateHexagonPath(x, y, this.hexSize));

            if (hex.type === 'background') {
                // Calculate opacity based on layer and distance
                let opacity;
                if (hex.layer === 1) {
                    opacity = 0.6; // First layer around active nodes
                } else if (hex.layer === 2) {
                    opacity = 0.3; // Second layer, more transparent
                } else {
                    // Default grid when no primary nodes exist
                    opacity = Math.max(0.1, 0.5 - (hex.distance * 0.1));
                }

                // Get background hex colors that adapt to the current background
                const bgColors = this.getBackgroundHexColors();
                const baseColor = hex.layer === 1 ? bgColors.layer1 : bgColors.layer2;
                const strokeColor = hex.layer === 1 ? bgColors.stroke1 : bgColors.stroke2;

                hexPath.setAttribute('fill', baseColor);
                hexPath.setAttribute('stroke', strokeColor);
                hexPath.setAttribute('stroke-width', '1');
                hexPath.setAttribute('opacity', opacity.toString());
            } else {
                // Primary node styling
                hexPath.setAttribute('fill', hex.color);
                hexPath.setAttribute('stroke', '#ffffff');
                hexPath.setAttribute('stroke-width', '2');
                hexPath.setAttribute('opacity', '1');
            }

            hexGroup.appendChild(hexPath);

            // Icon (only for primary nodes)
            if (hex.type === 'primary' && hex.icon) {
                const iconUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                iconUse.setAttribute('href', `#${hex.icon}`);
                iconUse.setAttribute('x', x - 12);
                iconUse.setAttribute('y', y - 12);
                iconUse.setAttribute('width', '24');
                iconUse.setAttribute('height', '24');
                iconUse.setAttribute('fill', '#ffffff');
                hexGroup.appendChild(iconUse);
            }

            // Add professional drag & drop and selection for primary hexagons
            if (hex.type === 'primary') {
                hexGroup.style.cursor = 'grab';
                hexGroup.addEventListener('mousedown', (e) => this.handleNodeMouseDown(e, hex));
                hexGroup.addEventListener('contextmenu', (e) => this.showContextMenu(e, hex));

                // Add hover effects
                hexGroup.addEventListener('mouseenter', () => {
                    if (!this.dragState.isDragging) {
                        hexGroup.style.filter = 'brightness(1.1)';
                    }
                });

                hexGroup.addEventListener('mouseleave', () => {
                    if (!this.dragState.isDragging) {
                        hexGroup.style.filter = '';
                    }
                });
            }

            svg.appendChild(hexGroup);
        });
    }

    // Helper functions for hexagonal calculations
    getHexDistance(q1, r1, q2, r2) {
        return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
    }

    getHexNeighbors(q, r, radius = 1) {
        const neighbors = [];
        for (let dq = -radius; dq <= radius; dq++) {
            for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
                if (dq === 0 && dr === 0) continue;
                neighbors.push({ q: q + dq, r: r + dr });
            }
        }
        return neighbors;
    }

    getMinDistanceToActiveNodes(q, r) {
        if (this.hexGridData.length === 0) return Infinity;

        let minDistance = Infinity;
        for (const node of this.hexGridData) {
            const distance = this.getHexDistance(q, r, node.q, node.r);
            minDistance = Math.min(minDistance, distance);
        }
        return minDistance;
    }

    generateBackgroundHexagons() {
        // Create a string representation of current primary coordinates for caching
        const currentPrimaryCoords = this.hexGridData
            .map(node => `${node.q},${node.r}`)
            .sort()
            .join('|');

        // Return cached result if primary nodes haven't changed
        if (currentPrimaryCoords === this.lastPrimaryCoords && this.backgroundHexCache.length > 0) {
            return this.backgroundHexCache;
        }

        const backgroundMap = new Map(); // Use Map to track and update background hexes
        const primaryCoords = new Set(this.hexGridData.map(node => `${node.q},${node.r}`));

        // Generate 2-layer background around each primary node
        this.hexGridData.forEach(primaryNode => {
            // Layer 1: Immediate neighbors (radius 1)
            const layer1Neighbors = this.getHexNeighbors(primaryNode.q, primaryNode.r, 1);
            layer1Neighbors.forEach(neighbor => {
                const coord = `${neighbor.q},${neighbor.r}`;
                if (!primaryCoords.has(coord)) {
                    const existingHex = backgroundMap.get(coord);
                    if (!existingHex || existingHex.layer > 1) {
                        // Add as layer 1 or upgrade existing hex to layer 1
                        backgroundMap.set(coord, {
                            id: `bg-${neighbor.q}-${neighbor.r}`,
                            q: neighbor.q,
                            r: neighbor.r,
                            type: 'background',
                            layer: 1,
                            distance: this.getMinDistanceToActiveNodes(neighbor.q, neighbor.r)
                        });
                    }
                }
            });

            // Layer 2: Second ring neighbors (radius 2)
            const layer2Neighbors = this.getHexNeighbors(primaryNode.q, primaryNode.r, 2);
            layer2Neighbors.forEach(neighbor => {
                const coord = `${neighbor.q},${neighbor.r}`;
                const distance = this.getHexDistance(neighbor.q, neighbor.r, primaryNode.q, primaryNode.r);
                if (distance === 2 && !primaryCoords.has(coord)) {
                    const existingHex = backgroundMap.get(coord);
                    if (!existingHex) {
                        // Only add as layer 2 if not already exists
                        backgroundMap.set(coord, {
                            id: `bg-${neighbor.q}-${neighbor.r}`,
                            q: neighbor.q,
                            r: neighbor.r,
                            type: 'background',
                            layer: 2,
                            distance: this.getMinDistanceToActiveNodes(neighbor.q, neighbor.r)
                        });
                    }
                }
            });
        });

        const background = Array.from(backgroundMap.values());

        // If no primary nodes exist, generate a small default grid
        if (this.hexGridData.length === 0) {
            for (let q = -2; q <= 2; q++) {
                for (let r = -2; r <= 2; r++) {
                    if (Math.abs(q) + Math.abs(r) + Math.abs(-q - r) <= 4) {
                        background.push({
                            id: `bg-${q}-${r}`,
                            q: q,
                            r: r,
                            type: 'background',
                            layer: Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)),
                            distance: 0
                        });
                    }
                }
            }
        }

        // Update cache
        this.backgroundHexCache = background;
        this.lastPrimaryCoords = currentPrimaryCoords;

        return background;
    }

    renderNodeList() {
        const nodeList = document.getElementById('nodeList');
        nodeList.innerHTML = '';

        this.hexGridData.forEach((node, index) => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'node-item bg-gray-50 p-4 rounded-lg border border-gray-200';
            nodeDiv.setAttribute('draggable', 'true');
            nodeDiv.setAttribute('data-node-id', node.id);
            nodeDiv.setAttribute('data-node-index', index);

            // Add drag event listeners
            nodeDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
            nodeDiv.addEventListener('dragover', (e) => this.handleDragOver(e));
            nodeDiv.addEventListener('drop', (e) => this.handleDrop(e));
            nodeDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));

            nodeDiv.innerHTML = `
                          <div class="flex justify-between items-center mb-3">
                              <div class="flex items-center space-x-2">
                                  <div class="flex flex-col">
                                      <button onclick="configurator.moveNodeUp('${node.id}')" 
                                              class="text-gray-400 hover:text-gray-600 transition-colors ${index === 0 ? 'opacity-25 cursor-not-allowed' : ''}"
                                              ${index === 0 ? 'disabled' : ''}
                                              title="Move up">
                                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                          </svg>
                                      </button>
                                      <button onclick="configurator.moveNodeDown('${node.id}')" 
                                              class="text-gray-400 hover:text-gray-600 transition-colors ${index === this.hexGridData.length - 1 ? 'opacity-25 cursor-not-allowed' : ''}"
                                              ${index === this.hexGridData.length - 1 ? 'disabled' : ''}
                                              title="Move down">
                                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                          </svg>
                                      </button>
                                  </div>
                                  <div class="flex items-center space-x-2">
                                      <span class="order-indicator">${index + 1}</span>
                                      <h3 class="font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                                         id="nodeName-${node.id}"
                                         ondblclick="configurator.editNodeName('${node.id}')"
                                         title="Double-click to edit">${node.name}</h3>
                                  </div>
                              </div>
                              <div class="flex items-center space-x-2">
                                  <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" title="Drag to reorder">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                      </svg>
                                  </div>
                                  <button onclick="configurator.removeNode('${node.id}')" class="text-red-500 hover:text-red-700">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                  </button>
                              </div>
                          </div>
  
                          <div class="space-y-3">
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                  <div class="flex space-x-1">
                                      ${this.colors.map(color => {
                const colorData = this.getCurrentPalette().colors.find(c => c.hex === color);
                return `
                                          <div class="color-swatch-enhanced ${node.color === color ? 'active' : ''}"
                                               style="background-color: ${color}"
                                               onclick="configurator.updateNode('${node.id}', 'color', '${color}')"
                                               title="${colorData ? colorData.name : color}">
                                               ${colorData ? `<div class="accessibility-badge accessibility-${colorData.accessibility}">${colorData.accessibility === 'max' ? 'A' : colorData.accessibility === 'high' ? '✓' : '!'}</div>` : ''}
                                          </div>
                                      `}).join('')}
                                  </div>
                              </div>
  
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                  <div class="relative">
                                      <div class="icon-selector-container">
                                          <button type="button" 
                                                  class="w-full p-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                  onclick="configurator.toggleIconSelector('${node.id}')">
                                              <div class="flex items-center space-x-2">
                                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <use href="#${node.icon}"></use>
                                                  </svg>
                                                  <span>${this.icons.find(icon => icon.id === node.icon)?.name || 'Select Icon'}</span>
                                              </div>
                                              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                              </svg>
                                          </button>
                                          <div id="iconSelector-${node.id}" class="icon-selector-dropdown hidden absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                                              <div class="p-2 border-b border-gray-200">
                                                  <input type="text" 
                                                         placeholder="Search icons..." 
                                                         class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                         onkeyup="configurator.filterIcons('${node.id}', this.value)">
                                              </div>
                                              <div id="iconOptions-${node.id}" class="max-h-48 overflow-y-auto">
                                                  <!-- Icon options will be populated here -->
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
  
                              <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                  <div class="grid grid-cols-3 gap-1">
                                      <button onclick="configurator.moveNode('${node.id}', 'up-left')" class="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">↖</button>
                                      <button onclick="configurator.moveNode('${node.id}', 'up')" class="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">↑</button>
                                      <button onclick="configurator.moveNode('${node.id}', 'up-right')" class="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">↗</button>
                                      <button onclick="configurator.moveNode('${node.id}', 'left')" class="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">←</button>
                                      <div class="p-1 text-xs text-center text-gray-500">●</div>
                                      <button onclick="configurator.moveNode('${node.id}', 'right')" class="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">→</button>
                                      <div></div>
                                      <button onclick="configurator.moveNode('${node.id}', 'down')" class="p-1 text-xs bg-gray-200 hover:bg-gray-300 rounded">↓</button>
                                      <div></div>
                                  </div>
                              </div>
  
                              <div class="text-xs text-gray-500">
                                  Coordinates: (${node.q}, ${node.r})
                              </div>
                          </div>
                      `;
            nodeList.appendChild(nodeDiv);
        });
    }

    async playFlow() {
        if (this.isAnimating || this.hexGridData.length === 0) return;

        this.isAnimating = true;
        this.animationStopped = false;

        // Show stop button, hide play button
        document.getElementById('playFlowBtn').classList.add('hidden');
        document.getElementById('stopFlowBtn').classList.remove('hidden');

        const hexSvg = document.getElementById('hexSvg');
        const canvas = document.getElementById('hexCanvas');

        // Define fixed highlight position in SVG coordinates (center of viewBox)
        const svgHighlightX = 400; // Center X of SVG viewBox (800/2)
        const svgHighlightY = 300; // Center Y of SVG viewBox (600/2)

        // Get the actual canvas dimensions
        const canvasRect = canvas.getBoundingClientRect();
        const svgRect = hexSvg.getBoundingClientRect();

        // Calculate the actual position based on SVG scaling
        const scaleX = svgRect.width / 800; // SVG viewBox width is 800
        const scaleY = svgRect.height / 600; // SVG viewBox height is 600

        const actualHighlightX = svgHighlightX * scaleX;
        const actualHighlightY = svgHighlightY * scaleY;

        // Reset all hexagons to hidden state
        const hexagons = document.querySelectorAll('.hexagon[data-type="primary"]');
        hexagons.forEach(hex => {
            hex.classList.remove('hex-approaching', 'hex-active', 'hex-visited', 'hex-flow-visible');
            hex.classList.add('hex-hidden');
        });

        // Hide all background hexagons initially
        const backgroundHexagons = document.querySelectorAll('.hexagon[data-type="background"]');
        backgroundHexagons.forEach(hex => {
            hex.classList.remove('bg-hex-flow-visible');
            hex.classList.add('bg-hex-hidden');
        });

        // Animate through each node
        for (let i = 0; i < this.hexGridData.length && !this.animationStopped; i++) {
            const node = this.hexGridData[i];
            const { x, y } = this.axialToPixel(node.q, node.r);
            const hexElement = document.querySelector(`[data-id="${node.id}"]`);

            // Calculate the offset needed to move this node to the highlight position
            const offsetX = svgHighlightX - x;
            const offsetY = svgHighlightY - y;

            // Move the entire hexSvg to position the current node at the highlight with zoom
            const zoomScale = 1.5; // Zoom in by 1.5x during animation
            hexSvg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomScale})`;
            hexSvg.style.transition = 'transform 0.5s ease-in-out';

            // Hide all nodes first
            hexagons.forEach(hex => {
                hex.classList.remove('hex-flow-visible', 'hex-approaching', 'hex-active', 'hex-visited');
                hex.classList.add('hex-hidden');
            });

            // Hide all background hexagons first
            backgroundHexagons.forEach(hex => {
                hex.classList.remove('bg-hex-flow-visible');
                hex.classList.add('bg-hex-hidden');
            });

            // Collect coordinates of visible nodes
            const visibleNodeCoords = new Set();

            // Previous node
            if (i > 0) {
                const prevNode = this.hexGridData[i - 1];
                const prevHex = document.querySelector(`[data-id="${prevNode.id}"]`);
                if (prevHex) {
                    prevHex.classList.remove('hex-hidden');
                    prevHex.classList.add('hex-flow-visible', 'hex-visited');
                    visibleNodeCoords.add(`${prevNode.q},${prevNode.r}`);
                }
            }

            // Current node
            if (hexElement) {
                hexElement.classList.remove('hex-hidden');
                hexElement.classList.add('hex-flow-visible', 'hex-active');
                visibleNodeCoords.add(`${node.q},${node.r}`);
            }

            // Next node
            if (i < this.hexGridData.length - 1) {
                const nextNode = this.hexGridData[i + 1];
                const nextHex = document.querySelector(`[data-id="${nextNode.id}"]`);
                if (nextHex) {
                    nextHex.classList.remove('hex-hidden');
                    nextHex.classList.add('hex-flow-visible', 'hex-approaching');
                    visibleNodeCoords.add(`${nextNode.q},${nextNode.r}`);
                }
            }

            // Show only layer 1 background hexagons around visible nodes
            backgroundHexagons.forEach(bgHex => {
                const bgQ = parseInt(bgHex.getAttribute('data-q'));
                const bgR = parseInt(bgHex.getAttribute('data-r'));

                // Check if this background hex is layer 1 (immediate neighbor) of any visible node
                let isLayer1Neighbor = false;
                for (const coord of visibleNodeCoords) {
                    const [nodeQ, nodeR] = coord.split(',').map(Number);
                    const distance = this.getHexDistance(bgQ, bgR, nodeQ, nodeR);
                    if (distance === 1) {
                        isLayer1Neighbor = true;
                        break;
                    }
                }

                if (isLayer1Neighbor) {
                    bgHex.classList.remove('bg-hex-hidden');
                    bgHex.classList.add('bg-hex-flow-visible');
                }
            });

            await this.delay(this.animationSpeed);

            // Check if animation was stopped
            if (this.animationStopped) break;
        }

        this.resetAnimationUI();
    }

    stopFlow() {
        this.animationStopped = true;
        this.resetAnimationUI();
    }

    resetAnimationUI() {
        this.isAnimating = false;

        // Show play button, hide stop button
        document.getElementById('playFlowBtn').classList.remove('hidden');
        document.getElementById('stopFlowBtn').classList.add('hidden');

        // Reset hexSvg position
        const hexSvg = document.getElementById('hexSvg');
        hexSvg.style.transform = 'none';
        hexSvg.style.transition = 'transform 0.5s ease-in-out';

        // Remove highlight element
        const highlight = document.getElementById('flowHighlight');
        if (highlight) {
            highlight.remove();
        }

        // Reset all hexagons to normal state
        const hexagons = document.querySelectorAll('.hexagon[data-type="primary"]');
        hexagons.forEach(hex => {
            hex.classList.remove('hex-approaching', 'hex-active', 'hex-visited', 'hex-hidden', 'hex-flow-visible');
        });

        // Reset background hexagons to normal state
        const backgroundHexagons = document.querySelectorAll('.hexagon[data-type="background"]');
        backgroundHexagons.forEach(hex => {
            hex.classList.remove('bg-hex-hidden', 'bg-hex-flow-visible');
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    exportPNG() {
        const svg = document.getElementById('hexSvg');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // High resolution for better quality
        const scale = 3; // 3x resolution for crisp export
        const width = 1200;
        const height = 900;

        canvas.width = width * scale;
        canvas.height = height * scale;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);

        // Transparent background (no fill needed)

        // Clone the SVG to avoid modifying the original
        const svgClone = svg.cloneNode(true);

        // Set high-quality SVG attributes
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);

        // Get the defs section from the parent SVG
        const parentSvg = document.querySelector('svg');
        const defs = parentSvg.querySelector('defs');

        // Add the defs section to the cloned SVG if it doesn't exist
        if (defs && !svgClone.querySelector('defs')) {
            svgClone.insertBefore(defs.cloneNode(true), svgClone.firstChild);
        }

        const svgData = new XMLSerializer().serializeToString(svgClone);
        const img = new Image();

        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);

            // Download the image with high quality
            const link = document.createElement('a');
            link.download = 'honeycomb-configuration.png';
            link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    exportCode() {
        const exportData = {
            metadata: {
                title: 'Honeycomb Configurator - Complete Export',
                description: 'This file contains a complete configuration including all nodes and settings. Use the "Import Code" button to restore this exact configuration.',
                generator: 'Honeycomb Configurator v1.0',
                exported: new Date().toISOString(),
                nodeCount: this.hexGridData.length
            },
            version: '1.0',
            timestamp: new Date().toISOString(),
            configuration: {
                hexSize: this.hexSize,
                hexSpacing: this.hexSpacing,
                animationSpeed: this.animationSpeed,
                // Include additional settings for comprehensive import
                background: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--hex-grid-bg') || '#ffffff'
                },
                palette: {
                    selected: document.getElementById('paletteSelector')?.value || 'default'
                },
                defaultColor: this.defaultColor || '#3b82f6'
            },
            nodes: this.hexGridData.map(node => ({
                id: node.id,
                q: node.q,
                r: node.r,
                type: node.type,
                color: node.color,
                icon: node.icon
            }))
        };

        const jsonString = JSON.stringify(exportData, null, 2);

        // Create a modal to display the code
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
                      <div class="bg-white rounded-lg p-6 w-3/4 max-w-4xl max-h-3/4 overflow-y-auto">
                          <h3 class="text-lg font-semibold mb-4">Export Configuration Code</h3>
                          <textarea id="codeOutput" class="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm" readonly>${jsonString}</textarea>
                          <div class="flex justify-end space-x-3 mt-4">
                              <button id="copyCodeBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                  Copy to Clipboard
                              </button>
                              <button id="downloadCodeBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                  Download JSON
                              </button>
                              <button id="closeModalBtn" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                                  Close
                              </button>
                          </div>
                      </div>
                  `;

        document.body.appendChild(modal);

        // Add event listeners for modal actions
        document.getElementById('copyCodeBtn').addEventListener('click', () => {
            const textarea = document.getElementById('codeOutput');
            textarea.select();
            document.execCommand('copy');

            // Show feedback
            const btn = document.getElementById('copyCodeBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.className = 'bg-green-600 text-white px-4 py-2 rounded-lg';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700';
            }, 2000);
        });

        document.getElementById('downloadCodeBtn').addEventListener('click', () => {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'honeycomb-configuration.json';
            link.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    handleCodeImport(event) {
        const file = event.target.files[0];
        if (file) {
            this.importCode(file);
            // Clear the file input
            event.target.value = '';
        }
    }

    async importCode(file) {
        // Show loading state
        const importBtn = document.getElementById('importCodeBtn');
        const originalText = importBtn.innerHTML;
        importBtn.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>Importing...';
        importBtn.disabled = true;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate the imported data structure
            if (!this.validateImportedCode(data)) {
                throw new Error('Invalid code format. Please ensure you are importing a valid JSON configuration exported from this tool.');
            }

            // Apply the imported configuration and nodes
            this.applyImportedCode(data);

            // Show success feedback
            importBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Import Successful!';
            importBtn.className = 'btn-upload w-full bg-green-600 hover:bg-green-700';

            setTimeout(() => {
                importBtn.innerHTML = originalText;
                importBtn.className = 'btn-upload w-full';
                importBtn.disabled = false;
            }, 2000);

            console.log('Imported configuration:', data);

        } catch (error) {
            console.error('Error importing code:', error);

            // Show error feedback
            importBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Import Failed';
            importBtn.className = 'btn-upload w-full bg-red-600 hover:bg-red-700';

            setTimeout(() => {
                importBtn.innerHTML = originalText;
                importBtn.className = 'btn-upload w-full';
                importBtn.disabled = false;
            }, 3000);

            alert('Error importing code: ' + error.message);
        }
    }

    validateImportedCode(data) {
        // Check if it's a valid object
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check for required fields from exportCode format
        if (!data.version || !data.timestamp) {
            return false;
        }

        // Check for configuration section
        if (!data.configuration || typeof data.configuration !== 'object') {
            return false;
        }

        // Check for nodes array
        if (!data.nodes || !Array.isArray(data.nodes)) {
            return false;
        }

        // Validate each node has required properties
        for (const node of data.nodes) {
            if (typeof node.id === 'undefined' ||
                typeof node.q === 'undefined' ||
                typeof node.r === 'undefined' ||
                !node.type ||
                !node.color) {
                return false;
            }
        }

        return true;
    }

    applyImportedCode(data) {
        try {
            // Clear existing nodes first
            this.hexGridData = [];

            // Apply configuration settings
            if (data.configuration) {
                const config = data.configuration;

                // Apply hex size and spacing if present
                if (config.hexSize) {
                    this.hexSize = config.hexSize;
                }
                if (config.hexSpacing) {
                    this.hexSpacing = config.hexSpacing;
                }
                if (config.animationSpeed) {
                    this.animationSpeed = config.animationSpeed;
                    // Update the animation speed control if it exists
                    const speedSlider = document.getElementById('animationSpeed');
                    if (speedSlider && typeof flowAnimationManager !== 'undefined') {
                        speedSlider.value = config.animationSpeed;
                        flowAnimationManager.animationSpeed = config.animationSpeed;
                        document.getElementById('speedValue').textContent = config.animationSpeed + 'x';
                    }
                }

                // Apply background color if present
                if (config.background && config.background.color) {
                    document.documentElement.style.setProperty('--hex-grid-bg', config.background.color);
                    // Update background color selection UI if it exists
                    const backgroundOptions = document.querySelectorAll('#backgroundColorOptions .color-swatch');
                    backgroundOptions.forEach(swatch => {
                        if (swatch.style.backgroundColor === config.background.color) {
                            swatch.classList.add('active');
                        } else {
                            swatch.classList.remove('active');
                        }
                    });
                }

                // Apply palette selection if present
                if (config.palette && config.palette.selected) {
                    const paletteSelector = document.getElementById('paletteSelector');
                    if (paletteSelector) {
                        paletteSelector.value = config.palette.selected;
                        // Trigger change event to update the palette display
                        paletteSelector.dispatchEvent(new Event('change'));
                    }
                }

                // Apply default color if present
                if (config.defaultColor) {
                    this.defaultColor = config.defaultColor;
                }
            }

            // Import all nodes
            data.nodes.forEach(nodeData => {
                const newNode = {
                    id: nodeData.id,
                    q: nodeData.q,
                    r: nodeData.r,
                    type: nodeData.type,
                    color: nodeData.color,
                    icon: nodeData.icon || 'iconoir-plus'
                };
                this.hexGridData.push(newNode);
            });

            // Re-render the grid and node list
            this.renderHexGrid();
            this.renderNodeList();

            console.log('Successfully applied imported code with', data.nodes.length, 'nodes');
        } catch (error) {
            console.error('Error applying imported code:', error);
            throw new Error('Failed to apply imported configuration: ' + error.message);
        }
    }

    // ==========================================
    // PROFESSIONAL DRAG & DROP SYSTEM
    // ==========================================

    handleNodeMouseDown(e, node) {
        e.preventDefault();
        e.stopPropagation();

        const isCtrlPressed = e.ctrlKey || e.metaKey;

        // Handle selection
        if (!this.selectedNodes.has(node.id)) {
            if (!isCtrlPressed) {
                this.selectedNodes.clear();
            }
            this.selectedNodes.add(node.id);
        } else if (isCtrlPressed) {
            this.selectedNodes.delete(node.id);
        }

        // Start drag if we have selected nodes
        if (this.selectedNodes.size > 0) {
            this.startDrag(e, node);
        }

        this.updateVisualSelection();
    }

    startDrag(e, primaryNode) {
        const svg = document.getElementById('hexSvg');
        const rect = svg.getBoundingClientRect();

        this.dragState.isDragging = true;
        this.dragState.startPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.dragState.currentPosition = { ...this.dragState.startPosition };

        // Store all selected nodes for dragging
        this.dragState.draggedNodes = Array.from(this.selectedNodes).map(nodeId => {
            const node = this.hexGridData.find(n => n.id === nodeId);
            const pixelPos = this.axialToPixel(node.q, node.r);
            return {
                ...node,
                startPixelPos: pixelPos,
                offsetFromMouse: {
                    x: pixelPos.x - this.dragState.startPosition.x,
                    y: pixelPos.y - this.dragState.startPosition.y
                }
            };
        });

        // Add visual feedback
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        this.addDragVisualFeedback();
    }

    handleMouseMove(e) {
        if (!this.dragState.isDragging) return;

        e.preventDefault();
        const svg = document.getElementById('hexSvg');
        const rect = svg.getBoundingClientRect();

        this.dragState.currentPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        this.updateDragPreview();
    }

    updateDragPreview() {
        const deltaX = this.dragState.currentPosition.x - this.dragState.startPosition.x;
        const deltaY = this.dragState.currentPosition.y - this.dragState.startPosition.y;

        this.dragState.draggedNodes.forEach(dragNode => {
            const newPixelPos = {
                x: dragNode.startPixelPos.x + deltaX,
                y: dragNode.startPixelPos.y + deltaY
            };

            // Update visual position during drag
            const hexElement = document.querySelector(`[data-id="${dragNode.id}"]`);
            if (hexElement) {
                hexElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                hexElement.style.opacity = '0.8';
                hexElement.style.zIndex = '1000';
            }
        });

        // Show snap guides if enabled
        if (this.snapGrid) {
            this.showSnapGuides();
        }
    }

    handleMouseUp(e) {
        if (!this.dragState.isDragging) return;

        e.preventDefault();
        this.finalizeDrag();
    }

    finalizeDrag() {
        const deltaX = this.dragState.currentPosition.x - this.dragState.startPosition.x;
        const deltaY = this.dragState.currentPosition.y - this.dragState.startPosition.y;

        // Update actual node positions
        this.dragState.draggedNodes.forEach(dragNode => {
            const node = this.hexGridData.find(n => n.id === dragNode.id);
            if (!node) return;

            const newPixelPos = {
                x: dragNode.startPixelPos.x + deltaX,
                y: dragNode.startPixelPos.y + deltaY
            };

            // Convert back to axial coordinates with snapping
            const axialPos = this.pixelToAxial(newPixelPos.x, newPixelPos.y);
            const snappedPos = this.snapToGrid(axialPos);

            // Check for collisions and handle them
            const collision = this.checkCollision(snappedPos.q, snappedPos.r, node.id);
            if (!collision) {
                node.q = snappedPos.q;
                node.r = snappedPos.r;
            }
        });

        // Clean up drag state
        this.dragState.isDragging = false;
        this.dragState.draggedNodes = [];
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        this.removeDragVisualFeedback();

        // Re-render with final positions
        this.renderHexGrid();
        this.renderNodeList();
        this.updateVisualSelection();
    }

    snapToGrid(axialPos) {
        if (!this.snapGrid) return axialPos;
        return {
            q: Math.round(axialPos.q),
            r: Math.round(axialPos.r)
        };
    }

    checkCollision(q, r, excludeId) {
        return this.hexGridData.find(node =>
            node.id !== excludeId &&
            node.type === 'primary' &&
            node.q === q &&
            node.r === r
        );
    }

    addDragVisualFeedback() {
        // Add drag feedback styles to dragged elements
        this.dragState.draggedNodes.forEach(dragNode => {
            const hexElement = document.querySelector(`[data-id="${dragNode.id}"]`);
            if (hexElement) {
                hexElement.classList.add('dragging');
            }
        });
    }

    removeDragVisualFeedback() {
        // Remove drag feedback styles
        document.querySelectorAll('.hexagon.dragging').forEach(element => {
            element.classList.remove('dragging');
            element.style.transform = '';
            element.style.opacity = '';
            element.style.zIndex = '';
        });
        this.hideSnapGuides();
    }

    showSnapGuides() {
        // Visual snap guides implementation would go here
        // For now, we'll skip this and add it later if needed
    }

    hideSnapGuides() {
        // Hide snap guides implementation
    }

    updateVisualSelection() {
        // Update visual selection indicators
        document.querySelectorAll('.hexagon[data-type="primary"]').forEach(element => {
            const nodeId = parseInt(element.getAttribute('data-id'));
            if (this.selectedNodes.has(nodeId)) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });


    }

    handleKeyDown(e) {
        // Handle keyboard shortcuts
        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.deleteSelectedNodes();
        } else if (e.key === 'Escape') {
            this.clearSelection();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            this.selectAllNodes();
        }
    }

    deleteSelectedNodes() {
        if (this.selectedNodes.size === 0) return;

        Array.from(this.selectedNodes).forEach(nodeId => {
            this.hexGridData = this.hexGridData.filter(node => node.id !== nodeId);
        });

        this.selectedNodes.clear();
        this.renderHexGrid();
        this.renderNodeList();
    }

    clearSelection() {
        this.selectedNodes.clear();
        this.updateVisualSelection();
    }

    selectAllNodes() {
        this.hexGridData.forEach(node => {
            if (node.type === 'primary') {
                this.selectedNodes.add(node.id);
            }
        });
        this.updateVisualSelection();
    }

    // ==========================================
    // CONTEXT MENU SYSTEM
    // ==========================================

    showContextMenu(e, node) {
        e.preventDefault();
        e.stopPropagation();

        // Select the node if it's not already selected
        if (!this.selectedNodes.has(node.id)) {
            this.selectedNodes.clear();
            this.selectedNodes.add(node.id);
            this.updateVisualSelection();
        }

        const contextMenu = document.getElementById('contextMenu');
        const hexCanvas = document.getElementById('hexCanvas');
        const rect = hexCanvas.getBoundingClientRect();

        // Position the context menu
        contextMenu.style.left = `${e.clientX - rect.left}px`;
        contextMenu.style.top = `${e.clientY - rect.top}px`;
        contextMenu.classList.remove('hidden');

        // Add event listeners for context menu items
        this.setupContextMenuListeners();
    }

    setupContextMenuListeners() {
        const contextMenu = document.getElementById('contextMenu');

        // Remove existing listeners
        const items = contextMenu.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            item.replaceWith(item.cloneNode(true));
        });

        // Add new listeners
        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.getAttribute('data-action');
                this.handleContextMenuAction(action);
                this.hideContextMenu();
            });
        });
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'duplicate':
                this.duplicateSelectedNodes();
                break;
            case 'delete':
                this.deleteSelectedNodes();
                break;
            case 'bring-forward':
                this.bringSelectedNodesForward();
                break;
            case 'send-backward':
                this.sendSelectedNodesBackward();
                break;
        }
    }

    duplicateSelectedNodes() {
        const nodesToDuplicate = Array.from(this.selectedNodes).map(nodeId =>
            this.hexGridData.find(n => n.id === nodeId)
        );

        this.selectedNodes.clear();

        nodesToDuplicate.forEach(node => {
            // Find an empty adjacent position for the duplicate
            const newPosition = this.findEmptyAdjacentPosition(node.q, node.r);
            if (newPosition) {
                const duplicate = {
                    ...node,
                    id: this.nextId++,
                    q: newPosition.q,
                    r: newPosition.r
                };
                this.hexGridData.push(duplicate);
                this.selectedNodes.add(duplicate.id);
            }
        });

        this.renderHexGrid();
        this.renderNodeList();
        this.updateVisualSelection();
    }

    findEmptyAdjacentPosition(q, r) {
        // Check the 6 adjacent hexagon positions
        const directions = [
            { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
            { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
        ];

        for (const dir of directions) {
            const newQ = q + dir.q;
            const newR = r + dir.r;

            if (!this.checkCollision(newQ, newR, null)) {
                return { q: newQ, r: newR };
            }
        }

        return null; // No empty adjacent position found
    }

    bringSelectedNodesForward() {
        // Move selected nodes to the end of the array (rendered last = on top)
        const selectedNodesData = Array.from(this.selectedNodes).map(nodeId =>
            this.hexGridData.find(n => n.id === nodeId)
        );

        // Remove selected nodes from their current positions
        this.hexGridData = this.hexGridData.filter(node => !this.selectedNodes.has(node.id));

        // Add them back at the end
        this.hexGridData.push(...selectedNodesData);

        this.renderHexGrid();
        this.renderNodeList();
        this.updateVisualSelection();
    }

    sendSelectedNodesBackward() {
        // Move selected nodes to the beginning of the array (rendered first = behind)
        const selectedNodesData = Array.from(this.selectedNodes).map(nodeId =>
            this.hexGridData.find(n => n.id === nodeId)
        );

        // Remove selected nodes from their current positions
        this.hexGridData = this.hexGridData.filter(node => !this.selectedNodes.has(node.id));

        // Add them at the beginning
        this.hexGridData.unshift(...selectedNodesData);

        this.renderHexGrid();
        this.renderNodeList();
        this.updateVisualSelection();
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.classList.add('hidden');
    }

    clearAll() {
        this.hexGridData = [];
        this.renderHexGrid();
        this.renderNodeList();
    }
}