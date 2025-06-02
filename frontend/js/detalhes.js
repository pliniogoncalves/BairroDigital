//const API_OCCURRENCES_URL = 'http://localhost:3002/occurrences';
//const OCCURRENCES_SERVICE_BASE_URL = 'http://localhost:3002';

const API_OCCURRENCES_URL = 'https://bairro-digital-occurrences.onrender.com/occurrences';
const OCCURRENCES_SERVICE_BASE_URL = 'https://bairro-digital-occurrences.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
    const loadingDiv = document.getElementById("loading");
    const errorMessageDiv = document.getElementById("error-message");
    const occurrenceDetailsDiv = document.getElementById("occurrenceDetails");

    function formatDate(dateString) {
        if (!dateString) return 'Data não informada';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    function configurarNavbarDetalhes() {
        const authToken = localStorage.getItem('authToken');
        const currentUserData = localStorage.getItem('currentUser');
        const navUserInfo = document.getElementById("navUserInfo");
        const loggedInUserNameSpan = document.getElementById("loggedInUserName"); 
        const btnLogoutDetalhes = document.getElementById("btnLogoutDetalhes");

        if (authToken && currentUserData) {
            try {
                const currentUser = JSON.parse(currentUserData);
                if (navUserInfo && loggedInUserNameSpan && currentUser.name) {
                    loggedInUserNameSpan.textContent = currentUser.name.split(' ')[0];
                    navUserInfo.classList.remove("d-none");
                }
                if (btnLogoutDetalhes) {
                    btnLogoutDetalhes.classList.remove("d-none");
                    btnLogoutDetalhes.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('currentUser');
                        window.location.href = 'login.html';
                    });
                }
            } catch (e) { console.error("Erro ao configurar navbar:", e); }
        }
    }

    configurarNavbarDetalhes();

    if (loadingDiv) loadingDiv.classList.remove("d-none");
    if (occurrenceDetailsDiv) occurrenceDetailsDiv.classList.add("d-none");

    const urlParams = new URLSearchParams(window.location.search);
    const occurrenceId = urlParams.get("id");

    if (!occurrenceId) {
        if (loadingDiv) loadingDiv.classList.add("d-none");
        if (errorMessageDiv) {
            errorMessageDiv.textContent = "ID da ocorrência não fornecido na URL.";
            errorMessageDiv.classList.remove("d-none");
        }
        return;
    }

    try {
        const response = await axios.get(`${API_OCCURRENCES_URL}/${occurrenceId}`);
        const ocorrencia = response.data;

        if (!ocorrencia) { 
            throw new Error("Ocorrência não encontrada na resposta da API.");
        }

        document.getElementById("occurrenceTitle").textContent = ocorrencia.titulo || "Título não informado";
        document.getElementById("occurrenceDescription").textContent = ocorrencia.descricao || "Descrição não informada";
        
        const status = ocorrencia.status || "Pendente";
        const statusIconMap = { "Aberto": "🔴", "Em andamento": "🟡", "Resolvido": "🟢" };
        const statusIcon = statusIconMap[status] || "⚪";
        document.getElementById("occurrenceStatus").innerHTML = `${statusIcon} ${status}`;

        document.getElementById("occurrenceType").textContent = ocorrencia.tipo || "Tipo não informado";
        
        const localizacaoCompleta = `${ocorrencia.rua || ''}, ${ocorrencia.bairro || ''}, ${ocorrencia.cidade || ''} - ${ocorrencia.estado || ''} (CEP: ${ocorrencia.cep || ''})`;
        document.getElementById("occurrenceLocation").textContent = localizacaoCompleta;
        
        const nomeUsuario = ocorrencia.userName || "Usuário Anônimo";
        document.getElementById("occurrenceUser").textContent = nomeUsuario;
        
        document.getElementById("occurrenceDate").textContent = formatDate(ocorrencia.createdAt);
        
        const occurrenceImage = document.getElementById("occurrenceImage");
        if (ocorrencia.fotoFileId) {
            occurrenceImage.src = `${OCCURRENCES_SERVICE_BASE_URL}/occurrences/image/${ocorrencia.fotoFileId}`;
            occurrenceImage.alt = `Foto da ocorrência: ${ocorrencia.titulo}`;
        } else if (ocorrencia.fotoUrl && ocorrencia.fotoUrl.startsWith('http')) { 
            occurrenceImage.src = ocorrencia.fotoUrl;
            occurrenceImage.alt = `Foto da ocorrência: ${ocorrencia.titulo}`;
        } else {
            occurrenceImage.src = "img/sem-imagem.jpg";
            occurrenceImage.alt = "Sem imagem para esta ocorrência";
        }

        const mapLink = document.getElementById("mapLink");
        if (mapLink && ocorrencia.cep) {
            const query = encodeURIComponent(`${ocorrencia.rua}, ${ocorrencia.numero || ''}, ${ocorrencia.bairro}, ${ocorrencia.cidade}, ${ocorrencia.estado}`);
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
            mapLink.classList.remove("d-none");
        } else if (mapLink) {
            mapLink.classList.add("d-none");
        }
        
        if (occurrenceDetailsDiv) occurrenceDetailsDiv.classList.remove("d-none");

    } catch (error) {
        console.error("Erro ao buscar detalhes da ocorrência:", error);
        if (errorMessageDiv) {
            if (error.response && error.response.status === 404) {
                errorMessageDiv.textContent = "Ocorrência não encontrada.";
            } else if (error.response && error.response.data && error.response.data.message) {
                errorMessageDiv.textContent = `Erro: ${error.response.data.message}`;
            } else {
                errorMessageDiv.textContent = "Não foi possível carregar os detalhes da ocorrência. Tente novamente mais tarde.";
            }
            errorMessageDiv.classList.remove("d-none");
        }
    } finally {
        if (loadingDiv) loadingDiv.classList.add("d-none");
    }
});