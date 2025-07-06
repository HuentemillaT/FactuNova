# backend/utils/email_utils.py
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()  # Carga variables del .env

def enviar_codigo_verificacion(destinatario, codigo):
    print(f"Enviando código {codigo} al correo {destinatario}")

    msg = EmailMessage()
    msg.set_content(f"Tu código de verificación es: {codigo}")
    msg["Subject"] = "Verificación de identidad"
    msg["From"] = "no-reply@factunova.cl"  # remitente fijo
    msg["To"] = destinatario  # destinatario dinámico

    # Leer credenciales desde variables de entorno
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USER = os.getenv('SMTP_USER')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print("Correo enviado correctamente")
    except Exception as e:
        print("Error enviando correo:", e)
