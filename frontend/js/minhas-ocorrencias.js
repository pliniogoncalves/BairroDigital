//const API_OCCURRENCES_URL = 'http://localhost:3002/occurrences';
//const OCCURRENCES_SERVICE_BASE_URL = 'http://localhost:3002';

const API_OCCURRENCES_URL = 'https://bairro-digital-occurrences.onrender.com/occurrences';
const OCCURRENCES_SERVICE_BASE_URL = 'https://bairro-digital-occurrences.onrender.com';

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

    configurarNavbarMinhasOcorrencias(currentUser);
    carregarOcorrenciasDoUsuario();

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = "login.html";
        });
    }

    const editOccurrenceForm = document.getElementById("editOccurrenceForm");
    if (editOccurrenceForm) {
        editOccurrenceForm.addEventListener("submit", handleSubmitEditarOcorrencia);
    }

    const cepModalInput = document.getElementById("editOccurrenceCepModal");
    if (cepModalInput) {
    }
});

function configurarNavbarMinhasOcorrencias(user) {
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

function showAlertMinhasOcorrencias(message, type = 'danger') {
    const alertDiv = document.getElementById('alert-messages-minhas-ocorrencias');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                                ${message}
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>`;
    } else {
        alert(message);
    }
}


async function carregarOcorrenciasDoUsuario() {
    const tabelaBody = document.getElementById("occurrenceTable");
    if (!tabelaBody) {
        console.error("Elemento 'occurrenceTable' não encontrado no DOM.");
        return;
    }
    tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"><span class="sr-only">Carregando...</span></div></td></tr>';
    const authToken = localStorage.getItem('authToken');

    try {
        const response = await axios.get(`${API_OCCURRENCES_URL}/my`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const ocorrencias = response.data;

        if (ocorrencias && ocorrencias.length > 0) {
            tabelaBody.innerHTML = '';
            ocorrencias.forEach(ocorrencia => {
                const linha = tabelaBody.insertRow();
                const titulo = ocorrencia.titulo || "N/A";
                const descricaoResumida = (ocorrencia.descricao || "N/A").substring(0, 40) + ((ocorrencia.descricao || "").length > 40 ? "..." : "");
                const bairro = ocorrencia.bairro || "N/A";
                const status = ocorrencia.status || "N/A";
                const data = new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR");
                const idOcorrencia = ocorrencia._id;

                let statusClass = 'secondary';
                if (status === 'Aberto') statusClass = 'danger';
                else if (status === 'Em andamento') statusClass = 'warning';
                else if (status === 'Resolvido') statusClass = 'success';

                linha.innerHTML = `
                    <td title="${ocorrencia.titulo || ''}">${titulo}</td>
                    <td title="${ocorrencia.descricao || ''}">${descricaoResumida}</td>
                    <td>${bairro}</td>
                    <td><span class="badge badge-${statusClass}">${status}</span></td>
                    <td>${data}</td>
                    <td>
                        <a href="detalhes.html?id=${idOcorrencia}" class="btn btn-sm btn-info mr-1" title="Ver Detalhes"><i class="fas fa-eye"></i></a>
                        <button class="btn btn-sm btn-warning mr-1" onclick="abrirModalEdicao('${idOcorrencia}')" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="excluirOcorrencia('${idOcorrencia}')" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                `;
            });
        } else {
            tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Você ainda não registrou nenhuma ocorrência.</td></tr>';
        }
    } catch (error) {
        console.error("Erro ao carregar 'minhas ocorrências':", error);
        let mensagemErro = "Falha ao carregar suas ocorrências.";
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = "login.html";
                return;
            }
            mensagemErro = error.response.data?.message || mensagemErro;
        }
        tabelaBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${mensagemErro}</td></tr>`;
    }
}

