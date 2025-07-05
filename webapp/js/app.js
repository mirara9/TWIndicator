// Main Application Controller
class XAUUSDApp {
    constructor() {
        this.isInitialized = false;
        this.updateInterval = null;
        this.connectionStatus = 'connected';
        this.preferences = {};
        
        // Bind methods
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateRealTime = this.updateRealTime.bind(this);
        
        console.log('XAUUSDApp initialized');
    }

    // Initialize the application
    async initialize() {
        try {
            this.showInitialLoading();
            
            // Load user preferences
            this.loadPreferences();
            
            // Initialize chart manager
            await window.chartManager.initialize();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update market status
            this.updateMarketStatus();
            
            // Update trading sessions
            this.updateTradingSessions();
            
            // Hide loading
            this.hideInitialLoading();
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showInitializationError(error);
        }
    }

    // Load user preferences from localStorage
    loadPreferences() {
        try {
            const stored = localStorage.getItem(CONFIG.APP.STORAGE_KEYS.PREFERENCES);
            if (stored) {
                this.preferences = JSON.parse(stored);
                this.applyPreferences();
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    // Save user preferences to localStorage
    savePreferences() {
        if (!CONFIG.APP.SAVE_PREFERENCES) return;
        
        try {
            localStorage.setItem(
                CONFIG.APP.STORAGE_KEYS.PREFERENCES,
                JSON.stringify(this.preferences)
            );
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    // Apply loaded preferences
    applyPreferences() {
        // Apply timeframe preference
        if (this.preferences.timeframe) {
            window.chartManager.currentTimeframe = this.preferences.timeframe;
            this.updateActiveTimeframeButton(this.preferences.timeframe);
        }

        // Apply indicator preferences
        if (this.preferences.indicators) {
            Object.entries(this.preferences.indicators).forEach(([indicator, enabled]) => {
                if (enabled) {
                    window.chartManager.enabledIndicators.add(indicator);
                    this.updateIndicatorCheckbox(indicator, true);
                }
            });
        }

        // Apply chart type preference
        if (this.preferences.chartType) {
            window.chartManager.currentChartType = this.preferences.chartType;
            this.updateActiveChartTypeButton(this.preferences.chartType);
        }
    }

    // Setup real-time data updates
    setupRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Update every minute (or based on current timeframe)
        const updateFrequency = Math.max(
            CONFIG.CHART.UPDATE_INTERVAL,
            parseInt(window.chartManager.currentTimeframe) * 60000
        );

        this.updateInterval = setInterval(this.updateRealTime, updateFrequency);
        console.log(`Real-time updates scheduled every ${updateFrequency/1000} seconds`);
    }

    // Real-time update function
    async updateRealTime() {
        if (!this.isInitialized || document.hidden) return;

        try {
            // Update connection status
            this.updateConnectionStatus('connected');
            
            // Fetch latest data for current timeframe
            await window.chartManager.loadChartData(
                window.chartManager.currentTimeframe,
                false // Don't use cache for real-time updates
            );
            
            // Update charts
            window.chartManager.updateCharts();
            
            // Update market status and sessions
            this.updateMarketStatus();
            this.updateTradingSessions();
            
            console.log('Real-time update completed');
            
        } catch (error) {
            console.error('Real-time update failed:', error);
            this.updateConnectionStatus('disconnected');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Chart tools
        this.setupChartTools();
        
        // Mobile sidebar toggle
        this.setupMobileInterface();
    }

    // Setup chart tools
    setupChartTools() {
        // Zoom in
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomChart(1.2);
            });
        }

        // Zoom out
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomChart(0.8);
            });
        }

