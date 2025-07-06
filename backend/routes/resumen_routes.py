# backend/routes/resumen_routes.py
from flask import Blueprint, request, jsonify, g
from extensions import db
from models.resumen import ResumenControlGastos, Gasto
from utils.auth import login_required

resumen_routes = Blueprint('resumen_routes', __name__)

@resumen_routes.route('/resumen', methods=['POST'])
@login_required
def guardar_resumen():
    data = request.json
    nuevo_resumen = ResumenControlGastos(
        ingreso_total=data.get('ingreso_total', 0),
        total_gastos=data.get('total_gastos', 0),
        balance=data.get('balance', 0),
        moneda=data.get('moneda', 'CLP'),
        usuario_id=g.user.id
    )
    db.session.add(nuevo_resumen)
    db.session.commit()
    return jsonify({'message': 'Resumen guardado correctamente'}), 201

@resumen_routes.route('/resumen', methods=['GET'])
@login_required
def obtener_resumen_y_gastos():
    user_id = g.user.id

    resumenes = ResumenControlGastos.query.filter_by(usuario_id=user_id).order_by(ResumenControlGastos.fecha_creacion.desc()).all()
    gastos = Gasto.query.filter_by(usuario_id=user_id).order_by(Gasto.fecha.desc()).all()

    resumenes_list = [r.to_dict() for r in resumenes]
    gastos_list = [g.to_dict() for g in gastos]

    return jsonify({'resumenes': resumenes_list, 'gastos': gastos_list})
