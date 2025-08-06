class FlowAnimationManager {
    constructor() {
        this.animationSpeed = 1.0;
        this.glowEffect = true;
        this.initControls();
    }

    initControls() {
        const speedValue = document.getElementById('speedValue');
        const glowCheckbox = document.getElementById('glowEffect');

        // Glow effect toggle
        glowCheckbox.addEventListener('change', (e) => {
            this.glowEffect = e.target.checked;
            this.updateGlowEffects();
            localStorage.setItem('glow-effect', this.glowEffect);
        });

        // Load saved settings
        this.loadSettings();
    }

    loadSettings() {
        const savedGlow = localStorage.getItem('glow-effect');
        if (savedGlow !== null) {
            this.glowEffect = savedGlow === 'true';
            document.getElementById('glowEffect').checked = this.glowEffect;
        }
    }

    updateGlowEffects() {
        const hexSvg = document.getElementById('hexSvg');
        if (this.glowEffect) {
            hexSvg.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))';
        } else {
            hexSvg.style.filter = 'none';
        }
    }

    getAnimationDuration() {
        return 1000 / this.animationSpeed; // Base duration modified by speed
    }

    enhanceNodeVisual(element, state) {
        if (!this.glowEffect) return;

        const glowIntensity = {
            'approaching': '0 0 12px rgba(59, 130, 246, 0.5)',
            'active': '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)',
            'visited': '0 0 8px rgba(59, 130, 246, 0.3)'
        };

        if (element && glowIntensity[state]) {
            element.style.filter = `drop-shadow(${glowIntensity[state]})`;
        }
    }
}