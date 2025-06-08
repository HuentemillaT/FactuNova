import os

DB_URI = "sqlite:///database.db"  # o la URI de tu Mongo/Postgres
SECRET_KEY = "tu_clave_secreta"
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
