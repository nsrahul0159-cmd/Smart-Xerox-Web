import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Fetch dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Printing', 'Payment Pending'] } });
    const completedOrders = await Order.countDocuments({ status: { $in: ['Completed', 'Delivered'] } });
    
    const aggregatedRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Payment Pending' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    
    const totalRevenue = aggregatedRevenue.length > 0 ? aggregatedRevenue[0].totalRevenue : 0;

    res.status(200).json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// Fetch all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Admin login (Simplified)
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    // For production, use environment variables!
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'SmartXerox@2026';

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      res.status(200).json({ success: true, message: 'Logged in successfully' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
