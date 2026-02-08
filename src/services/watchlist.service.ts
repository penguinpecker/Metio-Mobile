import prisma from '../utils/db.js';
import axios from 'axios';

// Cheerio - dynamic import for ESM compatibility
let cheerio: any;
async function getCheerio() {
  if (!cheerio) {
    cheerio = await import('cheerio');
  }
  return cheerio;
}

class WatchlistService {
  // ======== WATCHLIST CRUD ========

  async addToWatchlist(userId: string, data: { url: string; name?: string; targetPrice?: number }) {
    const { url, name, targetPrice } = data;
    const productInfo = this.extractProductInfo(url);

    // Try to fetch current price
    let priceData: any = {};
    try {
      priceData = await this.scrapePrice(url, productInfo.platform);
    } catch (err: any) {
      console.log('Initial price fetch failed, will retry later:', err.message);
    }

    const currentPrice = priceData.price || null;
    const productName = name || priceData.name || 'Unknown Product';

    const item = await prisma.watchlistItem.create({
      data: {
        userId,
        name: productName,
        url: url.trim(),
        platform: productInfo.platform,
        platformIcon: productInfo.platformIcon,
        asin: productInfo.asin,
        currentPrice,
        originalPrice: currentPrice,
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        targetPrice: targetPrice || null,
        imageUrl: priceData.imageUrl || null,
        currency: priceData.currency || 'INR',
        lastChecked: new Date(),
      },
    });

    // Record first price point
    if (currentPrice) {
      await prisma.priceHistory.create({
        data: {
          watchlistItemId: item.id,
          price: currentPrice,
        },
      });
    }

    return item;
  }

