<template lang="html">
  <div class="flex-overview demo">
    <div class="full-width-header"></div>
    <div class="page-inner">
      <img class="icon" src="/src/assets/img/zh-circle.svg">

      <h1>Welcome to #Hashboard Investment Platform</h1>
      <p>Invest in Bitcoin mining operations and track your ROI with real-time mining data integration.</p>

      <!-- Investment Summary Section -->
      <div v-if="isAuthenticated" class="investment-summary">
        <div class="summary-card">
          <h3>Portfolio Balance</h3>
          <p class="balance">${{ userBalance.toLocaleString() }}</p>
        </div>
        <div class="summary-card">
          <h3>Total ROI</h3>
          <p class="roi" :class="{ positive: totalROI >= 0, negative: totalROI < 0 }">
            {{ totalROI >= 0 ? '+' : '' }}{{ totalROI.toFixed(2) }}%
          </p>
        </div>
        <div class="summary-card">
          <h3>Active Investments</h3>
          <p class="investments">{{ investments.length }}</p>
        </div>
      </div>

      <div class="modal-relative centre" v-if="!isAuthenticated">
        <h1><i class="i-alert-circle"></i> Welcome</h1>
        <p>Please log in to access your investment dashboard.</p>
        <p class="centred-connect-btn">
          <router-link to="/login" class="btn-link">Login</router-link>
          <router-link to="/register" class="btn-link secondary">Register</router-link>
        </p>
      </div>

      <div class="container" v-if="isAuthenticated">
        <div class="section">
          <h2>Investment Dashboard:</h2>
          <div class="flex-shortcuts">
            <router-link :to="{ name: 'deposit' }" class="tile">
              <img src="/static/img/image.webp">
              <div class="text-container">
                <div class="icon"><b-icon-plus-circle /></div>
                <h3>Make a Deposit</h3>
                <p>Deposit cryptocurrencies to fund your mining investments.</p>
              </div>
            </router-link>

            <router-link :to="{ name: 'investment' }" class="tile">
              <img src="/static/img/2image.webp">
              <div class="text-container">
                <div class="icon"><b-icon-graph-up /></div>
                <h3>Manage Investments</h3>
                <p>View your portfolio, track ROI, and manage your mining investments.</p>
              </div>
            </router-link>

            <router-link :to="{ name: 'withdrawal' }" class="tile">
              <img src="/static/img/3image.webp">
              <div class="text-container">
                <div class="icon"><b-icon-cash /></div>
                <h3>Withdraw Funds</h3>
                <p>Request withdrawals from your investment balance.</p>
              </div>
            </router-link>

            <router-link :to="{ name: 'mining' }" class="tile">
              <img src="/static/img/1image.webp">
              <div class="text-container">
                <div class="icon"><b-icon-activity /></div>
                <h3>View Mining Stats</h3>
                <p>Get detailed metrics on hash rates, energy consumption, and profitability of Hashminer operations.</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

// Setup Vuex store
const store = useStore();

// Computed properties for authentication
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const userBalance = computed(() => store.getters.getUserBalance || 0);
const investments = computed(() => store.getters.getInvestments || []);

// Computed property for total ROI
const totalROI = computed(() => {
  if (!investments.value.length) return 0;
  const totalInvested = investments.value.reduce((sum, inv) => sum + inv.amount, 0);
  const currentValue = investments.value.reduce((sum, inv) => sum + (inv.amount * (1 + inv.roi / 100)), 0);
  return totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
});

// Fetch investment data on mount if authenticated
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await store.dispatch('fetchInvestments');
      await store.dispatch('fetchDeposits');
      await store.dispatch('fetchWithdrawals');
    } catch (error) {
      console.error('Failed to fetch investment data:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
@import 'src/assets/scss/constants';

.section {
  box-shadow: 0 0 0 1px var(--neutral-4);
  border-radius: $radius1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: max-content;
  padding: 20px;
  gap: 10px;

  h2 {
    margin-top: 0;
    text-align: center;
  }
}

.flex-shortcuts {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-shrink: 0;
  flex-grow: 1;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;

  a {
    display: grid;
    grid-template: 1fr / 1fr 3fr;
    padding: 20px;
    border-radius: 8px;
    background-color: var(--neutral-6);
    background-image: radial-gradient(ellipse at top right, var(--neutral-4), transparent), radial-gradient(ellipse at bottom left, var(--neutral-6), transparent);
    align-content: center;
    gap: 20px;
    transition: 200ms ease;

    &:hover {
      background: var(--brandeis-blue);
    }

    img {
      mix-blend-mode: luminosity;
      width: 200px;
      border-radius: 4px;
    }

    .text-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
      justify-content: start;
      align-items: flex-start;

      h3,
      p {
        text-align: left;
        margin: 0;
      }
      h3 {
        font-size: 24px;
      }

      .icon {
        height: auto;
        width: auto;
        margin: 0 auto 0 0;

        svg {
          height: 50px;
          width: 50px;
        }
      }
    }
  }
}

.modal-relative {
  margin: 40px auto;
  height: max-content;
  width: 500px;
  max-width: 80vw;
  padding: 30px;
  border-radius: $radius1;
  background: var(--neutral-10);
  position: relative;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

h1 {
  justify-content: center;
  align-items: center;
}

.icon {
  height: 80px;
  width: auto;
  margin: 20px auto;
  display: block;
}

p {
  max-width: calc($ui-width / 2);
  margin: 20px auto;
  display: block;
  text-align: center;
}

.centred-connect-btn {
  width: max-content;
  margin: 20px auto;
  a{
    // margin: 20px auto;
    padding: 5px 25px;}
}

.investment-summary {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  flex-wrap: wrap;

  .summary-card {
    background: var(--neutral-6);
    border-radius: $radius1;
    padding: 20px;
    text-align: center;
    min-width: 150px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: var(--neutral-2);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .balance {
      font-size: 28px;
      font-weight: bold;
      color: var(--brandeis-blue);
      margin: 0;
    }

    .roi {
      font-size: 24px;
      font-weight: bold;
      margin: 0;

      &.positive {
        color: #28a745;
      }

      &.negative {
        color: #dc3545;
      }
    }

    .investments {
      font-size: 24px;
      font-weight: bold;
      color: var(--neutral-1);
      margin: 0;
    }
  }
}
</style>
