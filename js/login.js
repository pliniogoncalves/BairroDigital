// Inicializar o Parse
Parse.initialize("Kh8rJMBCG43Lq5cpwJVGNpM4w09HELTfcskylROh", "Dcw2WhPSyOZKLfmBIEZUHZbmbhM8ObCDlnCh3Dhr");
Parse.serverURL = "https://parseapi.back4app.com";

// Alternar entre login e cadastro
document.getElementById("showRegister").addEventListener("click", () => {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
    clearMessages();
});

document.getElementById("showLogin").addEventListener("click", () => {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
    clearMessages();
});

// Função para limpar mensagens
function clearMessages() {
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("successMessage").style.display = "none";
}

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showError("E-mail e senha são obrigatórios.");
        return;
    }

    try {
        const user = await Parse.User.logIn(email, password);
        console.log("Usuário logado:", user);

        showSuccess(`Bem-vindo(a), ${user.get("name") || user.get("username")}`);

        // Aguarda o Parse.User estar disponível na próxima página
        setTimeout(() => {
            window.location.href = "pagInicial.html";
        }, 1500);
    } catch (error) {
        console.error("Erro no login:", error);
        showError("Usuário ou senha incorretos.");
    }
});

// CADASTRO
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
        showError("Por favor, preencha todos os campos.");
        return;
    }

    const user = new Parse.User();
    user.set("username", email);
    user.set("email", email);
    user.set("password", password);
    user.set("name", name);

    try {
        await user.signUp();
        console.log("Usuário cadastrado:", user);

        showSuccess("Cadastro realizado com sucesso!");
        document.getElementById("registerForm").reset();

        setTimeout(() => {
            window.location.href = "pagInicial.html";
        }, 1500);
    } catch (error) {
        console.error("Erro no cadastro:", error);
        showError(error.message);
    }
});

// RECUPERAÇÃO DE SENHA
document.getElementById("passwordRecoveryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("recoveryEmail").value.trim();
    const msg = document.getElementById("recoveryErrorMessage");

    msg.textContent = "";

    if (!email) {
        msg.classList.remove("text-success");
        msg.classList.add("text-danger");
        msg.textContent = "Informe o e-mail para recuperar a senha.";
        return;
    }

    try {
        await Parse.User.requestPasswordReset(email);
        msg.classList.remove("text-danger");
        msg.classList.add("text-success");
        msg.textContent = "E-mail de recuperação enviado!";
    } catch (error) {
        console.error("Erro na recuperação:", error);
        msg.classList.remove("text-success");
        msg.classList.add("text-danger");
        msg.textContent = "Erro: " + error.message;
    }
});

// Funções auxiliares
function showError(message) {
    const el = document.getElementById("errorMessage");
    el.textContent = message;
    el.style.display = "block";
}

function showSuccess(message) {
    const el = document.getElementById("successMessage");
    el.textContent = message;
    el.style.display = "block";
}
