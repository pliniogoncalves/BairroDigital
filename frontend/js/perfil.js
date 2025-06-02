//const API_AUTH_URL = 'http://localhost:3001/auth';
const API_AUTH_URL = 'https://bairro-digital-auth.onrender.com/auth';

document.addEventListener("DOMContentLoaded", () => {
    const authToken = localStorage.getItem('authToken');
    let currentUser = null;
    const currentUserData = localStorage.getItem('currentUser');

    if (!authToken || !currentUserData) {
        window.location.href = "login.html";
        return;
    }
    try {
        currentUser = JSON.parse(currentUserData);
    } catch (e) {
        console.error("Erro ao parsear dados do usuário:", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = "login.html";
        return;
    }
    if (!currentUser) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = "login.html";
        return;
    }

    carregarPerfilUsuario(currentUser);
    configurarNavbarPerfil(currentUser);

    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleSubmitEditarPerfil);
    }

    const btnLogoutPerfil = document.getElementById("btnLogoutPerfil");
    if (btnLogoutPerfil) {
        btnLogoutPerfil.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = "login.html";
        });
    }
});

function configurarNavbarPerfil(user) {
    const navUserInfo = document.getElementById("navUserInfo");
    const loggedInUserNameSpan = document.getElementById("loggedInUserName");

    if (navUserInfo && loggedInUserNameSpan) {
        if (user && user.name) {
            loggedInUserNameSpan.textContent = user.name.split(' ')[0];
            navUserInfo.classList.remove("d-none");
        } else {
            navUserInfo.classList.add("d-none");
        }
    }
}


function carregarPerfilUsuario(user) {
    if (!user) return;
    document.getElementById("userName").innerText = user.name || "N/A";
    document.getElementById("userEmail").innerText = user.email || "N/A";
    document.getElementById("userPhone").innerText = user.phone || "Não informado";
    document.getElementById("editName").value = user.name || "";
    document.getElementById("editPhone").value = user.phone || "";
}

async function handleSubmitEditarPerfil(e) {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        window.location.href = "login.html";
        return;
    }

    const name = document.getElementById("editName").value.trim();
    const phone = document.getElementById("editPhone").value.trim();

    if (!name && !phone) {
        alert("Forneça pelo menos um campo (nome ou telefone) para atualizar.");
        return;
    }
    if (name === "" || phone === "") {
        if (!confirm("Um dos campos está vazio. Deseja limpar essa informação do seu perfil?")) {
            return;
        }
    }


    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (phone || phone === "") dataToUpdate.phone = phone;


    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';

    try {
        const response = await axios.put(`${API_AUTH_URL}/profile`, dataToUpdate, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const updatedUser = response.data.user;

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        carregarPerfilUsuario(updatedUser);
        
        configurarNavbarPerfil(updatedUser); 

        $('#editProfileModal').modal('hide');
        alert("Perfil atualizado com sucesso!");

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        let errorMessage = "Erro ao atualizar perfil.";
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.request) {
            errorMessage = "Não foi possível conectar ao servidor para atualizar o perfil.";
        }
        alert(`Erro: ${errorMessage}`);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}
