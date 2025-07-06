from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import Table, TableStyle, Image
import os
import io
import requests

def generar_pdf_factura(ruta, factura):
    c = canvas.Canvas(ruta, pagesize=A4)
    width, height = A4
    margen = 20 * mm
    y = height - margen

    # Ruta del logo en tu carpeta local
    logo_path = os.path.join(os.getcwd(), "static", "sii-logo.png")
    if os.path.exists(logo_path):
        c.drawImage(logo_path, width - margen - 40*mm, y - 15*mm, width=40*mm, height=15*mm)

    # Título
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, y, "Factura Electrónica")
    y -= 25

    c.setFont("Helvetica", 10)
    c.drawString(margen, y, f"N° Factura: {factura['numero_factura']}")
    c.drawRightString(width - margen, y, f"Fecha: {factura['fecha_emision']}")
    y -= 20

    # Emisor y Receptor
    def dibujar_datos(label, datos, y_inicio):
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margen, y_inicio, label)
        c.setFont("Helvetica", 9)
        y_line = y_inicio - 12
        c.drawString(margen, y_line, f"Razón Social: {datos['razonSocial']}")
        c.drawString(margen, y_line - 12, f"RUT: {datos['rut']}")
        c.drawString(margen, y_line - 24, f"Giro: {datos['giro']}")
        c.drawString(margen, y_line - 36, f"Dirección: {datos['direccion']}, {datos['comuna']}")
        return y_line - 48

    y = dibujar_datos("Emisor:", factura['emisor'], y)
    y = dibujar_datos("Receptor:", factura['receptor'], y - 10)

    # Tabla de items
    y -= 10
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margen, y, "Detalle:")
    y -= 5

    data = [["Descripción", "Cantidad", "Precio Unitario", "Subtotal"]]
    for item in factura['items']:
        subtotal = item['cantidad'] * item['precioUnitario']
        data.append([
            item['descripcion'],
            str(item['cantidad']),
            f"${item['precioUnitario']:.2f}",
            f"${subtotal:.2f}"
        ])

    table = Table(data, colWidths=[220, 60, 80, 80])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ('RIGHTPADDING', (2,1), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ]))

    table.wrapOn(c, width, height)
    table_height = table._height
    table.drawOn(c, margen, y - table_height)
    y -= table_height + 20

    # Totales
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - margen, y, f"Neto: ${factura['neto']:.2f}")
    y -= 15
    c.drawRightString(width - margen, y, f"IVA (19%): ${factura['iva']:.2f}")
    y -= 15
    c.drawRightString(width - margen, y, f"Total a pagar: ${factura['total']:.2f}")
    y -= 25

    # Timbre y QR
    c.setFont("Helvetica", 9)
    c.drawString(margen, y, f"Timbre electrónico: {factura['timbre']}")
    y -= 75

    # QR desde API externa
    try:
        qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={factura['timbre']}"
        qr_data = requests.get(qr_url).content
        qr = Image(io.BytesIO(qr_data), width=30*mm, height=30*mm)
        qr.drawOn(c, margen, y)
    except:
        pass

    # Footer
    y -= 40
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    c.drawCentredString(width / 2, 20, "Documento generado electrónicamente conforme a la normativa del SII.")

    c.save()
