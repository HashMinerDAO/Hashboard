const express = require('express');
const Joi = require('joi');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createDepositSchema = Joi.object({
  amount: Joi.number().positive().precision(8).required(),
  currency: Joi.string().valid('BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'LUNA', 'MATIC').required(),
  walletAddress: Joi.string().length(42).required()
});

const updateDepositSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'failed').required(),
  txHash: Joi.string().length(66).optional()
});

// Get user deposits
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, amount, currency, wallet_address, tx_hash, status, confirmed_at, created_at FROM deposits WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ deposits: result.rows });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new deposit
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createDepositSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { amount, currency, walletAddress } = value;

    // Create deposit record
    const result = await query(
      'INSERT INTO deposits (user_id, amount, currency, wallet_address) VALUES ($1, $2, $3, $4) RETURNING id, amount, currency, wallet_address, status, created_at',
      [req.user.id, amount, currency, walletAddress]
    );

    const deposit = result.rows[0];

    res.status(201).json({
      message: 'Deposit request created successfully',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: deposit.currency,
        walletAddress: deposit.wallet_address,
        status: deposit.status,
        createdAt: deposit.created_at
      }
    });

  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm deposit (admin endpoint - in production, this would be triggered by blockchain monitoring)
router.put('/:id/confirm', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateDepositSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status, txHash } = value;
    const depositId = req.params.id;

    // Verify deposit belongs to user
    const depositCheck = await query(
      'SELECT id, user_id, amount, currency FROM deposits WHERE id = $1 AND user_id = $2',
      [depositId, req.user.id]
    );

    if (depositCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const deposit = depositCheck.rows[0];

    // Update deposit status
    const updateFields = ['status = $1'];
    const updateValues = [status];
    let paramCount = 1;

    if (txHash) {
      paramCount++;
      updateFields.push(`tx_hash = $${paramCount}`);
      updateValues.push(txHash);
    }

    if (status === 'confirmed') {
      paramCount++;
      updateFields.push(`confirmed_at = $${paramCount}`);
      updateValues.push(new Date());
    }

    updateValues.push(depositId);

    await query(
      `UPDATE deposits SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1}`,
      updateValues
    );

    // If confirmed, update user balance
    if (status === 'confirmed') {
      await query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [deposit.amount, req.user.id]
      );
    }

    res.json({
      message: `Deposit ${status} successfully`,
      depositId: depositId
    });

  } catch (error) {
    console.error('Confirm deposit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
