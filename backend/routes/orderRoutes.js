import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import { calculatePrice } from '../utils/pricing.js';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { user, files, totalPages, settings } = req.body;

    const amount = calculatePrice(totalPages, settings);

    const today = new Date();
    const datePrefix = today.toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY format looks good, or YYYYMMDD? The user wanted it to reset with date. Let's use YYYYMMDD for easier sorting.
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const lastOrder = await Order.findOne({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastOrder && lastOrder.displayId) {
      const parts = lastOrder.displayId.split('-');
      if (parts.length === 2 && !isNaN(parts[1])) {
        nextNumber = parseInt(parts[1]) + 1;
      }
    }

    const displayId = `${dateStr}-${nextNumber}`;

    const newOrder = new Order({
      displayId,
      user,
      files,
      totalPages,
      settings,
      amount
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Update order status - Protected endpoint (admin only for non-payment updates)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Allow payment completion without authentication
    if (status === 'Paid' && order.status === 'Payment Pending') {
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
      return res.status(200).json(updatedOrder);
    }

    // For other status changes, require admin authentication
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required for this status change' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Update the status
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// Track orders by phone
router.get('/track/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ 'user.phone': req.params.phone }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking details.' });
  }
});

export default router;
