document.addEventListener("DOMContentLoaded", async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
        return; 
    }

    let currentUser = null;
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
        try {
            currentUser = JSON.parse(currentUserData);
        } catch (e) {
            console.error("Erro ao parsear dados do usuário do localStorage:", e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return;
        }
    } else {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
        return;
    }

    const btnEntrar = document.getElementById("btnEntrar");
    const btnNavbarPublicar = document.getElementById("btnNavbarPublicar");
    const btnLogout = document.getElementById("btnLogout");
    const navPerfil = document.getElementById("navPerfil");
    const navUserInfo = document.getElementById("navUserInfo");
    const loggedInUserNameSpan = document.getElementById("loggedInUserName");

    configurarVisibilidadeNavbar(currentUser, btnEntrar, navPerfil, btnNavbarPublicar, btnLogout, navUserInfo, loggedInUserNameSpan);

    if (btnLogout) {
        btnLogout.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = "login.html";
            } catch (error) {
                console.error("Erro ao fazer logout:", error);
                showError("Erro ao fazer logout. Tente novamente.");
            }
        });
    }

    const filterCategory = document.getElementById("filterCategory");
    const filterType = document.getElementById("filterType");

    if (filterCategory) filterCategory.addEventListener("change", loadOccurrences);
    if (filterType) filterType.addEventListener("change", loadOccurrences);

    await loadOccurrences();
});

//const API_OCCURRENCES_URL = 'http://localhost:3002/occurrences';
const API_OCCURRENCES_URL = 'https://bairro-digital-occurrences.onrender.com/occurrences';

function configurarVisibilidadeNavbar(user, btnEntrar, navPerfil, btnPublicar, btnSair, navUserInfo, loggedInUserNameSpan) {
    const isLoggedIn = !!user && !!localStorage.getItem('authToken');

    if (btnEntrar) btnEntrar.classList.toggle("d-none", isLoggedIn);
    
    if (navPerfil) navPerfil.classList.toggle("d-none", !isLoggedIn);
    if (btnPublicar) btnPublicar.classList.toggle("d-none", !isLoggedIn);
    if (btnSair) btnSair.classList.toggle("d-none", !isLoggedIn);

    if (navUserInfo && loggedInUserNameSpan) {
        if (isLoggedIn && user && user.name) {
            loggedInUserNameSpan.textContent = `Olá, ${user.name.split(' ')[0]}`;
            navUserInfo.classList.remove("d-none");
        } else {
            navUserInfo.classList.add("d-none");
        }
    }
}

//const OCCURRENCES_SERVICE_BASE_URL = 'http://localhost:3002';
const OCCURRENCES_SERVICE_BASE_URL = 'https://bairro-digital-occurrences.onrender.com';

async function loadOccurrences() {
    const serviceList = document.getElementById("serviceList");
    if (!serviceList) {
        console.error("Elemento 'serviceList' não encontrado no DOM.");
        return;
    }
    serviceList.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="sr-only">Carregando...</span></div></div>';

    const filterStatusValue = document.getElementById("filterCategory")?.value || ""; 
    const filterTypeValue = document.getElementById("filterType")?.value || ""; 

    try {
        const params = {};
        if (filterStatusValue) {
            params.status = filterStatusValue;
        }
        if (filterTypeValue) {
            params.tipo = filterTypeValue;
        }

        const response = await axios.get(API_OCCURRENCES_URL, { params });
        
        const ocorrencias = response.data;

        if (ocorrencias && ocorrencias.length > 0) {
            const cardsHTML = ocorrencias.map(ocorrencia => criarCardOcorrencia(ocorrencia)).join('');
            serviceList.innerHTML = cardsHTML;
        } else {
            serviceList.innerHTML = `<div class="col-12"><p class="text-center text-muted">Nenhuma ocorrência encontrada com os filtros selecionados.</p></div>`;
        }
    } catch (error) {
        console.error("Erro ao carregar ocorrências:", error);
        showError("Falha ao carregar ocorrências. Verifique a conexão com o servidor ou tente mais tarde.");
        serviceList.innerHTML = `<div class="col-12"><p class="text-center text-danger">Não foi possível carregar as ocorrências.</p></div>`;
    }
}

function criarCardOcorrencia(ocorrencia) {
    const titulo = ocorrencia.titulo || "Sem título";
    const localizacaoDisplay = `${ocorrencia.rua || ''}, ${ocorrencia.bairro || ''} - ${ocorrencia.cidade || ''}`;
    const status = ocorrencia.status || "Não informado";
    const data = new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    let imagemSrc = "img/sem-imagem.jpg";
    if (ocorrencia.fotoUrl) {
        if (ocorrencia.fotoUrl.startsWith('http')) {
            imagemSrc = ocorrencia.fotoUrl;
        } else {
            imagemSrc = `${OCCURRENCES_SERVICE_BASE_URL}/${ocorrencia.fotoUrl}`;
        }
    }

    const nomeUsuario = ocorrencia.userName || "Usuário Anônimo";
    const idOcorrencia = ocorrencia._id;

    const statusIconMap = { "Aberto": "🔴", "Em andamento": "🟡", "Resolvido": "🟢" };
    const statusIcon = statusIconMap[status] || "⚪";

    return `
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <img src="${imagemSrc}" class="card-img-top" alt="Imagem da ocorrência: ${titulo}"
                 style="height: 200px; object-fit: cover;" onerror="this.onerror=null;this.src='img/sem-imagem.jpg';" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title" title="${titulo}">🚧 ${titulo.substring(0, 25)}${titulo.length > 25 ? '...' : ''}</h5>
              <p class="card-text mb-1"><small><i class="fas fa-map-marker-alt"></i> ${localizacaoDisplay}</small></p>
              <p class="card-text mb-1"><small>${statusIcon} <strong>Status:</strong> ${status}</small></p>
              <p class="card-text mb-1"><small><i class="far fa-calendar-alt"></i> <strong>Data:</strong> ${data}</small></p>
              <p class="card-text"><small><i class="fas fa-user"></i> <strong>Por:</strong> ${nomeUsuario}</small></p>
              <div class="mt-auto text-center pt-2">
                <a href="detalhes.html?id=${idOcorrencia}" class="btn btn-primary btn-sm">Ver Detalhes</a>
              </div>
            </div>
          </div>
        </div>
    `;
}

function showError(message) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
        setTimeout(() => { 
            errorDiv.classList.add('d-none');
            errorDiv.textContent = '';
        }, 5000);
    } else {
        alert(message);
    }
}