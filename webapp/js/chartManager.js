// Chart Manager for XAUUSD Live Trading App
class ChartManager {
    constructor() {
        this.mainChart = null;
        this.subCharts = {};
        this.currentTimeframe = '60';
        this.currentChartType = 'candlestick';
        this.enabledIndicators = new Set();
        this.chartData = [];
        this.indicators = {};
        this.isInitialized = false;

        // Chart.js registration
        this.registerChartJS();
        
        console.log('ChartManager initialized');
    }

    registerChartJS() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js not loaded');
        }
        
        try {
            // Register Chart.js components
            Chart.register(
                ...Object.values(Chart.controllers),
                ...Object.values(Chart.elements),
                ...Object.values(Chart.plugins),
                ...Object.values(Chart.scales)
            );
            
            console.log('Chart.js components registered successfully');
        } catch (error) {
            console.error('Error registering Chart.js components:', error);
            throw error;
        }
    }

    // Initialize all charts
    async initialize() {
        try {
            await this.initializeMainChart();
            this.initializeSubCharts();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Charts initialized successfully');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    // Initialize main candlestick chart
    async initializeMainChart() {
        const ctx = document.getElementById('main-chart');
        if (!ctx) throw new Error('Main chart canvas not found');

        // Fetch initial data
        await this.loadChartData(this.currentTimeframe);

        // Check if candlestick chart type is available
        const chartType = Chart.registry.getController('candlestick') ? 'candlestick' : 'line';
        if (chartType === 'line') {
            console.warn('Candlestick chart not available, using line chart as fallback');
        }

        const config = {
            type: chartType,
            data: {
                datasets: [{
                    label: 'XAUUSD',
                    data: chartType === 'candlestick' ? this.prepareOHLCData() : this.prepareLineData(),
                    borderColor: CONFIG.CHART.COLORS.ACCENT,
                    backgroundColor: chartType === 'candlestick' ? 'transparent' : CONFIG.CHART.COLORS.ACCENT + '20',
                    fill: chartType === 'line'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(22, 28, 36, 0.95)',
                        titleColor: CONFIG.CHART.COLORS.TEXT,
                        bodyColor: CONFIG.CHART.COLORS.TEXT,
                        borderColor: CONFIG.CHART.COLORS.GRID,
                        borderWidth: 1,
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].raw.x);
                                return date.toLocaleString();
                            },
                            beforeBody: () => 'XAUUSD',
                            body: (context) => {
                                const data = context[0].raw;
                                return [
                                    `Open: ${data.o?.toFixed(2) || 'N/A'}`,
                                    `High: ${data.h?.toFixed(2) || 'N/A'}`,
                                    `Low: ${data.l?.toFixed(2) || 'N/A'}`,
                                    `Close: ${data.c?.toFixed(2) || 'N/A'}`,
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: this.getTimeUnit(this.currentTimeframe)
                        },
                        grid: {
                            color: CONFIG.CHART.COLORS.GRID,
                            drawOnChartArea: true
                        },
                        ticks: {
                            color: CONFIG.CHART.COLORS.TEXT,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'right',
                        grid: {
                            color: CONFIG.CHART.COLORS.GRID,
                            drawOnChartArea: true
                        },
                        ticks: {
                            color: CONFIG.CHART.COLORS.TEXT,
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    }
                }
            }
        };

        this.mainChart = new Chart(ctx, config);
    }

    // Initialize sub charts (RSI, MACD, Volume)
    initializeSubCharts() {
        this.initializeRSIChart();
        this.initializeMACDChart();
        this.initializeVolumeChart();
    }

    initializeRSIChart() {
        const ctx = document.getElementById('rsi-chart');
        if (!ctx) return;

        const config = {
            type: 'line',
            data: {
                labels: this.chartData.map(d => d.timestamp),
                datasets: [{
                    label: 'RSI',
                    data: this.indicators.rsi || [],
                    borderColor: CONFIG.CHART.COLORS.INDICATORS.RSI,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(22, 28, 36, 0.95)',
                        titleColor: CONFIG.CHART.COLORS.TEXT,
                        bodyColor: CONFIG.CHART.COLORS.TEXT
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        min: 0,
                        max: 100,
                        position: 'right',
                        grid: {
                            color: CONFIG.CHART.COLORS.GRID
                        },
                        ticks: {
                            color: CONFIG.CHART.COLORS.TEXT,
                            stepSize: 25
                        }
                    }
                }
            }
        };

        // Add overbought/oversold lines
        config.options.plugins.annotation = {
            annotations: {
                overbought: {
                    type: 'line',
                    yMin: 70,
                    yMax: 70,
                    borderColor: 'rgba(239, 83, 80, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5]
                },
                oversold: {
                    type: 'line',
                    yMin: 30,
                    yMax: 30,
                    borderColor: 'rgba(38, 166, 154, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5]
                }
            }
        };

        this.subCharts.rsi = new Chart(ctx, config);
    }

    initializeMACDChart() {
        const ctx = document.getElementById('macd-chart');
        if (!ctx) return;

        const macdData = this.indicators.macd || { macd: [], signal: [], histogram: [] };

        const config = {
            type: 'line',
            data: {
                labels: this.chartData.map(d => d.timestamp),
                datasets: [
                    {
                        label: 'MACD',
                        data: macdData.macd,
                        borderColor: CONFIG.CHART.COLORS.INDICATORS.MACD_LINE,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Signal',
                        data: macdData.signal,
                        borderColor: CONFIG.CHART.COLORS.INDICATORS.MACD_SIGNAL,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Histogram',
                        type: 'bar',
                        data: macdData.histogram,
                        backgroundColor: CONFIG.CHART.COLORS.INDICATORS.MACD_HISTOGRAM,
                        borderWidth: 0,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(22, 28, 36, 0.95)',
                        titleColor: CONFIG.CHART.COLORS.TEXT,
                        bodyColor: CONFIG.CHART.COLORS.TEXT
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: CONFIG.CHART.COLORS.GRID
                        },
                        ticks: {
                            color: CONFIG.CHART.COLORS.TEXT
                        }
                    }
                }
            }
        };

        this.subCharts.macd = new Chart(ctx, config);
    }

    initializeVolumeChart() {
        const ctx = document.getElementById('volume-chart');
        if (!ctx) return;

        const config = {
            type: 'bar',
            data: {
                labels: this.chartData.map(d => d.timestamp),
                datasets: [{
                    label: 'Volume',
                    data: this.chartData.map(d => d.volume),
                    backgroundColor: CONFIG.CHART.COLORS.INDICATORS.VOLUME,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(22, 28, 36, 0.95)',
                        titleColor: CONFIG.CHART.COLORS.TEXT,
                        bodyColor: CONFIG.CHART.COLORS.TEXT,
                        callbacks: {
                            label: (context) => {
                                return `Volume: ${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: CONFIG.CHART.COLORS.GRID
                        },
                        ticks: {
                            color: CONFIG.CHART.COLORS.TEXT,
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        };

        this.subCharts.volume = new Chart(ctx, config);
    }

    // Load chart data for specified timeframe
    async loadChartData(timeframe, useCache = true) {
        try {
            this.showLoading(true);
            this.chartData = await window.dataFetcher.fetchMarketData(timeframe, useCache);
            
            if (this.chartData && this.chartData.length > 0) {
                // Calculate all indicators
                this.indicators = window.technicalIndicators.calculateAllIndicators(
                    this.chartData,
                    CONFIG.INDICATORS
                );
                
                this.updatePriceDisplay();
                this.updateMarketData();
                console.log(`Loaded ${this.chartData.length} data points for ${timeframe}m timeframe`);
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
            this.showError(true);
        } finally {
            this.showLoading(false);
        }
    }

    // Prepare OHLC data for Chart.js
    prepareOHLCData() {
        if (!this.chartData || this.chartData.length === 0) return [];

        return this.chartData.map(item => ({
            x: new Date(item.timestamp).getTime(),
            o: item.open,
            h: item.high,
            l: item.low,
            c: item.close
        }));
    }

    // Prepare line data (close prices) for fallback
    prepareLineData() {
        if (!this.chartData || this.chartData.length === 0) return [];

        return this.chartData.map(item => ({
            x: new Date(item.timestamp).getTime(),
            y: item.close
        }));
    }

    // Update charts with new data
    updateCharts() {
        if (!this.isInitialized) return;

        try {
            this.updateMainChart();
            this.updateSubCharts();
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    updateMainChart() {
        if (!this.mainChart) return;

        // Update main dataset based on chart type
        const isCandlestick = this.mainChart.config.type === 'candlestick';
        this.mainChart.data.datasets[0].data = isCandlestick ? 
            this.prepareOHLCData() : 
            this.prepareLineData();

        // Update indicator datasets
        this.updateIndicatorDatasets();

        this.mainChart.update('none');
    }

    updateIndicatorDatasets() {
        if (!this.mainChart) return;

        const datasets = this.mainChart.data.datasets;
        
        // Remove existing indicator datasets
        this.mainChart.data.datasets = datasets.filter(dataset => 
            dataset.label === 'XAUUSD' || dataset.yAxisID === 'y'
        );

        const timestamps = this.chartData.map(d => new Date(d.timestamp).getTime());

        // Add enabled indicators
        if (this.enabledIndicators.has('sma20') && this.indicators.sma20) {
            this.addLineDataset('SMA 20', this.indicators.sma20, timestamps, CONFIG.CHART.COLORS.INDICATORS.SMA20);
        }

        if (this.enabledIndicators.has('sma50') && this.indicators.sma50) {
            this.addLineDataset('SMA 50', this.indicators.sma50, timestamps, CONFIG.CHART.COLORS.INDICATORS.SMA50);
        }

        if (this.enabledIndicators.has('ema20') && this.indicators.ema20) {
            this.addLineDataset('EMA 20', this.indicators.ema20, timestamps, CONFIG.CHART.COLORS.INDICATORS.EMA20);
        }

        if (this.enabledIndicators.has('bollinger') && this.indicators.bollinger) {
            this.addBollingerBands(timestamps);
        }
    }

    addLineDataset(label, data, timestamps, color) {
        const dataset = {
            label: label,
            type: 'line',
            data: timestamps.map((timestamp, index) => ({
                x: timestamp,
                y: data[index]
            })).filter(point => point.y !== null),
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y'
        };

        this.mainChart.data.datasets.push(dataset);
    }

    addBollingerBands(timestamps) {
        const { upper, middle, lower } = this.indicators.bollinger;

        // Upper band
        this.addLineDataset('BB Upper', upper, timestamps, CONFIG.CHART.COLORS.INDICATORS.BOLLINGER_UPPER);
        
        // Middle band
        this.addLineDataset('BB Middle', middle, timestamps, CONFIG.CHART.COLORS.INDICATORS.BOLLINGER_MIDDLE);
        
        // Lower band
        this.addLineDataset('BB Lower', lower, timestamps, CONFIG.CHART.COLORS.INDICATORS.BOLLINGER_LOWER);
    }

    updateSubCharts() {
        // Update RSI chart
        if (this.subCharts.rsi && this.indicators.rsi) {
            this.subCharts.rsi.data.labels = this.chartData.map(d => d.timestamp);
            this.subCharts.rsi.data.datasets[0].data = this.indicators.rsi;
            this.subCharts.rsi.update('none');
            
            // Update RSI value display
            const latestRSI = this.indicators.rsi[this.indicators.rsi.length - 1];
            const rsiElement = document.getElementById('rsi-value');
            if (rsiElement && latestRSI !== null) {
                rsiElement.textContent = latestRSI.toFixed(1);
            }
        }

        // Update MACD chart
        if (this.subCharts.macd && this.indicators.macd) {
            const macdData = this.indicators.macd;
            this.subCharts.macd.data.labels = this.chartData.map(d => d.timestamp);
            this.subCharts.macd.data.datasets[0].data = macdData.macd;
            this.subCharts.macd.data.datasets[1].data = macdData.signal;
            this.subCharts.macd.data.datasets[2].data = macdData.histogram;
            this.subCharts.macd.update('none');
            
            // Update MACD value display
            const latestMACD = macdData.macd[macdData.macd.length - 1];
            const macdElement = document.getElementById('macd-value');
            if (macdElement && latestMACD !== null) {
                macdElement.textContent = latestMACD.toFixed(4);
            }
        }

        // Update Volume chart
        if (this.subCharts.volume) {
            this.subCharts.volume.data.labels = this.chartData.map(d => d.timestamp);
            this.subCharts.volume.data.datasets[0].data = this.chartData.map(d => d.volume);
            this.subCharts.volume.update('none');
            
            // Update volume value display
            const latestVolume = this.chartData[this.chartData.length - 1]?.volume;
            const volumeElement = document.getElementById('volume-value');
            if (volumeElement && latestVolume) {
                volumeElement.textContent = (latestVolume / 1000).toFixed(0) + 'K';
            }
        }
    }

    // Change timeframe
    async changeTimeframe(newTimeframe) {
        if (this.currentTimeframe === newTimeframe) return;

        this.currentTimeframe = newTimeframe;
        await this.loadChartData(newTimeframe);
        
        if (this.isInitialized) {
            this.updateCharts();
            this.updateTimeframeDisplay();
        }
    }

    // Toggle indicators
    toggleIndicator(indicator) {
        if (this.enabledIndicators.has(indicator)) {
            this.enabledIndicators.delete(indicator);
        } else {
            this.enabledIndicators.add(indicator);
        }

        if (this.isInitialized) {
            this.updateCharts();
        }

        console.log(`Indicator ${indicator} ${this.enabledIndicators.has(indicator) ? 'enabled' : 'disabled'}`);
    }

    // Update price display
    updatePriceDisplay() {
        if (!this.chartData || this.chartData.length === 0) return;

        const latestData = this.chartData[this.chartData.length - 1];
        const previousData = this.chartData[this.chartData.length - 2];
        
        if (!latestData || !previousData) return;

        const currentPrice = latestData.close;
        const change = currentPrice - previousData.close;
        const changePercent = (change / previousData.close) * 100;

        // Update price
        const priceElement = document.getElementById('current-price');
        if (priceElement) {
            priceElement.textContent = CONFIG.utils.formatPrice(currentPrice);
        }

        // Update change
        const changeElement = document.getElementById('price-change');
        if (changeElement) {
            changeElement.textContent = CONFIG.utils.formatChange(change, changePercent);
            changeElement.className = 'change ' + (change >= 0 ? 'positive' : 'negative');
        }

        // Update last update time
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = CONFIG.utils.formatTime(Date.now());
        }
    }

    // Update market data display
    updateMarketData() {
        if (!this.chartData || this.chartData.length === 0) return;

        const latestData = this.chartData[this.chartData.length - 1];
        
        // Get daily data
        const today = new Date().toDateString();
        const todayData = this.chartData.filter(d => 
            new Date(d.timestamp).toDateString() === today
        );

        if (todayData.length > 0) {
            const dayOpen = todayData[0].open;
            const dayHigh = Math.max(...todayData.map(d => d.high));
            const dayLow = Math.min(...todayData.map(d => d.low));
            
            // Update market data elements
            this.updateElement('day-open', CONFIG.utils.formatPrice(dayOpen));
            this.updateElement('day-high', CONFIG.utils.formatPrice(dayHigh));
            this.updateElement('day-low', CONFIG.utils.formatPrice(dayLow));
        }

        // Update volume
        if (latestData.volume) {
            this.updateElement('volume', (latestData.volume / 1000000).toFixed(2) + 'M');
        }

        // Update ATR
        if (this.indicators.atr) {
            const latestATR = this.indicators.atr[this.indicators.atr.length - 1];
            if (latestATR !== null) {
                this.updateElement('atr', latestATR.toFixed(2));
            }
        }

        // Update volatility (based on recent price movements)
        const recentData = this.chartData.slice(-20);
        if (recentData.length > 1) {
            const volatility = this.calculateVolatility(recentData);
            this.updateElement('volatility', (volatility * 100).toFixed(2) + '%');
        }
    }

    calculateVolatility(data) {
        if (data.length < 2) return 0;

        const returns = [];
        for (let i = 1; i < data.length; i++) {
            const return_ = Math.log(data[i].close / data[i - 1].close);
            returns.push(return_);
        }

        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Update timeframe display
    updateTimeframeDisplay() {
        const timeframeInfo = CONFIG.CHART.TIMEFRAMES[this.currentTimeframe];
        const element = document.getElementById('chart-timeframe');
        if (element && timeframeInfo) {
            element.textContent = timeframeInfo.label;
        }
    }

    // Get appropriate time unit for Chart.js
    getTimeUnit(timeframe) {
        const minutes = parseInt(timeframe);
        if (minutes < 60) return 'minute';
        if (minutes < 1440) return 'hour';
        if (minutes < 10080) return 'day';
        return 'week';
    }

    // Setup event listeners
    setupEventListeners() {
        // Timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeframe = e.target.dataset.timeframe;
                this.changeTimeframe(timeframe);
                
                // Update active button
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Indicator checkboxes
        document.querySelectorAll('input[data-indicator]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const indicator = e.target.dataset.indicator;
                this.toggleIndicator(indicator);
            });
        });

        // Chart type buttons
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.type;
                this.changeChartType(chartType);
                
                // Update active button
                document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.showError(false);
                this.loadChartData(this.currentTimeframe, false);
            });
        }
    }

    // Change chart type
    changeChartType(type) {
        this.currentChartType = type;
        // Implementation for different chart types would go here
        console.log(`Chart type changed to: ${type}`);
    }

    // Show/hide loading overlay
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Show/hide error overlay
    showError(show) {
        const overlay = document.getElementById('error-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Cleanup
    destroy() {
        if (this.mainChart) {
            this.mainChart.destroy();
        }
        
        Object.values(this.subCharts).forEach(chart => {
            if (chart) chart.destroy();
        });

        console.log('ChartManager destroyed');
    }
}

// Create global instance
window.chartManager = new ChartManager();