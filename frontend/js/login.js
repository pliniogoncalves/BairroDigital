document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const forgotPasswordLink = document.getElementById('forgotPassword');

    const errorMessageDiv = document.getElementById('errorMessage');
    const successMessageDiv = document.getElementById('successMessage');

    //const API_BASE_URL = 'http://localhost:3001/auth';
    const API_BASE_URL = 'https://bairro-digital-auth.onrender.com/auth';

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('registerSection').style.display = 'block';
            clearMessages();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerSection').style.display = 'none';
            document.getElementById('loginSection').style.display = 'block';
            clearMessages();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showError('E-mail e senha são obrigatórios.');
                return;
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/login`, {
                    email: email,
                    password: password
                });

                const { token, user } = response.data;
                localStorage.setItem('authToken', token);
                localStorage.setItem('currentUser', JSON.stringify(user));

                showSuccess(`Bem-vindo(a), ${user.name || user.email}! Redirecionando...`);

                setTimeout(() => {
                    window.location.href = 'pagInicial.html';
                }, 1500);

            } catch (error) {
                console.error('Erro no login:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    showError(error.response.data.message);
                } else {
                    showError('Erro ao tentar fazer login. Tente novamente.');
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();

            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;

            if (!name || !email || !password) {
                showError('Nome, e-mail e senha são obrigatórios.');
                return;
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/register`, {
                    name: name,
                    email: email,
                    password: password
                });

                showSuccess('Cadastro realizado com sucesso! Por favor, faça o login para continuar.');
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                console.error('Erro no cadastro:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    showError(error.response.data.message);
                } else {
                    showError('Erro ao tentar fazer o cadastro. Tente novamente.');
                }
            }
        });
    }

    const passwordRecoveryForm = document.getElementById('passwordRecoveryForm');
    if (passwordRecoveryForm) {
        passwordRecoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showError('Funcionalidade de recuperação de senha ainda não implementada.');
        });
    }


    function clearMessages() {
        if (errorMessageDiv) errorMessageDiv.style.display = 'none';
        if (successMessageDiv) successMessageDiv.style.display = 'none';
        if (errorMessageDiv) errorMessageDiv.textContent = '';
        if (successMessageDiv) successMessageDiv.textContent = '';
    }

    function showError(message) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }

    function showSuccess(message) {
        if (successMessageDiv) {
            successMessageDiv.textContent = message;
            successMessageDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }
});