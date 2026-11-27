const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const prisma = require("./lib/prisma");
const bcrypt = require("bcryptjs");
const session = require("express-session");

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
// Configuração da Sessão de Usuário
app.use(
  session({
    secret: "helpdesk-secret-key-super-segura-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // Sessão válida por 8 horas
  }),
);

// Disponibiliza o usuário logado para todas as telas (views/EJS)
app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  next();
});

// ==========================================
// ROTAS DO SISTEMA
// ==========================================

// ==========================================
// AUTENTICAÇÃO: TELA DE LOGIN (GET)
// ==========================================
app.get("/", (req, res) => {
  // Se já estiver logado, redireciona direto para o Dashboard
  if (req.session.usuario) {
    return res.redirect("/dashboard");
  }

  const erro = req.query.erro || null;
  res.render("login", { layout: false, title: "Login - Help Desk", erro });
});

// ==========================================
// AUTENTICAÇÃO: PROCESSAR LOGIN (POST)
// ==========================================
app.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.redirect("/?erro=Preencha todos os campos.");
    }

    const emailFormatado = usuario.trim().toLowerCase();

    // 1. Busca o usuário no banco pelo e-mail
    const user = await prisma.usuario.findUnique({
      where: { email: emailFormatado },
      include: { perfil: true },
    });

    if (!user || !user.ativo) {
      return res.redirect("/?erro=Usuário ou senha inválidos.");
    }

    // 2. Compara a senha digitada com o hash criptografado no banco
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.redirect("/?erro=Usuário ou senha inválidos.");
    }

    // 3. Salva os dados do usuário na sessão ativa
    req.session.usuario = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      perfil: user.perfil.nome, // 'ADMIN', 'TECNICO' ou 'SOLICITANTE'
    };

    console.log(`🔑 Login bem-sucedido: ${user.nome} (${user.email})`);
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Erro no processamento do login:", error);
    res.redirect("/?erro=Erro interno ao tentar fazer login.");
  }
});

// ==========================================
// AUTENTICAÇÃO: SAIR DO SISTEMA (LOGOUT)
// ==========================================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Dashboard
app.get("/dashboard", async (req, res) => {
  try {
    // 1. Contagens de KPIs por status
    const totalChamados = await prisma.chamado.count();
    const chamadosAbertos = await prisma.chamado.count({
      where: { status: "ABERTO" },
    });
    const chamadosEmAndamento = await prisma.chamado.count({
      where: { status: "EM_ANDAMENTO" },
    });
    const chamadosAguardando = await prisma.chamado.count({
      where: { status: "AGUARDANDO" },
    });
    const chamadosResolvidos = await prisma.chamado.count({
      where: { status: "RESOLVIDO" },
    });
    // 2. Chamados agrupados por Categoria
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      include: {
        _count: {
          select: { chamados: true },
        },
      },
      orderBy: { nome: "asc" },
    });
    // 3. Últimos 5 chamados recentes
    const chamadosRecentes = await prisma.chamado.findMany({
      take: 5,
      orderBy: { criadoEm: "desc" },
      include: {
        solicitante: true,
        fila: true,
        categoria: true,
      },
    });
    // 4. Data e hora formatadas para a saudação
    const agora = new Date();
    const opcoesData = { day: "numeric", month: "long", year: "numeric" };
    const dataExtenso = agora.toLocaleDateString("pt-BR", opcoesData);
    const diaSemana = agora.toLocaleDateString("pt-BR", { weekday: "long" });
    const diaCapitalizado =
      diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const horaFormatada = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dataHoraExtenso = `${diaCapitalizado}, ${horaFormatada}`;
    res.render("dashboard", {
      title: "Dashboard",
      paginaAtiva: "dashboard",
      caminho: ["Dashboard"],
      kpis: {
        total: totalChamados,
        abertos: chamadosAbertos,
        emAndamento: chamadosEmAndamento,
        aguardando: chamadosAguardando,
        resolvidos: chamadosResolvidos,
      },
      categorias,
      chamadosRecentes,
      dataExtenso,
      dataHoraExtenso,
    });
  } catch (error) {
    console.error("Erro ao carregar Dashboard:", error);
    res.status(500).send("Erro interno ao carregar o Dashboard.");
  }
});

