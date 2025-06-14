# backend/routes/resumen_routes.py
from flask import Blueprint, request, jsonify,g
from models import db, ResumenControlGastos
from utils.auth import login_required

resumen_routes = Blueprint('resumen_routes', __name__)

@resumen_routes.route('/resumen', methods=['POST'])
@login_required
def guardar_resumen():
    data = request.json
    nuevo_resumen = ResumenControlGastos(
        ingreso_total=data['ingreso_total'],
        total_gastos=data['total_gastos'],
        balance=data['balance'],
        moneda=data['moneda'],
        usuario_id=g.user.id
    )
    db.session.add(nuevo_resumen)
    db.session.commit()
    return jsonify({'message': 'Resumen guardado correctamente'})
