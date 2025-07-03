# backend/models/factura.py
from extensions import db

class Factura(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    monto = db.Column(db.Numeric, nullable=False)
    stripe_invoice_id = db.Column(db.String(120), nullable=True)
    status = db.Column(db.String(50), default='pendiente')