  async getWatchlist(userId: string) {
    const items = await prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 30, // Last 30 data points for chart
        },
        _count: {
          select: { alerts: true },
        },
      },
    });
    return items;
  }

  async getWatchlistItem(userId: string, itemId: string) {
    return prisma.watchlistItem.findFirst({
      where: { id: itemId, userId },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'asc' },
          take: 90, // 90 days
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updateWatchlistItem(userId: string, itemId: string, updates: any) {
    // Only allow safe fields to be updated
    const allowed = ['name', 'targetPrice', 'notifyOnDrop', 'dropThreshold', 'status'];
    const filtered: any = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    const item = await prisma.watchlistItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) return null;

    return prisma.watchlistItem.update({
      where: { id: itemId },
      data: filtered,
    });
  }

  async removeFromWatchlist(userId: string, itemId: string) {
    const item = await prisma.watchlistItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) throw new Error('Item not found');

    // Cascade delete handles price_history and price_alerts
    await prisma.watchlistItem.delete({
      where: { id: itemId },
    });

    return { deleted: true };
  }

  // ======== PRICE CHECKING ========

  async checkPrices(userId?: string) {
    const where: any = { status: 'watching' };
    if (userId) where.userId = userId;

    const items = await prisma.watchlistItem.findMany({ where });
    const results = [];

    for (const item of items) {
      try {
        const priceData = await this.scrapePrice(item.url, item.platform);
        if (!priceData.price) {
          results.push({ itemId: item.id, status: 'no_price', name: item.name });
          continue;
        }

        const previousPrice = item.currentPrice;
        const newPrice = priceData.price;

        // Build update data
        const updateData: any = {
          currentPrice: newPrice,
          lastChecked: new Date(),
        };

        if (newPrice < (item.lowestPrice || Infinity)) updateData.lowestPrice = newPrice;
        if (newPrice > (item.highestPrice || 0)) updateData.highestPrice = newPrice;
        if (priceData.name && item.name === 'Unknown Product') updateData.name = priceData.name;
        if (priceData.imageUrl) updateData.imageUrl = priceData.imageUrl;

        // Check for alerts
        if (previousPrice && newPrice < previousPrice) {
          const dropPct = parseFloat(((previousPrice - newPrice) / previousPrice * 100).toFixed(1));

          // Target hit
          if (item.targetPrice && newPrice <= item.targetPrice) {
            updateData.status = 'target_hit';
            await this.createAlert(item.userId, item.id, {
              type: 'target_hit',
              productName: item.name,
              previousPrice,
              newPrice,
              dropPercentage: dropPct,
              url: item.url,
            });
          }
          // Drop threshold
          else if (item.notifyOnDrop && dropPct >= item.dropThreshold) {
            await this.createAlert(item.userId, item.id, {
              type: 'price_drop',
              productName: item.name,
              previousPrice,
              newPrice,
              dropPercentage: dropPct,
              url: item.url,
            });
          }
        }

        // Update the item
        await prisma.watchlistItem.update({
          where: { id: item.id },
          data: updateData,
        });

        // Record price history
        await prisma.priceHistory.create({
          data: {
            watchlistItemId: item.id,
            price: newPrice,
          },
        });

        results.push({ itemId: item.id, status: 'updated', price: newPrice, name: item.name });
      } catch (err: any) {
        console.error(`Price check failed for ${item.name}:`, err.message);
        results.push({ itemId: item.id, status: 'error', error: err.message, name: item.name });
      }
    }

    return results;
  }

  async scrapePrice(url: string, platform: string): Promise<{
    price: number | null;
    name?: string;
    imageUrl?: string;
    currency?: string;
  }> {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      };

      const { data: html } = await axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
      });

      const ch = await getCheerio();
      const $ = ch.load(html);

      if (platform === 'Amazon') return this.parseAmazon($);
      if (platform === 'Flipkart') return this.parseFlipkart($);
      return this.parseGeneric($);
    } catch (err: any) {
      console.error('Scrape error:', err.message);
      return { price: null };
    }
  }

  private parseAmazon($: any) {
    const priceSelectors = [
      '#priceblock_dealprice', '#priceblock_ourprice', '#priceblock_saleprice',
      '.a-price .a-offscreen', '#corePrice_feature_div .a-offscreen',
      '#tp_price_block_total_price_ww .a-offscreen', '.priceToPay .a-offscreen',
    ];

    let priceText = '';
    for (const sel of priceSelectors) {
      priceText = $(sel).first().text().trim();
      if (priceText) break;
    }

    const price = this.extractNumber(priceText);
    const name = $('#productTitle').text().trim() || $('h1').first().text().trim();
    const imageUrl = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src');
    const currency = priceText.includes('₹') ? 'INR' : priceText.includes('$') ? 'USD' : 'INR';

    return { price, name: name?.substring(0, 200), imageUrl, currency };
  }

  private parseFlipkart($: any) {
    const priceSelectors = ['._30jeq3', '._16Jk6d', '.CEmiEU', '._25b18c ._30jeq3'];
    let priceText = '';
    for (const sel of priceSelectors) {
      priceText = $(sel).first().text().trim();
      if (priceText) break;
    }

    const price = this.extractNumber(priceText);
    const name = $('.B_NuCI').text().trim() || $('h1').first().text().trim();
    const imageUrl = $('img._396cs4').attr('src') || $('img._2r_T1I').attr('src');

    return { price, name: name?.substring(0, 200), imageUrl, currency: 'INR' };
  }

  private parseGeneric($: any) {
    let price: number | null = null;

    // Try meta tags first
    const ogPrice = $('meta[property="og:price:amount"]').attr('content')
      || $('meta[property="product:price:amount"]').attr('content');
    if (ogPrice) price = parseFloat(ogPrice);

    // Fallback: look for price patterns
    if (!price) {
      const priceRegex = /[₹$€£]\s?[\d,]+\.?\d*/;
      $('[class*="price"], [id*="price"], [data-price]').each((_: any, el: any) => {
        const text = $(el).text().trim();
        const match = text.match(priceRegex);
        if (match && !price) {
          price = this.extractNumber(match[0]);
        }
      });
    }

    const name = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    const imageUrl = $('meta[property="og:image"]').attr('content');
    const currencyMeta = $('meta[property="og:price:currency"]').attr('content') || 'INR';

    return { price, name: name?.substring(0, 200), imageUrl, currency: currencyMeta };
  }

  // ======== ALERTS ========

  async createAlert(userId: string, watchlistItemId: string, alertData: {
    type: string;
    productName: string;
    previousPrice?: number;
    newPrice?: number;
    dropPercentage?: number;
    url?: string;
  }) {
    return prisma.priceAlert.create({
      data: {
        userId,
        watchlistItemId,
        ...alertData,
      },
    });
  }

  async getAlerts(userId: string, options: {
    unreadOnly?: boolean;
    limit?: number;
    page?: number;
  } = {}) {
    const { unreadOnly = false, limit = 20, page = 1 } = options;

    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const [alerts, total, unread] = await Promise.all([
      prisma.priceAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          watchlistItem: {
            select: { id: true, name: true, imageUrl: true, platform: true },
          },
        },
      }),
      prisma.priceAlert.count({ where }),
      prisma.priceAlert.count({ where: { userId, read: false } }),
    ]);

    return { alerts, total, unread, page, limit };
  }

  async markAlertsRead(userId: string, alertIds: string[]) {
    const result = await prisma.priceAlert.updateMany({
      where: {
        id: { in: alertIds },
        userId,
      },
      data: { read: true },
    });
    return { updated: result.count };
  }

  // ======== STATS ========

  async getStats(userId: string) {
    const [items, unreadAlerts] = await Promise.all([
      prisma.watchlistItem.findMany({ where: { userId } }),
      prisma.priceAlert.count({ where: { userId, read: false } }),
    ]);

    const totalSaved = items.reduce((sum, item) => {
      if (item.originalPrice && item.currentPrice && item.currentPrice < item.originalPrice) {
        return sum + (item.originalPrice - item.currentPrice);
      }
      return sum;
    }, 0);

    return {
      totalTracking: items.length,
      totalSaved: Math.round(totalSaved),
      targetHits: items.filter(i => i.status === 'target_hit').length,
      unreadAlerts,
      activeWatches: items.filter(i => i.status === 'watching').length,
    };
  }

  // ======== HELPERS ========

  extractProductInfo(url: string) {
    const asinMatch = url.match(/\/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i)
      || url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/i);

    const isAmazon = url.includes('amazon');
    const isFlipkart = url.includes('flipkart');

    if (isAmazon) return { platform: 'Amazon', platformIcon: '🛒', asin: asinMatch?.[1] || null };
    if (isFlipkart) return { platform: 'Flipkart', platformIcon: '🛍️', asin: null };
    return { platform: 'Other', platformIcon: '🔗', asin: null };
  }

  private extractNumber(text: string | null): number | null {
    if (!text) return null;
    const cleaned = text.replace(/[₹$€£,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
}

export const watchlistService = new WatchlistService();
export default watchlistService;
