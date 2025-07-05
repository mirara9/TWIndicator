# XAUUSD Live Trading Chart - Quick Start Guide

## 🚀 One-Click Startup

### Windows Users
1. **Double-click** `start-server.bat`
2. **Wait** for the server to start (browser will open automatically)
3. **Access** your app at `http://localhost:8080`

### Linux/macOS Users
1. **Open terminal** in the webapp folder
2. **Run** `./start-server.sh`
3. **Access** your app at `http://localhost:8080`

## 📋 Requirements

### Minimum Requirements
- **Python 3.7+** (recommended) or **Python 2.7+**
- **Web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** for live data (works offline with demo data)

### Optional Requirements
- **Node.js** (alternative server)
- **PHP** (alternative server)
- **Ruby** (alternative server)

## 🔧 Installation

### Windows
1. **Download Python** from [python.org](https://www.python.org/downloads/)
2. **Check** "Add Python to PATH" during installation
3. **Verify** installation: Open Command Prompt and type `python --version`

### Linux (Ubuntu/Debian)
```bash
# Install Python 3
sudo apt-get update
sudo apt-get install python3

# Verify installation
python3 --version
```

### macOS
```bash
# Install Python 3 using Homebrew
brew install python3

# Verify installation
python3 --version
```

## 🌐 Server Options

The startup scripts automatically detect and use the best available server:

### Priority Order
1. **Python 3** - `python3 -m http.server`
2. **Python 2** - `python -m SimpleHTTPServer`
3. **Node.js** - `npx http-server` (requires npm)
4. **PHP** - `php -S localhost:8080`
5. **Ruby** - `ruby -run -e httpd`

## 🔑 API Configuration

### Get Free API Keys
1. **Alpha Vantage**: [alphavantage.co](https://www.alphavantage.co/support/#api-key)
   - Free: 500 calls/day
   - 5 calls/minute

2. **Twelve Data**: [twelvedata.com](https://twelvedata.com/pricing)
   - Free: 800 calls/day
   - 8 calls/minute

3. **Financial Modeling Prep**: [financialmodelingprep.com](https://financialmodelingprep.com/developer/docs)
   - Free: 250 calls/day
   - No rate limit

### Configure API Keys
1. **Open** `js/config.js`
2. **Replace** `'demo'` with your actual API keys:
```javascript
CONFIG.API.ALPHA_VANTAGE.API_KEY = 'YOUR_ALPHA_VANTAGE_KEY';
CONFIG.API.TWELVE_DATA.API_KEY = 'YOUR_TWELVE_DATA_KEY';
CONFIG.API.FMP.API_KEY = 'YOUR_FMP_KEY';
```

## 📱 Device Compatibility

### Desktop
- **Windows 10+** ✅
- **macOS 10.15+** ✅
- **Linux** (Ubuntu, Debian, CentOS) ✅

### Mobile
- **iOS Safari 13+** ✅
- **Android Chrome 80+** ✅
- **Responsive design** adapts to all screen sizes

### Browsers
- **Chrome 80+** ✅
- **Firefox 75+** ✅
- **Safari 13+** ✅
- **Edge 80+** ✅

## 🚨 Troubleshooting

### Server Won't Start
**Problem**: "Python is not installed or not in PATH"
**Solution**: Install Python and add to PATH

**Problem**: "Port 8080 is already in use"
**Solution**: Script automatically tries ports 8081, 8082, etc.

**Problem**: "index.html not found"
**Solution**: Make sure you're running the script from the `webapp` folder

### No Data Loading
**Problem**: Charts show "Loading..." indefinitely
**Solution**: 
1. Check internet connection
2. Verify API keys in `js/config.js`
3. App will use demo data as fallback

### Browser Compatibility
**Problem**: App doesn't work in older browsers
**Solution**: Use modern browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

## 🎯 Quick Test

1. **Start server** using appropriate script
2. **Open browser** to `http://localhost:8080`
3. **Verify** you see the XAUUSD chart interface
4. **Test** timeframe switching (M1, M5, M15, etc.)
5. **Toggle** indicators (RSI, MACD, Bollinger Bands)

## 📞 Support

### Common Issues
- **CORS errors**: Use the provided scripts (don't open HTML directly)
- **API rate limits**: Scripts automatically switch to demo data
- **Mobile display**: App is fully responsive

### Resources
- **Full Documentation**: `README.md`
- **Configuration**: `js/config.js`
- **Technical Support**: Check browser console for errors

## 🎉 Success!

If you can see the XAUUSD chart with real-time data and working controls, your installation is successful!

**Next Steps:**
1. Configure API keys for real data
2. Customize indicators and timeframes
3. Use on mobile devices
4. Deploy to web hosting for public access

---

*Enjoy trading with your professional XAUUSD chart application!*