// Listagem de Chamados
app.get("/chamados", async (req, res) => {
  try {
    const chamados = await prisma.chamado.findMany({
      include: {
        solicitante: true,
        tecnico: true,
        fila: true,
        categoria: true,
      },
      orderBy: { criadoEm: "desc" },
    });
    const filas = await prisma.fila.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
    res.render("chamados", {
      title: "Chamados",
      paginaAtiva: "chamados",
      caminho: ["Chamados", "Todos os Chamados"],
      chamados,
      filas,
      categorias,
    });
  } catch (error) {
    console.error("Erro ao listar chamados:", error);
    res.status(500).send("Erro interno ao carregar chamados.");
  }
});

// Novo Chamado
// ==========================================
// ROTA 1: EXIBE A TELA DE NOVO CHAMADO (GET)
// ==========================================
app.get("/novo-chamado", async (req, res) => {
  try {
    const filas = await prisma.fila.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    res.render("novo-chamado", {
      title: "Novo Chamado",
      paginaAtiva: "novo-chamado",
      filas,
      categorias,
    });
  } catch (error) {
    console.error("Erro ao carregar dados para novo chamado:", error);
    res.status(500).send("Erro interno ao carregar a página.");
  }
});

// =======================================================
// ROTA 2: RECEBE O FORMULÁRIO E SALVA NO BANCO NEON (POST)
// =======================================================
app.post("/novo-chamado", async (req, res) => {
  try {
    const { titulo, descricao, prioridade, categoriaId, filaId } = req.body;

    // Mapeia os valores do HTML ("alta", "critica", etc.) para o Enum do PostgreSQL
    const mapaPrioridade = {
      baixa: "BAIXA",
      media: "MEDIA",
      alta: "ALTA",
      critica: "CRITICA",
    };
    const prioridadeValida =
      mapaPrioridade[prioridade?.toLowerCase()] || "MEDIA";

    // 1. Busca a categoria selecionada para calcular as horas de SLA
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoriaId) },
    });

    const slaHoras = categoria ? categoria.slaHoras : 24;
    const slaVencimento = new Date(Date.now() + slaHoras * 60 * 60 * 1000);

    // 2. Conta quantos chamados já existem para gerar o código (ex: INC-1003)
    const totalChamados = await prisma.chamado.count();
    const proximoNumero = `INC-${1001 + totalChamados}`;

    // 3. Pega o usuário solicitante (Kauan Vitor ou o primeiro usuário cadastrado)
    const solicitante =
      (await prisma.usuario.findFirst({
        where: { email: "kauan.vitor@empresa.com" },
      })) || (await prisma.usuario.findFirst());

    // 4. Grava o chamado no banco PostgreSQL do Neon
    const novoChamado = await prisma.chamado.create({
      data: {
        numero: proximoNumero,
        titulo,
        descricao,
        prioridade: prioridadeValida,
        status: "ABERTO",
        categoriaId: parseInt(categoriaId),
        filaId: filaId ? parseInt(filaId) : null,
        solicitanteId: solicitante.id,
        slaVencimento,
        historicos: {
          create: {
            acao: "Chamado criado com status Aberto",
            campo: "status",
            valorNovo: "Aberto",
            usuarioId: solicitante.id,
          },
        },
      },
    });

    console.log(
      `✅ Chamado ${novoChamado.numero} gravado com sucesso no Neon!`,
    );

    // Redireciona o usuário para a página de listagem de chamados
    res.redirect("/chamados");
  } catch (error) {
    console.error("Erro ao salvar chamado no banco:", error);
    res.status(500).send("Erro interno ao salvar o chamado.");
  }
});

