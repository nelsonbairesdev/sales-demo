// Configuration Download/Upload System
class ConfigurationManager {
    constructor() {
        this.initButtons();
    }

    initButtons() {
        const downloadBtn = document.getElementById('downloadConfigBtn');
        const uploadBtn = document.getElementById('uploadConfigBtn');
        const fileInput = document.getElementById('configUpload');

        // Download configuration
        downloadBtn.addEventListener('click', () => {
            this.downloadConfiguration();
        });

        // Upload configuration - trigger file input
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle file upload
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadConfiguration(file);
            }
        });
    }

    buildConfiguration() {
        const config = {
            metadata: {
                title: "Honeycomb Configuration",
                version: "1.0.0",
                generatedAt: new Date().toISOString(),
                generator: "Honeycomb Configurator"
            },
            settings: {
                // Background settings
                background: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--hex-grid-bg') || '#ffffff',
                    palette: this.getCurrentPalette(),
                    defaultColor: this.getDefaultColor()
                },
                // Animation settings
                animation: {
                    speed: flowAnimationManager?.animationSpeed || 1.0,
                    glowEffects: flowAnimationManager?.glowEffect !== false
                },
                // Custom icons URLs (if any)
                iconUrls: (typeof iconUrlsManager !== 'undefined' && iconUrlsManager) ? iconUrlsManager.getUrls() : []
            }
        };

        return config;
    }

    getCurrentPalette() {
        const paletteSelector = document.getElementById('paletteSelector');
        return paletteSelector ? paletteSelector.value : 'default';
    }

    getDefaultColor() {
        // Try to get the default color from the configurator
        if (typeof configurator !== 'undefined' && configurator && configurator.defaultColor) {
            return configurator.defaultColor;
        }

        // Fallback to common default hex color (blue)
        return '#3b82f6';
    }

    downloadConfiguration() {
        try {
            const config = this.buildConfiguration();
            const jsonString = JSON.stringify(config, null, 2);

            // Create download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'honeycomb-config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Configuration downloaded successfully');
        } catch (error) {
            console.error('Error downloading configuration:', error);
            alert('Error downloading configuration. Please try again.');
        }
    }

    async uploadConfiguration(file) {
        try {
            const text = await file.text();
            const config = JSON.parse(text);

            // Validate configuration structure
            if (!this.validateConfiguration(config)) {
                throw new Error('Invalid configuration format');
            }

            // Apply configuration
            this.applyConfiguration(config);

            console.log('Configuration loaded successfully:', config);
            alert('Configuration loaded successfully!');

            // Clear file input
            document.getElementById('configUpload').value = '';
        } catch (error) {
            console.error('Error loading configuration:', error);
            alert('Error loading configuration: ' + error.message);
        }
    }

    validateConfiguration(config) {
        // Basic validation
        if (!config || typeof config !== 'object') {
            return false;
        }

        // Check for required structure
        if (!config.settings || typeof config.settings !== 'object') {
            return false;
        }

        return true;
    }

    applyConfiguration(config) {
        const settings = config.settings;

        try {
            // Apply background settings
            if (settings.background) {
                this.applyBackgroundSettings(settings.background);
            }

            // Apply animation settings
            if (settings.animation) {
                this.applyAnimationSettings(settings.animation);
            }

            // Apply icon URLs
            if (settings.iconUrls && Array.isArray(settings.iconUrls)) {
                this.applyIconUrls(settings.iconUrls);
            }

        } catch (error) {
            console.error('Error applying configuration:', error);
            throw error;
        }
    }

    applyBackgroundSettings(backgroundConfig) {
        // Apply background color
        if (backgroundConfig.color) {
            document.documentElement.style.setProperty('--hex-grid-bg', backgroundConfig.color);

            // Update any background color options that might be selected
            const backgroundOptions = document.querySelectorAll('#backgroundColorOptions .color-swatch');
            backgroundOptions.forEach(option => {
                option.classList.remove('active');
                if (option.style.backgroundColor === backgroundConfig.color) {
                    option.classList.add('active');
                }
            });
        }

        // Apply palette selection first
        if (backgroundConfig.palette) {
            const paletteSelector = document.getElementById('paletteSelector');
            if (paletteSelector) {
                paletteSelector.value = backgroundConfig.palette;
                // Trigger change event to update colors
                paletteSelector.dispatchEvent(new Event('change'));
            }
        }

        // Apply default color AFTER palette change (so it doesn't get overridden)
        if (backgroundConfig.defaultColor && typeof configurator !== 'undefined' && configurator) {
            // Small delay to ensure palette change is complete
            setTimeout(() => {
                configurator.defaultColor = backgroundConfig.defaultColor;
                console.log('Applied default color:', backgroundConfig.defaultColor);
            }, 100);
        }
    }

    applyAnimationSettings(animationConfig) {
        // Apply animation speed
        if (typeof animationConfig.speed === 'number') {
            if (flowAnimationManager) {
                flowAnimationManager.animationSpeed = animationConfig.speed;

                // Update UI controls
                const speedSlider = document.getElementById('animationSpeed');
                const speedValue = document.getElementById('speedValue');
                if (speedSlider && speedValue) {
                    speedSlider.value = animationConfig.speed;
                    speedValue.textContent = `${animationConfig.speed}x`;
                }

                // Save to localStorage
                localStorage.setItem('animation-speed', animationConfig.speed);
            }
        }

        // Apply glow effects setting
        if (typeof animationConfig.glowEffects === 'boolean') {
            if (flowAnimationManager) {
                flowAnimationManager.glowEffect = animationConfig.glowEffects;

                // Update UI controls
                const glowCheckbox = document.getElementById('glowEffect');
                if (glowCheckbox) {
                    glowCheckbox.checked = animationConfig.glowEffects;
                }

                // Apply effects and save to localStorage
                flowAnimationManager.updateGlowEffects();
                localStorage.setItem('glow-effect', animationConfig.glowEffects);
            }
        }
    }

    applyIconUrls(iconUrls) {
        if (typeof iconUrlsManager !== 'undefined' && iconUrlsManager && Array.isArray(iconUrls)) {
            // Clear existing URLs
            iconUrlsManager.iconUrls = [...iconUrls];
            iconUrlsManager.saveUrls();

            // Load icons from URLs
            if (iconUrls.length > 0) {
                iconUrlsManager.loadCustomIcons();
            }
        }
    }
}