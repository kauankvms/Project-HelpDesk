// =========================================================
// FILTROS E PAGINAÇÃO DE CHAMADOS
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Elementos dos Filtros
  const formFiltros = document.querySelector(".filtros");
  const filtroStatus = document.getElementById("filtro-status");
  const filtroFila = document.getElementById("filtro-fila");
  const filtroCategoria = document.getElementById("filtro-categoria");
  const filtroPrioridade = document.getElementById("filtro-prioridade");
  const filtroTecnico = document.getElementById("filtro-tecnico");
  const inputBusca = document.querySelector('input[name="busca"]');

  // 2. Elementos da Tabela
  const corpoTabela = document.querySelector(".tabela-chamados tbody");
  const todasLinhas = Array.from(corpoTabela.querySelectorAll("tr"));

  // 3. Elementos da Paginação
  const infoPaginacao = document.getElementById("paginacao-info");
  const btnAnterior = document.getElementById("btn-anterior");
  const btnProximo = document.getElementById("btn-proximo");
  const containerNumeros = document.getElementById("paginacao-numeros");

  // Configuração da Paginação
  const ITENS_POR_PAGINA = 5;
  let paginaAtual = 1;
  let linhasFiltradas = [...todasLinhas];

  //Função Auxiliar para ignorar acentos e letras maiúsculas/minúsculas
  function normalizar(texto) {
    return texto
      ? texto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      : "";
  }

  // Aplica todos os filtros simultaneamente
  function aplicarFiltros() {
    const statusFiltro = normalizar(
      filtroStatus.options[filtroStatus.selectedIndex]?.text || "",
    );
    const filaFiltro = normalizar(
      filtroFila.options[filtroFila.selectedIndex]?.text || "",
    );
    const categoriaFiltro = normalizar(
      filtroCategoria.options[filtroCategoria.selectedIndex]?.text || "",
    );
    const prioridadeFiltro = normalizar(
      filtroPrioridade.options[filtroPrioridade.selectedIndex]?.text || "",
    );
    const tecnicoFiltro = normalizar(
      filtroTecnico.options[filtroTecnico.selectedIndex]?.text || "",
    );
    const termoBusca = normalizar(inputBusca.value);

    linhasFiltradas = todasLinhas.filter((linha) => {
      const colunas = linha.querySelectorAll("td");
      if (colunas.length < 6) return false; // Ignora linhas que não têm colunas suficientes

      const id = normalizar(colunas[0].textContent);
      const titulo = normalizar(colunas[1].textContent);
      const solicitante = normalizar(colunas[2].textContent);
      const tecnico = normalizar(colunas[3].textContent);
      const fila = normalizar(colunas[4].textContent);
      const categoria = normalizar(colunas[5].textContent);
      const status = normalizar(colunas[6].textContent);
      const prioridade = normalizar(colunas[7].textContent);

      // Verificação de cada critério (se estiver vazio ou "todos/todas", aceita qualquer)
      const bateStatus = !filtroStatus.value || status === statusFiltro;
      const bateFila = !filtroFila.value || fila === filaFiltro;
      const bateCategoria =
        !filtroCategoria.value || categoria === categoriaFiltro;
      const batePrioridade =
        !filtroPrioridade.value || prioridade === prioridadeFiltro;
      const bateTecnico = !filtroTecnico.value || tecnico === tecnicoFiltro;

      // Busca pesquisa no ID ou no Título
      const bateBusca =
        !termoBusca || id.includes(termoBusca) || titulo.includes(termoBusca);

      return (
        bateStatus &&
        bateFila &&
        bateCategoria &&
        batePrioridade &&
        bateTecnico &&
        bateBusca
      );
    });

    // Ao filtrar, volta para a primeira página dos novos resultados
    paginaAtual = 1;
    renderizarPaginacao();
  }

  // Exibe apenas as linhas da página atual e atualiza os botões
  function renderizarPaginacao() {
    const totalItens = linhasFiltradas.length;
    const totalPaginas = Math.ceil(totalItens / ITENS_POR_PAGINA) || 1;

    // Garante que a página atual não ultrapasse o total de páginas
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    // Oculta todas as linhas e exibe apenas as da fatia atual
    todasLinhas.forEach((linha) => (linha.style.display = "none"));

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const linhasExibidas = linhasFiltradas.slice(inicio, fim);

    linhasExibidas.forEach((linha) => (linha.style.display = ""));

    // Atualiza texto informativo ("Exibindo X-Y de Z")
    if (totalItens === 0) {
      infoPaginacao.innerHTML = "Nenhum chamado encontrado";
    } else {
      const exibindoFim = Math.min(fim, totalItens);
      infoPaginacao.innerHTML = `Exibindo <strong>${inicio + 1}–${exibindoFim}</strong> de <strong>${totalItens}</strong> chamados`;
    }

    // Atualiza botões Anterior / Próximo
    btnAnterior.disabled = paginaAtual === 1;
    btnProximo.disabled = paginaAtual === totalPaginas;

    // Gera os números de página (1, 2, 3...)
    containerNumeros.innerHTML = "";
    for (let i = 1; i <= totalPaginas; i++) {
      const btnNum = document.createElement("button");
      btnNum.type = "button";
      btnNum.className = `btn-pag ${i === paginaAtual ? "ativo" : ""}`;
      btnNum.textContent = i;
      btnNum.addEventListener("click", () => {
        paginaAtual = i;
        renderizarPaginacao();
      });
      containerNumeros.appendChild(btnNum);
    }
  }

  // 4. Event Listeners dos Filtros
  const selects = [
    filtroStatus,
    filtroFila,
    filtroCategoria,
    filtroPrioridade,
    filtroTecnico,
  ];
  selects.forEach((select) =>
    select.addEventListener("change", aplicarFiltros),
  );
  inputBusca.addEventListener("input", aplicarFiltros);

  // Ao clicar em Limpar Filtros, aguarda o formulário resetar e reaplica
  formFiltros.addEventListener("reset", () => {
    setTimeout(aplicarFiltros, 10);
  });

  // 5. Event Listeners da Paginação
  btnAnterior.addEventListener("click", () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarPaginacao();
    }
  });

  btnProximo.addEventListener("click", () => {
    const totalPaginas = Math.ceil(linhasFiltradas.length / ITENS_POR_PAGINA);
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarPaginacao();
    }
  });

  // Inicializa a paginação no primeiro carregamento
  renderizarPaginacao();
});
