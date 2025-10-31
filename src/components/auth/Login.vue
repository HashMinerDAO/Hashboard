<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Sign in to your Hashboard account</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="loading || !form.email || !form.password"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-links">
        <p>
          Don't have an account?
          <router-link to="/register" class="auth-link">Sign up</router-link>
        </p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'UserLogin',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      error: null
    };
  },
  methods: {
    ...mapActions(['loginUser']),

    async handleLogin() {
      if (this.loading) return;

      this.loading = true;
      this.error = null;

      try {
        await this.loginUser(this.form);
        // Redirect to dashboard on success
        this.$router.push('/');
      } catch (error) {
        this.error = error.message || 'Login failed. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/scss/constants';

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: var(--bg-primary);
}

.auth-card {
  background: var(--card-bg);
  border-radius: $radius3;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 32px;
  font-size: 16px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.auth-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px 24px;
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

.auth-links {
  text-align: center;
  margin-top: 24px;

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

.auth-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.error-message {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 12px 16px;
  border-radius: $radius2;
  margin-top: 20px;
  border: 1px solid var(--error-border);
  font-size: 14px;
  text-align: center;
}
</style>