// Detalhes de um Chamado
app.get(["/detalhes-chamado", "/chamado/:id"], async (req, res) => {
  try {
    const idParam = req.params.id;
    let chamado = null;

    //Se passou um ID número (ex: /chamado/1 ou /chamado/3)
    if (idParam && !isNaN(idParam)) {
      chamado = await prisma.chamado.findUnique({
        where: { id: parseInt(idParam) },
        include: {
          solicitante: true,
          tecnico: true,
          fila: true,
          categoria: true,
          comentarios: {
            include: { autor: true },
            orderBy: { criadoEm: "asc" },
          },
          historicos: {
            include: { usuario: true },
            orderBy: { criadoEm: "desc" },
          },
        },
      });
    }

    //Se não encontrou por número ou acessou sem ID, pega o último chamado aberto
    if (!chamado) {
      chamado = await prisma.chamado.findFirst({
        orderBy: { criadoEm: "desc" },
        include: {
          solicitante: true,
          tecnico: true,
          fila: true,
          categoria: true,
          comentarios: {
            include: { autor: true },
            orderBy: { criadoEm: "asc" },
          },
          historicos: {
            include: { usuario: true },
            orderBy: { criadoEm: "desc" },
          },
        },
      });
    }

    if (!chamado) {
      return res.redirect("/chamados");
    }

    // Busca os técnicos e admins disponíveis para atribuição
    const tecnicos = await prisma.usuario.findMany({
      where: {
        ativo: true,
        perfil: {
          nome: { in: ["ADMIN", "TECNICO"] },
        },
      },
      include: { perfil: true },
      orderBy: { nome: "asc" },
    });

    res.render("detalhes-chamado", {
      title: `Chamado #${chamado.numero}`,
      paginaAtiva: "chamados",
      caminho: ["Chamados", `#${chamado.numero}`],
      chamado,
      tecnicos,
    });
  } catch (error) {
    console.error("Erro ao carregar detalhes do chamado:", error);
    res.status(500).send("Erro interno ao carregar detalhes do chamado.");
  }
});

// =======================================================
// ROTA: ADICIONAR COMENTÁRIO AO CHAMADO (POST)
// =======================================================
app.post("/chamado/:id/comentario", async (req, res) => {
  try {
    const chamadoId = parseInt(req.params.id);
    const { conteudo, tipoComentario } = req.body;

    if (!conteudo || !conteudo.trim()) {
      return res.redirect(`/chamado/${chamadoId}`);
    }

    // Pega o usuário logado/padrão (Kauan Vitor)
    const autor =
      (await prisma.usuario.findFirst({
        where: { email: "kauan.vitor@empresa.com" },
      })) || (await prisma.usuario.findFirst());

    const ehInterno = tipoComentario === "interno";

    // 1. Grava o comentário no banco
    await prisma.comentario.create({
      data: {
        conteudo: conteudo.trim(),
        ehInterno,
        chamadoId,
        autorId: autor.id,
      },
    });

    // 2. Grava um registro no histórico de auditoria
    await prisma.historico.create({
      data: {
        acao: ehInterno
          ? "Adicionou uma nota interna"
          : "Enviou uma resposta pública",
        campo: "comentario",
        chamadoId,
        usuarioId: autor.id,
      },
    });

    console.log(`💬 Novo comentário gravado no chamado #${chamadoId}`);
    res.redirect(`/chamado/${chamadoId}`);
  } catch (error) {
    console.error("Erro ao salvar comentário:", error);
    res.status(500).send("Erro interno ao salvar comentário.");
  }
});

