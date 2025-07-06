# backend/models/verification_code.py
from extensions import db
from datetime import datetime, timedelta

class VerificationCode(db.Model):
    __tablename__ = 'verification_code'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    codigo = db.Column(db.String(6), nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    expira_en = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=10))
    factura_id = db.Column(db.Integer, nullable=False)  