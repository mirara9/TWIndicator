// Technical Indicators Calculator
class TechnicalIndicators {
    constructor() {
        this.cache = new Map();
    }

    // Simple Moving Average
    calculateSMA(data, period) {
        const cacheKey = `sma_${period}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                let sum = 0;
                for (let j = i - period + 1; j <= i; j++) {
                    sum += data[j].close;
                }
                result.push(sum / period);
            }
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    // Exponential Moving Average
    calculateEMA(data, period) {
        const cacheKey = `ema_${period}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = [];
        const multiplier = 2 / (period + 1);

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                result.push(data[i].close);
            } else {
                const ema = (data[i].close - result[i - 1]) * multiplier + result[i - 1];
                result.push(ema);
            }
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    // Bollinger Bands
    calculateBollingerBands(data, period = 20, deviation = 2) {
        const cacheKey = `bb_${period}_${deviation}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const sma = this.calculateSMA(data, period);
        const upper = [];
        const lower = [];
        const middle = sma;

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
                // Calculate standard deviation
                let sumSquares = 0;
                for (let j = i - period + 1; j <= i; j++) {
                    sumSquares += Math.pow(data[j].close - sma[i], 2);
                }
                const stdDev = Math.sqrt(sumSquares / period);
                
                upper.push(sma[i] + (deviation * stdDev));
                lower.push(sma[i] - (deviation * stdDev));
            }
        }

        const result = { upper, middle, lower };
        this.cache.set(cacheKey, result);
        return result;
    }

    // RSI (Relative Strength Index)
    calculateRSI(data, period = 14) {
        const cacheKey = `rsi_${period}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = [];
        const gains = [];
        const losses = [];

        // Calculate price changes
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        // Calculate RSI
        for (let i = 0; i < data.length; i++) {
            if (i < period) {
                result.push(null);
            } else {
                const gainIndex = i - 1; // Gains array is one element shorter
                let avgGain = 0;
                let avgLoss = 0;

                if (gainIndex === period - 1) {
                    // First RSI calculation
                    for (let j = 0; j < period; j++) {
                        avgGain += gains[j];
                        avgLoss += losses[j];
                    }
                    avgGain /= period;
                    avgLoss /= period;
                } else {
                    // Subsequent RSI calculations (smoothed)
                    const prevAvgGain = result[i - 1] ? 
                        (result[i - 1] * (period - 1) + gains[gainIndex]) / period :
                        gains[gainIndex];
                    const prevAvgLoss = result[i - 1] ? 
                        ((100 - result[i - 1]) / result[i - 1] * prevAvgGain * (period - 1) + losses[gainIndex]) / period :
                        losses[gainIndex];
                    
                    avgGain = prevAvgGain;
                    avgLoss = prevAvgLoss;
                }

                const rs = avgGain / (avgLoss || 0.001); // Avoid division by zero
                const rsi = 100 - (100 / (1 + rs));
                result.push(rsi);
            }
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    // MACD (Moving Average Convergence Divergence)
    calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const cacheKey = `macd_${fastPeriod}_${slowPeriod}_${signalPeriod}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const fastEMA = this.calculateEMA(data, fastPeriod);
        const slowEMA = this.calculateEMA(data, slowPeriod);
        
        // Calculate MACD line
        const macdLine = [];
        for (let i = 0; i < data.length; i++) {
            if (fastEMA[i] !== null && slowEMA[i] !== null) {
                macdLine.push(fastEMA[i] - slowEMA[i]);
            } else {
                macdLine.push(null);
            }
        }

        // Calculate signal line (EMA of MACD line)
        const validMacdData = macdLine.map((value, index) => ({
            close: value || 0,
            timestamp: data[index].timestamp
        }));
        
        const signalLine = this.calculateEMA(validMacdData, signalPeriod);

        // Calculate histogram
        const histogram = [];
        for (let i = 0; i < macdLine.length; i++) {
            if (macdLine[i] !== null && signalLine[i] !== null) {
                histogram.push(macdLine[i] - signalLine[i]);
            } else {
                histogram.push(null);
            }
        }

        const result = {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram
        };

        this.cache.set(cacheKey, result);
        return result;
    }

    // Average True Range (ATR)
    calculateATR(data, period = 14) {
        const cacheKey = `atr_${period}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const trueRanges = [];
        const result = [];

        // Calculate True Range
        for (let i = 1; i < data.length; i++) {
            const high = data[i].high;
            const low = data[i].low;
            const prevClose = data[i - 1].close;

            const tr1 = high - low;
            const tr2 = Math.abs(high - prevClose);
            const tr3 = Math.abs(low - prevClose);

            trueRanges.push(Math.max(tr1, tr2, tr3));
        }

        // Calculate ATR
        result.push(null); // First value is null
        
        for (let i = 0; i < trueRanges.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else if (i === period - 1) {
                // First ATR value (simple average)
                let sum = 0;
                for (let j = 0; j <= i; j++) {
                    sum += trueRanges[j];
                }
                result.push(sum / period);
            } else {
                // Subsequent ATR values (smoothed)
                const prevATR = result[result.length - 1];
                const currentTR = trueRanges[i];
                const atr = (prevATR * (period - 1) + currentTR) / period;
                result.push(atr);
            }
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    // Stochastic Oscillator
    calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
        const cacheKey = `stoch_${kPeriod}_${dPeriod}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const kPercent = [];
        
        // Calculate %K
        for (let i = 0; i < data.length; i++) {
            if (i < kPeriod - 1) {
                kPercent.push(null);
            } else {
                let highest = data[i].high;
                let lowest = data[i].low;
                
                for (let j = i - kPeriod + 1; j <= i; j++) {
                    highest = Math.max(highest, data[j].high);
                    lowest = Math.min(lowest, data[j].low);
                }
                
                const k = ((data[i].close - lowest) / (highest - lowest)) * 100;
                kPercent.push(k);
            }
        }

        // Calculate %D (SMA of %K)
        const dPercent = [];
        for (let i = 0; i < kPercent.length; i++) {
            if (i < dPeriod - 1 || kPercent[i] === null) {
                dPercent.push(null);
            } else {
                let sum = 0;
                let count = 0;
                for (let j = i - dPeriod + 1; j <= i; j++) {
                    if (kPercent[j] !== null) {
                        sum += kPercent[j];
                        count++;
                    }
                }
                dPercent.push(count > 0 ? sum / count : null);
            }
        }

        const result = {
            k: kPercent,
            d: dPercent
        };

        this.cache.set(cacheKey, result);
        return result;
    }

    // Williams %R
    calculateWilliamsR(data, period = 14) {
        const cacheKey = `williamsr_${period}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = [];

        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                let highest = data[i].high;
                let lowest = data[i].low;
                
                for (let j = i - period + 1; j <= i; j++) {
                    highest = Math.max(highest, data[j].high);
                    lowest = Math.min(lowest, data[j].low);
                }
                
                const williamsR = ((highest - data[i].close) / (highest - lowest)) * -100;
                result.push(williamsR);
            }
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    // Volume-weighted Average Price (VWAP)
    calculateVWAP(data) {
        const cacheKey = `vwap_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = [];
        let cumulativePriceVolume = 0;
        let cumulativeVolume = 0;

        for (let i = 0; i < data.length; i++) {
            const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
            const volume = data[i].volume;

            cumulativePriceVolume += typicalPrice * volume;
            cumulativeVolume += volume;

            const vwap = cumulativePriceVolume / cumulativeVolume;
            result.push(vwap);
        }

        this.cache.set(cacheKey, result);
        return result;
    }

    // Support and Resistance Levels
    calculateSupportResistance(data, lookback = 20, threshold = 0.1) {
        const cacheKey = `sr_${lookback}_${threshold}_${data.length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const supports = [];
        const resistances = [];

        for (let i = lookback; i < data.length - lookback; i++) {
            const currentLow = data[i].low;
            const currentHigh = data[i].high;
            
            let isSupport = true;
            let isResistance = true;

            // Check if current low is a support level
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j !== i && data[j].low < currentLow * (1 + threshold / 100)) {
                    isSupport = false;
                    break;
                }
            }

            // Check if current high is a resistance level
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j !== i && data[j].high > currentHigh * (1 - threshold / 100)) {
                    isResistance = false;
                    break;
                }
            }

            if (isSupport) {
                supports.push({
                    price: currentLow,
                    timestamp: data[i].timestamp,
                    index: i
                });
            }

            if (isResistance) {
                resistances.push({
                    price: currentHigh,
                    timestamp: data[i].timestamp,
                    index: i
                });
            }
        }

