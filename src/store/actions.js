/* eslint-disable */

const endpoint = import.meta.env.VITE_MIDDLEWARE_URL
import { encodeStr } from '@/utils/strings.js'

const actions = {
  async init({ context, getters, dispatch, commit }) {
    try {
      commit("setDynamic", {
        item: 'version',
        value: import.meta.env.VITE_GIT_HASH
      })
      for (const [key, value] of Object.entries(localStorage)) {
        commit("setDynamic", {
          item: key,
          value: value
        })
      }

      // Try to fetch data but don't fail if it doesn't work
      try {
        await dispatch('expressFetch', { commit, dispatch, getters, context })
      } catch (e) {
        console.warn("Express fetch failed during init, continuing:", e)
      }

      commit("setDynamic", {
        item: 'name',
        value: import.meta.env.VITE_APPLICATION_NAME
      })

      commit('setDynamic', { item: 'applicationLoaded', value: true })
      dispatch('responsiveUI', { commit })
    } catch (e) {
      console.error("Store init failed:", e)
      // Still mark as loaded even if init fails
      commit('setDynamic', { item: 'applicationLoaded', value: true })
      dispatch('responsiveUI', { commit })
    }
  },
  fetchLincoin({ commit, dispatch, getters, context }) {
    commit("setData", { item: 'synchronisationStatus', value: "syncing" })


    let endpoint = import.meta.env.VITE_MIDDLEWARE_URL
    try {
      fetch(`${endpoint}/api/get-data`, { method: 'get' })
        .then(result => { return result.json() }).then(data => {
          commit("setPayload", data.payload)
          commit("setData", { item: 'synchronisation', value: Date.now() })
          commit("setData", { item: 'synchronisationStatus', value: false })
        })
    } catch (e) {
      commit("setData", { item: 'synchronisationStatus', value: "error" })
      commit("setNotification", {
        title: "Synchronisation did not complete",
        className: 'error',
        data: "Features which rely on exchange data may not be available.",
      })
    }

    let c = commit
    let d = dispatch
    let g = getters
    let co = context
    let rg = rootGetters
    let parentTimeout = false
    let secondaryTimeout = false

    clearTimeout(parentTimeout)
    clearTimeout(secondaryTimeout)
    parentTimeout = setTimeout(() => {
      secondaryTimeout = setTimeout(() => {
        dispatch('fetchLincoin', { c, d, g, co, rg })
      }, 120000)
    }, 2000)

  },
  async geoLocation({ commit, dispatch, getters, context }) {
    let geoBlocked = false
    if (!localStorage.getItem("synchronisation")) {
      localStorage.setItem("synchronisation", Date.now())
    }
    if (localStorage.getItem("geoBlocked")) {
      geoBlocked = localStorage.getItem("geoBlocked")
      commit("setData", { item: 'geoBlocked', value: JSON.parse(geoBlocked) })
    }
    let sync = localStorage.getItem("synchronisation")
    if (!geoBlocked || (Date.now() - Number(sync) >= 720000)) {
      //NEW CALL
      const geo = await fetch(`${endpoint}/geolocation`, { method: 'POST', })
      let payload = await geo.json();
      localStorage.setItem("geoBlocked", JSON.stringify(payload.payload))
      commit("setData", { item: 'geoBlocked', value: payload.payload })
    }
  },
  expressFetch({ commit, dispatch, getters, context }) {
    commit("setData", { item: 'synchronisationStatus', value: "syncing" })
    try {
      fetch(`${endpoint}/api/get-data-express`, { method: 'get' })
        .then(result => {
          if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`)
          }
          return result.json()
        })
        .then(data => {
          if (data.payload) {
            try {
              commit("setHoldingsBTC", data.payload.btc.response)
            } catch(e){ console.log("Missing data:" + e) }
            try {
              commit("setHoldingsETH", data.payload.eth.response)
            } catch(e){ console.log("Missing data:" + e) }
            try {
              commit("setRates", data.payload.cached_exchange_rates)
              commit("setDynamic", { item: 'systemCurrencies', value: data.payload.systemCurrencies })
            } catch(e){ console.log("Missing data:" + e) }
            try {
              commit("setPhysicalAssets", data.payload.physical_assets)
            } catch(e){ console.log("Missing data:" + e) }
            try {
              commit("setGraphQL", data.payload.graphQL)
              commit("setGraphQLDynamic", data.payload.graphQLDynamic)
              commit("setSnapshotSpaces", data.payload.snapshotSpaces)
              commit("setHedgeyGraphQL", data.payload.hedgeyGraphQL)
            } catch(e){ console.log("Missing data:" + e) }
          }
        })
        .catch(e => {
          console.warn("API fetch failed, continuing with app:", e)
          commit("setData", { item: 'synchronisationStatus', value: "error" })
          // Don't show error notification to avoid blocking app load
        })
    } catch (e) {
      console.warn("API fetch error, continuing with app:", e)
      commit("setData", { item: 'synchronisationStatus', value: "error" })
    }
    let parentTimeout = false
    let secondaryTimeout = false

    clearTimeout(parentTimeout)
    clearTimeout(secondaryTimeout)
    parentTimeout = setTimeout(() => {
      commit("setData", { item: 'synchronisation', value: Date.now() })
      commit("setData", { item: 'assets', value: Date.now() })
      commit("setData", { item: 'synchronisationStatus', value: false })
      dispatch('geoLocation', { commit, dispatch, getters, context })

      secondaryTimeout = setTimeout(() => {
        dispatch('expressFetch', { commit, dispatch, getters, context })
      }, 900000)
    }, 2000)
  },
  async queryHedgeyVestingNFTs({ commit, dispatch, getters }, data) {
    let hedgeyGraphQL = data.graphQLKey?getters.graphQL.hedgeyGraphQL[data.graphQLKey]:getters.graphQL.hedgeyGraphQL.VestingPlans
    const address = data.id ? data.id : data
    const token = data.token ? data.token : ''
    let payload = {}
    if (hedgeyGraphQL && address) {
      const login = await fetch(
        'https://us-east-1.aws.realm.mongodb.com/api/client/v2.0/app/hedgeyotc-tuolf/auth/providers/anon-user/login',
        {
          method: 'POST',
        })
      payload.login = await login.json();
      let query = hedgeyGraphQL.replace(/\$address/g, address.toLowerCase()).replace(/\$token/g, token.toLowerCase())
      payload.query = query
      const result = await fetch(
        'https://us-east-1.aws.realm.mongodb.com/api/client/v2.0/app/hedgeyotc-tuolf/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${payload.login.access_token}`
          },
          body: query,
        }
      )
      payload.result = await result.json();

    } else {
      console.log("Missing Hedgey data: no graphQL")
    }
    return { payload: payload }
  },
  async getSnapshot({ commit, dispatch, getters }) {
    let graphQL = getters.graphQL.graphQL
    let snapshotSpaces = getters.snapshotSpaces

    let payload = false
    if (graphQL && snapshotSpaces) {
      let query = graphQL
      const result = await fetch(
        'https://hub.snapshot.org/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
          })
        }
      )
      payload = await result.json();
    } else {
      console.log("Missing snapshot data: " + (!graphQL?'no graphQL ':' ') + ( !snapshotSpaces?'no snapshotSpaces':''))
    }
    commit("setSnapshot", payload)
  },
  async getSnapshotUser({ commit, dispatch, getters, context }, data) {
    dispatch('getSnapshot', { commit, dispatch, getters })

    let graphQLDynamic = getters.graphQL.graphQLDynamic
    if (graphQLDynamic) {
      let payload = {}
      for (const [key, value] of Object.entries(graphQLDynamic)) {
        let query = value.query.replace(/\$address/g, data.address)
        const result = await fetch(
          'https://hub.snapshot.org/graphql',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: query,
            })
          }
        )
        payload[key] = await result.json();
      }
      commit("setSnapshotUser", payload)

    } else {
      console.log("Missing snapshot data: no graphQLDynamic")
    }
  },
  initProfile({ commit, dispatch, getters, context }, payload) {
    fetch(`${endpoint}/forum/init`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ address: payload.address })
    })
      .then(result => { return result.json() }).then(data => {
        payload.store.commit("setForum", data.payload?.profile)
        payload.store.dispatch("fetchPosts", { id: payload.address, store: payload.store })
      })
  },
  async submitPost({ commit, dispatch, getters, context }, payload) {
    let encodedPost = encodeStr(JSON.stringify(payload.post))
    let post = await fetch(`${endpoint}/forum/new-post`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ post: payload.post, address: payload.id })
    })
    return post.json()
  },
  async fetchPosts({ commit, dispatch, getters, context }, payload) {
    let start = payload.start ? payload.start : 0
    let end = payload.end ? payload.end : 50
    let category = payload.category ? payload.category : false
    let posts = await fetch(`${endpoint}/forum/fetch-posts`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ limit: { start: start, end: end }, address: payload.id, category: category })
    })
    let postsPayload = await posts.json()
    if (postsPayload.payload.posts) {
      if (payload.store) { payload.store.commit('setForumPostsCache', postsPayload.payload) }
      else if (commit) { commit('setForumPostsCache', postsPayload.payload) }
    }
  },
  async viewPost({ commit, dispatch, getters, context }, payload) {
    await fetch(`${endpoint}/forum/increment-view`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ id: payload.id, address: payload.address })
    })
  },
  async vote({ commit, dispatch, getters, context }, payload) {
    const request = await fetch(`${endpoint}/forum/vote`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ direction: payload.direction, topic_id: payload.topic_id, comment_id: payload.comment_id, address: payload.address })
    })
    let response = await request.json()
    if (response.payload) { return response }
    else { return { error: 'Failed to submit vote.' } }
  },
  async submitReply({ commit, dispatch, getters, context }, payload) {
    let encodedPost = encodeStr(JSON.stringify(payload.post))
    let post = await fetch(`${endpoint}/forum/new-reply`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ post: payload.post, address: payload.id })
    })
    return post.json()
  },
  async fetchPostReplies({ commit, dispatch, getters, context }, payload) {
    let posts = await fetch(`${endpoint}/forum/fetch-post-replies`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ limit: { start: 0, end: 50 }, address: payload.id, topic_id: payload.topic_id })
    })
    let postsPayload = await posts.json()
    if (postsPayload.payload.replies) { return postsPayload.payload.replies }
    else { return { error: 'Failed to fetch comments.' } }
  },
  async snapshotUnfollow({ commit, dispatch, getters, context }, payload) {
    let request = await fetch(`${endpoint}/snapshot/unfollow`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ address: payload.address })
    })
    let response = await request.json()
    if (response.payload) { return response.payload }
    else { return { error: 'Failed to fetch comments.' } }
  },
  async fetchHedgeyVesting({ commit, dispatch, getters, context }, payload) {
    let response = await fetch(`${endpoint}/vesting/hedgey`, {
      method: 'post', headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ address: payload.id })
    })
    let responsePayload = await response.json()
    return responsePayload
  },
  responsiveUI({ commit }) {
    if (window.innerWidth <= 1200) {
      commit("setDynamic", {
        item: 'uiSidebarCollapse',
        value: true
      })
    }
    let c = commit
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 1200) {
        c("setDynamic", {
          item: 'uiSidebarCollapse',
          value: true
        })
      }
    })
  },
  async backendAPI({ commit }, url) {
    // Default options are marked with *
    const requestURL = `https://api.flat18.co.uk/hashminer/`
    let query = await fetch(requestURL, {
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: JSON.stringify({ data: url })
    })

    return { data: await query }

  },
  test(payload) {
    console.log(payload)
  },

  // Authentication actions
  async registerUser({ commit }, userData) {
    commit('setAuthLoading', true);
    commit('setAuthError', null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Set user and token in state
      commit('setAuthUser', data.user);
      commit('setAuthToken', data.token);

      return data;
    } catch (error) {
      commit('setAuthError', error.message);
      throw error;
    } finally {
      commit('setAuthLoading', false);
    }
  },

  async loginUser({ commit }, credentials) {
    commit('setAuthLoading', true);
    commit('setAuthError', null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Set user and token in state
      commit('setAuthUser', data.user);
      commit('setAuthToken', data.token);

      return data;
    } catch (error) {
      commit('setAuthError', error.message);
      throw error;
    } finally {
      commit('setAuthLoading', false);
    }
  },

  async logoutUser({ commit, getters }) {
    try {
      // Call logout endpoint if needed
      const token = getters.getAuthToken;
      if (token) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      commit('logout');
    }
  },

  async fetchUserProfile({ commit, getters }) {
    const token = getters.getAuthToken;
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        commit('setAuthUser', data.user);
      } else if (response.status === 401) {
        // Token expired, logout
        commit('logout');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  },

  // Initialize auth state from localStorage
  initializeAuth({ commit, dispatch }) {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        commit('setAuthToken', token);
        commit('setAuthUser', userData);

        // Verify token is still valid
        dispatch('fetchUserProfile');
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  },

  // Investment Platform Actions
  async createDeposit({ commit, getters }, depositData) {
    commit('setDepositLoading', true);
    commit('setDepositError', null);

    try {
      const token = getters.getAuthToken;
      const response = await fetch('http://localhost:3001/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(depositData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create deposit');
      }

      return data;
    } catch (error) {
      commit('setDepositError', error.message);
      throw error;
    } finally {
      commit('setDepositLoading', false);
    }
  },

  async fetchDeposits({ commit, getters }) {
    commit('setDepositLoading', true);
    commit('setDepositError', null);

    try {
      const token = getters.getAuthToken;
      const response = await fetch('http://localhost:3001/api/deposits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deposits');
      }

      const data = await response.json();
      commit('setDeposits', data.deposits);
      return data.deposits;
    } catch (error) {
      commit('setDepositError', error.message);
      throw error;
    } finally {
      commit('setDepositLoading', false);
    }
  },

  async createInvestment({ commit, getters }, investmentData) {
    commit('setInvestmentLoading', true);
    commit('setInvestmentError', null);

    try {
      const token = getters.getAuthToken;
      const response = await fetch('http://localhost:3001/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(investmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create investment');
      }

      return data;
    } catch (error) {
      commit('setInvestmentError', error.message);
      throw error;
    } finally {
      commit('setInvestmentLoading', false);
    }
  },

  async fetchInvestments({ commit, getters }) {
    commit('setInvestmentLoading', true);
    commit('setInvestmentError', null);

    try {
      const token = getters.getAuthToken;
      const response = await fetch('http://localhost:3001/api/investments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }

      const data = await response.json();
      commit('setInvestments', data.investments);
      return data.investments;
    } catch (error) {
      commit('setInvestmentError', error.message);
      throw error;
    } finally {
      commit('setInvestmentLoading', false);
    }
  },

  async createWithdrawal({ commit, getters }, withdrawalData) {
    commit('setWithdrawalLoading', true);
    commit('setWithdrawalError', null);

    try {
      const token = getters.getAuthToken;
      const response = await fetch('http://localhost:3001/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(withdrawalData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create withdrawal');
      }

      return data;
    } catch (error) {
      commit('setWithdrawalError', error.message);
      throw error;
    } finally {
      commit('setWithdrawalLoading', false);
    }
  },

  async fetchWithdrawals({ commit, getters }) {
    commit('setWithdrawalLoading', true);
    commit('setWithdrawalError', null);

    try {
      const token = getters.getAuthToken;
      const response = await fetch('http://localhost:3001/api/withdrawals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      commit('setWithdrawals', data.withdrawals);
      return data.withdrawals;
    } catch (error) {
      commit('setWithdrawalError', error.message);
      throw error;
    } finally {
      commit('setWithdrawalLoading', false);
    }
  },

}

export default actions
