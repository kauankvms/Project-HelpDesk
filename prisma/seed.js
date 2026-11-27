const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Criar Perfis
  const perfilAdmin = await prisma.perfil.upsert({
    where: { nome: "ADMIN" },
    update: {},
    create: {
      nome: "ADMIN",
      descricao:
        "Acesso total a todas as configurações e relatórios do sistema",
    },
  });

  const perfilTecnico = await prisma.perfil.upsert({
    where: { nome: "TECNICO" },
    update: {},
    create: {
      nome: "TECNICO",
      descricao: "Atende, transfere e resolve chamados",
    },
  });

  const perfilSolicitante = await prisma.perfil.upsert({
    where: { nome: "SOLICITANTE" },
    update: {},
    create: {
      nome: "SOLICITANTE",
      descricao: "Abre e acompanha seus próprios chamados",
    },
  });

  console.log("✅ Perfis criados com sucesso.");

  // 2. Criar Filas
  const filaN1 = await prisma.fila.upsert({
    where: { nome: "Suporte N1" },
    update: {},
    create: {
      nome: "Suporte N1",
      descricao: "Triagem inicial, dúvidas e suporte rápido",
    },
  });

  const filaInfra = await prisma.fila.upsert({
    where: { nome: "Infraestrutura" },
    update: {},
    create: {
      nome: "Infraestrutura",
      descricao: "Servidores, redes e hardware crítico",
    },
  });

  const filaSistemas = await prisma.fila.upsert({
    where: { nome: "Sistemas" },
    update: {},
    create: {
      nome: "Sistemas",
      descricao: "ERP, banco de dados e softwares internos",
    },
  });

  console.log("✅ Filas criadas com sucesso.");

  // 3. Criar Categorias
  const catHardware = await prisma.categoria.upsert({
    where: { nome: "Hardware" },
    update: {},
    create: {
      nome: "Hardware",
      slaHoras: 8,
      descricao: "Computadores, monitores, periféricos",
    },
  });

  const catSoftware = await prisma.categoria.upsert({
    where: { nome: "Software" },
    update: {},
    create: {
      nome: "Software",
      slaHoras: 12,
      descricao: "Instalação de programas e licenças",
    },
  });

  const catAcessos = await prisma.categoria.upsert({
    where: { nome: "Acessos" },
    update: {},
    create: {
      nome: "Acessos",
      slaHoras: 4,
      descricao: "Criação de e-mails, permissões e senhas",
    },
  });

  const catRedes = await prisma.categoria.upsert({
    where: { nome: "Redes" },
    update: {},
    create: {
      nome: "Redes",
      slaHoras: 6,
      descricao: "VPN, Wi-Fi e conectividade",
    },
  });

  console.log("✅ Categorias criadas com sucesso.");

  // 4. Criar Usuários Oficiais
  const senhaHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "kauan.vitor@empresa.com" },
    update: {},
    create: {
      nome: "Kauan Vitor",
      email: "kauan.vitor@empresa.com",
      senha: senhaHash,
      cargo: "Administrador",
      perfilId: perfilAdmin.id,
    },
  });

  const tecnico = await prisma.usuario.upsert({
    where: { email: "carlos.silva@empresa.com" },
    update: {},
    create: {
      nome: "Carlos Silva",
      email: "carlos.silva@empresa.com",
      senha: senhaHash,
      cargo: "Técnico",
      perfilId: perfilTecnico.id,
      filas: {
        create: [{ filaId: filaN1.id }, { filaId: filaInfra.id }],
      },
    },
  });

  const solicitante = await prisma.usuario.upsert({
    where: { email: "ana.souza@empresa.com" },
    update: {},
    create: {
      nome: "Ana Souza",
      email: "ana.souza@empresa.com",
      senha: senhaHash,
      cargo: "Solicitante",
      perfilId: perfilSolicitante.id,
    },
  });

  console.log("✅ Usuários criados com sucesso.");

  // 5. Criar Chamados de Teste (com os status oficiais da modelagem)
  await prisma.chamado.upsert({
    where: { numero: "INC-1001" },
    update: {},
    create: {
      numero: "INC-1001",
      titulo: "Falha de conexão com a impressora do 2º andar",
      descricao: "A impressora do setor financeiro parou de responder na rede.",
      prioridade: "ALTA",
      status: "EM_ANDAMENTO", // Status oficial da modelagem
      solicitanteId: solicitante.id,
      tecnicoId: tecnico.id,
      filaId: filaN1.id,
      categoriaId: catHardware.id,
      slaVencimento: new Date(Date.now() + 4 * 60 * 60 * 1000),
      comentarios: {
        create: [
          {
            conteudo:
              "Verifiquei o IP da impressora e ela perdeu a reserva no DHCP. Reiniciando o switch de mesa.",
            ehInterno: true,
            autorId: tecnico.id,
          },
        ],
      },
      historicos: {
        create: [
          {
            acao: "Status alterado de Aberto para Em andamento",
            campo: "status",
            valorAntigo: "Aberto",
            valorNovo: "Em andamento",
            usuarioId: admin.id,
          },
        ],
      },
    },
  });

  await prisma.chamado.upsert({
    where: { numero: "INC-1002" },
    update: {},
    create: {
      numero: "INC-1002",
      titulo: "Solicitação de acesso à pasta da Diretoria",
      descricao:
        "Preciso de liberação de leitura na pasta compartilhada de contratos.",
      prioridade: "MEDIA",
      status: "ABERTO", // Status oficial da modelagem
      solicitanteId: solicitante.id,
      filaId: filaN1.id,
      categoriaId: catAcessos.id,
      slaVencimento: new Date(Date.now() + 8 * 60 * 60 * 1000),
      historicos: {
        create: [
          {
            acao: "Chamado criado com status Aberto",
            campo: "status",
            valorNovo: "Aberto",
            usuarioId: solicitante.id,
          },
        ],
      },
    },
  });

  console.log("✅ Chamados de teste criados com sucesso.");
  console.log("🚀 Seed concluído com sucesso!");

  // 6. Criar Artigos da Base de Conhecimento
  const artigosIniciais = [
    {
      titulo: "Como instalar o pacote Office 365",
      conteudo:
        "Passo a passo para instalação do Office 365 em máquinas corporativas com licença ativa no portal da Microsoft.",
      categoriaId: catSoftware.id,
      autorId: admin.id,
    },
    {
      titulo: "VPN corporativa: como conectar e solucionar erros",
      conteudo:
        "Instruções de configuração do cliente VPN, credenciais e resolução dos erros mais frequentes de autenticação.",
      categoriaId: catRedes.id,
      autorId: tecnico.id,
    },
    {
      titulo: "Como solicitar acesso a um sistema ou pasta de rede",
      conteudo:
        "Entenda o fluxo de aprovação de acessos, quem deve autorizar e como acompanhar a solicitação pelo sistema.",
      categoriaId: catAcessos.id,
      autorId: admin.id,
    },
    {
      titulo: "Impressora não imprime: diagnóstico e soluções",
      conteudo:
        "Guia de diagnóstico para os problemas mais comuns em impressoras de rede e locais, incluindo reinstalação de drivers.",
      categoriaId: catHardware.id,
      autorId: tecnico.id,
    },
    {
      titulo: "Erro ao abrir o sistema ERP: soluções conhecidas",
      conteudo:
        "Coletânea dos erros mais comuns ao inicializar o ERP corporativo e os comandos para resolver sem abrir chamado.",
      categoriaId: catSoftware.id,
      autorId: admin.id,
    },
    {
      titulo: "Rede lenta ou sem conexão: o que verificar primeiro",
      conteudo:
        "Checklist de diagnóstico de conectividade para resolver na própria estação antes de abrir um chamado para a infraestrutura.",
      categoriaId: catRedes.id,
      autorId: tecnico.id,
    },
  ];

  for (const art of artigosIniciais) {
    const existe = await prisma.artigo.findFirst({
      where: { titulo: art.titulo },
    });
    if (!existe) {
      await prisma.artigo.create({ data: art });
    }
  }

  console.log("✅ Artigos da Base de Conhecimento criados com sucesso.");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
