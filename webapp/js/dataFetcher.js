// Data Fetcher for XAUUSD Live Data
class DataFetcher {
    constructor() {
        this.currentAPI = 'ALPHA_VANTAGE';
        this.failedAPIs = new Set();
        this.cache = new Map();
        this.isOnline = navigator.onLine;
        this.retryCount = 0;
        
        // Bind methods
        this.handleOnline = this.handleOnline.bind(this);
        this.handleOffline = this.handleOffline.bind(this);
        
        // Listen for connection changes
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);
        
        console.log('DataFetcher initialized');
    }

    handleOnline() {
        this.isOnline = true;
        this.failedAPIs.clear();
        this.retryCount = 0;
        console.log('Connection restored');
    }

    handleOffline() {
        this.isOnline = false;
        console.log('Connection lost');
    }

    // Generate realistic demo data
    generateDemoData(timeframe = '60', count = 100, symbol = CONFIG.CURRENT_SYMBOL) {
        console.log(`Generating demo data: ${count} candles for ${symbol} on ${timeframe}m timeframe`);
        
        const data = [];
        const now = new Date();
        const intervalMs = parseInt(timeframe) * 60 * 1000;
        const symbolConfig = CONFIG.SYMBOLS[symbol];
        let currentPrice = symbolConfig ? symbolConfig.demoBasePrice : 2050.00;
        let trend = 0;

        for (let i = count - 1; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * intervalMs));
            
            // Add some trend persistence and market patterns
            if (Math.random() < 0.15) {
                trend = (Math.random() - 0.5) * 1.5;
            }
            
            // Add some intraday patterns for forex
            let timeMultiplier = 1;
            if (symbolConfig?.type !== 'crypto') {
                const hour = timestamp.getUTCHours();
                // More volatility during London/NY overlap (13-16 UTC)
                if (hour >= 13 && hour <= 16) {
                    timeMultiplier = 1.4;
                }
                // Lower volatility during Asian session for XAUUSD
                else if (hour >= 22 || hour <= 3) {
                    timeMultiplier = 0.7;
                }
            }
            
            // Generate OHLC data
            const volatility = this.getVolatilityForHour(timestamp.getUTCHours(), symbol);
            const symbolVolatility = symbolConfig ? symbolConfig.volatility : 0.02;
            const effectiveVolatility = symbolVolatility * timeMultiplier;
            const change = (Math.random() - 0.5 + trend * 0.4) * currentPrice * effectiveVolatility;
            
            const open = currentPrice;
            const close = Math.max(0.01, currentPrice + change); // Ensure positive prices
            const spread = Math.abs(change) * (0.2 + Math.random() * 0.3);
            const high = Math.max(open, close) + spread;
            const low = Math.min(open, close) - spread;
            
            // Volume varies by symbol type and time
            let baseVolume = symbolConfig?.type === 'crypto' ? 
                Math.floor(Math.random() * 500000 + 1000000) : // Higher crypto volume
                Math.floor(Math.random() * 100000 + 50000);   // Lower forex volume
            
            baseVolume = Math.floor(baseVolume * timeMultiplier);

            const precision = symbolConfig ? symbolConfig.precision : 2;
            data.push({
                timestamp: timestamp.toISOString(),
                open: parseFloat(open.toFixed(precision)),
                high: parseFloat(high.toFixed(precision)),
                low: parseFloat(low.toFixed(precision)),
                close: parseFloat(close.toFixed(precision)),
                volume: baseVolume
            });

            currentPrice = close;
        }

        console.log(`Generated ${data.length} demo candles for ${symbol}`);
        return data;
    }

    getVolatilityForHour(hour, symbol = CONFIG.CURRENT_SYMBOL) {
        const symbolConfig = CONFIG.SYMBOLS[symbol];
        const baseVolatility = symbolConfig ? symbolConfig.volatility : 0.02;
        
        // For crypto, volatility is more consistent throughout the day
        if (symbolConfig && symbolConfig.type === 'crypto') {
            return baseVolatility;
        }
        
        // For forex, apply time-based volatility multipliers
        const period = CONFIG.DEMO.VOLATILITY_PERIODS.find(p => 
            hour >= p.start && hour < p.end
        );
        return period ? baseVolatility * period.multiplier : baseVolatility;
    }

    // Fetch data from Alpha Vantage
    async fetchFromAlphaVantage(timeframe = '60', symbol = CONFIG.CURRENT_SYMBOL) {
        try {
            const interval = this.mapTimeframeToAlphaVantage(timeframe);
            const func = CONFIG.SYMBOLS[symbol]?.type === 'crypto' ? 
                CONFIG.API.ALPHA_VANTAGE.FUNCTIONS.CRYPTO_INTRADAY : 
                CONFIG.API.ALPHA_VANTAGE.FUNCTIONS.INTRADAY;
            const url = CONFIG.buildAlphaVantageURL(func, interval, symbol);
            
            if (!url) throw new Error('Invalid symbol configuration');
            
            console.log('Fetching from Alpha Vantage:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(data['Error Message']);
            }
            
            if (data['Note']) {
                throw new Error('API call frequency limit reached');
            }
            
            return this.parseAlphaVantageData(data, symbol);
        } catch (error) {
            console.error('Alpha Vantage error:', error);
            throw error;
        }
    }

    // Fetch data from Twelve Data
    async fetchFromTwelveData(timeframe = '60', symbol = CONFIG.CURRENT_SYMBOL) {
        try {
            const interval = this.mapTimeframeToTwelveData(timeframe);
            const url = CONFIG.buildTwelveDataURL(interval, 'compact', symbol);
            
            if (!url) throw new Error('Invalid symbol configuration');
            
            console.log('Fetching from Twelve Data:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message || 'API Error');
            }
            
            return this.parseTwelveDataData(data);
        } catch (error) {
            console.error('Twelve Data error:', error);
            throw error;
        }
    }

    // Fetch data from Financial Modeling Prep
    async fetchFromFMP(timeframe = '60', symbol = CONFIG.CURRENT_SYMBOL) {
        try {
            const interval = this.mapTimeframeToFMP(timeframe);
            const url = CONFIG.buildFMPURL(interval, symbol);
            
            if (!url) throw new Error('Invalid symbol configuration');
            
            console.log('Fetching from FMP:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return this.parseFMPData(data);
        } catch (error) {
            console.error('FMP error:', error);
            throw error;
        }
    }

    // Main fetch method with fallbacks
    async fetchMarketData(timeframe = '60', useCache = true, symbol = CONFIG.CURRENT_SYMBOL) {
        const cacheKey = `market_data_${symbol}_${timeframe}`;
        
        // Check cache first
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            const age = Date.now() - cached.timestamp;
            const maxAge = parseInt(timeframe) * 60 * 1000; // Cache for one timeframe period
            
            if (age < maxAge) {
                console.log('Using cached data');
                return cached.data;
            }
        }

        // Check if we should force demo mode (when API keys are 'demo' or not configured)
        const shouldUseDemoMode = CONFIG.API.FORCE_DEMO_MODE || 
                                 (CONFIG.API.ALPHA_VANTAGE.API_KEY === 'demo' && 
                                  CONFIG.API.TWELVE_DATA.API_KEY === 'demo' && 
                                  CONFIG.API.FMP.API_KEY === 'demo') ||
                                 !this.isOnline;

        if (shouldUseDemoMode) {
            console.log('Using demo data mode');
            this.showDemoIndicator(true);
            const demoData = this.generateDemoData(timeframe, 100, symbol);
            this.cache.set(cacheKey, { data: demoData, timestamp: Date.now() });
            return demoData;
        } else {
            this.showDemoIndicator(false);
        }

        // Try APIs in order
        const apis = ['ALPHA_VANTAGE', 'TWELVE_DATA', 'FMP'];
        
        for (const api of apis) {
            if (this.failedAPIs.has(api)) continue;
            
            try {
                let data;
                
                switch (api) {
                    case 'ALPHA_VANTAGE':
                        data = await this.fetchFromAlphaVantage(timeframe, symbol);
                        break;
                    case 'TWELVE_DATA':
                        data = await this.fetchFromTwelveData(timeframe, symbol);
                        break;
                    case 'FMP':
                        data = await this.fetchFromFMP(timeframe, symbol);
                        break;
                }

                if (data && data.length > 0) {
                    console.log(`Successfully fetched data from ${api}`);
                    this.cache.set(cacheKey, { data, timestamp: Date.now() });
                    this.retryCount = 0;
                    return data;
                }
            } catch (error) {
                console.error(`${api} failed:`, error);
                this.failedAPIs.add(api);
            }
        }

        // All APIs failed, use demo data
        console.warn('All APIs failed, using demo data');
        this.showDemoIndicator(true);
        const demoData = this.generateDemoData(timeframe, 100, symbol);
        this.cache.set(cacheKey, { data: demoData, timestamp: Date.now() });
        return demoData;
    }

    // Get real-time price (latest candle)
    async getCurrentPrice(timeframe = '1') {
        try {
            const data = await this.fetchMarketData(timeframe, false);
            if (data && data.length > 0) {
                return data[data.length - 1];
            }
        } catch (error) {
            console.error('Error fetching current price:', error);
        }
        
        // Fallback to demo data
        const demoData = this.generateDemoData(timeframe, 1);
        return demoData[0];
    }

    // Parse different API response formats
    parseAlphaVantageData(data, symbol = CONFIG.CURRENT_SYMBOL) {
        const symbolConfig = CONFIG.SYMBOLS[symbol];
        
        if (symbolConfig?.type === 'crypto') {
            // Handle crypto data format
            const timeSeries = data['Time Series (Digital Currency Intraday)'];
            if (!timeSeries) return [];
            
            return Object.entries(timeSeries)
                .map(([timestamp, values]) => ({
                    timestamp: new Date(timestamp).toISOString(),
                    open: parseFloat(values['1a. open (USD)']),
                    high: parseFloat(values['2a. high (USD)']),
                    low: parseFloat(values['3a. low (USD)']),
                    close: parseFloat(values['4a. close (USD)']),
                    volume: Math.floor(Math.random() * 1000000 + 500000)
                }))
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        
        // Handle forex data format
        const timeSeries = data['Time Series FX (1min)'] || 
                          data['Time Series FX (5min)'] || 
                          data['Time Series FX (15min)'] || 
                          data['Time Series FX (30min)'] || 
                          data['Time Series FX (60min)'] ||
                          data['Time Series FX (Daily)'];
        
        if (!timeSeries) return [];

        return Object.entries(timeSeries)
            .map(([timestamp, values]) => ({
                timestamp: new Date(timestamp).toISOString(),
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: Math.floor(Math.random() * 1000000 + 500000) // Alpha Vantage doesn't provide forex volume
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    parseTwelveDataData(data) {
        if (!data.values) return [];

        return data.values
            .map(item => ({
                timestamp: new Date(item.datetime).toISOString(),
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: parseInt(item.volume) || Math.floor(Math.random() * 1000000 + 500000)
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    parseFMPData(data) {
        if (!Array.isArray(data)) return [];

        return data
            .map(item => ({
                timestamp: new Date(item.date).toISOString(),
                open: parseFloat(item.open),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                close: parseFloat(item.close),
                volume: Math.floor(Math.random() * 1000000 + 500000)
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // Map timeframe to API specific intervals
    mapTimeframeToAlphaVantage(timeframe) {
        const mapping = {
            '1': '1min',
            '5': '5min',
            '15': '15min',
            '30': '30min',
            '60': '60min',
            '240': '60min', // Will need aggregation
            '1440': 'daily',
            '10080': 'weekly'
        };
        return mapping[timeframe] || '60min';
    }

    mapTimeframeToTwelveData(timeframe) {
        const mapping = {
            '1': '1min',
            '5': '5min',
            '15': '15min',
            '30': '30min',
            '60': '1h',
            '240': '4h',
            '1440': '1day',
            '10080': '1week'
        };
        return mapping[timeframe] || '1h';
    }

    mapTimeframeToFMP(timeframe) {
        const mapping = {
            '1': '1min',
            '5': '5min',
            '15': '15min',
            '30': '30min',
            '60': '1hour',
            '240': '4hour',
            '1440': '1day',
            '10080': '1week'
        };
        return mapping[timeframe] || '1hour';
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    // Get cache status
    getCacheStatus() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    // Show/hide demo data indicator
    showDemoIndicator(show) {
        const indicator = document.getElementById('demo-indicator');
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
    }

    // Clean up
    destroy() {
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        this.clearCache();
        console.log('DataFetcher destroyed');
    }
}

// Create global instance
window.dataFetcher = new DataFetcher();