// =======================================================
// ROTA: ATRIBUIR TÉCNICO AO CHAMADO (POST)
// =======================================================
app.post("/chamado/:id/atribuir", async (req, res) => {
  try {
    const chamadoId = parseInt(req.params.id);
    const { tecnicoId } = req.body;
    const novoTecnicoId = tecnicoId ? parseInt(tecnicoId) : null;

    const chamadoAtual = await prisma.chamado.findUnique({
      where: { id: chamadoId },
      include: { tecnico: true },
    });

    if (!chamadoAtual) {
      return res.redirect("/chamados");
    }

    const autor = req.session.usuario || { id: 1, nome: "Kauan Vitor" };

    let nomeNovoTecnico = "Não atribuído";
    if (novoTecnicoId) {
      const tec = await prisma.usuario.findUnique({
        where: { id: novoTecnicoId },
      });
      if (tec) nomeNovoTecnico = tec.nome;
    }

    // 1. Atualiza no banco
    await prisma.chamado.update({
      where: { id: chamadoId },
      data: { tecnicoId: novoTecnicoId },
    });

    // 2. Registra na auditoria
    await prisma.historico.create({
      data: {
        acao: novoTecnicoId
          ? `Atribuiu o chamado para o técnico ${nomeNovoTecnico}`
          : "Removeu a atribuição do chamado",
        campo: "tecnico",
        valorAntigo: chamadoAtual.tecnico
          ? chamadoAtual.tecnico.nome
          : "Não atribuído",
        valorNovo: nomeNovoTecnico,
        chamadoId,
        usuarioId: autor.id,
      },
    });

    console.log(`👤 Chamado #${chamadoId} atribuído para: ${nomeNovoTecnico}`);
    res.redirect(`/chamado/${chamadoId}`);
  } catch (error) {
    console.error("Erro ao atribuir técnico:", error);
    res.status(500).send("Erro interno ao atribuir técnico.");
  }
});

// =======================================================
// ROTA: ATUALIZAR STATUS DO CHAMADO (POST)
// =======================================================
app.post("/chamado/:id/status", async (req, res) => {
  try {
    const chamadoId = parseInt(req.params.id);
    const { novoStatus } = req.body;

    const chamadoAtual = await prisma.chamado.findUnique({
      where: { id: chamadoId },
    });

    if (!chamadoAtual) {
      return res.redirect("/chamados");
    }

    const autor = req.session.usuario || { id: 1, nome: "Kauan Vitor" };

    // Nomes amigáveis em português para a auditoria
    const nomesStatus = {
      ABERTO: "Aberto",
      EM_ANDAMENTO: "Em andamento",
      AGUARDANDO: "Aguardando",
      RESOLVIDO: "Resolvido",
      FECHADO: "Fechado",
    };

    const statusAntigoTexto =
      nomesStatus[chamadoAtual.status] || chamadoAtual.status;
    const statusNovoTexto = nomesStatus[novoStatus] || novoStatus;

    // 1. Atualiza no banco
    await prisma.chamado.update({
      where: { id: chamadoId },
      data: {
        status: novoStatus,
        resolvidoEm: novoStatus === "RESOLVIDO" ? new Date() : null,
      },
    });

    // 2. Registra na auditoria com texto limpo e profissional
    await prisma.historico.create({
      data: {
        acao: `Status alterado de ${statusAntigoTexto} para ${statusNovoTexto}`,
        campo: "status",
        valorAntigo: statusAntigoTexto,
        valorNovo: statusNovoTexto,
        chamadoId,
        usuarioId: autor.id,
      },
    });

    console.log(
      `🔄 Status do chamado #${chamadoId} alterado para: ${statusNovoTexto}`,
    );
    res.redirect(`/chamado/${chamadoId}`);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).send("Erro interno ao atualizar status.");
  }
});

// Base de Conhecimento
app.get("/base-conhecimento", async (req, res) => {
  try {
    const artigos = await prisma.artigo.findMany({
      where: { publicado: true },
      include: {
        categoria: true,
        autor: true,
      },
      orderBy: { criadoEm: "desc" },
    });
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
    res.render("base-conhecimento", {
      title: "Base de conhecimento",
      paginaAtiva: "base-conhecimento",
      caminho: ["Base de conhecimento"],
      artigos,
      categorias,
    });
  } catch (error) {
    console.error("Erro ao carregar base de conhecimento:", error);
    res.status(500).send("Erro interno ao carregar a Base de Conhecimento.");
  }
});

