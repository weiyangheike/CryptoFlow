/**
 * Binance REST API Service
 * Fetches historical aggregate trades for footprint reconstruction
 */

const BINANCE_FUTURES_API = 'https://fapi.binance.com';

/**
 * Fetch historical aggregate trades from Binance Futures
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {number} limit - Number of trades to fetch (max 1000)
 * @param {number} startTime - Start timestamp in ms (optional)
 * @param {number} endTime - End timestamp in ms (optional)
 * @returns {Promise<Array>} Array of trade objects
 */
export async function fetchHistoricalTrades(symbol, limit = 1000, startTime = null, endTime = null) {
    const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        limit: Math.min(limit, 1000).toString()
    });

    if (startTime) params.append('startTime', startTime.toString());
    if (endTime) params.append('endTime', endTime.toString());

    const url = `${BINANCE_FUTURES_API}/fapi/v1/aggTrades?${params}`;

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform to our trade format
            return data.map(trade => ({
                price: parseFloat(trade.p),
                quantity: parseFloat(trade.q),
                time: trade.T,
                isBuyerMaker: trade.m,
                tradeId: trade.a
            }));
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
            
            // Only retry on network errors, not on 404 or other status codes
            if (attempt < maxRetries - 1 && (error.name === 'AbortError' || !error.message.includes('400'))) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            } else {
                break;
            }
        }
    }

    console.error('Failed to fetch historical trades after retries:', lastError);
    throw lastError;
}

/**
 * Fetch multiple batches of historical trades
 * @param {string} symbol - Trading pair
 * @param {number} minutes - How many minutes of history to fetch
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Array>} All trades within the time range
 */
export async function fetchTradesForPeriod(symbol, minutes = 10, onProgress = null) {
    const endTime = Date.now();
    const startTime = endTime - (minutes * 60 * 1000);

    const allTrades = [];
    let currentEndTime = endTime;
    let batchCount = 0;
    const maxBatches = 20;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    while (currentEndTime > startTime && batchCount < maxBatches && consecutiveErrors < maxConsecutiveErrors) {
        try {
            const trades = await fetchHistoricalTrades(symbol, 1000, null, currentEndTime);

            if (trades.length === 0) {
                consecutiveErrors++;
                if (consecutiveErrors >= maxConsecutiveErrors) {
                    console.warn('⚠️ No more trades available, stopping');
                    break;
                }
                continue;
            }

            consecutiveErrors = 0; // Reset error counter on success

            // Filter trades within our time range
            const validTrades = trades.filter(t => t.time >= startTime);
            allTrades.push(...validTrades);

            // Update progress
            batchCount++;
            if (onProgress) {
                const progress = Math.min(100, Math.round((batchCount / maxBatches) * 100));
                onProgress(progress);
            }

            // Check if we've reached our time window
            const oldestTrade = trades[trades.length - 1];
            if (oldestTrade.time <= startTime) {
                console.log(`✅ Reached start time boundary`);
                break;
            }

            currentEndTime = oldestTrade.time - 1;

            // Rate limiting: 500ms delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            consecutiveErrors++;
            console.warn(`⚠️ Error fetching batch ${batchCount + 1}:`, error.message);
            
            if (consecutiveErrors >= maxConsecutiveErrors) {
                console.warn('⚠️ Max retries exceeded, stopping with partial data');
                break;
            }
            
            // Add delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Sort by time ascending
    allTrades.sort((a, b) => a.time - b.time);

    console.log(`📊 Fetched total of ${allTrades.length} trades in ${batchCount} batches`);
    return allTrades;
}

/**
 * Fetch historical klines (OHLCV candles) - simpler alternative
 * @param {string} symbol - Trading pair
 * @param {string} interval - Timeframe (1m, 5m, 15m, 1h)
 * @param {number} limit - Number of candles
 * @returns {Promise<Array>} Array of kline objects
 */
export async function fetchHistoricalKlines(symbol, interval = '1m', limit = 100) {
    const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        interval: interval,
        limit: limit.toString()
    });

    const url = `${BINANCE_FUTURES_API}/fapi/v1/klines?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform to our candle format
        return data.map(k => ({
            time: k[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
            closeTime: k[6],
            quoteVolume: parseFloat(k[7]),
            trades: k[8],
            takerBuyVolume: parseFloat(k[9]),
            takerBuyQuoteVolume: parseFloat(k[10])
        }));
    } catch (error) {
        console.error('Failed to fetch historical klines:', error);
        throw error;
    }
}

export const binanceREST = {
    fetchHistoricalTrades,
    fetchTradesForPeriod,
    fetchHistoricalKlines
};