async function abrirModalEdicao(idOcorrencia) {
    const authToken = localStorage.getItem('authToken');
    try {
        const response = await axios.get(`${API_OCCURRENCES_URL}/${idOcorrencia}`, {
        });
        const ocorrencia = response.data;

        document.getElementById('editOccurrenceIdModal').value = ocorrencia._id;
        document.getElementById('editOccurrenceTitleModal').value = ocorrencia.titulo || '';
        document.getElementById('editOccurrenceDescriptionModal').value = ocorrencia.descricao || '';
        document.getElementById('editOccurrenceTypeModal').value = ocorrencia.tipo || '';
        document.getElementById('editOccurrenceStatusModal').value = ocorrencia.status || 'Aberto';
        document.getElementById('editOccurrenceCepModal').value = ocorrencia.cep || '';
        document.getElementById('editOccurrenceRuaModal').value = ocorrencia.rua || '';
        document.getElementById('editOccurrenceBairroModal').value = ocorrencia.bairro || '';
        document.getElementById('editOccurrenceCidadeModal').value = ocorrencia.cidade || '';
        document.getElementById('editOccurrenceEstadoModal').value = ocorrencia.estado || '';
        document.getElementById('editOccurrenceReferenciaModal').value = ocorrencia.referencia || '';
        
        const imgPreview = document.getElementById('currentOccurrenceImagePreview');
        if (ocorrencia.fotoFileId) {
            imgPreview.src = `${OCCURRENCES_SERVICE_BASE_URL}/occurrences/image/${ocorrencia.fotoFileId}`;
            imgPreview.style.display = 'block';
            imgPreview.alt = `Foto atual da ocorrência: ${ocorrencia.titulo || 'Ocorrência'}`;
        } else if (ocorrencia.fotoUrl && ocorrencia.fotoUrl.startsWith('http')) {
            imgPreview.src = ocorrencia.fotoUrl;
            imgPreview.style.display = 'block';
            imgPreview.alt = `Foto atual da ocorrência: ${ocorrencia.titulo || 'Ocorrência'}`;
        } else {
            imgPreview.src = 'img/sem-imagem.jpg';
            imgPreview.alt = 'Nenhuma foto atual';
        }
        document.getElementById('editOccurrenceFotoModal').value = '';

        $('#editOccurrenceModal').modal('show');
    } catch (error) {
        console.error("Erro ao buscar dados da ocorrência para edição:", error);
        showAlertMinhasOcorrencias("Não foi possível carregar os dados da ocorrência para edição.");
    }
}

async function handleSubmitEditarOcorrencia(e) {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken');
    const occurrenceId = document.getElementById('editOccurrenceIdModal').value;

    if (!occurrenceId) {
        showAlertMinhasOcorrencias("ID da ocorrência não encontrado para edição.");
        return;
    }

    const formData = new FormData();
    formData.append('titulo', document.getElementById('editOccurrenceTitleModal').value.trim());
    formData.append('descricao', document.getElementById('editOccurrenceDescriptionModal').value.trim());
    formData.append('tipo', document.getElementById('editOccurrenceTypeModal').value);
    formData.append('status', document.getElementById('editOccurrenceStatusModal').value);
    formData.append('cep', document.getElementById('editOccurrenceCepModal').value.replace(/\D/g, ''));
    formData.append('rua', document.getElementById('editOccurrenceRuaModal').value.trim());
    formData.append('bairro', document.getElementById('editOccurrenceBairroModal').value.trim());
    formData.append('cidade', document.getElementById('editOccurrenceCidadeModal').value.trim());
    formData.append('estado', document.getElementById('editOccurrenceEstadoModal').value.trim());
    formData.append('referencia', document.getElementById('editOccurrenceReferenciaModal').value.trim());

    const fotoInput = document.getElementById('editOccurrenceFotoModal');
    if (fotoInput.files && fotoInput.files[0]) {
        if (fotoInput.files[0].size > 5 * 1024 * 1024) {
            showAlertMinhasOcorrencias("A nova foto selecionada é muito grande (máx 5MB).");
            return;
        }
        formData.append('foto', fotoInput.files[0]);
    }

    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';

    try {
        await axios.put(`${API_OCCURRENCES_URL}/${occurrenceId}`, formData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        showAlertMinhasOcorrencias("Ocorrência atualizada com sucesso!", "success");
        $('#editOccurrenceModal').modal('hide');
        carregarOcorrenciasDoUsuario(); 

    } catch (error) {
        console.error("Erro ao atualizar ocorrência:", error);
        showAlertMinhasOcorrencias((error.response?.data?.message) || "Erro ao atualizar ocorrência. Tente novamente.");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

window.excluirOcorrencia = async (idOcorrencia) => {
    if (!idOcorrencia) {
        showAlertMinhasOcorrencias("ID da ocorrência não fornecido para exclusão.");
        return;
    }

    if (confirm("Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.")) {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            showAlertMinhasOcorrencias("Sua sessão expirou. Por favor, faça login novamente.");
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await axios.delete(`${API_OCCURRENCES_URL}/${idOcorrencia}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            showAlertMinhasOcorrencias(response.data.message || "Ocorrência excluída com sucesso!", "success");
            carregarOcorrenciasDoUsuario();

        } catch (error) {
            console.error("Erro ao excluir ocorrência:", error);
            let mensagemErro = "Erro ao excluir ocorrência.";
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 403) {
                    mensagemErro = error.response.data.message || "Você não tem permissão para excluir esta ocorrência ou sua sessão expirou.";
                } else if (error.response.data && error.response.data.message) {
                    mensagemErro = error.response.data.message;
                }
            }
            showAlertMinhasOcorrencias(mensagemErro);
        }
    }
};