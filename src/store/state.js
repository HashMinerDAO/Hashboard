let state = {
  application: {
    notifications: [],
    version: false,
    applicationLoaded: false,
    name: false,
    //UI States
    routerLoaded: false,
    uiSidebarCollapse: false,
    uiDemoValues: false,
    uiListSearchTerm: '',
    uiView: 'grid',
    uiThemeDark: true,
    activeFarm: 'lincoin',
    postBodyByteLimit: 950000,
    postTextBytesMin: 16,
    postTextCharacterMin: 10,
    postTitleCharacterLimit: 1000,
    postBodyCharacterLimit: 20000,
    forumTopics: {
      quantities: false,
      names: ['General', 'Organization', 'Governance', 'Mining', 'Economics', 'Proposals']
    },
    systemCurrencies: false,
    disclaimerAgreed: false,
  },
  // User Authentication State
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  // Investment Platform State
  investments: {
    list: [],
    currentInvestment: null,
    loading: false,
    error: null
  },
  deposits: {
    list: [],
    loading: false,
    error: null
  },
  withdrawals: {
    list: [],
    loading: false,
    error: null
  },
  // Legacy wallet state (for backward compatibility)
  wallet: false,
  holdings: { btc: false, eth: false },
  rates: false,
  snapshot: false,
  snapshotUser: false,
  test: false,
  forumProfile: false,
  forumPostsCache: false,
  forumPosts: {
    total: false,
    page: 0,
    paginationLimit: 50,
  },
  forumPostRepliesWatcherFlag: false,
  ens: {
    name: false,
    avatar: false,
    systemUseENS: false,
  },
  graphQL: { graphQL: false, graphQLDynamic: false, hedgeyGraphQL: false, },
  snapshotSpaces: false,
  physical_assets: false,
  // Legacy application state (keeping for compatibility)
  data: {},
  payload: false,
}
export default state
