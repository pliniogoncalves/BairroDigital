// Inicialização do Parse
Parse.initialize("Kh8rJMBCG43Lq5cpwJVGNpM4w09HELTfcskylROh", "Dcw2WhPSyOZKLfmBIEZUHZbmbhM8ObCDlnCh3Dhr");
Parse.serverURL = "https://parseapi.back4app.com/";

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = Parse.User.current();

  // Elementos da interface
  const btnCadastro = document.getElementById("btnCadastro");
  const btnNavbarPublicar = document.getElementById("btnNavbarPublicar");
  const btnLogout = document.getElementById("btnLogout");

  configurarVisibilidadeBotoes(currentUser, btnCadastro, btnNavbarPublicar, btnLogout);

  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await Parse.User.logOut();
        window.location.href = "login.html";
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        showError("Erro ao fazer logout. Tente novamente.");
      }
    });
  }

  // Filtros
  const filterCategory = document.getElementById("filterCategory");
  const filterType = document.getElementById("filterType");

  if (filterCategory) filterCategory.addEventListener("change", loadOccurrences);
  if (filterType) filterType.addEventListener("change", loadOccurrences);

  await loadOccurrences();
});

// Controla visibilidade dos botões conforme autenticação
function configurarVisibilidadeBotoes(user, btnCadastro, btnNavbarPublicar, btnLogout) {
  const isLoggedIn = !!user;

  if (btnCadastro) btnCadastro.classList.toggle("d-none", isLoggedIn);
  if (btnNavbarPublicar) btnNavbarPublicar.classList.toggle("d-none", !isLoggedIn);
  if (btnLogout) btnLogout.classList.toggle("d-none", !isLoggedIn);
}

// Carrega a lista de ocorrências do Parse
async function loadOccurrences() {
  const serviceList = document.getElementById("serviceList");
  if (!serviceList) {
    console.error("Elemento 'serviceList' não encontrado no DOM.");
    return;
  }

  serviceList.innerHTML = "";

  const filterCategory = document.getElementById("filterCategory")?.value || null;
  const filterType = document.getElementById("filterType")?.value || null;

  const Ocorrencia = Parse.Object.extend("Ocorrencia");
  const query = new Parse.Query(Ocorrencia);

  if (filterCategory) query.equalTo("status", filterCategory);
  if (filterType) query.equalTo("type", filterType); // Se seu campo no Parse for "tipo", substitua "type" por "tipo"

  query.descending("createdAt");

  try {
    const results = await query.find();

    if (results.length === 0) {
      serviceList.innerHTML = `
        <div class="col-12">
          <p class="text-center text-muted">Nenhuma ocorrência encontrada com os filtros selecionados.</p>
        </div>`;
      return;
    }

    const cards = results.map(ocorrencia => criarCardOcorrencia(ocorrencia));
    serviceList.innerHTML = cards.join("");

  } catch (error) {
    console.error("Erro ao carregar ocorrências:", error);
    showError("Erro ao carregar ocorrências. Tente novamente mais tarde.");
  }
}

// Cria card de uma ocorrência
function criarCardOcorrencia(ocorrencia) {
  const titulo = ocorrencia.get("titulo") || "Sem título";
  const localizacaoCompleta = ocorrencia.get("localizacao") || "Local não informado";
  const status = ocorrencia.get("status") || "Não informado";
  const tipo = ocorrencia.get("type") || "Outro";
  const data = new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR");
  const imagem = ocorrencia.get("foto")?.url() || "https://via.placeholder.com/600x400?text=Sem+Imagem";
  const nomeUsuario = ocorrencia.get("nomeUsuario") || "Usuário desconhecido";

  // Extrair rua e bairro (assume que a localização tem pelo menos três partes separadas por vírgula)
  let ruaEBairro = localizacaoCompleta;
  const partes = localizacaoCompleta.split(",");
  if (partes.length >= 3) {
    ruaEBairro = `${partes[1].trim()}, ${partes[2].trim()}`;
  }

  const statusIcon = {
    "Aberto": "🔴",
    "Em andamento": "🟡",
    "Resolvido": "🟢"
  }[status] || "⚪";

  const googleMapsLink = `https://www.google.com/maps?q=${encodeURIComponent(localizacaoCompleta)}`;

  return `
    <div class="col-md-4 mb-4">
      <div class="card h-100 shadow-sm">
        <img src="${imagem}" class="card-img-top" alt="Imagem da ocorrência: ${titulo}"
             style="height: 300px; object-fit: cover;" onerror="this.onerror=null;this.src='img/sem-imagem.jpg';" />
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title">🚧 ${titulo}</h5>
            <p class="card-text">📍 <a href="${googleMapsLink}" target="_blank">${ruaEBairro}</a></p>
            <hr>
            <p class="card-text mb-1">${statusIcon} <strong>Status:</strong> ${status}</p>
            <p class="card-text">📅 <strong>Reportado em:</strong> ${data}</p>
            <hr>
            <p class="card-text mb-1"><strong>🧑‍🔧 Responsável:</strong> ${nomeUsuario}</p>
          </div>
          <div class="mt-3 text-center">
            <a href="detalhes.html?id=${ocorrencia.id}" class="btn btn-primary btn-sm">Ver Detalhes</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Exibe erro genérico
function showError(message) {
  alert(message); // Sugestão: substituir por biblioteca como Toastr para UX aprimorada
}
