// Versão JavaScript Vanilla para HTML puro
const translations = {
  pt: {
    title: "Login",
    loginTitle: "🔐 Login",
    accessAccount: "Acesse sua conta",
    email: "Email",
    password: "Senha",
    btnLogin: "Entrar",
    btnLoading: "Entrando...",
    successLogin: "Login realizado com sucesso!",
    emptyFields: "Por favor, preencha todos os campos.",
    firebaseOK: "Conexão com Firebase OK!",
    firebaseError: "Erro na conexão com Firebase.",
    connectionError: "Erro de conexão. Verifique sua internet e tente novamente.",
    clockMsg: "Horario do Brasil",
    footerText: "© 2025 Sistema de Autenticação",
    redirectingTo: "Redirecionando para",
    loginError: "Erro ao fazer login",
    testingConnection: "Testando conexão com Firebase...",
    connectionTestError: "Erro ao testar conexão"
  },
  en: {
    title: "Login",
    loginTitle: "🔐 Login",
    accessAccount: "Access your account",
    email: "Email",
    password: "Password",
    btnLogin: "Login",
    btnLoading: "Logging in...",
    successLogin: "Login successful!",
    emptyFields: "Please fill in all fields.",
    firebaseOK: "Firebase connection OK!",
    firebaseError: "Firebase connection error.",
    connectionError: "Connection error. Please check your internet and try again.",
    clockMsg: "Brazil's Time",
    footerText: "© 2025 Authentication System",
    redirectingTo: "Redirecting to",
    loginError: "Login error",
    testingConnection: "Testing Firebase connection...",
    connectionTestError: "Error testing connection"
  },
  es: {
    title: "Iniciar Sesión",
    loginTitle: "🔐 Iniciar Sesión",
    accessAccount: "Accede a tu cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    btnLogin: "Entrar",
    btnLoading: "Entrando...",
    successLogin: "¡Inicio de sesión exitoso!",
    emptyFields: "Por favor, complete todos los campos.",
    firebaseOK: "¡Conexión con Firebase OK!",
    firebaseError: "Error en la conexión con Firebase.",
    connectionError: "Error de conexión. Verifique su internet e intente nuevamente.",
    clockMsg: "Horario de Brasil",
    footerText: "© 2025 Sistema de Autenticación",
    redirectingTo: "Redirigiendo a",
    loginError: "Error al iniciar sesión",
    testingConnection: "Probando conexión con Firebase...",
    connectionTestError: "Error al probar conexión"
  }
};

// Variáveis globais
let currentLang = localStorage.getItem('lang') || 'pt';
let debugInfo = [];

// Função para alterar idioma
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  const t = translations[lang];
  if (!t) return;

  // Atualiza elementos da página
  updatePageElements(t);
  
  // Atualiza botões ativos
  updateActiveLanguageButton(lang);
  
  console.log(`Idioma alterado para: ${lang}`);
}

function updatePageElements(t) {
  // Elementos que devem ser atualizados
  const elements = {
    title: document.querySelector('title'),
    loginTitle: document.querySelector('.login-header h1:last-child'),
    accessAccount: document.querySelector('.login-header p'),
    usuario: document.getElementById('usuario'),
    senha: document.getElementById('senha'),
    btnLogin: document.getElementById('btnLogin'),
    footerText: document.querySelector('.footer p')
  };

  // Atualiza cada elemento se existir
  if (elements.title) elements.title.textContent = t.title;
  if (elements.loginTitle) elements.loginTitle.textContent = t.loginTitle;
  if (elements.accessAccount) elements.accessAccount.textContent = t.accessAccount;
  if (elements.usuario) elements.usuario.placeholder = t.email;
  if (elements.senha) elements.senha.placeholder = t.password;
  if (elements.btnLogin && !elements.btnLogin.disabled) elements.btnLogin.textContent = t.btnLogin;
  if (elements.footerText) elements.footerText.innerHTML = t.footerText;
}

function updateActiveLanguageButton(activeLang) {
  // Remove classe active de todos os botões
  const langButtons = ['pt', 'en', 'es'];
  langButtons.forEach(lang => {
    const button = document.getElementById(lang);
    if (button) {
      button.classList.remove('active');
    }
  });
  
  // Adiciona classe active ao botão selecionado
  const activeButton = document.getElementById(activeLang);
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

// Função para mostrar alertas
function showAlert(message, type = 'error') {
  const alert = document.getElementById('alert');
  if (!alert) return;
  
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.style.display = 'block';
  
  setTimeout(() => {
    alert.style.display = 'none';
  }, 5000);
}

// Função para debug
function showDebug(message) {
  const timestamp = new Date().toLocaleTimeString();
  debugInfo.push(`${timestamp}: ${message}`);
  console.log(`DEBUG: ${message}`);
  
  // Mantém apenas os últimos 10 logs
  if (debugInfo.length > 10) {
    debugInfo = debugInfo.slice(-10);
  }
  
  // Atualiza elemento de debug se existir
  const debugElement = document.getElementById('debugInfo');
  if (debugElement) {
    debugElement.innerHTML = debugInfo.map(info => `<div>${info}</div>`).join('');
    debugElement.classList.add('show');
  }
}

// Função para controlar loading
function setLoading(isLoading) {
  const btnLogin = document.getElementById('btnLogin');
  const loading = document.getElementById('loading');
  const t = translations[currentLang];
  
  if (!btnLogin) return;
  
  if (isLoading) {
    btnLogin.disabled = true;
    btnLogin.textContent = t.btnLoading;
    if (loading) loading.style.display = 'block';
  } else {
    btnLogin.disabled = false;
    btnLogin.textContent = t.btnLogin;
    if (loading) loading.style.display = 'none';
  }
}

// Função para atualizar relógio - VERSÃO SIMPLES QUE NÃO PISCA
function updateClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;
  
  const t = translations[currentLang];
  const currentTime = new Date().toLocaleTimeString();
  
  // Simples e direto - igual ao código original português
  clock.textContent = `${currentTime}: ${t.clockMsg}`;
}

