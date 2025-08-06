# CSI Frontend Testing Guide

## Overview

This guide covers the testing setup and practices for both the backend API and frontend UI of the CSI Frontend project.

## Backend Testing (Bun Test)

### Setup

The backend uses Bun's built-in test runner. Tests are located in `CSI_API/tests/`.

### Running Tests

```bash
cd CSI_API
bun test                 # Run all tests
bun test:watch          # Run tests in watch mode
bun test:coverage       # Run tests with coverage report
```

### Test Structure

```
CSI_API/tests/
├── unit/               # Unit tests for individual functions
│   └── validation.test.ts
├── integration/        # Integration tests for API endpoints
│   └── devices.test.ts
└── test-setup.ts      # Shared test utilities
```

### Writing Backend Tests

```typescript
import { describe, it, expect } from 'bun:test';

describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Frontend Testing (Vitest + React Testing Library)

### Setup

The frontend uses Vitest with React Testing Library. Tests are located in `CSI_UI/src/tests/`.

### Running Tests

```bash
cd CSI_UI
npm test                # Run all tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage
```

### Test Structure

```
CSI_UI/src/tests/
├── setup.ts           # Test environment setup
├── unit/              # Unit tests for utilities
├── components/        # Component tests
└── integration/       # Integration tests
```

### Writing Component Tests

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Testing Best Practices

### 1. Test Organization

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components work together
- **E2E Tests**: Test complete user workflows (future implementation)

### 2. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// Good
it('should return error when email is invalid')

// Bad
it('test email')
```

### 3. AAA Pattern

Structure tests using Arrange-Act-Assert:

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

### 4. Testing Async Code

```typescript
// Backend
it('should fetch device data', async () => {
  const response = await app.fetch('/api/devices/1');
  expect(response.status).toBe(200);
});

// Frontend
it('should load data', async () => {
  render(<DeviceList />);
  
  await waitFor(() => {
    expect(screen.getByText('Device 1')).toBeInTheDocument();
  });
});
```

### 5. Mocking

#### Backend Mocking

```typescript
import { mock } from 'bun:test';

const mockDb = mock(() => ({
  select: () => Promise.resolve([{ id: 1, name: 'Test' }])
}));
```

#### Frontend Mocking

```typescript
// Mock API calls
vi.mock('../services/DeviceService', () => ({
  getDevices: vi.fn(() => Promise.resolve([
    { id: 1, name: 'Device 1' }
  ]))
}));

// Mock hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test User' } })
}));
```

## Coverage Requirements

Aim for the following coverage targets:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Critical paths should have 100% coverage.

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Commits to main branch
- Pre-deployment

## Common Testing Scenarios

### Testing API Endpoints

```typescript
describe('POST /api/devices', () => {
  it('should create device with valid data', async () => {
    const device = {
      name: 'Test Device',
      type: 'Server',
      ipAddress: '192.168.1.100'
    };
    
    const response = await app.fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device)
    });
    
    expect(response.status).toBe(201);
    const created = await response.json();
    expect(created.name).toBe(device.name);
  });
});
```

### Testing React Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Form Validation

```typescript
it('should show error for invalid email', async () => {
  render(<LoginForm />);
  
  const emailInput = screen.getByLabelText('Email');
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.blur(emailInput);
  
  expect(await screen.findByText('Invalid email')).toBeInTheDocument();
});
```

## Debugging Tests

### Backend
```bash
bun test --watch --bail  # Stop on first failure
```

### Frontend
```bash
npm run test:ui         # Visual test runner
```

### VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test"
}
```

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)