// ==========================================
// RELATÓRIOS E INDICADORES DE DESEMPENHO (GET)
// ==========================================
app.get("/relatorios", async (req, res) => {
  try {
    const periodo = req.query.periodo || "semana";
    const dataInicioQuery = req.query.inicio;
    const dataFimQuery = req.query.fim;

    const agora = new Date();
    let dataFiltroInicio = null;
    let dataFiltroFim = null;

    if (dataInicioQuery && dataFimQuery) {
      dataFiltroInicio = new Date(`${dataInicioQuery}T00:00:00`);
      dataFiltroFim = new Date(`${dataFimQuery}T23:59:59`);
    } else if (periodo === "hoje") {
      dataFiltroInicio = new Date(agora);
      dataFiltroInicio.setHours(0, 0, 0, 0);
      dataFiltroFim = new Date(agora);
      dataFiltroFim.setHours(23, 59, 59, 999);
    } else if (periodo === "mes") {
      dataFiltroInicio = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        1,
        0,
        0,
        0,
      );
      dataFiltroFim = new Date(
        agora.getFullYear(),
        agora.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
    } else {
      // Padrão: "semana" (últimos 7 dias)
      dataFiltroInicio = new Date(agora);
      dataFiltroInicio.setDate(dataFiltroInicio.getDate() - 7);
      dataFiltroInicio.setHours(0, 0, 0, 0);
      dataFiltroFim = new Date(agora);
      dataFiltroFim.setHours(23, 59, 59, 999);
    }

    // 1. Busca todos os chamados no intervalo selecionado
    const whereChamados = {};
    if (dataFiltroInicio && dataFiltroFim) {
      whereChamados.criadoEm = {
        gte: dataFiltroInicio,
        lte: dataFiltroFim,
      };
    }

    const chamados = await prisma.chamado.findMany({
      where: whereChamados,
      include: {
        categoria: true,
        tecnico: true,
      },
    });

    // 2. Cálculo dos KPIs Principais
    const totalChamados = chamados.length;
    const resolvidos = chamados.filter(
      (c) => c.status === "RESOLVIDO" || c.status === "FECHADO",
    );
    const totalResolvidos = resolvidos.length;

    // Tempo Médio de Resolução (TMA)
    let somaMinutosResolucao = 0;
    resolvidos.forEach((c) => {
      const fim = c.resolvidoEm
        ? new Date(c.resolvidoEm)
        : new Date(c.atualizadoEm);
      const diffMs = fim - new Date(c.criadoEm);
      somaMinutosResolucao += Math.max(0, Math.floor(diffMs / (1000 * 60)));
    });

    let tmaFormatado = "—";
    if (totalResolvidos > 0) {
      const mediaMinutos = Math.round(somaMinutosResolucao / totalResolvidos);
      const horas = Math.floor(mediaMinutos / 60);
      const minutos = mediaMinutos % 60;
      tmaFormatado = horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
    }

    // SLA Cumprido vs Violado
    let slaViolado = 0;
    let slaCumpridoQtd = 0;

    chamados.forEach((c) => {
      if (c.slaVencimento) {
        const limite = new Date(c.slaVencimento);
        if (c.status === "RESOLVIDO" || c.status === "FECHADO") {
          const momentoResolucao = c.resolvidoEm
            ? new Date(c.resolvidoEm)
            : new Date(c.atualizadoEm);
          if (momentoResolucao > limite) {
            slaViolado++;
          } else {
            slaCumpridoQtd++;
          }
        } else {
          if (agora > limite) {
            slaViolado++;
          }
        }
      }
    });

    const totalComAnaliseSla = slaCumpridoQtd + slaViolado;
    const slaPercentual =
      totalComAnaliseSla > 0
        ? Math.round((slaCumpridoQtd / totalComAnaliseSla) * 100)
        : 100;

    // 3. Distribuição por Status (para o gráfico Rosca)
    const contagemStatus = {
      ABERTO: 0,
      EM_ANDAMENTO: 0,
      AGUARDANDO: 0,
      RESOLVIDO: 0,
    };

    chamados.forEach((c) => {
      if (c.status === "FECHADO") contagemStatus.RESOLVIDO++;
      else if (contagemStatus[c.status] !== undefined)
        contagemStatus[c.status]++;
    });

    // Calcula o gradiente da rosca direto no backend (à prova de quebras no EJS)
    let gradienteRosca = "conic-gradient(#e2e8f0 0% 100%)";
    if (totalChamados > 0) {
      const pAberto = Math.round((contagemStatus.ABERTO / totalChamados) * 100);
      const pAndamento = Math.round(
        (contagemStatus.EM_ANDAMENTO / totalChamados) * 100,
      );
      const pAguardando = Math.round(
        (contagemStatus.AGUARDANDO / totalChamados) * 100,
      );

      const stop1 = pAberto;
      const stop2 = stop1 + pAndamento;
      const stop3 = stop2 + pAguardando;

      gradienteRosca = `conic-gradient(var(--cor-status-aberto) 0% ${stop1}%, var(--cor-status-em-andamento) ${stop1}% ${stop2}%, var(--cor-status-aguardando) ${stop2}% ${stop3}%, var(--cor-status-resolvido) ${stop3}% 100%)`;
    }

    // 4. Distribuição por Categoria (para o gráfico de barras)
    const todasCategorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });

    const coresBarras = [
      "var(--cor-azul-principal)",
      "var(--cor-laranja)",
      "var(--cor-verde)",
      "var(--cor-status-aberto)",
      "var(--cor-cinza-outros)",
    ];

    const contagemPorCategoria = todasCategorias.map((cat, idx) => {
      const totalCat = chamados.filter((c) => c.categoriaId === cat.id).length;
      return {
        id: cat.id,
        nome: cat.nome,
        total: totalCat,
        cor: coresBarras[idx % coresBarras.length],
        percentual:
          totalChamados > 0 ? Math.round((totalCat / totalChamados) * 100) : 0,
      };
    });

    // 5. Desempenho por Técnico
    const tecnicos = await prisma.usuario.findMany({
      where: {
        ativo: true,
        perfil: {
          nome: { in: ["ADMIN", "TECNICO"] },
        },
      },
      orderBy: { nome: "asc" },
    });

    const desempenhoTecnicos = tecnicos.map((tec) => {
      const atribuidos = chamados.filter((c) => c.tecnicoId === tec.id);
      const resTec = atribuidos.filter(
        (c) => c.status === "RESOLVIDO" || c.status === "FECHADO",
      );
      const emAberto = atribuidos.filter(
        (c) => c.status !== "RESOLVIDO" && c.status !== "FECHADO",
      );

      let somaMinTec = 0;
      resTec.forEach((c) => {
        const fim = c.resolvidoEm
          ? new Date(c.resolvidoEm)
          : new Date(c.atualizadoEm);
        somaMinTec += Math.max(
          0,
          Math.floor((fim - new Date(c.criadoEm)) / (1000 * 60)),
        );
      });

      let tmaTec = "—";
      if (resTec.length > 0) {
        const med = Math.round(somaMinTec / resTec.length);
        const h = Math.floor(med / 60);
        const m = med % 60;
        tmaTec = h > 0 ? `${h}h ${m}m` : `${m}m`;
      }

      let slaCumpridoTec = 0;
      let totalSlaTec = 0;
      atribuidos.forEach((c) => {
        if (c.slaVencimento) {
          totalSlaTec++;
          const limite = new Date(c.slaVencimento);
          const dataVerificacao =
            c.status === "RESOLVIDO" || c.status === "FECHADO"
              ? c.resolvidoEm
                ? new Date(c.resolvidoEm)
                : new Date(c.atualizadoEm)
              : agora;
          if (dataVerificacao <= limite) {
            slaCumpridoTec++;
          }
        }
      });

      const slaPercentualTec =
        totalSlaTec > 0
          ? Math.round((slaCumpridoTec / totalSlaTec) * 100)
          : 100;

      const partes = tec.nome.trim().split(/\s+/);
      const iniciais =
        partes.length === 1
          ? partes[0].substring(0, 2).toUpperCase()
          : (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();

      return {
        id: tec.id,
        nome: tec.nome,
        iniciais,
        totalAtribuidos: atribuidos.length,
        totalResolvidos: resTec.length,
        totalAberto: emAberto.length,
        tma: tmaTec,
        sla: slaPercentualTec,
      };
    });

    res.render("relatorios", {
      title: "Relatórios",
      paginaAtiva: "relatorios",
      caminho: ["Relatórios", "Desempenho"],
      periodoAtivo: periodo,
      dataInicio: dataInicioQuery || "",
      dataFim: dataFimQuery || "",
      kpis: {
        total: totalChamados,
        resolvidos: totalResolvidos,
        tma: tmaFormatado,
        sla: `${slaPercentual}%`,
        violado: slaViolado,
      },
      gradienteRosca,
      statusData: contagemStatus,
      categoriasData: contagemPorCategoria,
      tecnicosData: desempenhoTecnicos,
    });
  } catch (error) {
    console.error("Erro ao carregar relatórios:", error);
    res.status(500).send("Erro interno ao carregar relatórios.");
  }
});