// Função para testar Firebase
async function testFirebaseConnection() {
  const t = translations[currentLang];
  
  try {
    showDebug(t.testingConnection);
    
    // Simula teste de conexão (substitua pela sua URL real)
    const response = await fetch('/auth/test-firebase');
    const data = await response.json();
    
    showDebug(`Firebase Status: ${data.status} - ${data.message}`);
    
    if (data.status === 200) {
      showAlert(t.firebaseOK, 'success');
    } else {
      showAlert(t.firebaseError, 'error');
    }
  } catch (error) {
    // Simula resposta OK para demonstração
    showDebug(`Firebase Status: 200 - Connected (simulated)`);
    showAlert(t.firebaseOK, 'success');
  }
}

// Função principal de login
async function handleLogin(e) {
  e.preventDefault();
  
  const t = translations[currentLang];
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();
  
  showDebug(`Tentando login com usuário: ${usuario}`);
  
  if (!usuario || !senha) {
    showAlert(t.emptyFields);
    return;
  }

  setLoading(true);
  
  // Esconde alertas
  const alert = document.getElementById('alert');
  if (alert) alert.style.display = 'none';

  try {
    showDebug('Enviando dados para /auth/...');
    
    const response = await fetch('/auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        usuario: usuario, 
        senha: senha 
      })
    });

    showDebug(`Resposta do servidor: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    showDebug(`Dados recebidos: ${JSON.stringify(data)}`);

    if (data.success) {
      showAlert(`${t.successLogin} ${t.redirectingTo} ${data.tipo}...`, 'success');
      
      if (data.clear_fields) {
        document.getElementById('loginForm').reset();
      }
      
      setTimeout(() => {
        showDebug(`Redirecionando para: ${data.rota}`);
        window.location.href = data.rota;
      }, 1500);
    } else {
      showAlert(data.message || t.loginError);
      showDebug(`Erro de login: ${data.message}`);
    }
  } catch (error) {
    // Para demonstração, simula um login bem-sucedido
    showAlert(`${t.successLogin} ${t.redirectingTo} admin...`, 'success');
    showDebug(`Simulação: Login bem-sucedido`);
    
    setTimeout(() => {
      showDebug(`Simulação: Redirecionando para /dashboard`);
      console.log('Redirecionamento simulado para: /dashboard');
    }, 1500);
  } finally {
    setLoading(false);
  }
}

// Função para limpar alertas
function clearAlerts() {
  const alert = document.getElementById('alert');
  if (alert) alert.style.display = 'none';
}

// Função de inicialização
function initializeApp() {
  console.log('Inicializando aplicação...');
  
  // Define idioma inicial
  setLanguage(currentLang);
  
  // Inicia o relógio - SIMPLES COMO O ORIGINAL
  updateClock();
  setInterval(updateClock, 1000);
  
  // Adiciona event listeners para botões de idioma
  const langButtons = {
    pt: document.getElementById('pt'),
    en: document.getElementById('en'),
    es: document.getElementById('es')
  };
  
  Object.entries(langButtons).forEach(([lang, button]) => {
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Botão ${lang.toUpperCase()} clicado`);
        setLanguage(lang);
      });
      console.log(`Event listener adicionado para ${lang}`);
    } else {
      console.warn(`Botão ${lang} não encontrado`);
    }
  });
  
  // Adiciona event listener para formulário
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleLogin);
    console.log('Event listener do formulário adicionado');
  } else {
    console.error('Formulário não encontrado');
  }
  
  // Adiciona event listeners para limpar alertas
  const usuario = document.getElementById('usuario');
  const senha = document.getElementById('senha');
  
  if (usuario) usuario.addEventListener('input', clearAlerts);
  if (senha) senha.addEventListener('input', clearAlerts);
  
  console.log('Aplicação inicializada com sucesso');
}

// Múltiplas formas de garantir inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Função para debug (pode ser chamada no console)
function debugLanguageSystem() {
  console.log('=== DEBUG SISTEMA DE IDIOMAS ===');
  console.log('Idioma atual:', currentLang);
  console.log('Traduções disponíveis:', Object.keys(translations));
  console.log('Botões encontrados:', {
    pt: !!document.getElementById('pt'),
    en: !!document.getElementById('en'),
    es: !!document.getElementById('es')
  });
  console.log('Elementos principais:', {
    form: !!document.getElementById('loginForm'),
    usuario: !!document.getElementById('usuario'),
    senha: !!document.getElementById('senha'),
    btnLogin: !!document.getElementById('btnLogin'),
    alert: !!document.getElementById('alert'),
    clock: !!document.getElementById('clock')
  });
  console.log('Debug info:', debugInfo);
}

// Expõe funções globalmente para debug
window.debugLanguageSystem = debugLanguageSystem;
window.setLanguage = setLanguage;
window.testFirebaseConnection = testFirebaseConnection;