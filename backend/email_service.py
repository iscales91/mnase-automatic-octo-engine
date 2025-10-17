"""
Email Service for MNASE Basketball League
Supports Gmail SMTP, SendGrid, and Mock mode
"""
import os
import smtplib
from datetime import datetime
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

class EmailDeliveryError(Exception):
    """Raised when email delivery fails"""
    pass

class EmailService:
    """
    Email service with Gmail SMTP, SendGrid, and mock mode support
    Priority: Gmail SMTP > SendGrid > Mock mode
    """
    
    def __init__(self):
        # Gmail SMTP settings
        self.gmail_user = os.environ.get('GMAIL_USER')
        self.gmail_password = os.environ.get('GMAIL_APP_PASSWORD')
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
        # SendGrid settings
        self.sendgrid_api_key = os.environ.get('SENDGRID_API_KEY')
        
        # Common settings
        self.from_email = os.environ.get('SENDER_EMAIL', 'mnasebasketball@gmail.com')
        
        # Determine which service to use
        if self.gmail_user and self.gmail_password:
            self.email_mode = 'gmail'
            print("✅ EmailService initialized with Gmail SMTP")
        elif SENDGRID_AVAILABLE and self.sendgrid_api_key and self.sendgrid_api_key != 'your_sendgrid_api_key_here':
            self.email_mode = 'sendgrid'
            print("✅ EmailService initialized with SendGrid")
        else:
            self.email_mode = 'mock'
            print("⚠️  EmailService running in MOCK mode (configure Gmail or SendGrid for real emails)")
        
    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None):
        """
        Send email via SendGrid or mock logging
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            body: Plain text email body
            html_body: HTML email body (optional, takes precedence over plain text)
        
        Returns:
            bool: True if email sent successfully
        
        Raises:
            EmailDeliveryError: If email sending fails
        """
        if self.use_sendgrid:
            return self._send_via_sendgrid(to_email, subject, body, html_body)
        else:
            return self._send_mock(to_email, subject, body, html_body)
    
    def _send_via_sendgrid(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None):
        """Send email using SendGrid API"""
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                plain_text_content=body,
                html_content=html_body if html_body else body
            )
            
            sg = SendGridAPIClient(self.sendgrid_api_key)
            response = sg.send(message)
            
            if response.status_code in [200, 202]:
                print(f"✅ Email sent via SendGrid to {to_email}: {subject}")
                return True
            else:
                raise EmailDeliveryError(f"SendGrid returned status {response.status_code}")
                
        except Exception as e:
            print(f"❌ SendGrid email failed: {str(e)}")
            raise EmailDeliveryError(f"Failed to send email via SendGrid: {str(e)}")
    
    def _send_mock(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None):
        """Mock email sending - logs to console"""
        print("\n" + "="*80)
        print("📧 MOCK EMAIL SENT (SendGrid not configured)")
        print("="*80)
        print(f"From: {self.from_email}")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-"*80)
        print("BODY:")
        print(body[:500] + "..." if len(body) > 500 else body)
        if html_body:
            print("\n[HTML BODY PRESENT]")
        print("="*80 + "\n")
        
        return True
    
    def send_registration_confirmation(self, to_email: str, athlete_name: str, parent_name: str, registration_id: str):
        """Send registration confirmation email"""
        subject = "Registration Confirmation - MNASE Basketball League"
        
        body = f"""
Dear {parent_name},

Thank you for registering with MNASE Basketball League!

REGISTRATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Athlete Name: {athlete_name}
Registration ID: {registration_id}
Status: Pending Approval
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT'S NEXT?
1. Our team will review your registration within 2-3 business days
2. You will receive a confirmation email once approved
3. Payment instructions will be provided upon approval
4. You can check your registration status in your Member Dashboard

IMPORTANT INFORMATION:
• Keep this registration ID for your records
• Check your email regularly for updates
• If you have questions, reply to this email or call (612) 555-1234

MNASE BASKETBALL LEAGUE
Building champions on and off the court through Mentorship, Networking, 
Athletics, Support, and Experience.

Website: www.mnasebasketball.com
Email: contact@mnasebasketball.com
Phone: (612) 555-1234

Follow us on social media for updates, highlights, and announcements!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply directly to this email.
For assistance, contact us at contact@mnasebasketball.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        """
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8f9ff; padding: 30px; border-radius: 0 0 8px 8px; }}
        .details {{ background: white; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }}
        .button {{ display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏀 Registration Confirmed!</h1>
            <p>MNASE Basketball League</p>
        </div>
        <div class="content">
            <h2>Dear {parent_name},</h2>
            <p>Thank you for registering with MNASE Basketball League!</p>
            
            <div class="details">
                <h3>Registration Details</h3>
                <p><strong>Athlete Name:</strong> {athlete_name}</p>
                <p><strong>Registration ID:</strong> {registration_id}</p>
                <p><strong>Status:</strong> <span style="color: #eab308;">Pending Approval</span></p>
            </div>
            
            <h3>What's Next?</h3>
            <ol>
                <li>Our team will review your registration within 2-3 business days</li>
                <li>You will receive a confirmation email once approved</li>
                <li>Payment instructions will be provided upon approval</li>
                <li>You can check your registration status in your Member Dashboard</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard" class="button">View Dashboard</a>
            </div>
            
            <h3>Need Help?</h3>
            <p>📧 Email: contact@mnasebasketball.com<br>
            📞 Phone: (612) 555-1234<br>
            🌐 Website: www.mnasebasketball.com</p>
            
            <div class="footer">
                <p><strong>MNASE Basketball League</strong></p>
                <p>Building champions on and off the court through<br>
                Mentorship, Networking, Athletics, Support, and Experience</p>
                <p style="font-size: 12px; margin-top: 20px;">
                    This is an automated message. Please do not reply directly to this email.<br>
                    For assistance, contact us at contact@mnasebasketball.com
                </p>
            </div>
        </div>
    </div>
</body>
</html>
        """
        
        return self.send_email(to_email, subject, body, html_body)
    
    def send_registration_approved(self, to_email: str, athlete_name: str, parent_name: str, registration_id: str, amount: float):
        """Send registration approval email with payment info"""
        subject = "Registration Approved - Payment Required - MNASE Basketball"
        
        body = f"""
Dear {parent_name},

Great news! Your registration for {athlete_name} has been approved! 🎉

REGISTRATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Athlete Name: {athlete_name}
Registration ID: {registration_id}
Status: APPROVED
Amount Due: ${amount:.2f}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT OPTIONS:
1. Online: Visit your Member Dashboard to pay online
2. Phone: Call (612) 555-1234 with your registration ID
3. In Person: Visit our facility during office hours

Payment must be completed within 7 days to secure your spot.

Questions? Contact us at contact@mnasebasketball.com or (612) 555-1234

We look forward to seeing {athlete_name} on the court!

MNASE Basketball League
contact@mnasebasketball.com
        """
        
        return self.send_email(to_email, subject, body)

# Global email service instance
email_service = EmailService()
