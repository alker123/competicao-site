 const form = document.getElementById('loginForm');
        const alert = document.getElementById('alert');
        const loading = document.getElementById('loading');
        const btnLogin = document.getElementById('btnLogin');

        // Função para exibir alertas
        function showAlert(message, type = 'error') {
            alert.textContent = message;
            alert.className = `alert alert-${type}`;
            alert.style.display = 'block';
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }

        // Função para mostrar/ocultar o carregamento
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

        // Função para verificar se o usuário está offline
        function isOffline() {
            if (!navigator.onLine) {
                showAlert('Você está offline. Verifique sua conexão com a internet.', 'error');
                return true;
            }
            return false;
        }

        // Evento ao enviar o formulário
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Verifica se o usuário está offline
            if (isOffline()) {
                return; // Não envia a requisição se estiver offline
            }

            const usuario = document.getElementById('usuario').value.trim();
            const senha = document.getElementById('senha').value.trim();

            if (!usuario || !senha) {
                showAlert('Por favor, preencha todos os campos.');
                return;
            }

            setLoading(true);
            alert.style.display = 'none';

            try {
                // Enviar dados para o backend
                const response = await fetch('/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usuario, senha })
                });

                const data = await response.json();

                if (data.success) {
                    showAlert(`Login realizado com sucesso!...`, 'success');
                    setTimeout(() => {
                        window.location.href = data.rota;
                    }, 1500);
                } else {
                    showAlert(data.message || 'Erro ao fazer login');
                }
            } catch (error) {
                // Caso o erro seja de conexão
                if (!navigator.onLine) {
                    showAlert('Erro de conexão! Verifique sua internet e tente novamente.', 'error');
                } else {
                    showAlert('Erro ao tentar autenticar. Tente novamente.', 'error');
                }
                console.error('Erro:', error);
            } finally {
                setLoading(false);
            }
        });