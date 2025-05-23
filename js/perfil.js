// Inicialização do Parse
Parse.initialize("Kh8rJMBCG43Lq5cpwJVGNpM4w09HELTfcskylROh", "Dcw2WhPSyOZKLfmBIEZUHZbmbhM8ObCDlnCh3Dhr");
Parse.serverURL = "https://parseapi.back4app.com/";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = Parse.User.current();

  if (!currentUser) {
    alert("Usuário não autenticado!");
    return window.location.href = "login.html";
  }

  carregarPerfil();
  carregarOcorrencias();

  // Função para obter classe CSS do status
function getStatusClass(status) {
  switch (status) {
    case "Aberto": return "danger";     // vermelho
    case "Pendente": return "warning";  // amarelo
    case "Resolvido": return "success"; // verde
    default: return "secondary";        // cinza padrão
  }
}

  // Carrega perfil do usuário
  async function carregarPerfil() {
    const user = Parse.User.current();
    if (!user) return;

    document.getElementById("userName").innerText = user.get("name") || "Nome não informado";
    document.getElementById("userEmail").innerText = user.get("email") || "Email não informado";
    document.getElementById("userPhone").innerText = user.get("contact") || "Telefone não informado";

    document.getElementById("editName").value = user.get("name") || "";
    document.getElementById("editPhone").value = user.get("contact") || "";
  }

  // Editar ocorrência
window.editarOcorrencia = async (id) => {
  console.log("ID da ocorrência:", id);
  const Ocorrencia = Parse.Object.extend("Ocorrencia");
  const query = new Parse.Query(Ocorrencia);

  try {
    const ocorrencia = await query.get(id);
    const localizacao = ocorrencia.get("localizacao") || "";

    // Extrair bairro da localização (índice 2)
    let bairro = "";
    const partes = localizacao.split(",");
    if (partes.length >= 3) {
      bairro = partes[2].trim(); // Bairro
    }

    document.getElementById("editOccurrenceTitle").value = ocorrencia.get("titulo");
    document.getElementById("editOccurrenceDescription").value = ocorrencia.get("descricao");
    document.getElementById("editOccurrenceStatus").value = ocorrencia.get("status");
    document.getElementById("editOccurrenceNeighborhood").value = bairro;
    document.getElementById("editOccurrenceId").value = ocorrencia.id;

    $('#editOccurrenceModal').modal('show');
  } catch (err) {
    console.error("Erro ao carregar ocorrência:", err.message);
    alert("Erro ao editar a ocorrência. Tente novamente.");
  }
};

