// Inicializar o Parse 
Parse.initialize("Kh8rJMBCG43Lq5cpwJVGNpM4w09HELTfcskylROh", "Dcw2WhPSyOZKLfmBIEZUHZbmbhM8ObCDlnCh3Dhr");
Parse.serverURL = "https://parseapi.back4app.com/";

// Formatar data para padrão brasileiro
function formatDate(date) {
  const opcoes = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleDateString('pt-BR', opcoes);
}

document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");

  const urlParams = new URLSearchParams(window.location.search);
  const occurrenceId = urlParams.get("id");

  if (!occurrenceId) {
    loading.classList.add("d-none");
    errorMessage.classList.remove("d-none");
    errorMessage.textContent = "ID da ocorrência não foi informado na URL.";
    return;
  }

  try {
    const Ocorrencia = Parse.Object.extend("Ocorrencia");
    const query = new Parse.Query(Ocorrencia);

    const ocorrencia = await query.get(occurrenceId);

    document.getElementById("occurrenceTitle").textContent = ocorrencia.get("titulo");
    document.getElementById("occurrenceDescription").textContent = ocorrencia.get("descricao");

    const status = ocorrencia.get("status") || "Pendente";
    const exibirStatus = status === "Aberto" ? "🔴 Aberto" : 
                         status === "Em andamento" ? "🟡 Em andamento" :
                         status === "Resolvido" ? "🟢 Resolvido" : "⚪ Pendente";
    document.getElementById("occurrenceStatus").textContent = exibirStatus;

    document.getElementById("occurrenceType").textContent = ocorrencia.get("type");

    const region = ocorrencia.get("localizacao");
    document.getElementById("occurrenceRegion").textContent = region;

    const nomeUsuario = ocorrencia.get("nomeUsuario") || "Desconhecido";
    document.getElementById("occurrenceUser").textContent = nomeUsuario;

    document.getElementById("occurrenceDate").textContent = formatDate(ocorrencia.createdAt);

    const foto = ocorrencia.get("foto");
    if (foto) {
      document.getElementById("occurrenceImage").src = foto.url();
    }

    // Mostrar link do mapa se houver localização
    if (region) {
      const mapLink = document.getElementById("mapLink");
      const query = encodeURIComponent(region + ", CE");
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
      mapLink.classList.remove("d-none");
    }

  } catch (error) {
    console.error("Erro ao buscar dados da ocorrência:", error.message);
    errorMessage.classList.remove("d-none");
    errorMessage.textContent = "Erro ao carregar os dados da ocorrência.";
  } finally {
    loading.classList.add("d-none");
  }
});
