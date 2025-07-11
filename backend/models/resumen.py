#models/resumen.py
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class Gasto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(120), nullable=False)
    monto = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'descripcion': self.descripcion,
            'monto': self.monto,
            'categoria': self.categoria,
            'fecha': self.fecha.strftime('%Y-%m-%d'),
            'usuario_id': self.usuario_id
        }

class ResumenControlGastos(db.Model):
    __tablename__ = 'resumencontrolgastos'

    id = db.Column(db.Integer, primary_key=True)
    ingreso_total = db.Column(db.Float, nullable=False)
    total_gastos = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    moneda = db.Column(db.String(10), nullable=False)
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'ingreso_total': self.ingreso_total,
            'total_gastos': self.total_gastos,
            'balance': self.balance,
            'moneda': self.moneda,
            'fecha_creacion': self.fecha_creacion.isoformat(),
            'usuario_id': self.usuario_id
        }