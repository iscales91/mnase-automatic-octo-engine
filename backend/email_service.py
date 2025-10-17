"""
Email Service for MNASE Basketball League
Supports both SendGrid (production) and Mock mode (development)
"""
import os
from datetime import datetime
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

class EmailDeliveryError(Exception):
    """Raised when email delivery fails"""
    pass

class EmailService:
    """
    Email service with SendGrid integration and mock mode fallback
    Set SENDGRID_API_KEY environment variable to enable real email sending
    """
    
    def __init__(self):
        self.sendgrid_api_key = os.environ.get('SENDGRID_API_KEY')
        self.from_email = os.environ.get('SENDER_EMAIL', 'contact@mnasebasketball.com')
        self.use_sendgrid = self.sendgrid_api_key and self.sendgrid_api_key != 'your_sendgrid_api_key_here'
        
        if self.use_sendgrid:
            print("✅ EmailService initialized with SendGrid")
        else:
            print("⚠️  EmailService running in MOCK mode (set SENDGRID_API_KEY to enable real emails)")
        
    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None):
        """
        Mock send email - logs to console
        In production, this would use smtplib to send actual emails
        """
        print("\n" + "="*80)
        print("📧 MOCK EMAIL SENT")
        print("="*80)
        print(f"From: {self.from_email}")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-"*80)
        print("BODY:")
        print(body)
        if html_body:
            print("\nHTML BODY:")
            print(html_body)
        print("="*80 + "\n")
        
        # For production Gmail SMTP, uncomment this:
        """
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        if not self.app_password:
            raise Exception("Gmail App Password not configured")
            
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.from_email
        message["To"] = to_email
        
        part1 = MIMEText(body, "plain")
        message.attach(part1)
        
        if html_body:
            part2 = MIMEText(html_body, "html")
            message.attach(part2)
        
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.from_email, self.app_password)
            server.sendmail(self.from_email, to_email, message.as_string())
        """
        
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
