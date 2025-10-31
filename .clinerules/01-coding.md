# Coding Standards - Hashboard

## Vue.js Development Standards

### Component Architecture
- **Composition API Required**: All new components built after April 2024 MUST use Vue 3 Composition API
- **Atomic Design Pattern**: Organize components following atoms → molecules → organisms → templates → pages hierarchy
- **Single Responsibility**: Each component should have one clear purpose and responsibility
- **Props/Emits Interface**: Strictly type component interfaces with clear prop validation and emit definitions

### Naming Conventions
- **Components**: PascalCase for component names (e.g., `DataTable.vue`, `WalletConnector.vue`)
- **Files**: kebab-case for file names (e.g., `wallet-connector.vue`)
- **Directories**: kebab-case for directory names following atomic design structure
- **Variables/Functions**: camelCase for JavaScript, PascalCase for component references
- **Constants**: SCREAMING_SNAKE_CASE for configuration constants

### Code Organization
```vue
<script setup>
// Imports (external libraries first, then internal)
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import DataTable from '@/components/data/DataTable.vue'

// Composables and reactive data
const store = useStore()
const loading = ref(false)
const data = ref([])

// Computed properties
const processedData = computed(() => {
  return data.value.filter(item => item.active)
})

// Methods
const fetchData = async () => {
  try {
    loading.value = true
    const result = await store.dispatch('fetchMiningData')
    data.value = result
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchData()
})
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Scoped styles */
</style>
```

## TypeScript Integration
- Use TypeScript for all new utilities and complex business logic
- Define interfaces for API responses and component props
- Leverage type inference where possible
- Avoid `any` type - use proper type definitions

## State Management
- **Vuex Store**: Use modular Vuex store for global state management
- **Store Modules**: Organize store by feature domains (wallet, forum, data)
- **Actions for Async**: Use actions for API calls and complex async operations
- **Mutations for Sync**: Use mutations for synchronous state updates
- **Getters for Computed**: Use getters for derived state

## API Integration
- **Service Layer**: Centralize API calls in dedicated service classes
- **Error Handling**: Implement consistent error handling with user-friendly messages
- **Caching Strategy**: Use appropriate caching for performance (localStorage, memory)
- **Retry Logic**: Implement automatic retry for failed API calls

## Performance Standards
- **Lazy Loading**: Implement route-based and component-based lazy loading
- **Memoization**: Use computed properties and memoization for expensive calculations
- **Virtualization**: Consider virtualization for large data sets
- **Bundle Optimization**: Keep initial bundle size under 3 seconds load time

## Testing Requirements
- **Unit Tests**: Required for utilities, composables, and complex components
- **Component Tests**: Required for critical UI components
- **Integration Tests**: Required for key user flows
- **E2E Tests**: Required for critical user journeys

## Code Quality
- **ESLint Compliance**: All code must pass ESLint validation
- **Prettier Formatting**: Use Prettier for consistent code formatting
- **Pre-commit Hooks**: Code quality checks run automatically on commits
- **Code Reviews**: All changes require peer review before merging

## Security Considerations
- **Input Validation**: Validate all user inputs on client and server side
- **XSS Prevention**: Sanitize dynamic content and use CSP headers
- **Web3 Security**: Follow Web3 security best practices for wallet interactions
- **API Security**: Never expose sensitive credentials in client code
