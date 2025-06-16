from flask import Blueprint, request, jsonify, g

from models import db, User
from utils.auth import login_required, roles_required

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/perfil', methods=['GET'])
@login_required
def perfil():
    user = g.user
    return jsonify({
        'id': user.id,
        'name': user.name,
        'rut': user.rut,
        'email': user.email,
        'role': user.role,
        'is_verified': user.is_verified
    })


@user_routes.route('/perfil', methods=['PUT'])
@login_required
def editar_perfil():
    user = g.user
    data = request.json

    name = data.get('name')
    rut = data.get('rut')
    email = data.get('email')

    if name:
        user.name = name
    if rut:
        user.rut = rut
    if email:
        if User.query.filter(User.email == email, User.id != user.id).first():
            return jsonify({'error': 'Email ya en uso'}), 400
        user.email = email

    db.session.commit()
    return jsonify({'message': 'Perfil actualizado correctamente'})


@user_routes.route('/usuarios', methods=['GET'])
@login_required
@roles_required('admin')
def listar_usuarios():
    usuarios = User.query.all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'rut': u.rut,
        'email': u.email,
        'role': u.role,
        'is_verified': u.is_verified
    } for u in usuarios])


@user_routes.route('/perfil/password', methods=['PUT'])
@login_required
def cambiar_password():
    user = g.user
    data = request.json

    old_password = data.get('old_password')
    new_password = data.get('new_password')

    # Validar que se envíen ambas contraseñas
    if not old_password or not new_password:
        return jsonify({'error': 'Contraseña antigua y nueva son requeridas'}), 400

    # Verificar que la contraseña antigua coincida con la almacenada
    if not user.check_password(old_password):
        return jsonify({'error': 'Contraseña antigua incorrecta'}), 401

    # Actualizar con la nueva contraseña (se asume que set_password hace el hash)
    user.set_password(new_password)

    # Guardar cambios en la base de datos
    db.session.commit()

    return jsonify({'message': 'Contraseña actualizada correctamente'})


@user_routes.route('/usuarios/<int:user_id>', methods=['DELETE'])
@login_required
@roles_required('admin')
def eliminar_usuario(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Usuario eliminado'})
