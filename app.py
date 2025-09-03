from flask import Flask, redirect
from routes.user import user_bp
from routes.auth import auth_bp

app = Flask(__name__)

app.secret_key = 'chave_secreta_segura'

# Configurações de sessão
app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # 30 minutos

# Registrando os Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(user_bp, url_prefix='/user')

# Rota raiz que redireciona para auth
@app.route('/')
def home():
    return redirect('/auth/')

# Tratamento de erros
@app.errorhandler(404)
def not_found(error):
    return redirect('/auth/')

@app.errorhandler(500)
def internal_error(error):
    return "Erro interno do servidor", 500

if __name__ == "__main__":
    app.run(debug=True, use_reloader=True, port=5000)