const express = require('express');
const Joi = require('joi');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createWithdrawalSchema = Joi.object({
  amount: Joi.number().positive().precision(8).required(),
  currency: Joi.string().valid('BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'LUNA', 'MATIC').required(),
  walletAddress: Joi.string().length(42).required()
});

const updateWithdrawalSchema = Joi.object({
  status: Joi.string().valid('processing', 'completed', 'rejected').required(),
  txHash: Joi.string().length(66).optional()
});

// Get user withdrawals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, amount, currency, wallet_address, status, processed_at, tx_hash, created_at FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ withdrawals: result.rows });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new withdrawal request
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createWithdrawalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { amount, currency, walletAddress } = value;

    // Check user balance
    const balanceResult = await query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    const userBalance = parseFloat(balanceResult.rows[0].balance);

    if (userBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check for minimum withdrawal amount (0.001 for crypto)
    if (amount < 0.001) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is 0.001' });
    }

    // Create withdrawal request
    const result = await query(
      'INSERT INTO withdrawals (user_id, amount, currency, wallet_address) VALUES ($1, $2, $3, $4) RETURNING id, amount, currency, wallet_address, status, created_at',
      [req.user.id, amount, currency, walletAddress]
    );

    const withdrawal = result.rows[0];

    res.status(201).json({
      message: 'Withdrawal request created successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        walletAddress: withdrawal.wallet_address,
        status: withdrawal.status,
        createdAt: withdrawal.created_at
      }
    });

  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process withdrawal (admin endpoint - in production, this would trigger blockchain transaction)
router.put('/:id/process', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateWithdrawalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status, txHash } = value;
    const withdrawalId = req.params.id;

    // Verify withdrawal belongs to user
    const withdrawalCheck = await query(
      'SELECT id, user_id, amount, currency, status FROM withdrawals WHERE id = $1 AND user_id = $2',
      [withdrawalId, req.user.id]
    );

    if (withdrawalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    const withdrawal = withdrawalCheck.rows[0];

    // Prevent processing already completed withdrawals
    if (withdrawal.status === 'completed') {
      return res.status(400).json({ error: 'Withdrawal already completed' });
    }

    // Update withdrawal status
    const updateFields = ['status = $1'];
    const updateValues = [status];
    let paramCount = 1;

    if (txHash) {
      paramCount++;
      updateFields.push(`tx_hash = $${paramCount}`);
      updateValues.push(txHash);
    }

    if (status === 'completed' || status === 'processing') {
      paramCount++;
      updateFields.push(`processed_at = $${paramCount}`);
      updateValues.push(new Date());
    }

    updateValues.push(withdrawalId);

    await query(
      `UPDATE withdrawals SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1}`,
      updateValues
    );

    // If completed, deduct from user balance
    if (status === 'completed') {
      await query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [withdrawal.amount, req.user.id]
      );
    }

    res.json({
      message: `Withdrawal ${status} successfully`,
      withdrawalId: withdrawalId
    });

  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get withdrawal details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    const result = await query(
      'SELECT id, amount, currency, wallet_address, status, processed_at, tx_hash, created_at FROM withdrawals WHERE id = $1 AND user_id = $2',
      [withdrawalId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    res.json({ withdrawal: result.rows[0] });

  } catch (error) {
    console.error('Get withdrawal details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel withdrawal (if still pending)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    // Check if withdrawal exists and is still pending
    const result = await query(
      'SELECT id, status FROM withdrawals WHERE id = $1 AND user_id = $2',
      [withdrawalId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    const withdrawal = result.rows[0];

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel a withdrawal that is already processing or completed' });
    }

    // Delete the withdrawal request
    await query('DELETE FROM withdrawals WHERE id = $1', [withdrawalId]);

    res.json({
      message: 'Withdrawal request cancelled successfully',
      withdrawalId: withdrawalId
    });

  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