        // Reset zoom
        const resetZoomBtn = document.getElementById('reset-zoom');
        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => {
                this.resetChartZoom();
            });
        }

        // Fullscreen
        const fullscreenBtn = document.getElementById('fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }

    // Setup mobile interface
    setupMobileInterface() {
        // Add mobile sidebar toggle if needed
        if (window.innerWidth <= 768) {
            this.createMobileToggle();
        }
    }

    createMobileToggle() {
        const existingToggle = document.getElementById('mobile-sidebar-toggle');
        if (existingToggle) return;

        const toggle = document.createElement('button');
        toggle.id = 'mobile-sidebar-toggle';
        toggle.innerHTML = '☰';
        toggle.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 300;
            background: rgba(22, 28, 36, 0.9);
            border: 1px solid #2a2e39;
            border-radius: 6px;
            color: #f7931e;
            padding: 10px;
            font-size: 18px;
            cursor: pointer;
        `;

        toggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        });

        document.body.appendChild(toggle);
    }

    // Handle keyboard shortcuts
    handleKeyboard(event) {
        // Only handle shortcuts when not typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.code) {
            case 'Digit1':
                this.changeTimeframe('1');
                break;
            case 'Digit2':
                this.changeTimeframe('5');
                break;
            case 'Digit3':
                this.changeTimeframe('15');
                break;
            case 'Digit4':
                this.changeTimeframe('60');
                break;
            case 'KeyR':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.refreshData();
                }
                break;
            case 'KeyF':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.toggleFullscreen();
                }
                break;
        }
    }

    // Handle window resize
    handleResize() {
        // Debounce resize handling
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (window.chartManager.isInitialized) {
                window.chartManager.mainChart?.resize();
                Object.values(window.chartManager.subCharts).forEach(chart => {
                    chart?.resize();
                });
            }

            // Handle mobile interface changes
            if (window.innerWidth <= 768) {
                this.createMobileToggle();
            } else {
                const toggle = document.getElementById('mobile-sidebar-toggle');
                if (toggle) {
                    toggle.remove();
                }
                
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('open');
                }
            }
        }, 250);
    }

    // Handle visibility change (tab switching)
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause updates when tab is not visible
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            console.log('Updates paused - tab not visible');
        } else {
            // Resume updates when tab becomes visible
            this.setupRealTimeUpdates();
            // Immediate update when tab becomes visible
            setTimeout(this.updateRealTime, 1000);
            console.log('Updates resumed - tab visible');
        }
    }

    // Change timeframe
    async changeTimeframe(timeframe) {
        await window.chartManager.changeTimeframe(timeframe);
        this.updateActiveTimeframeButton(timeframe);
        
        // Update preferences
        this.preferences.timeframe = timeframe;
        this.savePreferences();
        
        // Restart real-time updates with new frequency
        this.setupRealTimeUpdates();
    }

    // Update active timeframe button
    updateActiveTimeframeButton(timeframe) {
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.timeframe === timeframe) {
                btn.classList.add('active');
            }
        });
    }

    // Update active chart type button
    updateActiveChartTypeButton(chartType) {
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === chartType) {
                btn.classList.add('active');
            }
        });
    }

    // Update indicator checkbox
    updateIndicatorCheckbox(indicator, checked) {
        const checkbox = document.querySelector(`input[data-indicator="${indicator}"]`);
        if (checkbox) {
            checkbox.checked = checked;
        }
    }

    // Update market status
    updateMarketStatus() {
        const isOpen = CONFIG.isMarketOpen();
        const statusIndicator = document.getElementById('market-status');
        const statusText = document.getElementById('market-text');
        
        if (statusIndicator && statusText) {
            if (isOpen) {
                statusIndicator.classList.add('open');
                statusText.textContent = 'Market Open';
            } else {
                statusIndicator.classList.remove('open');
                statusText.textContent = 'Market Closed';
            }
        }
    }

    // Update trading sessions
    updateTradingSessions() {
        const currentSessions = CONFIG.getCurrentSession();
        
        // Update session status displays
        ['asian', 'london', 'newyork'].forEach(session => {
            const statusElement = document.getElementById(`${session}-status`);
            if (statusElement) {
                const sessionKey = session.toUpperCase().replace('NEWYORK', 'NEW_YORK');
                const isActive = currentSessions.includes(sessionKey);
                
                statusElement.textContent = isActive ? 'Open' : 'Closed';
                statusElement.className = `session-status ${isActive ? 'open' : 'closed'}`;
            }
        });
    }

    // Update connection status
    updateConnectionStatus(status) {
        this.connectionStatus = status;
        const statusElement = document.getElementById('connection-status');
        const statusDot = statusElement?.querySelector('.status-dot');
        const statusText = statusElement?.querySelector('.status-text');
        
        if (statusDot && statusText) {
            if (status === 'connected') {
                statusDot.classList.remove('disconnected');
                statusText.textContent = 'Connected';
            } else {
                statusDot.classList.add('disconnected');
                statusText.textContent = 'Disconnected';
            }
        }
    }

    // Chart tools methods
    zoomChart(factor) {
        // Implementation would depend on Chart.js zoom plugin
        console.log(`Zoom chart by factor: ${factor}`);
    }

    resetChartZoom() {
        // Reset chart zoom
        console.log('Reset chart zoom');
    }

    toggleFullscreen() {
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        if (!document.fullscreenElement) {
            chartContainer.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Refresh data
    async refreshData() {
        console.log('Refreshing data...');
        window.dataFetcher.clearCache();
        await this.updateRealTime();
    }

    // Show initial loading
    showInitialLoading() {
        const body = document.body;
        const loader = document.createElement('div');
        loader.id = 'initial-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0d1421;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(247, 147, 30, 0.3);
                    border-top: 4px solid #f7931e;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <h2 style="color: #f7931e; margin-bottom: 10px;">XAUUSD Live Chart</h2>
                <p style="color: #8892a8;">Loading market data...</p>
            </div>
        `;
        body.appendChild(loader);
    }

    // Hide initial loading
    hideInitialLoading() {
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }
    }

    // Show initialization error
    showInitializationError(error) {
        const body = document.body;
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0d1421;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                text-align: center;
                padding: 20px;
            ">
                <h2 style="color: #ef5350; margin-bottom: 20px;">Initialization Failed</h2>
                <p style="color: #8892a8; margin-bottom: 20px; max-width: 400px;">
                    Unable to initialize the application. Please check your internet connection and try again.
                </p>
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: #f7931e;
                    border: none;
                    border-radius: 6px;
                    color: #000000;
                    font-weight: 600;
                    cursor: pointer;
                ">Retry</button>
                <details style="margin-top: 20px; color: #8892a8;">
                    <summary style="cursor: pointer;">Technical Details</summary>
                    <pre style="margin-top: 10px; padding: 10px; background: rgba(239, 83, 80, 0.1); border-radius: 4px; font-size: 12px; text-align: left;">
${error.message}
                    </pre>
                </details>
            </div>
        `;
        
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.remove();
        }
        
        body.appendChild(errorDiv);
    }

    // Cleanup method
    destroy() {
        // Clear intervals
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // Destroy chart manager
        if (window.chartManager) {
            window.chartManager.destroy();
        }

        // Destroy data fetcher
        if (window.dataFetcher) {
            window.dataFetcher.destroy();
        }

        console.log('Application destroyed');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.xauusdApp = new XAUUSDApp();
    
    // Initialize the application
    window.xauusdApp.initialize().catch(error => {
        console.error('Failed to initialize application:', error);
    });
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.xauusdApp) {
        window.xauusdApp.destroy();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XAUUSDApp;
}