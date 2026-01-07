# Submit Button Implementation TODO

## Completed Tasks
- [x] Create submit.ts route in backend/src/routes/submit.ts
- [x] Implement submission logic:
  - Authenticate user
  - Fetch wrapper code from database
  - Combine user code with wrapper code
  - Run code against all test cases in Docker
  - Compare outputs and determine verdict (AC/WA/TLE/RE)
  - Save submission to database
  - Return verdict to frontend ("solved" or "attempted")
- [x] Add submit route to backend/src/app.ts
- [x] Add submitAPI to frontend/src/services/api.ts

## How to Use
Frontend can call:
```typescript
import { submitAPI } from './services/api';
const result = await submitAPI.submitCode(code, language, problemId);
// result.verdict will be "solved" or "attempted"
// result.message contains additional info
```

## Notes
- Requires Docker to be running
- Supports C, C++, Python, JavaScript, Java
- Uses timeout of 5 seconds per test case
- Saves all submissions to database with verdict, runtime, memory
- Wrapper code is optional but recommended for proper testing