// ==========================================
// PAINEL DE ADMINISTRAÇÃO (GET - CARREGA A TELA)
// ==========================================
app.get("/administracao", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        perfil: true,
        filas: { include: { fila: true } },
      },
      orderBy: { nome: "asc" },
    });

    const filas = await prisma.fila.findMany({
      include: {
        usuarios: { include: { usuario: true } },
        _count: { select: { chamados: true, usuarios: true } },
      },
      orderBy: { nome: "asc" },
    });

    const categorias = await prisma.categoria.findMany({
      include: {
        _count: { select: { chamados: true } },
      },
      orderBy: { nome: "asc" },
    });

    const perfis = await prisma.perfil.findMany({
      orderBy: { nome: "asc" },
    });

    res.render("administracao", {
      title: "Administração",
      paginaAtiva: "administracao",
      caminho: ["Administração"],
      usuarios,
      filas,
      categorias,
      perfis,
    });
  } catch (error) {
    console.error("Erro ao carregar administração:", error);
    res.status(500).send("Erro interno ao carregar painel de administração.");
  }
});

// =======================================================
// CADASTRAR NOVO USUÁRIO PELO MODAL (POST - SALVA NO BANCO)
// =======================================================
app.post("/administracao/usuarios", async (req, res) => {
  try {
    const { nome, email, perfilNome, cargo } = req.body;

    if (!nome || !email) {
      console.warn("⚠️ Nome ou e-mail não preenchidos.");
      return res.redirect("/administracao");
    }

    const emailFormatado = email.trim().toLowerCase();

    // 1. Verifica se o e-mail já existe no banco
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailFormatado },
    });

    if (usuarioExistente) {
      console.warn(
        `⚠️ O e-mail ${emailFormatado} já está cadastrado no sistema!`,
      );
      return res.redirect("/administracao");
    }

    // 2. Busca o perfil correspondente (ADMIN, TECNICO ou SOLICITANTE)
    let perfil = null;
    if (perfilNome) {
      perfil = await prisma.perfil.findUnique({
        where: { nome: perfilNome.toUpperCase() },
      });
    }

    if (!perfil) {
      perfil = await prisma.perfil.findFirst({
        where: { nome: "SOLICITANTE" },
      });
    }

    // 3. Gera a senha criptografada padrão inicial (123456)
    const senhaHash = await bcrypt.hash("123456", 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailFormatado,
        senha: senhaHash,
        cargo: cargo ? cargo.trim() : null,
        perfilId: perfil.id,
      },
    });

    console.log(
      `Usuário ${novoUsuario.nome} (${novoUsuario.email}) cadastrado com sucesso no Neon!`,
    );
    res.redirect("/administracao");
  } catch (error) {
    console.error("Erro detalhado ao cadastrar usuário:", error);
    res.redirect("/administracao");
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor HelpDesk rodando em http://localhost:${PORT}`);
});
