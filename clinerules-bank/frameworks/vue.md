# Vue.js Framework Standards

## Vue 3 Composition API Requirements

### Component Structure
- **Script Setup**: Use `<script setup>` syntax for all new components
- **Composition Functions**: Extract reusable logic into composables
- **Reactive References**: Use `ref()` and `reactive()` appropriately
- **Computed Properties**: Use `computed()` for derived state

### Component Communication
- **Props Definition**: Use `defineProps()` with TypeScript interfaces
- **Emits Definition**: Use `defineEmits()` for custom events
- **Provide/Inject**: Use for deep component communication when appropriate
- **Event Bus**: Avoid global event buses, prefer component props/emits

### Lifecycle Management
- **Composition Lifecycle**: Use lifecycle hooks from `vue` package
- **Cleanup**: Always cleanup subscriptions and timers in `onUnmounted`
- **Async Operations**: Handle component unmounting in async operations

## Component Organization

### File Structure
```
ComponentName.vue
├── <script setup> - Logic and reactivity
├── <template> - Markup structure
└── <style scoped> - Component styles
```

### Import Organization
```javascript
// External libraries
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Internal modules
import { useAuth } from '@/composables/auth'
import DataTable from '@/components/data/DataTable.vue'
```

## Performance Optimization

### Reactivity Optimization
- **Shallow Refs**: Use `shallowRef()` for large objects when deep reactivity isn't needed
- **Computed Caching**: Leverage computed properties for expensive calculations
- **Watch Effects**: Use `watchEffect()` for side effects, `watch()` for specific dependencies

### Rendering Optimization
- **v-memo**: Use for expensive operations in templates
- **v-once**: For static content that never changes
- **Functional Components**: For simple presentational components

### Bundle Optimization
- **Dynamic Imports**: Use for route-based and component lazy loading
- **Tree Shaking**: Structure code to enable effective tree shaking
- **Code Splitting**: Split large components into smaller chunks

## TypeScript Integration

### Type Definitions
```typescript
interface ComponentProps {
  data: MiningData[]
  loading: boolean
}

const props = defineProps<ComponentProps>()

interface Emits {
  update: [data: MiningData]
}

const emit = defineEmits<Emits>()
```

### Generic Components
- Use generics for flexible component APIs
- Type component slots and scoped slots
- Leverage utility types for common patterns

## Testing Standards

### Unit Testing
- **Vitest**: Primary testing framework
- **Component Testing**: Test component logic and interactions
- **Composable Testing**: Test custom composables in isolation

### Test Structure
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('DataTable', () => {
  it('renders data correctly', () => {
    const wrapper = mount(DataTable, {
      props: { data: testData }
    })
    expect(wrapper.text()).toContain('Expected Content')
  })
})
```

## Code Quality Standards

### ESLint Configuration
- Extend `eslint:recommended` and `@vue/eslint-config-prettier`
- Enable Vue 3 specific rules
- Custom rules for project conventions

### Prettier Configuration
- Consistent formatting across the codebase
- Vue-specific formatting rules
- Integration with ESLint

## Accessibility Standards

### ARIA Attributes
- Use semantic HTML elements
- Provide appropriate ARIA labels
- Support keyboard navigation
- Screen reader compatibility

### Focus Management
- Logical tab order
- Focus trapping in modals
- Skip links for navigation