        const result = { supports, resistances };
        this.cache.set(cacheKey, result);
        return result;
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('Indicators cache cleared');
    }

    // Get all available indicators
    getAvailableIndicators() {
        return [
            'SMA', 'EMA', 'Bollinger Bands', 'RSI', 'MACD', 
            'ATR', 'Stochastic', 'Williams %R', 'VWAP', 'Support/Resistance'
        ];
    }

    // Calculate all indicators for a dataset
    calculateAllIndicators(data, config = {}) {
        const indicators = {};

        try {
            // Moving Averages
            indicators.sma20 = this.calculateSMA(data, config.sma20?.period || 20);
            indicators.sma50 = this.calculateSMA(data, config.sma50?.period || 50);
            indicators.ema20 = this.calculateEMA(data, config.ema20?.period || 20);

            // Bollinger Bands
            indicators.bollinger = this.calculateBollingerBands(
                data, 
                config.bollinger?.period || 20, 
                config.bollinger?.deviation || 2
            );

            // Oscillators
            indicators.rsi = this.calculateRSI(data, config.rsi?.period || 14);
            indicators.macd = this.calculateMACD(
                data,
                config.macd?.fast || 12,
                config.macd?.slow || 26,
                config.macd?.signal || 9
            );

            // Volatility
            indicators.atr = this.calculateATR(data, config.atr?.period || 14);

            // Additional indicators
            indicators.stochastic = this.calculateStochastic(data);
            indicators.williamsR = this.calculateWilliamsR(data);
            indicators.vwap = this.calculateVWAP(data);
            indicators.supportResistance = this.calculateSupportResistance(data);

        } catch (error) {
            console.error('Error calculating indicators:', error);
        }

        return indicators;
    }
}

// Create global instance
window.technicalIndicators = new TechnicalIndicators();