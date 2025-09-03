from flask import Flask, jsonify, render_template, request, session, redirect, url_for
import os
import requests
import secrets
from datetime import timedelta

app = Flask(__name__)

# Configurações de sessão
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'chave_secreta_segura')
app.permanent_session_lifetime = timedelta(minutes=30)

# URL do Firebase
link = 'https://princi-4dfd7-default-rtdb.firebaseio.com/'

# Middleware de proteção global
@app.before_request
def check_authentication():
    rotas_publicas = ['/', '/static']

    if any(request.path.startswith(r) for r in rotas_publicas):
        return  # Permite acesso sem login

    if 'usuario' not in session or 'token' not in session:
        session['redirectTo'] = request.path
        return redirect('/')

# Página de login e processamento
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        data = request.get_json()
        usuario = data.get('usuario')
        senha = data.get('senha')

        response = requests.get(f"{link}/usuarios/{usuario}.json")
        if response.status_code != 200:
            return jsonify({'success': False, 'message': 'Erro ao acessar o banco de dados'}), 500

        dados = response.json()

        if dados and dados.get('senha') == senha:
            session.permanent = True
            session['usuario'] = usuario
            session['rota'] = dados.get('rota', 'operador')
            session['token'] = secrets.token_hex(16)

            rota_destino = session.pop('redirectTo', f'/{session["rota"]}')
            return jsonify({'success': True, 'rota': rota_destino})

        return jsonify({'success': False, 'message': 'Usuário ou senha incorretos'}), 401

    # Se já estiver logado, vai direto para a rota definida
    if 'usuario' in session and 'token' in session:
        return redirect(f'/{session.get("rota", "operador")}')

    return render_template('index.html')

# Logout
@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

# Rotas protegidas
@app.route('/operador')
def operador():
    return render_template('operador.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/juradoA')
def juradoA():
    return render_template('juradoA.html')

@app.route('/juradoB')
def juradoB():
    return render_template('juradoB.html')

@app.route('/juradoC')
def juradoC():
    return render_template('juradoC.html')

if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)
