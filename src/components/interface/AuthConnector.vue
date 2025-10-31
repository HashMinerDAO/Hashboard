<template>
  <div v-if="!isAuthenticated" class="auth-connector">
    <router-link to="/login" class="auth-button login-btn">
      <b-icon-box-arrow-in-right />
      <span>Sign In</span>
    </router-link>

    <router-link to="/register" class="auth-button register-btn">
      <b-icon-person-plus />
      <span>Sign Up</span>
    </router-link>
  </div>

  <div v-else class="user-menu">
    <div class="user-info" @click="toggleDropdown">
      <div class="user-avatar">
        <b-icon-person-circle />
      </div>
      <div class="user-details">
        <div class="user-email">{{ user?.email }}</div>
        <div class="user-balance">
          Balance: {{ formatBalance(userBalance) }} USD
        </div>
      </div>
      <b-icon-chevron-down class="dropdown-icon" :class="{ rotated: showDropdown }" />
    </div>

    <div v-if="showDropdown" class="user-dropdown">
      <router-link to="/profile" class="dropdown-item">
        <b-icon-person />
        <span>Profile</span>
      </router-link>

      <router-link to="/investments" class="dropdown-item">
        <b-icon-graph-up />
        <span>Investments</span>
      </router-link>

      <router-link to="/deposits" class="dropdown-item">
        <b-icon-cash />
        <span>Deposits</span>
      </router-link>

      <router-link to="/withdrawals" class="dropdown-item">
        <b-icon-cash-stack />
        <span>Withdrawals</span>
      </router-link>

      <hr class="dropdown-divider">

      <a @click="handleLogout" class="dropdown-item logout">
        <b-icon-box-arrow-right />
        <span>Sign Out</span>
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'AuthConnector',
  data() {
    return {
      showDropdown: false
    };
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'isAuthenticated',
      user: 'getUser',
      userBalance: 'getUserBalance'
    })
  },
  methods: {
    ...mapActions(['logoutUser']),

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    formatBalance(balance) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(balance || 0);
    },

    async handleLogout() {
      try {
        await this.logoutUser();
        this.showDropdown = false;
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },

  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showDropdown = false;
      }
    });
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/constants';

.auth-connector {
  display: flex;
  gap: 12px;
  align-items: center;
}

.auth-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: $radius2;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;

  &.login-btn {
    color: var(--text-primary);
    background: var(--secondary);
    border: 2px solid var(--secondary);

    &:hover {
      background: var(--secondary-bg);
      color: var(--secondary);
    }
  }

  &.register-btn {
    color: white;
    background: var(--primary);
    border: 2px solid var(--primary);

    &:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
    }
  }
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: $radius2;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--primary);
  }
}

.user-avatar {
  font-size: 24px;
  color: var(--text-secondary);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-email {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-balance {
  font-size: 12px;
  color: var(--text-secondary);
}

.dropdown-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-primary);
  font-size: 14px;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--hover-bg);
  }

  &.logout {
    color: var(--error-text);

    &:hover {
      background: var(--error-bg);
    }
  }
}

.dropdown-divider {
  margin: 8px 0;
  border: 0;
  border-top: 1px solid var(--border-color);
}
</style>
