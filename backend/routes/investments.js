const express = require('express');
const Joi = require('joi');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createInvestmentSchema = Joi.object({
  amount: Joi.number().positive().precision(8).required(),
  currency: Joi.string().valid('BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'LUNA', 'MATIC').required()
});

// Mining performance data (in production, this would come from external APIs)
const getMiningPerformance = async (currency) => {
  // Mock mining performance data - in production, fetch from mining pool APIs
  const miningData = {
    'BTC': { hashrate: 450, efficiency: 0.95 },
    'ETH': { hashrate: 1200, efficiency: 0.88 },
    'BNB': { hashrate: 850, efficiency: 0.92 },
    'ADA': { hashrate: 650, efficiency: 0.89 },
    'SOL': { hashrate: 950, efficiency: 0.91 },
    'DOT': { hashrate: 720, efficiency: 0.87 },
    'DOGE': { hashrate: 580, efficiency: 0.86 },
    'AVAX': { hashrate: 780, efficiency: 0.90 },
    'LUNA': { hashrate: 690, efficiency: 0.88 },
    'MATIC': { hashrate: 820, efficiency: 0.93 }
  };

  return miningData[currency] || { hashrate: 500, efficiency: 0.85 };
};

// Calculate ROI based on mining performance
const calculateROI = async (investment) => {
  const miningPerf = await getMiningPerformance(investment.currency);

  // Base ROI calculation: mining hashrate * efficiency * time factor
  // This is a simplified model - in production, use real mining profitability data
  const baseROI = (miningPerf.hashrate * miningPerf.efficiency) / 1000;
  const timeElapsed = Date.now() - new Date(investment.start_date).getTime();
  const daysElapsed = timeElapsed / (1000 * 60 * 60 * 24);

  // Daily ROI percentage (simplified model)
  const dailyROI = baseROI * 0.001; // 0.1% daily base rate
  const totalROI = investment.amount * dailyROI * daysElapsed;

  return {
    currentROI: Math.max(0, totalROI),
    dailyRate: dailyROI,
    miningHashrate: miningPerf.hashrate,
    efficiency: miningPerf.efficiency
  };
};

// Get user investments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, amount, currency, roi_rate, mining_hashrate, start_date, last_roi_update, status FROM investments WHERE user_id = $1 ORDER BY start_date DESC',
      [req.user.id]
    );

    // Calculate current ROI for each investment
    const investmentsWithROI = await Promise.all(
      result.rows.map(async (investment) => {
        const roiData = await calculateROI(investment);
        return {
          ...investment,
          currentROI: roiData.currentROI,
          totalValue: investment.amount + roiData.currentROI,
          dailyRate: roiData.dailyRate,
          miningHashrate: roiData.miningHashrate,
          efficiency: roiData.efficiency
        };
      })
    );

    res.json({ investments: investmentsWithROI });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new investment
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createInvestmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { amount, currency } = value;

    // Check user balance
    const balanceResult = await query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    const userBalance = parseFloat(balanceResult.rows[0].balance);

    if (userBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get mining performance for initial ROI calculation
    const miningPerf = await getMiningPerformance(currency);

    // Create investment record
    const result = await query(
      'INSERT INTO investments (user_id, amount, currency, mining_hashrate) VALUES ($1, $2, $3, $4) RETURNING id, amount, currency, start_date, status',
      [req.user.id, amount, currency, miningPerf.hashrate]
    );

    const investment = result.rows[0];

    // Deduct from user balance
    await query(
      'UPDATE users SET balance = balance - $1, total_invested = total_invested + $1 WHERE id = $2',
      [amount, req.user.id]
    );

    // Record initial ROI history
    await query(
      'INSERT INTO investment_roi_history (investment_id, roi_amount, mining_performance) VALUES ($1, $2, $3)',
      [investment.id, 0, miningPerf.hashrate]
    );

    res.status(201).json({
      message: 'Investment created successfully',
      investment: {
        id: investment.id,
        amount: investment.amount,
        currency: investment.currency,
        startDate: investment.start_date,
        status: investment.status,
        miningHashrate: miningPerf.hashrate
      }
    });

  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get investment details with ROI history
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const investmentId = req.params.id;

    // Get investment
    const investmentResult = await query(
      'SELECT * FROM investments WHERE id = $1 AND user_id = $2',
      [investmentId, req.user.id]
    );

    if (investmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const investment = investmentResult.rows[0];

    // Get ROI history
    const roiHistoryResult = await query(
      'SELECT roi_amount, mining_performance, recorded_at FROM investment_roi_history WHERE investment_id = $1 ORDER BY recorded_at DESC',
      [investmentId]
    );

    // Calculate current ROI
    const roiData = await calculateROI(investment);

    res.json({
      investment: {
        ...investment,
        currentROI: roiData.currentROI,
        totalValue: investment.amount + roiData.currentROI,
        dailyRate: roiData.dailyRate,
        miningHashrate: roiData.miningHashrate,
        efficiency: roiData.efficiency
      },
      roiHistory: roiHistoryResult.rows
    });

  } catch (error) {
    console.error('Get investment details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update investment ROI (called periodically or on demand)
router.put('/:id/update-roi', authenticateToken, async (req, res) => {
  try {
    const investmentId = req.params.id;

    // Get investment
    const investmentResult = await query(
      'SELECT * FROM investments WHERE id = $1 AND user_id = $2',
      [investmentId, req.user.id]
    );

    if (investmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    const investment = investmentResult.rows[0];

    // Calculate current ROI
    const roiData = await calculateROI(investment);

    // Update investment with new ROI data
    await query(
      'UPDATE investments SET roi_rate = $1, last_roi_update = NOW() WHERE id = $2',
      [roiData.dailyRate, investmentId]
    );

    // Record ROI history
    await query(
      'INSERT INTO investment_roi_history (investment_id, roi_amount, mining_performance) VALUES ($1, $2, $3)',
      [investmentId, roiData.currentROI, roiData.miningHashrate]
    );

    // Update user's total ROI
    await query(
      'UPDATE users SET total_roi = total_roi + $1 WHERE id = $2',
      [roiData.currentROI, req.user.id]
    );

    res.json({
      message: 'Investment ROI updated successfully',
      investmentId: investmentId,
      currentROI: roiData.currentROI,
      totalValue: investment.amount + roiData.currentROI
    });

  } catch (error) {
    console.error('Update ROI error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
