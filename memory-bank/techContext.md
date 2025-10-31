# Technical Context: Hashboard

## Technology Stack

### Frontend Framework
- **Vue.js 3.3.8**: Progressive JavaScript framework with Composition API
- **Vite 5.2.11**: Fast build tool and development server
- **Vue Router 4.2.5**: Official routing library for Vue.js
- **Vuex 4.1.0**: State management pattern and library

### Build and Development Tools
- **Vite**: Development server and build tool
- **ESLint**: Code linting with Vue-specific rules
- **Prettier**: Code formatting
- **TypeScript 5.2.2**: Type safety for JavaScript

### UI and Styling
- **Bootstrap Icons Vue**: Icon library integration
- **Bootstrap**: CSS framework for responsive design
- **SCSS/Sass**: CSS preprocessing
- **Tailwind CSS**: Utility-first CSS framework

### Data Visualization
- **Chart.js 4.4.0**: Simple yet flexible charting library
- **Vue-ChartJS 5.2.0**: Vue wrapper for Chart.js
- **Lightweight Charts 4.1.0**: Financial charting library
- **TradingView Widgets**: Advanced trading charts

### Web3 Integration
- **Ethers.js 5.7.0**: Ethereum JavaScript library
- **Web3Modal**: Wallet connection interface
- **ENS.js**: Ethereum Name Service integration

### API and Data
- **Apollo Client**: GraphQL client for API queries
- **Axios**: HTTP client for REST APIs
- **GraphQL**: Query language for APIs

### Development Dependencies
- **Vitest**: Unit testing framework
- **Happy DOM**: DOM simulation for testing
- **Rollup**: Module bundler for libraries

## Development Environment

### Prerequisites
- **Node.js v20+**: JavaScript runtime
- **npm or yarn**: Package management
- **Git**: Version control

### Environment Variables
```bash
# Required environment variables
VITE_MIDDLEWARE_URL=         # Backend API endpoint
VITE_WALLET_CONNECT_PROJECT_ID= # WalletConnect project ID
VITE_ALCHEMY_API_KEY=        # Alchemy API key for Ethereum
VITE_APPLICATION_NAME=       # App display name
```

### Development Commands
```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Production build
npm run lint   # Code linting
npm run serve  # Preview production build
```

## Technical Constraints

### Browser Support
- Modern browsers with ES6+ support
- Web3 wallet extensions required for full functionality
- Progressive enhancement for older browsers

### Performance Requirements
- Initial load time < 3 seconds
- Time to interactive < 5 seconds
- Support for 1000+ concurrent users
- Real-time data updates every 15-30 seconds

### Security Considerations
- Client-side only - no sensitive data storage
- HTTPS required for all connections
- CSP headers for script security
- Input validation on all user inputs

### Scalability Limits
- API rate limits from external services
- Browser storage limits for caching
- WebSocket connection limits for real-time data

## Dependencies and Integrations

### External APIs
- **Hashminer Middleware**: Primary data source for mining and financial data
- **Snapshot**: Governance proposal and voting data
- **Hedgey**: Vesting schedule information
- **GraphQL Endpoints**: Various blockchain data providers
- **Exchange APIs**: Market data and trading information

### Third-Party Services
- **WalletConnect**: Multi-wallet connection protocol
- **Alchemy**: Ethereum node provider
- **Infura**: Alternative Ethereum node provider
- **TradingView**: Advanced charting widgets

### Internal Dependencies
- **Forum Backend**: Community discussion platform
- **Notification System**: Real-time alerts and updates
- **Analytics**: User behavior tracking

## Tool Usage Patterns

### Version Control
- Git with GitHub for repository hosting
- Feature branches for development
- Pull requests for code review
- Semantic versioning for releases

### Code Quality
- ESLint for code style enforcement
- Pre-commit hooks for quality checks
- Automated testing with Vitest
- Code coverage reporting

### Deployment
- Cloudflare Pages for hosting
- CI/CD pipelines for automated deployment
- Environment-specific configurations
- Rollback capabilities for issues

### Monitoring
- Error tracking with Sentry
- Performance monitoring with analytics
- User feedback collection
- API health monitoring

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (`npm install`)
3. Configure environment variables
4. Start development server (`npm run dev`)
5. Make changes with hot reload
6. Test changes locally

### Testing Strategy
- Unit tests for utilities and components
- Integration tests for API interactions
- E2E tests for critical user flows
- Visual regression testing for UI changes

### Deployment Process
1. Create feature branch
2. Implement changes with tests
3. Code review via pull request
4. Merge to main branch
5. Automated deployment to staging
6. Manual promotion to production
7. Monitoring and rollback if needed
