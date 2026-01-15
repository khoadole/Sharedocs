import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Send reset password email
     * @param {string} to - Recipient email
     * @param {string} resetLink - Link to reset password
     */
    async sendResetPasswordEmail(to, resetLink) {
        const mailOptions = {
            from: `"ShareDocs Support" <${process.env.SMTP_FROM || 'support@sharedocs.app'}>`,
            to,
            subject: 'Password Reset Request - ShareDocs',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">ShareDocs</h2>
          <p>Hi there,</p>
          <p>We received a request to reset your password for your ShareDocs account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">ShareDocs - Secure Document Verification Platform</p>
        </div>
      `,
        };

        // If no real SMTP credentials, use Ethereal for development
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            try {
                // Create an ethereal account for preview
                const testAccount = await nodemailer.createTestAccount();
                const testTransporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });

                const info = await testTransporter.sendMail(mailOptions);
                const previewUrl = nodemailer.getTestMessageUrl(info);

                console.log('\n==========================================');
                console.log('DEVELOPMENT MODE: Reset password link generated');
                console.log(`To: ${to}`);
                console.log(`Reset Link: ${resetLink}`);
                console.log(`View Email HTML: ${previewUrl}`);
                console.log('==========================================\n');
                return true;
            } catch (error) {
                console.error('[ERROR] Failed to send Ethereal email:', error);
                // Fallback to link only if Ethereal fails
                console.log(`Reset Link: ${resetLink}`);
                return true;
            }
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('[OK] Reset password email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('[ERROR] Failed to send reset password email:', error);
            throw new Error('Failed to send email');
        }
    }
}

export default new EmailService();
