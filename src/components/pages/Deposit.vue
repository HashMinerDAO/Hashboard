<template>
  <div class="deposit-page">
    <div class="page-header">
      <h1 class="page-title">Make a Deposit</h1>
      <p class="page-subtitle">Add funds to your Hashboard account</p>
    </div>

    <div class="deposit-container">
      <div class="deposit-form-section">
        <form @submit.prevent="handleDeposit" class="deposit-form">
          <div class="form-group">
            <label for="currency" class="form-label">Select Currency</label>
            <select
              id="currency"
              v-model="form.currency"
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
            <label for="amount" class="form-label">Deposit Amount</label>
            <div class="amount-input-group">
              <input
                id="amount"
                v-model.number="form.amount"
                type="number"
                class="form-input"
                placeholder="0.00"
                step="0.00000001"
                min="0.00000001"
                required
                :disabled="loading"
              />
              <span class="currency-symbol">{{ form.currency || 'USD' }}</span>
            </div>
            <small class="form-hint">
              Minimum deposit: 0.00000001 {{ form.currency }}
            </small>
          </div>

          <div class="form-group">
            <label for="walletAddress" class="form-label">Your Wallet Address</label>
            <input
              id="walletAddress"
              v-model="form.walletAddress"
              type="text"
              class="form-input"
              placeholder="0x..."
              required
              :disabled="loading"
            />
            <small class="form-hint">
              The wallet address where you'll send the cryptocurrency
            </small>
          </div>

          <button
            type="submit"
            class="deposit-button"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating Deposit Request...' : 'Create Deposit Request' }}
          </button>
        </form>
      </div>

      <div class="deposit-info-section">
        <div class="info-card">
          <h3 class="info-title">Deposit Instructions</h3>
          <div class="instruction-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Select Currency & Amount</h4>
                <p>Choose your preferred cryptocurrency and enter the amount you want to deposit.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Send Cryptocurrency</h4>
                <p>Send the exact amount to the generated wallet address. Include any required network fees.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Wait for Confirmation</h4>
                <p>Transaction will be confirmed on the blockchain. This may take a few minutes to hours.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Funds Added to Account</h4>
                <p>Once confirmed, funds will be automatically added to your Hashboard balance.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="warning-card">
          <div class="warning-icon">
            <b-icon-exclamation-triangle-fill />
          </div>
          <div class="warning-content">
            <h4>Important Security Notice</h4>
            <ul>
              <li>Only send {{ form.currency || 'the selected cryptocurrency' }} to the provided address</li>
              <li>Double-check the wallet address before sending</li>
              <li>Deposits are processed automatically once confirmed on the blockchain</li>
              <li>Contact support if you have any issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit History -->
    <div class="deposit-history-section" v-if="deposits.length > 0">
      <h2 class="section-title">Recent Deposits</h2>
      <div class="deposits-table">
        <div class="table-header">
          <div class="col-amount">Amount</div>
          <div class="col-currency">Currency</div>
          <div class="col-status">Status</div>
          <div class="col-date">Date</div>
        </div>
        <div
          v-for="deposit in deposits.slice(0, 5)"
          :key="deposit.id"
          class="table-row"
        >
          <div class="col-amount">{{ formatAmount(deposit.amount) }}</div>
          <div class="col-currency">{{ deposit.currency }}</div>
          <div class="col-status">
            <span :class="`status-badge ${deposit.status}`">
              {{ deposit.status }}
            </span>
          </div>
          <div class="col-date">{{ formatDate(deposit.created_at) }}</div>
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
  name: 'DepositPage',
  data() {
    return {
      form: {
        currency: '',
        amount: null,
        walletAddress: ''
      },
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapGetters({
      deposits: 'getDeposits',
      user: 'getUser'
    }),

    isFormValid() {
      return (
        this.form.currency &&
        this.form.amount &&
        this.form.amount > 0 &&
        this.form.amount >= 0.00000001 &&
        this.form.walletAddress &&
        this.isValidWalletAddress(this.form.walletAddress)
      );
    }
  },
  methods: {
    ...mapActions(['createDeposit', 'fetchDeposits']),

    isValidWalletAddress(address) {
      // Basic Ethereum-style address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },

    async handleDeposit() {
      if (this.loading || !this.isFormValid) return;

      this.loading = true;
      this.error = null;

      try {
        await this.createDeposit(this.form);
        // Reset form
        this.form = {
          currency: '',
          amount: null,
          walletAddress: ''
        };
        // Refresh deposits list
        await this.fetchDeposits();
      } catch (error) {
        this.error = error.message || 'Failed to create deposit request';
      } finally {
        this.loading = false;
      }
    },

    formatAmount(amount) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8
      }).format(amount);
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
    // Fetch user's deposit history
    try {
      await this.fetchDeposits();
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/constants';

.deposit-page {
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

.deposit-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.deposit-form-section,
.deposit-info-section {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.deposit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.deposit-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: $radius2;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-card,
.warning-card {
  background: var(--bg-primary);
  border-radius: $radius2;
  padding: 24px;
}

.info-title {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  h4 {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  p {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
}

.warning-card {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  margin-top: 20px;

  .warning-icon {
    color: var(--error-text);
    font-size: 24px;
    margin-bottom: 16px;
  }

  .warning-content {
    h4 {
      color: var(--error-text);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    ul {
      color: var(--error-text);
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        font-size: 14px;
      }
    }
  }
}

.deposit-history-section {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

.deposits-table {
  .table-header,
  .table-row {
    display: grid;
    grid-template-columns: 1fr 100px 120px 120px;
    gap: 16px;
    padding: 12px 0;
    align-items: center;
  }

  .table-header {
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

    &.confirmed {
      background: var(--success-bg);
      color: var(--success-text);
    }

    &.failed {
      background: var(--error-bg);
      color: var(--error-text);
    }
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
  .deposit-page {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .deposit-container {
    gap: 20px;
  }

  .deposit-form-section,
  .deposit-info-section {
    padding: 20px;
  }

  .deposits-table {
    .table-header,
    .table-row {
      grid-template-columns: 1fr 80px 100px 100px;
      gap: 8px;
      font-size: 12px;
    }
  }
}
</style>
