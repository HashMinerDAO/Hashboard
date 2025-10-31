# React Framework Standards

## Component Architecture

### Functional Components
- **Hooks Required**: Use functional components with hooks for all new components
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Memoization**: Use `React.memo()` for expensive components
- **Forward Refs**: Use `forwardRef()` when ref forwarding is needed

### Component Structure
```jsx
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const DataTable = ({ data, loading }) => {
  const dispatch = useDispatch()
  const [filteredData, setFilteredData] = useState([])

  useEffect(() => {
    // Component logic
  }, [data])

  return (
    <div className="data-table">
      {/* JSX content */}
    </div>
  )
}

export default React.memo(DataTable)
```

## State Management

### Local State
- **useState**: For simple local state
- **useReducer**: For complex state logic
- **Custom Hooks**: For shared stateful logic

### Global State
- **Redux Toolkit**: Preferred for complex global state
- **Context API**: For simple theme/user preferences
- **Zustand**: Alternative for lightweight global state

## Performance Optimization

### Rendering Optimization
- **React.memo()**: Prevent unnecessary re-renders
- **useMemo()**: Memoize expensive calculations
- **useCallback()**: Memoize event handlers
- **React.lazy()**: Code splitting for components

### Bundle Optimization
- **Dynamic Imports**: Route-based and component lazy loading
- **Tree Shaking**: Structure for effective tree shaking
- **Webpack Configuration**: Optimize chunk splitting

## TypeScript Integration

### Type Definitions
```typescript
interface DataTableProps {
  data: MiningData[]
  loading: boolean
  onUpdate?: (data: MiningData) => void
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  loading,
  onUpdate
}) => {
  // Component logic
}
```

### Generic Components
- Use generics for flexible APIs
- Type custom hooks properly
- Leverage utility types

## Testing Standards

### Testing Framework
- **Jest**: Primary testing framework
- **React Testing Library**: Component testing utilities
- **User Event**: User interaction testing

### Test Structure
```javascript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTable from './DataTable'

describe('DataTable', () => {
  it('renders data correctly', async () => {
    render(<DataTable data={testData} />)
    expect(screen.getByText('Expected Content')).toBeInTheDocument()
  })
})
```

## Code Quality Standards

### ESLint Configuration
- Extend `react/recommended` and `react-hooks/recommended`
- Enable TypeScript rules
- Custom project conventions

### Prettier Configuration
- Consistent JSX formatting
- Import organization
- Semicolon and quote preferences

## Accessibility Standards

### Semantic HTML
- Use appropriate HTML elements
- Provide alt text for images
- Semantic form elements

### ARIA Support
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility

### Focus Management
- Logical tab order
- Focus trapping in modals
- Skip navigation links
