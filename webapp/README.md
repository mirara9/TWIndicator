# XAUUSD Live Trading Chart Web Application

A comprehensive real-time XAUUSD (Gold/USD) trading chart application built with vanilla JavaScript, featuring multiple timeframes, technical indicators, and TradingView-like functionality.

## 🚀 Features

### Real-Time Data
- **Live XAUUSD Price Updates**: Real-time price feeds with automatic refresh
- **Multiple Data Sources**: Alpha Vantage, Twelve Data, Financial Modeling Prep APIs
- **Fallback Demo Data**: Works offline with realistic generated data
- **Smart Caching**: Intelligent data caching for optimal performance

### Advanced Charting
- **Multiple Timeframes**: M1, M5, M15, M30, H1, H4, D1, W1
- **Chart Types**: Candlestick, Line, Area charts
- **Interactive Charts**: Zoom, pan, hover tooltips
- **Professional Design**: Dark theme optimized for trading

### Technical Analysis
- **Moving Averages**: SMA 20/50, EMA 20
- **Bollinger Bands**: Dynamic volatility bands
- **Oscillators**: RSI, MACD, Stochastic
- **Volume Analysis**: Real-time volume charts
- **Support/Resistance**: Automatic level detection

### Trading Features
- **Market Sessions**: Asian, London, New York session tracking
- **Market Status**: Live open/closed status
- **Price Alerts**: Visual and audio notifications
- **Performance Metrics**: ATR, Volatility, Daily OHLC

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Fast navigation and control
- **User Preferences**: Settings saved locally
- **Offline Capability**: Functions without internet connection

## 📁 File Structure

```
webapp/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── js/
│   ├── config.js           # Configuration and API settings
│   ├── dataFetcher.js      # Data fetching and API management
│   ├── indicators.js       # Technical indicators calculator
│   ├── chartManager.js     # Chart management and rendering
│   └── app.js              # Main application controller
└── README.md               # This file
```

## 🔧 Setup Instructions

### 1. API Configuration

The application supports multiple data providers. Edit `js/config.js` to configure:

```javascript
// Replace 'demo' with your actual API keys
CONFIG.API.ALPHA_VANTAGE.API_KEY = 'your_alpha_vantage_key';
CONFIG.API.TWELVE_DATA.API_KEY = 'your_twelve_data_key';
CONFIG.API.FMP.API_KEY = 'your_fmp_key';
```

#### Free API Key Sources:
- **Alpha Vantage**: https://www.alphavantage.co/support/#api-key (500 calls/day)
- **Twelve Data**: https://twelvedata.com/pricing (800 calls/day)
- **Financial Modeling Prep**: https://financialmodelingprep.com/developer/docs (250 calls/day)

### 2. Local Development

#### Option A: Simple HTTP Server
```bash
# Python 3
cd webapp
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server -p 8000
```

#### Option B: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

### 3. Web Server Deployment

Upload all files to your web server maintaining the directory structure:

```
your-domain.com/
├── index.html
├── styles.css
└── js/
    ├── config.js
    ├── dataFetcher.js
    ├── indicators.js
    ├── chartManager.js
    └── app.js
```

## 🎯 Usage Guide

### Basic Navigation

#### Timeframe Selection
- **M1-W1 Buttons**: Click timeframe buttons in sidebar
- **Keyboard Shortcuts**: 
  - `1` = M1, `2` = M5, `3` = M15, `4` = H1

#### Chart Controls
- **Zoom In/Out**: Use toolbar buttons or mouse wheel
- **Reset Zoom**: Reset button in toolbar
- **Fullscreen**: F11 or fullscreen button

#### Indicators
- **Toggle On/Off**: Check/uncheck indicator boxes
- **Available Indicators**:
  - Moving Averages (SMA 20/50, EMA 20)
  - Bollinger Bands
  - RSI (14-period)
  - MACD (12,26,9)

### Advanced Features

#### Market Sessions
- **Session Tracking**: Automatically detects current trading session
- **Visual Indicators**: Green = Open, Gray = Closed
- **Session Times** (GMT):
  - Asian: 22:00-08:00
  - London: 08:00-17:00
  - New York: 13:00-22:00

#### Real-Time Updates
- **Auto Refresh**: Updates every minute (configurable)
- **Live Status**: Connection indicator bottom-right
- **Smart Pausing**: Stops updates when tab inactive

#### Responsive Design
- **Desktop**: Full sidebar with all features
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu navigation

## ⚙️ Configuration Options

### Update Frequency
```javascript
// In config.js
CONFIG.CHART.UPDATE_INTERVAL = 60000; // 1 minute (in milliseconds)
```

### Chart Appearance
```javascript
// In config.js
CONFIG.CHART.COLORS = {
    BULLISH: '#26a69a',      // Green candles
    BEARISH: '#ef5350',      // Red candles
    BACKGROUND: '#0d1421',   // Chart background
    ACCENT: '#f7931e'        // Gold accent color
};
```

