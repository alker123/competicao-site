# firebase.py
import firebase_admin
from firebase_admin import credentials, db

def init_firebase(app_name, database_url):
    if not firebase_admin._apps:
        cred = credentials.Certificate("path/to/your/firebase/credentials.json")  # Caminho para o arquivo .json do Firebase
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        }, name=app_name)

def initialize_all_firebase_apps():
    # Inicializar ambos os bancos de dados
    init_firebase("app1", 'https://princi-4dfd7-default-rtdb.firebaseio.com/')
    init_firebase("app2", 'https://sengu-abc16-default-rtdb.firebaseio.com/')
