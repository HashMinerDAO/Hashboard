<template>
  <div class="investment-page">
    <div class="page-header">
      <h1 class="page-title">My Investments</h1>
      <p class="page-subtitle">Track your portfolio performance and ROI</p>
    </div>

    <div class="investment-overview" v-if="investments.length > 0">
      <div class="overview-cards">
        <div class="overview-card">
          <h3>Total Invested</h3>
          <div class="amount">{{ formatCurrency(totalInvested) }}</div>
        </div>
        <div class="overview-card">
          <h3>Total ROI</h3>
          <div class="amount" :class="{ positive: totalROI > 0, negative: totalROI < 0 }">
            {{ formatCurrency(totalROI) }}
          </div>
        </div>
        <div class="overview-card">
          <h3>Portfolio Value</h3>
          <div class="amount">{{ formatCurrency(totalValue) }}</div>
        </div>
        <div class="overview-card">
          <h3>Avg. Daily Return</h3>
          <div class="amount">{{ formatPercentage(avgDailyReturn) }}</div>
        </div>
      </div>
    </div>

    <div class="investment-actions">
      <button
        class="create-investment-btn"
        @click="showCreateForm = !showCreateForm"
      >
        <b-icon-plus-circle />
        Create New Investment
      </button>
    </div>

    <!-- Create Investment Form -->
    <div v-if="showCreateForm" class="create-investment-form">
      <div class="form-card">
        <h3>Create Investment</h3>
        <form @submit.prevent="handleCreateInvestment">
          <div class="form-row">
            <div class="form-group">
              <label for="investment-currency" class="form-label">Currency</label>
              <select
                id="investment-currency"
                v-model="newInvestment.currency"
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
              <label for="investment-amount" class="form-label">Amount</label>
              <div class="amount-input-group">
                <input
                  id="investment-amount"
                  v-model.number="newInvestment.amount"
                  type="number"
                  class="form-input"
                  placeholder="0.00"
                  step="0.00000001"
                  min="0.00000001"
                  :max="userBalance"
                  required
                  :disabled="loading"
                />
                <span class="currency-symbol">{{ newInvestment.currency || 'USD' }}</span>
              </div>
              <small class="form-hint">
                Available balance: {{ formatCurrency(userBalance) }}
              </small>
            </div>
          </div>

          <div class="mining-info" v-if="newInvestment.currency">
            <div class="info-item">
              <span class="label">Mining Hashrate:</span>
              <span class="value">{{ getMiningInfo(newInvestment.currency).hashrate }} TH/s</span>
            </div>
            <div class="info-item">
              <span class="label">Efficiency:</span>
              <span class="value">{{ formatPercentage(getMiningInfo(newInvestment.currency).efficiency) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Est. Daily ROI:</span>
              <span class="value">{{ formatPercentage(getMiningInfo(newInvestment.currency).dailyROI) }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="cancel-btn"
              @click="showCreateForm = false"
              :disabled="loading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? 'Creating Investment...' : 'Create Investment' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Investments List -->
    <div class="investments-section">
      <div v-if="investments.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <b-icon-graph-up />
        </div>
        <h3>No Investments Yet</h3>
        <p>Start building your portfolio by creating your first investment</p>
        <button class="create-first-btn" @click="showCreateForm = true">
          Create Your First Investment
        </button>
      </div>

      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner large"></div>
        <p>Loading your investments...</p>
      </div>

      <div v-else class="investments-grid">
        <div
          v-for="investment in investments"
          :key="investment.id"
          class="investment-card"
        >
          <div class="card-header">
            <div class="currency-info">
              <div class="currency-symbol">{{ investment.currency }}</div>
              <div class="currency-name">{{ getCurrencyName(investment.currency) }}</div>
            </div>
            <div class="status-badge" :class="investment.status">
              {{ investment.status }}
            </div>
          </div>

          <div class="card-body">
            <div class="metric">
              <span class="label">Invested Amount</span>
              <span class="value">{{ formatCurrency(investment.amount) }}</span>
            </div>

            <div class="metric">
              <span class="label">Current ROI</span>
              <span class="value" :class="{ positive: investment.currentROI > 0 }">
                {{ formatCurrency(investment.currentROI) }}
              </span>
            </div>

            <div class="metric">
              <span class="label">Total Value</span>
              <span class="value">{{ formatCurrency(investment.totalValue) }}</span>
            </div>

            <div class="metric">
              <span class="label">Daily Rate</span>
              <span class="value">{{ formatPercentage(investment.dailyRate) }}</span>
            </div>

            <div class="metric">
              <span class="label">Mining Hashrate</span>
              <span class="value">{{ investment.miningHashrate }} TH/s</span>
            </div>

            <div class="metric">
              <span class="label">Start Date</span>
              <span class="value">{{ formatDate(investment.start_date) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="update-roi-btn"
              @click="updateInvestmentROI(investment.id)"
              :disabled="updatingROI === investment.id"
            >
              <span v-if="updatingROI === investment.id" class="loading-spinner small"></span>
              Update ROI
            </button>
            <button
              class="details-btn"
              @click="viewInvestmentDetails(investment)"
            >
              View Details
            </button>
          </div>
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
  name: 'InvestmentPage',
  data() {
    return {
      showCreateForm: false,
      newInvestment: {
        currency: '',
        amount: null
      },
      loading: false,
      updatingROI: null,
      error: null,
      selectedInvestment: null
    };
  },
  computed: {
    ...mapGetters({
      investments: 'getInvestments',
      user: 'getUser',
      userBalance: 'getUserBalance'
    }),

    isFormValid() {
      return (
        this.newInvestment.currency &&
        this.newInvestment.amount &&
        this.newInvestment.amount > 0 &&
        this.newInvestment.amount <= this.userBalance
      );
    },

    totalInvested() {
      return this.investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    },

    totalROI() {
      return this.investments.reduce((sum, inv) => sum + parseFloat(inv.currentROI || 0), 0);
    },

    totalValue() {
      return this.totalInvested + this.totalROI;
    },

    avgDailyReturn() {
      if (this.investments.length === 0) return 0;
      const totalDailyReturn = this.investments.reduce((sum, inv) => sum + parseFloat(inv.dailyRate || 0), 0);
      return totalDailyReturn / this.investments.length;
    }
  },
  methods: {
    ...mapActions(['createInvestment', 'fetchInvestments']),

    getMiningInfo(currency) {
      const miningData = {
        'BTC': { hashrate: 450, efficiency: 0.95, dailyROI: 0.001 },
        'ETH': { hashrate: 1200, efficiency: 0.88, dailyROI: 0.0012 },
        'BNB': { hashrate: 850, efficiency: 0.92, dailyROI: 0.0009 },
        'ADA': { hashrate: 650, efficiency: 0.89, dailyROI: 0.0011 },
        'SOL': { hashrate: 950, efficiency: 0.91, dailyROI: 0.0013 },
        'DOT': { hashrate: 720, efficiency: 0.87, dailyROI: 0.0010 },
        'DOGE': { hashrate: 580, efficiency: 0.86, dailyROI: 0.0008 },
        'AVAX': { hashrate: 780, efficiency: 0.90, dailyROI: 0.0011 },
        'LUNA': { hashrate: 690, efficiency: 0.88, dailyROI: 0.0009 },
        'MATIC': { hashrate: 820, efficiency: 0.93, dailyROI: 0.0010 }
      };
      return miningData[currency] || { hashrate: 500, efficiency: 0.85, dailyROI: 0.001 };
    },

    getCurrencyName(symbol) {
      const names = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'BNB': 'Binance Coin',
        'ADA': 'Cardano',
        'SOL': 'Solana',
        'DOT': 'Polkadot',
        'DOGE': 'Dogecoin',
        'AVAX': 'Avalanche',
        'LUNA': 'Terra',
        'MATIC': 'Polygon'
      };
      return names[symbol] || symbol;
    },

    async handleCreateInvestment() {
      if (this.loading || !this.isFormValid) return;

      this.loading = true;
      this.error = null;

      try {
        await this.createInvestment(this.newInvestment);
        this.newInvestment = { currency: '', amount: null };
        this.showCreateForm = false;
        await this.fetchInvestments();
      } catch (error) {
        this.error = error.message || 'Failed to create investment';
      } finally {
        this.loading = false;
      }
    },

    async updateInvestmentROI(investmentId) {
      if (this.updatingROI) return;

      this.updatingROI = investmentId;
      this.error = null;

      try {
        // This would call the update ROI endpoint
        await this.fetchInvestments(); // Refresh the list
      } catch (error) {
        this.error = 'Failed to update ROI';
      } finally {
        this.updatingROI = null;
      }
    },

    viewInvestmentDetails(investment) {
      // Navigate to detailed view or open modal
      this.$router.push(`/investments/${investment.id}`);
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(amount || 0);
    },

    formatPercentage(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
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
      await this.fetchInvestments();
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/constants';

.investment-page {
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

.investment-overview {
  margin-bottom: 40px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.overview-card {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .amount {
    color: var(--text-primary);
    font-size: 28px;
    font-weight: 600;

    &.positive {
      color: var(--success-text);
    }

    &.negative {
      color: var(--error-text);
    }
  }
}

.investment-actions {
  margin-bottom: 30px;
  text-align: center;
}

.create-investment-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: $radius2;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--primary-hover);
  }
}

.create-investment-form {
  margin-bottom: 40px;
}

.form-card {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;

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

.mining-info {
  background: var(--bg-primary);
  border-radius: $radius2;
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
  }
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: $radius2;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: transparent;
  color: var(--text-secondary);
  border: 2px solid var(--border-color);

  &:hover:not(:disabled) {
    background: var(--hover-bg);
  }
}

.submit-btn {
  background: var(--primary);
  color: white;
  border: 2px solid var(--primary);

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
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
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &.large {
    width: 24px;
    height: 24px;
  }

  &.small {
    width: 12px;
    height: 12px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.investments-section {
  margin-top: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: $radius3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .empty-icon {
    font-size: 64px;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  h3 {
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  p {
    color: var(--text-secondary);
    font-size: 16px;
    margin-bottom: 24px;
  }

  .create-first-btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: $radius2;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--primary-hover);
    }
  }
}

.loading-state {
  text-align: center;
  padding: 60px 20px;

  p {
    color: var(--text-secondary);
    font-size: 16px;
    margin-top: 16px;
  }
}

.investments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.investment-card {
  background: var(--card-bg);
  border-radius: $radius3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  background: var(--bg-primary);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.currency-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .currency-symbol {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .currency-name {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: $radius1;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;

  &.active {
    background: var(--success-bg);
    color: var(--success-text);
  }

  &.completed {
    background: var(--info-bg);
    color: var(--info-text);
  }

  &.paused {
    background: var(--warning-bg);
    color: var(--warning-text);
  }
}

.card-body {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);

    &.positive {
      color: var(--success-text);
    }
  }
}

.card-actions {
  padding: 20px;
  background: var(--bg-primary);
  display: flex;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
}

.update-roi-btn,
.details-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: $radius2;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.update-roi-btn {
  background: var(--secondary);
  color: var(--secondary);
  border: 2px solid var(--secondary);

  &:hover:not(:disabled) {
    background: var(--secondary-bg);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.details-btn {
  background: var(--primary);
  color: white;
  border: 2px solid var(--primary);

  &:hover {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
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
  .investment-page {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 20px;
  }

  .mining-info {
    grid-template-columns: 1fr;
  }
}
</style>