### Demo Data Settings
```javascript
// In config.js
CONFIG.API.USE_DEMO_DATA = true;        // Enable demo mode
CONFIG.API.DEMO_BASE_PRICE = 2050.00;   // Starting price
CONFIG.API.DEMO_VOLATILITY = 0.02;      // Price volatility
```

## 🔌 API Integration

### Data Source Priority
1. **Alpha Vantage** (Primary)
2. **Twelve Data** (Secondary)
3. **Financial Modeling Prep** (Tertiary)
4. **Demo Data** (Fallback)

### API Limitations
- **Alpha Vantage**: 5 requests/minute, 500/day
- **Twelve Data**: 8 requests/minute, 800/day
- **FMP**: No rate limit, 250/day
- **Demo Mode**: Unlimited, works offline

### Error Handling
- **Automatic Fallback**: Switches to backup APIs on failure
- **Smart Retry**: Exponential backoff for failed requests
- **Cache Management**: Reduces API calls with intelligent caching

## 📱 Mobile Support

### Touch Gestures
- **Pinch to Zoom**: Zoom in/out on charts
- **Swipe**: Pan across chart timeline
- **Tap**: Access tooltips and data points

### Mobile Features
- **Responsive Layout**: Optimized for small screens
- **Touch-Friendly**: Large buttons and controls
- **Sidebar Toggle**: Hamburger menu navigation
- **Portrait/Landscape**: Adapts to orientation changes

## 🛠️ Technical Details

### Browser Compatibility
- **Chrome**: 80+ ✅
- **Firefox**: 75+ ✅
- **Safari**: 13+ ✅
- **Edge**: 80+ ✅

### Dependencies
- **Chart.js**: Charting library (loaded from CDN)
- **date-fns**: Date manipulation (loaded from CDN)
- **No jQuery**: Pure vanilla JavaScript

### Performance
- **Lazy Loading**: Charts initialized on demand
- **Data Pagination**: Limited candles for performance
- **Memory Management**: Automatic cleanup and garbage collection
- **Efficient Updates**: Only redraws changed data

## 🔒 Security & Privacy

### Data Protection
- **No Server**: Runs entirely in browser
- **Local Storage**: Preferences saved locally only
- **API Keys**: Client-side only (consider server proxy for production)
- **No Tracking**: No analytics or user tracking

### Best Practices
- **HTTPS Required**: Use HTTPS for production deployment
- **API Key Security**: Consider server-side proxy for API calls
- **CSP Headers**: Implement Content Security Policy
- **Regular Updates**: Keep dependencies updated

## 🚀 Deployment Options

### Static Hosting (Recommended)
- **Netlify**: Drag & drop deployment
- **Vercel**: GitHub integration
- **GitHub Pages**: Free hosting
- **Firebase Hosting**: Google Cloud integration

### Traditional Web Hosting
- **Shared Hosting**: Upload via FTP/cPanel
- **VPS**: nginx or Apache configuration
- **CDN**: CloudFlare, AWS CloudFront

### Example nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/webapp;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # CORS headers for API calls
    location / {
        add_header Access-Control-Allow-Origin *;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### No Data Loading
- **Check API Keys**: Verify API keys in `config.js`
- **Network Issues**: Check browser console for CORS errors
- **Rate Limits**: Switch to demo mode if APIs exhausted

#### Chart Not Displaying
- **CDN Issues**: Check Chart.js loading in developer tools
- **JavaScript Errors**: Check browser console for errors
- **Canvas Support**: Ensure browser supports HTML5 canvas

#### Performance Issues
- **Reduce Timeframe**: Use longer timeframes (H4, D1)
- **Disable Indicators**: Turn off unused technical indicators
- **Clear Cache**: Refresh browser cache

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

### Error Reporting
Check browser Developer Tools → Console for detailed error messages.

## 📈 Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time streaming data
- **Advanced Indicators**: Fibonacci, Ichimoku, Elliott Wave
- **Trade Simulation**: Paper trading functionality
- **Price Alerts**: Email/SMS notifications
- **Multi-Symbol**: Support for additional instruments

### Contributing
This is a demonstration project. For production use:
1. Implement server-side API proxy
2. Add user authentication
3. Integrate with real trading APIs
4. Add comprehensive error tracking

## 📞 Support

### Resources
- **Chart.js Documentation**: https://www.chartjs.org/docs/
- **Technical Analysis**: https://www.investopedia.com/technical-analysis/
- **API Documentation**: Check respective provider docs

### Common Questions
- **Q: Can I add more timeframes?**
  A: Yes, modify `CONFIG.CHART.TIMEFRAMES` in config.js

- **Q: How to add custom indicators?**
  A: Extend the `TechnicalIndicators` class in indicators.js

- **Q: Is real money trading supported?**
  A: No, this is a chart display tool only

---

*This application is for educational and demonstration purposes. Always use proper risk management when trading financial instruments.*