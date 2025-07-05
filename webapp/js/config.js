// Configuration for the Multi-Symbol Trading App
const CONFIG = {
    // Current symbol configuration
    CURRENT_SYMBOL: 'XAUUSD', // Default symbol
    
    // Supported symbols
    SYMBOLS: {
        XAUUSD: {
            name: 'Gold/USD',
            alphaVantageSymbol: 'XAU/USD',
            twelveDataSymbol: 'XAUUSD',
            fmpSymbol: 'XAUUSD',
            demoBasePrice: 2050.00,
            volatility: 0.02,
            precision: 2,
            type: 'forex'
        },
        BTCUSD: {
            name: 'Bitcoin/USD',
            alphaVantageSymbol: 'BTC/USD',
            twelveDataSymbol: 'BTCUSD',
            fmpSymbol: 'BTCUSD',
            demoBasePrice: 45000.00,
            volatility: 0.05,
            precision: 2,
            type: 'crypto'
        }
    },

    // API Configuration
    API: {
        // Primary API - Alpha Vantage (Free tier: 5 requests per minute, 500 per day)
        ALPHA_VANTAGE: {
            BASE_URL: 'https://www.alphavantage.co/query',
            API_KEY: 'demo', // Replace with your API key
            FUNCTIONS: {
                INTRADAY: 'FX_INTRADAY',
                DAILY: 'FX_DAILY',
                WEEKLY: 'FX_WEEKLY',
                MONTHLY: 'FX_MONTHLY',
                CRYPTO_INTRADAY: 'DIGITAL_CURRENCY_INTRADAY'
            }
        },
        
        // Backup API - Twelve Data (Free tier: 800 requests per day)
        TWELVE_DATA: {
            BASE_URL: 'https://api.twelvedata.com',
            API_KEY: '36FI206E7T1KVALG', // Your API key
            ENDPOINTS: {
                TIME_SERIES: '/time_series',
                REAL_TIME: '/price',
                TECHNICAL: '/technical_indicator'
            }
        },
        
        // Backup API - Financial Modeling Prep (Free tier: 250 requests per day)
        FMP: {
            BASE_URL: 'https://financialmodelingprep.com/api/v3',
            API_KEY: 'demo', // Replace with your API key
            ENDPOINTS: {
                FOREX: '/fx',
                HISTORICAL: '/historical-chart',
                CRYPTO: '/historical-price-full/crypto'
            }
        },
        
        // Fallback - Generate demo data if APIs fail
        USE_DEMO_DATA: true,
        FORCE_DEMO_MODE: false // Set to true to use demo data only (useful when API keys are 'demo')
    },

    // Chart Configuration
    CHART: {
        UPDATE_INTERVAL: 60000, // 1 minute in milliseconds
        MAX_CANDLES: 500, // Maximum number of candles to display
        
        TIMEFRAMES: {
            '1': { name: 'M1', minutes: 1, label: '1 Minute' },
            '5': { name: 'M5', minutes: 5, label: '5 Minutes' },
            '15': { name: 'M15', minutes: 15, label: '15 Minutes' },
            '30': { name: 'M30', minutes: 30, label: '30 Minutes' },
            '60': { name: 'H1', minutes: 60, label: '1 Hour' },
            '240': { name: 'H4', minutes: 240, label: '4 Hours' },
            '1440': { name: 'D1', minutes: 1440, label: '1 Day' },
            '10080': { name: 'W1', minutes: 10080, label: '1 Week' }
        },

        COLORS: {
            BULLISH: '#26a69a',
            BEARISH: '#ef5350',
            BACKGROUND: '#0d1421',
            GRID: 'rgba(42, 46, 57, 0.3)',
            TEXT: '#d1d4dc',
            ACCENT: '#f7931e',
            
            INDICATORS: {
                SMA20: '#2196f3',
                SMA50: '#ff9800',
                EMA20: '#9c27b0',
                BOLLINGER_UPPER: '#607d8b',
                BOLLINGER_LOWER: '#607d8b',
                BOLLINGER_MIDDLE: '#795548',
                RSI: '#e91e63',
                MACD_LINE: '#00bcd4',
                MACD_SIGNAL: '#ff5722',
                MACD_HISTOGRAM: '#4caf50',
                VOLUME: 'rgba(247, 147, 30, 0.5)'
            }
        }
    },

    // Trading Sessions (GMT)
    SESSIONS: {
        ASIAN: {
            name: 'Asian',
            start: 22, // 22:00 GMT
            end: 8,    // 08:00 GMT
            color: 'rgba(33, 150, 243, 0.1)'
        },
        LONDON: {
            name: 'London',
            start: 8,  // 08:00 GMT
            end: 17,   // 17:00 GMT
            color: 'rgba(76, 175, 80, 0.1)'
        },
        NEW_YORK: {
            name: 'New York',
            start: 13, // 13:00 GMT
            end: 22,   // 22:00 GMT
            color: 'rgba(255, 193, 7, 0.1)'
        }
    },

    // Technical Indicators Default Settings
    INDICATORS: {
        SMA20: { period: 20, enabled: false },
        SMA50: { period: 50, enabled: false },
        EMA20: { period: 20, enabled: false },
        BOLLINGER: { period: 20, deviation: 2, enabled: false },
        RSI: { period: 14, overbought: 70, oversold: 30, enabled: false },
        MACD: { fast: 12, slow: 26, signal: 9, enabled: false }
    },

    // App Settings
    APP: {
        AUTO_REFRESH: true,
        SOUND_ALERTS: false,
        DARK_THEME: true,
        SAVE_PREFERENCES: true,
        
        // Local Storage Keys
        STORAGE_KEYS: {
            PREFERENCES: 'xauusd_app_preferences',
            CHART_DATA: 'xauusd_chart_data',
            INDICATORS: 'xauusd_indicators'
        }
    },

    // Error Handling
    ERROR: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 5000, // 5 seconds
        FALLBACK_TO_DEMO: true
    },

    // Demo Data Configuration
    DEMO: {
        GENERATE_HISTORY_DAYS: 30,
        PRICE_CHANGE_PROBABILITY: 0.5,
        TREND_PERSISTENCE: 0.7,
        VOLATILITY_PERIODS: [
            { start: 8, end: 10, multiplier: 1.5 },  // London open
            { start: 13, end: 15, multiplier: 1.8 }, // NY open
            { start: 21, end: 23, multiplier: 0.6 }  // Asian session
        ]
    }
};

