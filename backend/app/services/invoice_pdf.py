from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def _inr(value) -> str:
    try:
        return f"INR {float(value or 0):,.2f}"
    except Exception:
        return "INR 0.00"


def generate_invoice_pdf(invoice: dict) -> bytes:
    """
    Build a simple invoice PDF and return bytes.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    margin_x = 18 * mm
    y = height - 22 * mm

    # Header
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(colors.HexColor("#1e40af"))
    c.drawString(margin_x, y, "EventBazaar")
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.black)
    c.drawRightString(width - margin_x, y, "INVOICE")
    y -= 10 * mm

    c.setLineWidth(0.8)
    c.setStrokeColor(colors.HexColor("#cbd5e1"))
    c.line(margin_x, y, width - margin_x, y)
    y -= 8 * mm

    # Invoice meta
    c.setFont("Helvetica", 10)
    c.drawString(margin_x, y, f"Invoice No: INV-{invoice['booking_id']}")
    c.drawRightString(width - margin_x, y, f"Booking ID: #{invoice['booking_id']}")
    y -= 6 * mm
    c.drawString(margin_x, y, f"Booking Date: {invoice.get('booking_created_at', '-')}")
    c.drawRightString(width - margin_x, y, f"Event Date: {invoice.get('event_date', '-')}")
    y -= 10 * mm

    # Bill to
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin_x, y, "Bill To")
    y -= 6 * mm
    c.setFont("Helvetica", 10)
    c.drawString(margin_x, y, invoice.get("customer_name", "-"))
    y -= 5 * mm
    c.drawString(margin_x, y, invoice.get("customer_email", "-"))
    y -= 5 * mm
    c.drawString(margin_x, y, f"Phone: {invoice.get('customer_mobile', '-')}")
    y -= 10 * mm

    # Provider details
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margin_x, y, "Service Provider")
    y -= 6 * mm
    c.setFont("Helvetica", 10)
    c.drawString(margin_x, y, invoice.get("provider_name", "-"))
    y -= 5 * mm
    c.drawString(margin_x, y, f"Phone: {invoice.get('provider_mobile', '-')}")
    y -= 5 * mm
    c.drawString(margin_x, y, invoice.get("provider_email", "-"))
    y -= 10 * mm

    # Service table
    table_x = margin_x
    table_w = width - (2 * margin_x)
    row_h = 8 * mm
    qty_w = 28 * mm
    rate_w = 40 * mm
    amt_w = 40 * mm
    desc_w = table_w - qty_w - rate_w - amt_w

    c.setFillColor(colors.HexColor("#eff6ff"))
    c.rect(table_x, y - row_h, table_w, row_h, fill=1, stroke=0)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(table_x + 3 * mm, y - 5.5 * mm, "Description")
    c.drawRightString(table_x + desc_w + qty_w - 2 * mm, y - 5.5 * mm, "Qty")
    c.drawRightString(table_x + desc_w + qty_w + rate_w - 2 * mm, y - 5.5 * mm, "Rate")
    c.drawRightString(table_x + table_w - 2 * mm, y - 5.5 * mm, "Amount")
    y -= row_h

    c.setStrokeColor(colors.HexColor("#dbeafe"))
    c.rect(table_x, y - row_h, table_w, row_h, fill=0, stroke=1)
    c.setFont("Helvetica", 10)
    desc = f"{invoice.get('service_name', '-')} ({invoice.get('service_location', '-')})"
    c.drawString(table_x + 3 * mm, y - 5.5 * mm, desc[:70])
    c.drawRightString(table_x + desc_w + qty_w - 2 * mm, y - 5.5 * mm, str(invoice.get("quantity", 1)))
    c.drawRightString(table_x + desc_w + qty_w + rate_w - 2 * mm, y - 5.5 * mm, _inr(invoice.get("unit_price", 0)))
    c.drawRightString(table_x + table_w - 2 * mm, y - 5.5 * mm, _inr(invoice.get("paid_amount", 0)))
    y -= row_h + 5 * mm

    c.setFont("Helvetica-Bold", 11)
    c.drawRightString(table_x + table_w - 2 * mm, y, f"Total Paid: {_inr(invoice.get('paid_amount', 0))}")
    y -= 10 * mm

    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#475569"))
    c.drawString(margin_x, y, f"Status: {invoice.get('status', 'confirmed')}")
    y -= 5 * mm
    c.drawString(margin_x, y, "Thank you for booking with EventBazaar.")

    c.showPage()
    c.save()

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
