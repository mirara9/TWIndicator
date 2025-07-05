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
    generateDemoData(timeframe = '60', count = 100) {
        const data = [];
        const now = new Date();
        const intervalMs = parseInt(timeframe) * 60 * 1000;
        let currentPrice = CONFIG.API.DEMO_BASE_PRICE;
        let trend = 0;

        for (let i = count - 1; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - (i * intervalMs));
            
            // Add some trend persistence
            if (Math.random() < 0.1) {
                trend = (Math.random() - 0.5) * 2;
            }
            
            // Generate OHLC data
            const volatility = this.getVolatilityForHour(timestamp.getUTCHours());
            const change = (Math.random() - 0.5 + trend * 0.3) * currentPrice * volatility;
            
            const open = currentPrice;
            const close = currentPrice + change;
            const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.5;
            const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.5;
            const volume = Math.floor(Math.random() * 1000000 + 500000);

            data.push({
                timestamp: timestamp.toISOString(),
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: volume
            });

            currentPrice = close;
        }

        return data;
    }

    getVolatilityForHour(hour) {
        const period = CONFIG.DEMO.VOLATILITY_PERIODS.find(p => 
            hour >= p.start && hour < p.end
        );
        return period ? CONFIG.API.DEMO_VOLATILITY * period.multiplier : CONFIG.API.DEMO_VOLATILITY;
    }

    // Fetch data from Alpha Vantage
    async fetchFromAlphaVantage(timeframe = '60') {
        try {
            const interval = this.mapTimeframeToAlphaVantage(timeframe);
            const url = CONFIG.buildAlphaVantageURL(CONFIG.API.ALPHA_VANTAGE.FUNCTIONS.INTRADAY, interval);
            
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
            
            return this.parseAlphaVantageData(data);
        } catch (error) {
            console.error('Alpha Vantage error:', error);
            throw error;
        }
    }

    // Fetch data from Twelve Data
    async fetchFromTwelveData(timeframe = '60') {
        try {
            const interval = this.mapTimeframeToTwelveData(timeframe);
            const url = CONFIG.buildTwelveDataURL(interval);
            
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
    async fetchFromFMP(timeframe = '60') {
        try {
            const interval = this.mapTimeframeToFMP(timeframe);
            const url = CONFIG.buildFMPURL(interval);
            
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
    async fetchMarketData(timeframe = '60', useCache = true) {
        const cacheKey = `market_data_${timeframe}`;
        
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

        // If offline, use demo data
        if (!this.isOnline) {
            console.log('Offline - using demo data');
            const demoData = this.generateDemoData(timeframe);
            this.cache.set(cacheKey, { data: demoData, timestamp: Date.now() });
            return demoData;
        }

        // Try APIs in order
        const apis = ['ALPHA_VANTAGE', 'TWELVE_DATA', 'FMP'];
        
        for (const api of apis) {
            if (this.failedAPIs.has(api)) continue;
            
            try {
                let data;
                
                switch (api) {
                    case 'ALPHA_VANTAGE':
                        data = await this.fetchFromAlphaVantage(timeframe);
                        break;
                    case 'TWELVE_DATA':
                        data = await this.fetchFromTwelveData(timeframe);
                        break;
                    case 'FMP':
                        data = await this.fetchFromFMP(timeframe);
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
        const demoData = this.generateDemoData(timeframe);
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
    parseAlphaVantageData(data) {
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