// Market hours checker
CONFIG.isMarketOpen = (symbol = CONFIG.CURRENT_SYMBOL) => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcDay = now.getUTCDay();
    const symbolConfig = CONFIG.SYMBOLS[symbol];
    
    if (!symbolConfig) return false;
    
    if (symbolConfig.type === 'crypto') {
        // Crypto markets are always open
        return true;
    } else {
        // Forex market is closed on weekends
        if (utcDay === 0 || utcDay === 6) return false;
        
        // Friday 22:00 UTC to Sunday 22:00 UTC market is closed
        if (utcDay === 5 && utcHour >= 22) return false;
        if (utcDay === 0 && utcHour < 22) return false;
        
        return true;
    }
};

// Get current trading session
CONFIG.getCurrentSession = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    const sessions = [];
    
    // Check Asian session (22:00-08:00)
    if (utcHour >= 22 || utcHour < 8) {
        sessions.push('ASIAN');
    }
    
    // Check London session (08:00-17:00)
    if (utcHour >= 8 && utcHour < 17) {
        sessions.push('LONDON');
    }
    
    // Check New York session (13:00-22:00)
    if (utcHour >= 13 && utcHour < 22) {
        sessions.push('NEW_YORK');
    }
    
    return sessions;
};

// Symbol management
CONFIG.getCurrentSymbolConfig = () => {
    return CONFIG.SYMBOLS[CONFIG.CURRENT_SYMBOL];
};

CONFIG.setCurrentSymbol = (symbol) => {
    if (CONFIG.SYMBOLS[symbol]) {
        CONFIG.CURRENT_SYMBOL = symbol;
        return true;
    }
    return false;
};

// API URL builders
CONFIG.buildAlphaVantageURL = (func, interval = '1min', symbol = CONFIG.CURRENT_SYMBOL) => {
    const symbolConfig = CONFIG.SYMBOLS[symbol];
    if (!symbolConfig) return null;
    
    let params;
    
    if (symbolConfig.type === 'crypto') {
        params = new URLSearchParams({
            function: CONFIG.API.ALPHA_VANTAGE.FUNCTIONS.CRYPTO_INTRADAY,
            symbol: symbolConfig.alphaVantageSymbol.split('/')[0], // BTC
            market: 'USD',
            interval: interval,
            apikey: CONFIG.API.ALPHA_VANTAGE.API_KEY
        });
    } else {
        const [fromSymbol, toSymbol] = symbolConfig.alphaVantageSymbol.split('/');
        params = new URLSearchParams({
            function: func,
            from_symbol: fromSymbol,
            to_symbol: toSymbol,
            interval: interval,
            apikey: CONFIG.API.ALPHA_VANTAGE.API_KEY,
            outputsize: 'compact'
        });
    }
    
    return `${CONFIG.API.ALPHA_VANTAGE.BASE_URL}?${params}`;
};

CONFIG.buildTwelveDataURL = (interval = '1min', outputsize = 'compact', symbol = CONFIG.CURRENT_SYMBOL) => {
    const symbolConfig = CONFIG.SYMBOLS[symbol];
    if (!symbolConfig) return null;
    
    const params = new URLSearchParams({
        symbol: symbolConfig.twelveDataSymbol,
        interval: interval,
        outputsize: outputsize,
        apikey: CONFIG.API.TWELVE_DATA.API_KEY
    });
    
    return `${CONFIG.API.TWELVE_DATA.BASE_URL}${CONFIG.API.TWELVE_DATA.ENDPOINTS.TIME_SERIES}?${params}`;
};

CONFIG.buildFMPURL = (timeframe = '1hour', symbol = CONFIG.CURRENT_SYMBOL) => {
    const symbolConfig = CONFIG.SYMBOLS[symbol];
    if (!symbolConfig) return null;
    
    if (symbolConfig.type === 'crypto') {
        return `${CONFIG.API.FMP.BASE_URL}${CONFIG.API.FMP.ENDPOINTS.CRYPTO}/${symbolConfig.fmpSymbol}?apikey=${CONFIG.API.FMP.API_KEY}`;
    } else {
        return `${CONFIG.API.FMP.BASE_URL}${CONFIG.API.FMP.ENDPOINTS.HISTORICAL}/${timeframe}/${symbolConfig.fmpSymbol}?apikey=${CONFIG.API.FMP.API_KEY}`;
    }
};

// Utility functions
CONFIG.utils = {
    formatPrice: (price, symbol = CONFIG.CURRENT_SYMBOL) => {
        const symbolConfig = CONFIG.SYMBOLS[symbol];
        const precision = symbolConfig ? symbolConfig.precision : 2;
        return parseFloat(price).toFixed(precision);
    },
    
    formatChange: (change, percentage) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${CONFIG.utils.formatPrice(change)} (${sign}${percentage.toFixed(2)}%)`;
    },
    
    formatTime: (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    },
    
    formatDate: (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    },
    
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}