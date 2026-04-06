import express from 'express';
import Order from '../models/Order.js';
import { protectAdmin, generateToken } from '../utils/auth.js';

const router = express.Router();

// Fetch dashboard stats (Protected)
router.get('/stats', protectAdmin, async (req, res, next) => {
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
    next(error);
  }
});

// Fetch all orders (Protected)
router.get('/orders', protectAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

// Admin login (Returns JWT)
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Strict env usage without unsafe hardcoded fallback strings
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      console.error("CRITICAL ERROR: ADMIN_USERNAME or ADMIN_PASSWORD not set in environment variables!");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (username === adminUser && password === adminPass) {
      const token = generateToken('admin-user', 'admin');
      res.status(200).json({ success: true, message: 'Logged in successfully', token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
