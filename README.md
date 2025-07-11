# Bairro Digital

Projeto desenvolvido para a disciplina Projeto Aplicado Multiplataforma - Etapa 2 da Universidade de Fortaleza (UNIFOR). A aplicação consiste em uma plataforma com frontend responsivo e backend em arquitetura de microsserviços, voltada para o registro e acompanhamento de ocorrências em comunidades locais.

## 🌱 Objetivo de Desenvolvimento Sustentável (ODS)
Este projeto busca contribuir com os ODS 9 (Indústria, Inovação e Infraestrutura) e 11 (Cidades e Comunidades Sustentáveis), promovendo uma ferramenta para engajamento cívico e melhoria da infraestrutura local.

---

## 🚀 Visão Geral da Arquitetura

A solução é composta por:
* **Frontend:** Uma aplicação web construída com HTML, CSS e JavaScript puro, utilizando Bootstrap para responsividade e Axios para requisições HTTP.
* **Backend:** Implementado com uma arquitetura de microsserviços:
    * **Serviço de Autenticação (`auth-service`):** Responsável pelo registro, login, atualização de perfil e gerenciamento de tokens JWT dos usuários. Construído com Node.js e Express.js.
    * **Serviço de Ocorrências (`occurrences-service`):** Responsável pelo CRUD (Criar, Ler, Atualizar, Deletar) das ocorrências, incluindo upload de imagens (usando Multer). Construído com Node.js e Express.js.

Ambos os serviços utilizam MongoDB (conectado via MongoDB Atlas) como banco de dados.

---

## 📁 Estrutura do Projeto

