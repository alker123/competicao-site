const form = document.getElementById('loginForm');
        const alert = document.getElementById('alert');
        const loading = document.getElementById('loading');
        const btnLogin = document.getElementById('btnLogin');
        

        function showAlert(message, type = 'error') {
            alert.textContent = message;
            alert.className = `alert alert-${type}`;
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }

        function showDebug(message) {
            debugInfo.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
            debugInfo.style.display = 'block';
        }

        function setLoading(isLoading) {
            if (isLoading) {
                btnLogin.disabled = true;
                btnLogin.textContent = '<i class="fas fa-sign-in-alt"></i> Entrando...';
                loading.style.display = 'block';
            } else {
                btnLogin.disabled = false;
                btnLogin.textContent = '<i class="fas fa-sign-in-alt"></i> Entrar';
                loading.style.display = 'none';
            }
        }
        // Função para atualizar a hora a cada segundo
        function updateClock() {
         const currentTime = new Date().toLocaleTimeString();
  
        // Atualiza a parte da hora
        document.getElementById('current-time').textContent = currentTime;
  
        // Mantém o texto fixo, como "Horario do Brasil"
        document.getElementById('clock-msg').textContent = "Horario do Brasil";
        }

      // Atualizar o relógio a cada segundo
        setInterval(updateClock, 1000);



        async function testFirebaseConnection() {
            try {
                showDebug('Testando conexão com Firebase...');
                const response = await fetch('/auth/test-firebase');
                const data = await response.json();
                showDebug(`Firebase Status: ${data.status} - ${data.message}`);
                
                if (data.status === 200) {
                    showAlert('Conexão com Firebase OK!', 'success');
                } else {
                    showAlert('Erro na conexão com Firebase', 'error');
                }
            } catch (error) {
                showDebug(`Erro ao testar Firebase: ${error.message}`);
                showAlert('Erro ao testar conexão', 'error');
            }
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usuario = document.getElementById('usuario').value.trim();
            const senha = document.getElementById('senha').value.trim();
            
            showDebug(`Tentando login com usuário: ${usuario}`);
            
            if (!usuario || !senha) {
                showAlert('Por favor, preencha todos os campos.');
                return;
            }

            setLoading(true);
            alert.style.display = 'none';

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
                    showAlert(`Login realizado com sucesso! Redirecionando para ${data.tipo}...`, 'success');
                    
                    if (data.clear_fields) {
                        form.reset();
                    }
                    
                    setTimeout(() => {
                        showDebug(`Redirecionando para: ${data.rota}`);
                        window.location.href = data.rota;
                    }, 1500);
                } else {
                    showAlert(data.message || 'Erro ao fazer login');
                    showDebug(`Erro de login: ${data.message}`);
                }
            } catch (error) {
                const errorMsg = `Erro de conexão: ${error.message}`;
                showAlert('Erro de conexão. Verifique sua internet e tente novamente.');
                showDebug(errorMsg);
                console.error('Erro completo:', error);
            } finally {
                setLoading(false);
            }
        });

        // Limpar alertas ao digitar
        document.getElementById('usuario').addEventListener('input', () => {
            alert.style.display = 'none';
        });
        
        document.getElementById('senha').addEventListener('input', () => {
            alert.style.display = 'none';
        });
