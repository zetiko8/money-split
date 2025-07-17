# How to Create an API Endpoint in the Angular Monorepo

This guide explains how to create and test a new API endpoint based on the example of `addPaymentEvent`.

## 1. API Structure

### 1.1 API Interface Library (`libs/api-interface/src/lib/apis.ts`)

### 1.2 Router Setup (`apps/data-provider/src/bl/router.ts`)
- Use `registerRoute` to define the endpoint
- Implement validation in the route handler
- Use the VALIDATE helper functions for input validation
- Never throw string errors, always use error codes from `libs/entities/src/error.ts`

### 1.3 Module Types (`apps/data-provider/src/modules/payment-event.ts` or similar module file)
- Define request payload types
- Define response types
- Use strict typing for all parameters

## 2. Database Procedures

### 2.1 Location
Procedures are stored in `apps/migration-manager/src/assets/procedures/`

Example: `editPaymentEvent.sql`

### 2.2 Structure
```sql
DELIMITER //

CREATE PROCEDURE procedureName(
  IN p_param1 TYPE,
  IN p_param2 TYPE
)
BEGIN
  -- Validation
  IF NOT EXISTS (SELECT 1 FROM Table WHERE condition) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RESOURCE_NOT_FOUND';
  END IF;

  -- Main operation
  UPDATE/INSERT/DELETE ...

  -- Return result
  SELECT fields FROM Table WHERE condition;
END //

DELIMITER ;
```

### 2.3 Response Format
All procedures should return results in a consistent JSON format:
- Declare two special variables without the v_ prefix:
  ```sql
  DECLARE jsonResult TEXT;       -- For successful responses
  DECLARE procedureError TEXT;    -- For error responses
  ```
- Set error responses using: `SELECT JSON_OBJECT('procedureError', 'ERROR_CODE') INTO procedureError;`
- Always return both variables at the end:
  ```sql
  SELECT procedureError;
  SELECT jsonResult;
  ```

### 2.4 Shared Procedures
Common functionality should be extracted into shared procedures:
- Place shared procedures in separate files in the same directory
- Use meaningful names that describe what the procedure does
- Document input/output parameters

Example of a shared procedure:
```sql
CREATE PROCEDURE getPaymentEventJson(
    IN p_paymentEventId BIGINT,   -- ID of payment event to format
    OUT p_jsonResult TEXT         -- Formatted JSON result
)
BEGIN
    SELECT (SELECT JSON_OBJECT(
        'id', r.id,
        'created', r.created,
        -- ... other fields
    )
    FROM PaymentEvent r
    WHERE r.id = p_paymentEventId
    LIMIT 1) INTO p_jsonResult;
END
```

### 2.5 Best Practices
- Use `p_` prefix for procedure parameters
- Use `v_` prefix for local variables
- Always validate input data
- Verify data ownership
- Handle errors with SIGNAL using error codes from `libs/entities/src/error.ts`
  - Example: `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'RESOURCE_NOT_FOUND'`
  - Never use custom string error messages
- Document complex logic
- Extract common functionality into shared procedures
- Use transactions when needed
