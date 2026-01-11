# OTP Verification Implementation

## Database Changes
- [x] Create otp_verifications table for OTP management
- [x] Remove otp_code, otp_expires_at, is_verified columns from users table

## Backend Changes
- [x] Install Brevo SDK dependency
- [x] Create emailService.ts for OTP generation and email sending
- [x] Modify /auth/register endpoint to use otp_verifications table
- [x] Update /auth/verify-otp endpoint to use otp_verifications table

## Frontend Changes
- [x] Update registered.tsx to show OTP input after registration
- [x] Add verify-otp method to api.ts
- [x] Modify register flow to handle OTP verification
- [x] Update OTP verification to show "Verifying..." until modal closes
- [x] Create forgotPassword.tsx modal component
- [x] Add forgot password API methods to api.ts

## Backend Changes
- [x] Create passwordReset.ts routes file
- [x] Add password reset routes to app.ts
- [x] Update forgot-password endpoint to handle non-existent users gracefully

## Testing
- [ ] Test complete OTP registration flow
- [ ] Verify email sending works
- [ ] Test OTP verification and login
- [ ] Test forgot password flow with auto-login and redirect to explore
