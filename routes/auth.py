from flask import Blueprint, render_template, request, session, redirect, jsonify
import requests
import secrets
from datetime import timedelta

# Corrigindo o template_folder para apontar para a pasta correta
auth_bp = Blueprint('auth', __name__, template_folder='../templates')

# URL do Firebase
link = 'https://princi-4dfd7-default-rtdb.firebaseio.com/'

# Página de login e processamento
@auth_bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
       try:
            # Verificar se é JSON ou form data
            if request.is_json:
                data = request.get_json()
            else:
                data = request.form
            
            usuario = data.get('usuario')
            senha = data.get('senha')
            
            print(f"Tentativa de login - Usuário: {usuario}")  # Debug
            
            if not usuario or not senha:
                return jsonify({'success': False, 'message': 'Usuário e senha são obrigatórios'}), 400

            # Fazer requisição ao Firebase - corrigindo a URL
            firebase_url = f"{link}usuarios/{usuario}.json"
            print(f"URL Firebase: {firebase_url}")  # Debug
            
            response = requests.get(firebase_url, timeout=10)
            print(f"Status Firebase: {response.status_code}")  # Debug
            
            if response.status_code != 200:
                return jsonify({'success': False, 'message': 'Erro ao acessar o banco de dados'}), 500

            dados = response.json()
            print(f"Dados do Firebase: {dados}")  # Debug

            if dados and dados.get('senha') == senha:
                # Configurar sessão
                session.permanent = True
                session['usuario'] = usuario
                
                # Extrair o tipo de rota (admin.html -> admin)
                rota_completa = dados.get('rota', 'operador')
                if rota_completa.endswith('.html'):
                    rota_tipo = rota_completa.replace('.html', '')
                else:
                    rota_tipo = rota_completa
                
                session['rota'] = rota_tipo
                session['token'] = secrets.token_hex(16)
                
                print(f"Login bem-sucedido - Rota: {session['rota']}")  # Debug

                # Retorna a rota correta com prefixo /user
                rota_destino = f"/user/{session['rota']}"
                return jsonify({
                    'success': True, 
                    'rota': rota_destino, 
                    'clear_fields': True,
                    'usuario': usuario,
                    'tipo': session['rota']
                })
            return jsonify({'success': False, 'message': 'Usuário ou senha incorretos'}), 401
        
       except requests.exceptions.RequestException as e:
            print(f"Erro de conexão: {e}")  # Debug
            return jsonify({'success': False, 'message': 'Erro de conexão com o servidor'}), 500
       except Exception as e:
            print(f"Erro geral: {e}")  # Debug
            return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500
    # GET request - mostrar página de login
    return render_template('index.html')

# Logout
@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect('/auth/')



# Rota para testar conexão com Firebase
@auth_bp.route('/test-firebase')
def test_firebase():
    try:
        response = requests.get(f"{link}usuarios.json", timeout=10)
        return jsonify({
            'status': response.status_code,
            'data': response.json() if response.status_code == 200 else None,
            'message': 'Conexão com Firebase OK' if response.status_code == 200 else 'Erro na conexão'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Erro ao conectar com Firebase'})