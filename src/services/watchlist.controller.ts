import { Request, Response } from 'express';
import watchlistService from '../services/watchlist.service.js';

class WatchlistController {
  // GET /api/v1/watchlist
  async getWatchlist(req: Request, res: Response) {
    try {
      const items = await watchlistService.getWatchlist(req.user!.id);
      res.json({ success: true, data: { items, count: items.length } });
    } catch (err: any) {
      console.error('getWatchlist error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // POST /api/v1/watchlist
  async addItem(req: Request, res: Response) {
    try {
      const { url, name, targetPrice } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, error: { message: 'URL is required' } });
      }

      const item = await watchlistService.addToWatchlist(req.user!.id, {
        url,
        name,
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      });

      res.status(201).json({ success: true, data: item });
    } catch (err: any) {
      console.error('addItem error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // GET /api/v1/watchlist/:id
  async getItem(req: Request, res: Response) {
    try {
      const item = await watchlistService.getWatchlistItem(req.user!.id, req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: { message: 'Item not found' } });
      }
      res.json({ success: true, data: item });
    } catch (err: any) {
      console.error('getItem error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // PATCH /api/v1/watchlist/:id
  async updateItem(req: Request, res: Response) {
    try {
      const item = await watchlistService.updateWatchlistItem(req.user!.id, req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ success: false, error: { message: 'Item not found' } });
      }
      res.json({ success: true, data: item });
    } catch (err: any) {
      console.error('updateItem error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // DELETE /api/v1/watchlist/:id
  async removeItem(req: Request, res: Response) {
    try {
      await watchlistService.removeFromWatchlist(req.user!.id, req.params.id);
      res.json({ success: true, data: { deleted: true } });
    } catch (err: any) {
      console.error('removeItem error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // POST /api/v1/watchlist/check-prices
  async checkPrices(req: Request, res: Response) {
    try {
      const results = await watchlistService.checkPrices(req.user!.id);
      res.json({ success: true, data: { results } });
    } catch (err: any) {
      console.error('checkPrices error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // GET /api/v1/watchlist/alerts/all
  async getAlerts(req: Request, res: Response) {
    try {
      const { unreadOnly, limit, page } = req.query;
      const data = await watchlistService.getAlerts(req.user!.id, {
        unreadOnly: unreadOnly === 'true',
        limit: parseInt(limit as string) || 20,
        page: parseInt(page as string) || 1,
      });
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('getAlerts error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // POST /api/v1/watchlist/alerts/mark-read
  async markAlertsRead(req: Request, res: Response) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ success: false, error: { message: 'ids array is required' } });
      }
      const result = await watchlistService.markAlertsRead(req.user!.id, ids);
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error('markAlertsRead error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // GET /api/v1/watchlist/stats/summary
  async getStats(req: Request, res: Response) {
    try {
      const stats = await watchlistService.getStats(req.user!.id);
      res.json({ success: true, data: stats });
    } catch (err: any) {
      console.error('getStats error:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}

export const watchlistController = new WatchlistController();
export default watchlistController;
