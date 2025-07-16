# How to Create an API Endpoint in the Angular Monorepo

This guide explains how to create and test a new API endpoint based on the example of `addPaymentEvent`.

## 1. API Structure

### 1.1 API Interface Library (`libs/api-interface/src/lib/apis.ts`)
- Define the API endpoint interface using `apiDefinition`
- Specify request payload type, URL parameters type, and response type

### 1.2 Router Setup (`apps/data-provider/src/bl/router.ts`)
- Use `registerRoute` to define the endpoint
- Implement validation in the route handler
- Use the VALIDATE helper functions for input validation


### 1.3 Module Types (`apps/data-provider/src/modules/payment-event.ts` or similar module file)
- Define request payload types
- Define response types
- Use strict typing for all parameters

## 2. Testing Strategy

### 2.1 Test File Organization
Tests should be organized into logical blocks using `describe`.

Example files:
- `apps/data-provider-e2e/src/data-provider/addPaymentEventApi.spec.ts` - Complete example of validation, happy path, and database state tests

File structure:

```typescript
describe('addPaymentEventApi', () => {
  describe('validation', () => {
    // Input validation tests
  });

  describe('happy path', () => {
    // Successful operation tests
  });

  describe('dbState', () => {
    // Database state verification tests
  });
});
```

### 2.2 Validation Tests
Example: `apps/data-provider-e2e/src/data-provider/addPaymentEventApi.spec.ts` -> `describe('validation')`

Test all input validation cases:
- Required fields
- Field types (number, string, array)
- Field formats (currency = 3 uppercase letters)
- Array contents validation
- Authorization checks
- Business rule validations

Best practices:
- Only make one field invalid per test
- Keep all other fields valid
- Use clear test names that describe what's being tested
- Add TODO tests for future validations

### 2.3 Happy Path Tests
Example: `apps/data-provider-e2e/src/data-provider/addPaymentEventApi.spec.ts` -> `describe('happy path')`

Test successful operation:
- Verify all response fields
- Use `expect.any()` for dynamic fields like IDs and timestamps
- Match the exact shape of the expected response

### 2.4 Database State Tests
Example: `apps/data-provider-e2e/src/data-provider/addPaymentEventApi.spec.ts` -> `describe('dbState')`

Verify the database state after operations:
- Use beforeEach to set up test data
- Verify all stored fields
- Check data types and formats
- Verify relationships and foreign keys

## 3. Security Considerations

### 3.1 Authorization
- Validate user tokens
- Check namespace access
- Verify user permissions
- Validate that users belong to the correct owner

### 3.2 Input Validation
- Validate all input fields
- Check field types and formats
- Validate array contents
- Prevent SQL injection by using parameterized queries