```
BairroDigital/
├── frontend/                 # Código da interface do usuário (HTML, CSS, JS)
│   ├── css/                  # Estilos CSS
│   ├── img/                  # Imagens estáticas do frontend (ex: logo, placeholder)
│   ├── js/                   # Scripts JavaScript do frontend
│   │   ├── login.js
│   │   ├── pagInicial.js
│   │   ├── perfil.js
│   │   ├── nova-ocorrencia.js
│   │   ├── minhas-ocorrencias.js
│   │   └── detalhes.js
│   ├── login.html
│   ├── pagInicial.html
│   ├── perfil.html
│   ├── nova-ocorrencia.html
│   ├── minhas-ocorrencias.html
│   └── detalhes.html
├── services/                 # Microsserviços do backend
│   ├── auth-service/         # Serviço de Autenticação
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── server.js
│   │   ├── .env.example      # Exemplo de variáveis de ambiente
│   │   ├── .gitignore
│   │   └── package.json
│   └── occurrences-service/  # Serviço de Ocorrências
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   └── server.js
│       ├── uploads/          # Pasta para imagens das ocorrências (localmente)
│       ├── .env.example      # Exemplo de variáveis de ambiente
│       ├── .gitignore
│       └── package.json
└── README.md                 # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* HTML5
* CSS3
* Bootstrap 4.5.2
* JavaScript (ES6+)
* Axios (para requisições HTTP)

### Backend (Microsserviços)
* Node.js (v20.x ou superior)
* Express.js
* MongoDB (conectado via MongoDB Atlas)
* JSON Web Tokens (JWT) para autenticação e autorização
* Bcrypt.js (para hashing de senhas)
* Multer (para upload de arquivos/imagens no `occurrences-service`)
* CORS (Cross-Origin Resource Sharing)
* Dotenv (para gerenciamento de variáveis de ambiente)

### Ferramentas de Desenvolvimento
* Nodemon (para auto-reload do backend durante o desenvolvimento)
* Postman (para testes de API)
* Git & GitHub (para controle de versão e repositório público)
* Visual Studio Code (ou editor de preferência)

---

## 🚀 Como Rodar o Projeto Localmente

### ✅ Pré-requisitos
* Node.js e npm instalados (recomenda-se Node.js v20 ou superior).
* Uma conta no MongoDB Atlas e uma string de conexão válida.
* Git instalado (para clonar o repositório).

### ⚙️ Configuração Backend

Para cada microsserviço (`auth-service` e `occurrences-service`), siga os passos abaixo:

1.  **Clone o repositório (se ainda não o fez):**
    ```bash
    git clone [https://github.com/pliniogoncalves/BairroDigital](https://github.com/pliniogoncalves/BairroDigital.git)
    cd BairroDigital 
    ```

2.  **Navegue até a pasta do serviço:**
    Exemplo para `auth-service`:
    ```bash
    cd services/auth-service
    ```
    (Repita para `occurrences-service`)

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    * Na raiz da pasta de cada serviço (ex: `services/auth-service/`), crie um arquivo chamado `.env`.
    * Copie o conteúdo do arquivo `.env.example` correspondente para o seu novo arquivo `.env`. 
    * Preencha as variáveis no `.env` com seus valores:
        * `MONGODB_URI`: Sua string de conexão completa do MongoDB Atlas.
        * `JWT_SECRET`: Uma string secreta, longa e aleatória. **Importante: Deve ser a mesma para ambos os serviços.**
        * `PORT`: A porta (ex: `3001` para `auth-service`, `3002` para `occurrences-service`).

5.  **Inicie o Serviço em Modo de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    * `auth-service`: http://localhost:3001
    * `occurrences-service`: http://localhost:3002

### 🌐 Configuração e Uso do Frontend

1.  A pasta `frontend/` contém os arquivos da interface do usuário (HTML, CSS, JS).
2.  Para rodar o frontend localmente:
    * **Opção 1:** Abrir o arquivo `frontend/login.html` diretamente no seu navegador.
    * **Opção 2 (Recomendada para desenvolvimento):** Utilizar uma extensão como "Live Server" no Visual Studio Code, que recarrega automaticamente a página ao salvar alterações.

3.  **Conexão com o Backend:**
    * **Localmente:** Por padrão, os arquivos JavaScript do frontend (`pagInicial.js`, `login.js`, etc.) estão configurados para fazer requisições aos serviços de backend rodando localmente (`http://localhost:3001` para autenticação e `http://localhost:3002` para ocorrências). Certifique-se de que ambos os serviços de backend estejam em execução.
    * **Produção (Render/Vercel):** As URLs nos arquivos JavaScript do frontend foram ajustadas para apontar para os serviços hospedados:
        * Serviço de Autenticação: `https://bairro-digital-auth.onrender.com/auth`
        * Serviço de Ocorrências: `https://bairro-digital-occurrences.onrender.com/occurrences`
        Se precisar alterar essas URLs, modifique as constantes `API_BASE_URL` (ou `API_AUTH_URL`) e `API_OCCURRENCES_URL` (ou `OCCURRENCES_SERVICE_BASE_URL`) nos respectivos arquivos `.js`.

---

## 🧪 Testes de API com Postman

1. Importe a coleção: `[postman_collection.json]`
2. Configure as variáveis no Postman.
3. Teste registro, login, criação de ocorrências, etc.

---

## ☁️ Hospedagem (Deploy)

* **Frontend:**
    * Hospedado na Vercel.
    * As URLs da API nos arquivos JavaScript já foram atualizadas para apontar para os serviços de backend no Render (ver seção anterior).
    * O arquivo `vercel.json` está configurado para reescrever a rota raiz (`/`) para `login.html`.

* **Backend (Microsserviços):**
    * Os serviços de Autenticação e Ocorrências estão hospedados no Render.
    * **Upload de imagens:** O `occurrences-service` foi atualizado para usar **GridFS** com o MongoDB Atlas para armazenamento de imagens, eliminando a necessidade de armazenamento em disco local no servidor de produção ou soluções de terceiros como AWS S3 para este escopo. As imagens são servidas através da rota `/occurrences/image/:fileId`.

---

## 📄 Licença
Este projeto está licenciado sob a Licença MIT.

---

## 📣 Apresentação à Comunidade
A aplicação será apresentada à comunidade conforme os requisitos da disciplina.

---

## 👨‍💻 Contato
Para dúvidas, sugestões ou contribuições, por favor, abra uma *issue* neste repositório GitHub ou entre em contato com [Plinio Gonçalves/pliniogoncalves@edu.unifor.br].
