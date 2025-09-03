from flask import Blueprint, render_template, session, redirect, request

user_bp = Blueprint('user', __name__, template_folder='templates')

def check_authentication():
    """Verifica se o usuário está autenticado e tem token válido"""
    if 'token' not in session or 'usuario' not in session:
        session['redirectTo'] = request.url
        return redirect('/auth/')
    return None

@user_bp.route('/operador')
def operador():
    auth_check = check_authentication()
    if auth_check:
        return auth_check
    
    # Verifica se o usuário tem permissão para esta rota
    if session.get('rota') != 'operador':
        return redirect('/auth/')
    
    return render_template('operador.html', 
                         usuario=session['usuario'], 
                         token=session['token'],
                         rota='operador.html')

@user_bp.route('/admin')
def admin():
    auth_check = check_authentication()
    if auth_check:
        return auth_check
    
    if session.get('rota') != 'admin':
        return redirect('/auth/')
    
    return render_template('admin.html', 
                         usuario=session['usuario'], 
                         token=session['token'],
                         rota='admin.html')

@user_bp.route('/juradoA')
def juradoA():
    auth_check = check_authentication()
    if auth_check:
        return auth_check
    
    if session.get('rota') != 'juradoA':
        return redirect('/auth')
    
    return render_template('juradoA.html', 
                         usuario=session['usuario'], 
                         token=session['token'],
                         rota='juradoA')

@user_bp.route('/juradoB')
def juradoB():
    auth_check = check_authentication()
    if auth_check:
        return auth_check
    
    if session.get('rota') != 'juradoB':
        return redirect('/auth')
    
    return render_template('juradoB.html', 
                         usuario=session['usuario'], 
                         token=session['token'],
                         rota='juradoB')

@user_bp.route('/juradoC')
def juradoC():
    auth_check = check_authentication()
    if auth_check:
        return auth_check
    
    if session.get('rota') != 'juradoC':
        return redirect('/auth')
    
    return render_template('juradoC.html', 
                         usuario=session['usuario'], 
                         token=session['token'],
                         rota='juradoC')
    
@user_bp.route('/sorteio')
def sorteio():
    auth_check = check_authentication()
    if auth_check:
        return auth_check
    
    if session.get('rota') != 'sorteio':
        return redirect('/auth')
    
    return render_template('sorteio.html', 
                         usuario=session['usuario'], 
                         token=session['token'],
                         rota='sorteio')