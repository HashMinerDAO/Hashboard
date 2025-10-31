<template>
  <div class="withdrawal-page">
    <div class="page-header">
      <h1 class="page-title">Withdraw Funds</h1>
      <p class="page-subtitle">Transfer cryptocurrency to your external wallet</p>
    </div>

    <div class="balance-overview">
      <div class="balance-card">
        <h3>Available Balance</h3>
        <div class="balance-amount">{{ formatCurrency(userBalance) }}</div>
        <p class="balance-note">Funds available for withdrawal</p>
      </div>
    </div>

    <div class="withdrawal-form-section">
      <div class="form-card">
        <h3>Create Withdrawal Request</h3>
        <form @submit.prevent="handleWithdrawal">
          <div class="form-row">
            <div class="form-group">
              <label for="withdrawal-currency" class="form-label">Currency</label>
              <select
                id="withdrawal-currency"
                v-model="withdrawal.currency"
                class="form-select"
                required
                :disabled="loading"
              >
                <option value="">Choose currency...</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="BNB">Binance Coin (BNB)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="DOT">Polkadot (DOT)</option>
                <option value="DOGE">Dogecoin (DOGE)</option>
                <option value="AVAX">Avalanche (AVAX)</option>
                <option value="LUNA">Terra (LUNA)</option>
                <option value="MATIC">Polygon (MATIC)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="withdrawal-amount" class="form-label">Amount</label>
              <div class="amount-input-group">
                <input
                  id="withdrawal-amount"
                  v-model.number="withdrawal.amount"
                  type="number"
                  class="form-input"
                  placeholder="0.00"
                  step="0.00000001"
                  min="0.001"
                  :max="userBalance"
                  required
                  :disabled="loading"
                />
                <span class="currency-symbol">{{ withdrawal.currency || 'USD' }}</span>
              </div>
              <small class="form-hint">
                Minimum withdrawal: 0.001 {{ withdrawal.currency }}
              </small>
            </div>
          </div>

          <div class="form-group">
            <label for="wallet-address" class="form-label">Recipient Wallet Address</label>
            <input
              id="wallet-address"
              v-model="withdrawal.walletAddress"
              type="text"
              class="form-input"
              placeholder="0x..."
              required
              :disabled="loading"
            />
            <small class="form-hint">
              The wallet address where funds will be sent. Double-check this address.
            </small>
          </div>

          <div class="withdrawal-summary" v-if="isFormValid">
            <div class="summary-item">
              <span class="label">Withdrawal Amount:</span>
              <span class="value">{{ formatCurrency(withdrawal.amount) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Network Fee (est.):</span>
              <span class="value">{{ formatCurrency(estimatedFee) }}</span>
            </div>
            <div class="summary-item total">
              <span class="label">Total Deducted:</span>
              <span class="value">{{ formatCurrency(withdrawal.amount + estimatedFee) }}</span>
            </div>
            <div class="summary-item remaining">
              <span class="label">Remaining Balance:</span>
              <span class="value">{{ formatCurrency(userBalance - withdrawal.amount - estimatedFee) }}</span>
            </div>
          </div>

          <div class="security-notice">
            <div class="notice-icon">
              <b-icon-shield-check />
            </div>
            <div class="notice-content">
              <h4>Security Verification Required</h4>
              <p>Withdrawal requests require manual review for security. Processing may take 1-3 business days.</p>
            </div>
          </div>

          <button
            type="submit"
            class="withdrawal-button"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating Withdrawal Request...' : 'Create Withdrawal Request' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Withdrawal History -->
    <div class="withdrawal-history-section" v-if="withdrawals.length > 0">
      <h2 class="section-title">Withdrawal History</h2>
      <div class="withdrawals-table">
        <div class="table-header">
          <div class="col-amount">Amount</div>
          <div class="col-currency">Currency</div>
          <div class="col-address">Wallet Address</div>
          <div class="col-status">Status</div>
          <div class="col-date">Date</div>
          <div class="col-actions">Actions</div>
        </div>
        <div
          v-for="withdrawal in withdrawals.slice(0, 5)"
          :key="withdrawal.id"
          class="table-row"
        >
          <div class="col-amount">{{ formatCurrency(withdrawal.amount) }}</div>
          <div class="col-currency">{{ withdrawal.currency }}</div>
          <div class="col-address">
            <span class="address-short">{{ shortenAddress(withdrawal.wallet_address) }}</span>
          </div>
          <div class="col-status">
            <span :class="`status-badge ${withdrawal.status}`">
              {{ withdrawal.status }}
            </span>
          </div>
          <div class="col-date">{{ formatDate(withdrawal.created_at) }}</div>
          <div class="col-actions">
            <button
              v-if="withdrawal.status === 'pending'"
              class="cancel-btn"
              @click="cancelWithdrawal(withdrawal.id)"
              :disabled="cancelling === withdrawal.id"
            >
              <span v-if="cancelling === withdrawal.id" class="loading-spinner small"></span>
              Cancel
            </button>
            <span v-else class="no-action">-</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdrawal Guidelines -->
    <div class="guidelines-section">
      <h2 class="section-title">Withdrawal Guidelines</h2>
      <div class="guidelines-grid">
        <div class="guideline-card">
          <div class="guideline-icon">
            <b-icon-clock />
          </div>
          <h4>Processing Time</h4>
          <p>Withdrawal requests are processed within 1-3 business days after submission.</p>
        </div>

        <div class="guideline-card">
          <div class="guideline-icon">
            <b-icon-shield-check />
          </div>
          <h4>Security Review</h4>
          <p>All withdrawals undergo security verification to protect your funds.</p>
        </div>

        <div class="guideline-card">
          <div class="guideline-icon">
            <b-icon-cash-coin />
          </div>
          <h4>Network Fees</h4>
          <p>Network fees are estimated and may vary based on blockchain congestion.</p>
        </div>

        <div class="guideline-card">
          <div class="guideline-icon">
            <b-icon-exclamation-triangle />
          </div>
          <h4>Address Verification</h4>
          <p>Always double-check wallet addresses. We cannot recover funds sent to wrong addresses.</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'WithdrawalPage',
  data() {
    return {
      withdrawal: {
        currency: '',
        amount: null,
        walletAddress: ''
      },
      loading: false,
      cancelling: null,
      error: null
    };
  },
  computed: {
    ...mapGetters({
      withdrawals: 'getWithdrawals',
      user: 'getUser',
      userBalance: 'getUserBalance'
    }),

    isFormValid() {
      return (
        this.withdrawal.currency &&
        this.withdrawal.amount &&
        this.withdrawal.amount >= 0.001 &&
        this.withdrawal.amount <= this.userBalance &&
        this.withdrawal.walletAddress &&
        this.isValidWalletAddress(this.withdrawal.walletAddress)
      );
    },

    estimatedFee() {
      // Simple fee estimation based on currency
      const fees = {
        'BTC': 0.0001,
        'ETH': 0.001,
        'BNB': 0.0005,
        'ADA': 0.1,
        'SOL': 0.0001,
        'DOT': 0.01,
        'DOGE': 1,
        'AVAX': 0.001,
        'LUNA': 0.01,
        'MATIC': 0.01
      };
      return fees[this.withdrawal.currency] || 0.001;
    }
  },
  methods: {
    ...mapActions(['createWithdrawal', 'fetchWithdrawals']),

    isValidWalletAddress(address) {
      // Basic Ethereum-style address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },

    async handleWithdrawal() {
      if (this.loading || !this.isFormValid) return;

      // Final confirmation
      const confirmed = confirm(
        `Are you sure you want to withdraw ${this.formatCurrency(this.withdrawal.amount)} ${this.withdrawal.currency}?\n\n` +
        `Recipient: ${this.withdrawal.walletAddress}\n` +
        `Estimated fee: ${this.formatCurrency(this.estimatedFee)}\n` +
        `Total deducted: ${this.formatCurrency(this.withdrawal.amount + this.estimatedFee)}`
      );

      if (!confirmed) return;

      this.loading = true;
      this.error = null;

      try {
        await this.createWithdrawal(this.withdrawal);
        this.withdrawal = { currency: '', amount: null, walletAddress: '' };
        await this.fetchWithdrawals();
      } catch (error) {
        this.error = error.message || 'Failed to create withdrawal request';
      } finally {
        this.loading = false;
      }
    },

    async cancelWithdrawal(withdrawalId) {
      if (this.cancelling) return;

      const confirmed = confirm('Are you sure you want to cancel this withdrawal request?');
      if (!confirmed) return;

      this.cancelling = withdrawalId;
      this.error = null;

      try {
        // In a real implementation, this would call a cancel endpoint
        // For now, we'll just refresh the list
        await this.fetchWithdrawals();
      } catch (error) {
        this.error = 'Failed to cancel withdrawal';
      } finally {
        this.cancelling = null;
      }
    },

    shortenAddress(address) {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(amount || 0);
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },

  async mounted() {
    try {
      await this.fetchWithdrawals();
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/constants';

.withdrawal-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 18px;
}

.balance-overview {
  margin-bottom: 40px;
}

.balance-card {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  margin: 0 auto;

  h3 {
    color: var(--text-secondary);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .balance-amount {
    color: var(--text-primary);
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .balance-note {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.withdrawal-form-section {
  margin-bottom: 60px;
}

.form-card {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  h3 {
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    text-align: center;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-select,
.form-input {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: $radius2;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.form-select {
  cursor: pointer;
}

.amount-input-group {
  position: relative;

  .form-input {
    padding-right: 60px;
  }

  .currency-symbol {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-weight: 500;
  }
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.withdrawal-summary {
  background: var(--bg-primary);
  border-radius: $radius2;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }

  .label {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .value {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
  }

  &.total {
    .label, .value {
      font-weight: 700;
      color: var(--primary);
    }
  }

  &.remaining {
    .label {
      color: var(--text-secondary);
    }
    .value {
      color: var(--success-text);
      font-weight: 600;
    }
  }
}

.security-notice {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: $radius2;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .notice-icon {
    color: var(--warning-text);
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .notice-content {
    h4 {
      color: var(--warning-text);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    p {
      color: var(--warning-text);
      font-size: 14px;
      margin: 0;
      line-height: 1.4;
    }
  }
}

.withdrawal-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: $radius2;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &.small {
    width: 12px;
    height: 12px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.withdrawal-history-section,
.guidelines-section {
  margin-bottom: 40px;
}

.section-title {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.withdrawals-table {
  background: var(--card-bg);
  border-radius: $radius3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .table-header,
  .table-row {
    display: grid;
    grid-template-columns: 1fr 80px 140px 100px 100px 100px;
    gap: 16px;
    padding: 16px 20px;
    align-items: center;
  }

  .table-header {
    background: var(--bg-primary);
    border-bottom: 2px solid var(--border-color);
    font-weight: 600;
    color: var(--text-primary);
    font-size: 14px;
  }

  .table-row {
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
    color: var(--text-secondary);

    &:last-child {
      border-bottom: none;
    }
  }

  .address-short {
    font-family: monospace;
    font-size: 12px;
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: $radius1;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;

    &.pending {
      background: var(--warning-bg);
      color: var(--warning-text);
    }

    &.processing {
      background: var(--info-bg);
      color: var(--info-text);
    }

    &.completed {
      background: var(--success-bg);
      color: var(--success-text);
    }

    &.rejected {
      background: var(--error-bg);
      color: var(--error-text);
    }
  }

  .cancel-btn {
    background: var(--error-bg);
    color: var(--error-text);
    border: 1px solid var(--error-border);
    padding: 6px 12px;
    border-radius: $radius1;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--error-text);
      color: white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .no-action {
    color: var(--text-secondary);
    font-size: 12px;
  }
}

.guidelines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.guideline-card {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;

  .guideline-icon {
    color: var(--primary);
    font-size: 32px;
    margin-bottom: 16px;
  }

  h4 {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  p {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
}

.error-message {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 16px 20px;
  border-radius: $radius2;
  border: 1px solid var(--error-border);
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

@media (max-width: 768px) {
  .withdrawal-page {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .withdrawals-table {
    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: 8px;
      text-align: left;
    }

    .table-header {
      display: none;
    }

    .table-row {
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: $radius2;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;

        &::before {
          content: attr(data-label) ": ";
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }
  }

  .guidelines-grid {
    grid-template-columns: 1fr;
  }
}
</style>
