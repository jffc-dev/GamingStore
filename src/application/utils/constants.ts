export const INITIAL_PAYMENT_STATE = 'PENDING';
export const DEFAULT_CURRENCY = 'USD';

export const RESET_PASSWORD_BODY = `
    <p>Hello,</p>
    <p>Your password has been successfully reset. If you did not request this change, please contact our support team immediately.</p>
    <p>If you need further assistance, feel free to reach out to us at support@example.com.</p>
    <p>Best regards,<br>GamingStore</p>
`;

export const RESET_PASSWORD_SUBJECT = 'Password Reset Confirmations';

export const FORGOT_PASSWORD_BODY = `
    <p>Hello,</p>
    <p>We received a request to reset your password. Please click the link below to set a new password:</p>
    <p><a href="{{reset_link}}" style="color: #4CAF50; text-decoration: none;">Reset My Password</a></p>
    <p>If you didn’t request a password reset, you can ignore this email. Your password will remain unchanged.</p>
    <p>For security reasons, this link will expire in 24 hours.</p>
    <p>Best regards,<br>Your Company Name</p>
`;

export const FORGOT_PASSWORD_SUBJECT = 'Password Reset Request';
