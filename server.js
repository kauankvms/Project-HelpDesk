const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuração do EJS e do Layout Mestre
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout"); //Usa views/layout.ejs por padrão

// Disponibiliza arquivos estáticos (CSS, JS, Imagens da pasta public)
app.use(express.static(path.join(__dirname, "public")));

// Para receber dados enviados por formulários (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// ROTAS DO SISTEMA
// ==========================================

// Rota de Login (sem a topbar e sidebar padrão)
app.get("/", (req, res) => {
  res.render("login", { layout: false, title: "Login - Help Desk" });
});

// Dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    paginaAtiva: "dashboard",
    caminho: ["Dashboard"],
  });
});

// Listagem de Chamados
app.get("/chamados", (req, res) => {
  res.render("chamados", {
    title: "Chamados",
    paginaAtiva: "chamados",
    caminho: ["Chamados", "Todos os Chamados"],
  });
});

// Novo Chamado
app.get("/novo-chamado", (req, res) => {
  res.render("novo-chamado", {
    title: "Novo Chamado",
    paginaAtiva: "chamados",
    caminho: ["Chamados", "Novo Chamado"],
  });
});

// Detalhes de um Chamado
app.get(["/detalhes-chamado", "/chamado/:id"], (req, res) => {
  const idChamado = req.params.id || "HD-2567"; // Exemplo de ID de chamado
  res.render("detalhes-chamado", {
    title: `Detalhes do chamado #${idChamado}`,
    paginaAtiva: "chamados",
    caminho: ["Chamados", `#${idChamado}`],
  });
});

// Base de Conhecimento
app.get("/base-conhecimento", (req, res) => {
  res.render("base-conhecimento", {
    title: "Base de conhecimento",
    paginaAtiva: "base-conhecimento",
    caminho: ["Base de conhecimento"],
  });
});

// Relatórios
app.get("/relatorios", (req, res) => {
  res.render("relatorios", {
    title: "Relatórios",
    paginaAtiva: "relatorios",
    caminho: ["Relatórios", "Desempenho"],
  });
});

// Administração
app.get("/administracao", (req, res) => {
  res.render("administracao", {
    title: "Administração",
    paginaAtiva: "administracao",
    caminho: ["Administração"],
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor HelpDesk rodando em http://localhost:${PORT}`);
});
