const API_OCCURRENCES_URL = 'http://localhost:3002/occurrences';

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

    configurarNavbarNovaOcorrencia(currentUser);

    const newOccurrenceForm = document.getElementById("newOccurrenceForm");
    if (newOccurrenceForm) {
        newOccurrenceForm.addEventListener("submit", handleSubmitNovaOcorrencia);
    }

    const cepInput = document.getElementById("cep");
    if (cepInput) {
        cepInput.addEventListener("blur", buscarEnderecoPorCEP);
        cepInput.addEventListener("input", formatarCEP);
    }

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = "login.html";
        });
    }
});

function configurarNavbarNovaOcorrencia(user) {
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

async function handleSubmitNovaOcorrencia(e) {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Sua sessão expirou ou é inválida. Por favor, faça login novamente.");
        window.location.href = "login.html";
        return;
    }

    const titulo = document.getElementById('title').value.trim();
    const tipo = document.getElementById('type').value;
    const descricao = document.getElementById('description').value.trim();
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    const rua = document.getElementById('rua').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const referencia = document.getElementById('referencia').value.trim();
    const fotoInput = document.getElementById('foto');

    if (!titulo || !tipo || !descricao || !cep || !rua || !bairro || !cidade || !estado) {
        alert("Por favor, preencha todos os campos obrigatórios da ocorrência.");
        return;
    }
    if (cep.length !== 8) {
        alert("CEP inválido. Deve conter 8 dígitos.");
        return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('tipo', tipo);
    formData.append('descricao', descricao);
    formData.append('cep', cep);
    formData.append('rua', rua);
    formData.append('bairro', bairro);
    formData.append('cidade', cidade);
    formData.append('estado', estado);
    formData.append('referencia', referencia);

    if (fotoInput.files && fotoInput.files[0]) {
        const fotoFile = fotoInput.files[0];
        if (fotoFile.size > 5 * 1024 * 1024) {
            alert("A foto selecionada é muito grande. O tamanho máximo permitido é 5MB.");
            return;
        }
        formData.append('foto', fotoFile);
    }

    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';

    try {
        const response = await axios.post(API_OCCURRENCES_URL, formData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            }
        });

        alert("Ocorrência registrada com sucesso!");
        this.reset();
    } catch (error) {
        console.error("Erro ao registrar ocorrência:", error);
        if (error.response && error.response.data && error.response.data.message) {
            alert(`Erro: ${error.response.data.message}`);
        } else if (error.request) {
            alert("Erro ao registrar ocorrência: Não foi possível conectar ao servidor.");
        } else {
            alert("Erro ao registrar ocorrência. Verifique os dados e tente novamente.");
        }
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

function formatarCEP(event) {
    let input = event.target;
    input.value = input.value.replace(/\D/g, '');
    input.value = input.value.replace(/^(\d{5})(\d)/, '$1-$2');
    if (input.value.length > 9) {
        input.value = input.value.substring(0, 9);
    }
}

async function buscarEnderecoPorCEP() {
    const cep = this.value.replace(/\D/g, "");
    if (cep.length !== 8) {
        if (cep.length > 0 && cep.length < 8) console.warn("CEP incompleto.");
        return;
    }
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!res.ok) throw new Error(`Erro na API do ViaCEP: ${res.status}`);
        const data = await res.json();

        const ruaInput = document.getElementById("rua");
        const bairroInput = document.getElementById("bairro");
        const cidadeInput = document.getElementById("cidade");
        const estadoInput = document.getElementById("estado");

        if (data.erro) {
            alert("CEP não encontrado. Por favor, verifique o CEP ou preencha o endereço manualmente.");
            ruaInput.value = "";
            bairroInput.value = "";
            cidadeInput.value = "";
            estadoInput.value = "";
            return;
        }
        ruaInput.value = data.logradouro || "";
        bairroInput.value = data.bairro || "";
        cidadeInput.value = data.localidade || "";
        estadoInput.value = data.uf || "";
    } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        alert("Erro ao buscar endereço pelo CEP. Verifique sua conexão ou preencha manualmente.");
    }
}