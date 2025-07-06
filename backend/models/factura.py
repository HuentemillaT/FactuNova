# backend/models/factura.py
from extensions import db
from sqlalchemy.sql import func

class Factura(db.Model):
    __tablename__ = 'factura'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    monto = db.Column(db.Numeric, nullable=False)
    stripe_invoice_id = db.Column(db.String(120), nullable=True)
    status = db.Column(db.String(50), default='pendiente')

    numero_factura = db.Column(db.String(50), unique=True, nullable=False)  # Cambiado a String
    timbre = db.Column(db.String(64), nullable=True)  # Aquí guardamos el UUID

    fecha_emision = db.Column(db.DateTime(timezone=True), server_default=func.now())