// Salvar edição
document.getElementById("editOccurrenceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById('editOccurrenceId').value;
  const titulo = document.getElementById('editOccurrenceTitle').value.trim();
  const descricao = document.getElementById('editOccurrenceDescription').value.trim();
  const status = document.getElementById('editOccurrenceStatus').value;
  const bairro = document.getElementById('editOccurrenceNeighborhood').value.trim();

  if (!titulo || !descricao || !status) {
    return alert("Preencha todos os campos.");
  }

  const Ocorrencia = Parse.Object.extend("Ocorrencia");
  const query = new Parse.Query(Ocorrencia);

  try {
    const ocorrencia = await query.get(id);
    ocorrencia.set("titulo", titulo);
    ocorrencia.set("descricao", descricao);
    ocorrencia.set("status", status);

    // Atualizar apenas o bairro na localização
    const localizacaoAntiga = ocorrencia.get("localizacao") || "";
    const partes = localizacaoAntiga.split(",");
    if (partes.length >= 3) {
      partes[2] = ` ${bairro}`; // Atualiza o bairro no array
      const novaLocalizacao = partes.join(",");
      ocorrencia.set("localizacao", novaLocalizacao);
    }

    await ocorrencia.save();
    $('#editOccurrenceModal').modal('hide');
    carregarOcorrencias(); // ou loadOccurrences()
    alert("Ocorrência atualizada com sucesso.");
  } catch (err) {
    console.error("Erro ao atualizar:", err.message);
    alert("Erro ao salvar as alterações.");
  }
});


  // Excluir ocorrência
  window.excluirOcorrencia = async (id) => {
    const Ocorrencia = Parse.Object.extend("Ocorrencia");
    const query = new Parse.Query(Ocorrencia);

    try {
      const ocorrencia = await query.get(id);
      await ocorrencia.destroy();
      carregarOcorrencias();
      alert("Ocorrência excluída com sucesso.");
    } catch (err) {
      console.error("Erro ao excluir:", err.message);
      alert("Erro ao excluir ocorrência.");
    }
  };

  // Carregar ocorrências
  async function carregarOcorrencias() {
    const tabela = document.getElementById("occurrenceTable");
    tabela.innerHTML = "";

    const Ocorrencia = Parse.Object.extend("Ocorrencia");
    const query = new Parse.Query(Ocorrencia);
    query.equalTo("usuario", currentUser);
    query.descending("createdAt");

    try {
      const resultados = await query.find();

      if (resultados.length === 0) {
        tabela.innerHTML = "<tr><td colspan='6'>Nenhuma ocorrência encontrada.</td></tr>";
        return;
      }

      resultados.forEach(ocorrencia => {
        const titulo = ocorrencia.get("titulo") || "Sem título";
        const descricao = ocorrencia.get("descricao") || "Sem descrição";
        const localizacao = ocorrencia.get("localizacao") || "Localização não informada";
        const bairro = localizacao.split(",").slice(-2, -1)[0] || "Bairro não informado";
        const status = ocorrencia.get("status") || "Aberto";
        const data = new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR");

        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${titulo}</td>
          <td>${descricao}</td>
          <td>${bairro}</td>
          <td><span class="badge badge-${getStatusClass(status)}">${status}</span></td>
          <td>${data}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editarOcorrencia('${ocorrencia.id}')">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="excluirOcorrencia('${ocorrencia.id}')">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </td>
        `;
        tabela.appendChild(linha);
      });
    } catch (err) {
      console.error("Erro ao carregar ocorrências:", err.message);
      alert("Erro ao carregar as ocorrências.");
    }
  }

  // Nova ocorrência
  // Nova ocorrência
document.getElementById("newOccurrenceForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const titulo = document.getElementById('title').value.trim();
  const descricao = document.getElementById('description').value.trim();
  const tipo = document.getElementById('type').value;
  const cep = document.getElementById('cep').value.trim();
  const rua = document.getElementById('rua').value.trim();
  const bairro = document.getElementById('bairro').value.trim();
  const cidade = document.getElementById('cidade').value.trim();
  const estado = document.getElementById('estado').value.trim();
  const fileInput = document.getElementById('foto');

  if (!titulo || !descricao || !tipo || !cep || !rua || !bairro || !cidade || !estado || !fileInput.files.length) {
    return alert("Preencha todos os campos corretamente.");
  }

  const localizacao = `CEP: ${cep}, ${rua}, ${bairro}, ${cidade} - ${estado}`;
  const file = fileInput.files[0];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const parseFile = new Parse.File(safeName, file);

  const Ocorrencia = Parse.Object.extend("Ocorrencia");
  const nova = new Ocorrencia();

  // Recuperar o nome do usuário
  const nomeUsuario = currentUser.get("name") || "Usuário desconhecido";

  nova.set("titulo", titulo);
  nova.set("descricao", descricao);
  nova.set("type", tipo);
  nova.set("localizacao", localizacao);
  nova.set("status", "Aberto");
  nova.set("usuario", currentUser);
  nova.set("nomeUsuario", nomeUsuario); // Adiciona o nome do usuário
  nova.set("foto", parseFile);

  try {
    await parseFile.save();
    await nova.save();
    this.reset();
    $('#newOccurrenceModal').modal('hide');
    carregarOcorrencias();
    alert("Ocorrência cadastrada com sucesso.");
  } catch (err) {
    console.error("Erro ao salvar nova ocorrência:", err.message);
    alert("Erro ao salvar. Tente novamente.");
  }
});


  // Auto preencher endereço via CEP
  document.getElementById("cep").addEventListener("blur", async function () {
    const cep = this.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      return alert("CEP inválido. Deve conter 8 dígitos.");
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        return alert("CEP não encontrado.");
      }

      document.getElementById("rua").value = data.logradouro || "";
      document.getElementById("bairro").value = data.bairro || "";
      document.getElementById("cidade").value = data.localidade || "";
      document.getElementById("estado").value = data.uf || "";
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      alert("Erro ao buscar endereço.");
    }
  });

  // Atualizar perfil
  document.querySelector('#editProfileModal form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById("editName").value.trim();
    const telefone = document.getElementById("editPhone").value.trim();

    if (!nome || !telefone) {
      return alert("Preencha todos os campos.");
    }

    const user = Parse.User.current();
    user.set("name", nome);
    user.set("contact", telefone);

    try {
      await user.save();
      $('#editProfileModal').modal('hide');
      carregarPerfil();
      alert("Perfil atualizado com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err.message);
      alert("Erro ao atualizar o perfil.");
    }
  });
});
