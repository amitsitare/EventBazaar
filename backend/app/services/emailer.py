import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from ..config import settings


def _build_booking_html(details: dict) -> str:
    return f"""
    <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#2563eb,#4f46e5);padding:20px 24px;color:white;">
            <h2 style="margin:0 0 6px 0;font-size:22px;">Booking Confirmed</h2>
            <p style="margin:0;font-size:14px;opacity:0.95;">Your service booking is successful on EventBazaar.</p>
          </div>
          <div style="padding:20px 24px;">
            <p style="margin:0 0 12px 0;">Hi <strong>{details.get('customer_name', 'Customer')}</strong>,</p>
            <p style="margin:0 0 16px 0;color:#334155;">
              Thank you for your booking. Your payment is verified and your booking is confirmed.
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
              <h3 style="margin:0 0 10px 0;font-size:15px;color:#1e40af;">Booking Details</h3>
              <p style="margin:4px 0;"><strong>Booking ID:</strong> #{details.get('booking_id')}</p>
              <p style="margin:4px 0;"><strong>Service:</strong> {details.get('service_name')}</p>
              <p style="margin:4px 0;"><strong>Event Date:</strong> {details.get('event_date')}</p>
              <p style="margin:4px 0;"><strong>Address:</strong> {details.get('address') or '-'}</p>
              <p style="margin:4px 0;"><strong>Quantity:</strong> {details.get('quantity')}</p>
              <p style="margin:4px 0;"><strong>Total Paid:</strong> INR {float(details.get('paid_amount') or 0):,.2f}</p>
            </div>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 16px;">
              <h3 style="margin:0 0 10px 0;font-size:15px;color:#1d4ed8;">Provider Contact</h3>
              <p style="margin:4px 0;"><strong>Name:</strong> {details.get('provider_name') or '-'}</p>
              <p style="margin:4px 0;"><strong>Mobile:</strong> {details.get('provider_mobile') or '-'}</p>
              <p style="margin:4px 0;"><strong>Email:</strong> {details.get('provider_email') or '-'}</p>
            </div>
            <p style="margin:16px 0 0 0;color:#475569;font-size:13px;">
              Your invoice PDF is attached with this email.
            </p>
          </div>
        </div>
      </body>
    </html>
    """


def send_booking_confirmation_email(
    to_email: str,
    subject: str,
    details: dict,
    invoice_bytes: bytes,
    invoice_filename: str,
) -> None:
    if not settings.smtp_enabled:
        return

    if not settings.smtp_host or not settings.smtp_from_email:
        raise ValueError("SMTP is enabled but SMTP_HOST or SMTP_FROM_EMAIL is missing")

    msg = MIMEMultipart("mixed")
    from_name = settings.smtp_from_name.strip() or "EventBazaar"
    msg["From"] = f"{from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    alt = MIMEMultipart("alternative")
    html_body = _build_booking_html(details)
    alt.attach(MIMEText(html_body, "html", "utf-8"))
    msg.attach(alt)

    attachment = MIMEApplication(invoice_bytes, _subtype="pdf")
    attachment.add_header("Content-Disposition", "attachment", filename=invoice_filename)
    msg.attach(attachment)

    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from_email, [to_email], msg.as_string())
        return

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_from_email, [to_email], msg.as_string())
