# System Patterns: Hashboard Architecture

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │────│   Hashboard FE  │────│  Middleware API │
│                 │    │   (Vue.js)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  External APIs  │    │   Data Sources  │
                       │                 │    │                 │
                       │ • Snapshot      │    │ • Mining Pools  │
                       │ • Hedgey        │    │ • Exchanges     │
                       │ • GraphQL       │    │ • Wallets       │
                       │ • Forum Backend │    │ • Blockchains   │
                       └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### Atomic Design Pattern
```
Atoms (Basic) → Molecules (Combined) → Organisms (Complex) → Templates → Pages
├── Interface/  - UI components (buttons, inputs, cards)
├── Charts/     - Data visualization components
├── Data/       - Data display and table components
├── Modules/    - Feature-specific component groups
├── Pages/      - Route-level page components
└── Tiles/      - Dashboard widget components
```

## Key Technical Decisions

### State Management
- **Vuex Store**: Centralized state management with modular structure
- **Store Modules**: Feature-based separation (wallet, forum, data)
- **Persistent State**: LocalStorage integration for user preferences
- **Reactive Updates**: Real-time data synchronization patterns

### API Integration Patterns
- **Service Layer**: Centralized API service classes
- **Error Handling**: Consistent error handling with user feedback
- **Caching Strategy**: Browser caching with TTL for performance
- **Retry Logic**: Automatic retry for failed API calls

### Component Patterns
- **Composition API**: Vue 3 Composition API for all new components
- **Props/Emits**: Strict typing for component interfaces
- **Scoped Styles**: CSS isolation per component
- **Event Bus**: Global event system for cross-component communication

## Critical Implementation Paths

### Data Flow: Mining Data
```
Mining Pool API → Middleware → Vuex Store → Chart Components → User Interface
      ↓              ↓           ↓             ↓              ↓
   Raw Data    Data Processing  State Update  Re-rendering   Display
```

### Authentication Flow
```
Wallet Connect → Address Validation → API Authentication → User Context → UI Updates
      ↓               ↓                    ↓                ↓           ↓
   Web3 Modal    Address Check       JWT Token       Store Update   Route Access
```

### Governance Flow
```
Snapshot API → Proposal Fetch → Voting Interface → Transaction → Confirmation
      ↓            ↓              ↓                ↓           ↓
   GraphQL Query  Data Transform  UI Components   Web3 Sign   Success State
```

## Design Patterns in Use

### Observer Pattern
- Vue reactivity system for automatic UI updates
- Vuex store subscriptions for cross-component updates
- Event listeners for real-time data updates

### Factory Pattern
- Component factories for dynamic chart generation
- API service factories for different data sources
- Configuration factories for environment-specific setup

### Strategy Pattern
- Multiple API strategies (REST, GraphQL, WebSocket)
- Different caching strategies based on data type
- Various authentication strategies (wallet, API key)

### Singleton Pattern
- Vuex store instance
- API service instances
- Configuration objects

## Component Relationships

### Core Dependencies
```
App.vue
├── Router (Vue Router)
├── Store (Vuex)
├── Main Layout
│   ├── Sidebar
│   ├── Header
│   └── Content Area
│       ├── Dashboard Pages
│       ├── Data Views
│       └── Governance
```

### Data Flow Architecture
```
External APIs → Service Layer → Store Actions → Store Mutations → Components
                      ↓              ↓              ↓              ↓
               Error Handling  State Updates  Reactive Updates  UI Changes
```

## Performance Patterns

### Lazy Loading
- Route-based code splitting
- Component lazy loading for large features
- Image lazy loading for performance

### Memoization
- Computed properties for expensive calculations
- API response caching
- Chart data memoization

### Virtualization
- Large list virtualization for forum posts
- Chart data point limiting for performance
- Progressive data loading

## Error Handling Patterns

### Global Error Boundary
- Vue error handler for uncaught errors
- API error interceptor for consistent handling
- User-friendly error messages

### Graceful Degradation
- Fallback UI for failed API calls
- Cached data display during outages
- Progressive enhancement for features

### Logging Strategy
- Error logging to console in development
- User action tracking for analytics
- Performance monitoring integration
