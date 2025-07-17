# How to Test an API Endpoint in the Angular Monorepo

This guide explains how to test a new API endpoint based on the example of `addPaymentEvent`.

## 2. Testing Strategy

### 2.1 Test File Organization
Tests should be organized into logical blocks using `describe`.

Example files:
- `apps/data-provider-e2e/src/data-provider/addPaymentEventApi.spec.ts` - Complete example of validation, happy path, and database state tests

File structure:

```typescript
describe('addPaymentEventApi', () => {
  it('smoke', async () => {
    // Validates that the input exists
  });

  describe('validation', () => {
    // Input validation tests

    // Validate all the payload fields
    // Validate all the path parameters

    // Validate authorization
    // - if the token is missing
    // - if the token is invalid
    // - if the user is not authorized
    // - if the user is not a member of the namespace
    // - if the user is not a member of the owner
    
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
- Always verify database state by directly querying the database using `queryDb`
  ```typescript
  const response = await queryDb(
    `SELECT * FROM Table WHERE id = ${id}`
  ) as DbRow[];
  ```
- Never verify database state through API endpoints
- Verify all stored fields including their exact types and formats
- For JSON fields, parse them before comparing to avoid order-dependent failures:
  ```typescript
  const dbRow = response[0];
  const parsedRow = {
    ...dbRow,
    jsonField: JSON.parse(dbRow.jsonField),
  };
  expect(parsedRow).toEqual(expected);
  ```
- Check data types, formats, and relationships

## 3. Database Procedures

### 3.1 Location
Procedures are stored in `apps/migration-manager/src/assets/procedures/`

Example: `editPaymentEvent.sql`

### 3.2 Structure
```sql
DELIMITER //

CREATE PROCEDURE procedureName(
  IN p_param1 TYPE,
  IN p_param2 TYPE
)
BEGIN
  -- Validation
  IF NOT EXISTS (SELECT 1 FROM Table WHERE condition) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error message';
  END IF;

  -- Main operation
  UPDATE/INSERT/DELETE ...

  -- Return result
  SELECT fields FROM Table WHERE condition;
END //

DELIMITER ;
```

### 3.3 Best Practices
- Use `p_` prefix for procedure parameters
- Use `v_` prefix for local variables
- Always validate input data
- Return complete entity after modification
- Use transactions when needed
- Handle errors with SIGNAL
- Document complex logic

## 4. Security Considerations

### 4.1 Authorization
- Validate user tokens
- Check namespace access
- Verify user permissions
- Validate that users belong to the correct owner

### 4.2 Input Validation
- Validate all input fields
- Check field types and formats
- Validate array contents
- Prevent SQL injection by using parameterized queries
