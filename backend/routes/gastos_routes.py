#route/gastos_routes.py
from flask import Blueprint, request, jsonify, g
from models import db, Gasto
from utils.auth import login_required

gasto_routes = Blueprint('gasto_routes', __name__)

@gasto_routes.route('/gastos', methods=['GET'])
@login_required
def obtener_gastos():
    usuario = g.user
    gastos = Gasto.query.filter_by(usuario_id=usuario.id).all()
    return jsonify([g.to_dict() for g in gastos])

@gasto_routes.route('/gastos', methods=['POST'])
@login_required
def crear_gasto():
    data = request.json
    nuevo = Gasto(
        descripcion=data['descripcion'],
        monto=data['monto'],
        categoria=data['categoria'],
        fecha=data['fecha'],
        usuario_id=g.user.id
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify({'message': 'Gasto creado exitosamente'})

@gasto_routes.route('/gastos/<int:id>', methods=['PUT'])
@login_required
def editar_gasto(id):
    gasto = Gasto.query.get(id)
    if not gasto or gasto.usuario_id != g.user.id:
        return jsonify({'error': 'Gasto no encontrado'}), 404
    data = request.json
    gasto.descripcion = data['descripcion']
    gasto.monto = data['monto']
    gasto.categoria = data['categoria']
    gasto.fecha = data['fecha']
    db.session.commit()
    return jsonify({'message': 'Gasto actualizado'})

@gasto_routes.route('/gastos/<int:id>', methods=['DELETE'])
@login_required
def eliminar_gasto(id):
    gasto = Gasto.query.get(id)
    if not gasto or gasto.usuario_id != g.user.id:
        return jsonify({'error': 'Gasto no encontrado'}), 404
    db.session.delete(gasto)
    db.session.commit()
    return jsonify({'message': 'Gasto eliminado'})
