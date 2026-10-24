// =========================================================
// BASE DE CONHECIMENTO — BUSCA E FILTRO POR CATEGORIA
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const inputBusca = document.getElementById("busca-artigos");
  const pillsCategorias = document.querySelectorAll(".pill-categoria");
  const todosOsCards = document.querySelectorAll(".card-artigo");
  const contador = document.getElementById("contador-artigos");
  const estadoVazio = document.getElementById("estado-vazio");
  const termoBuscado = document.getElementById("termo-buscado");

  let categoriaAtiva = "todos";

  // Normaliza texto para comparações (sem acento e minúsculo)
  function normalizar(texto) {
    return texto
      ? texto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      : "";
  }

  function filtrar() {
    const busca = normalizar(inputBusca.value);
    let visiveis = 0;

    todosOsCards.forEach((card) => {
      const titulo = normalizar(card.dataset.titulo);
      const categoria = card.dataset.categoria;

      const bateBusca = !busca || titulo.includes(busca);
      const bateCategoria =
        categoriaAtiva === "todos" || categoria === categoriaAtiva;

      if (bateBusca && bateCategoria) {
        card.hidden = false;
        visiveis++;
      } else {
        card.hidden = true;
      }
    });

    // Atualiza o contador
    contador.innerHTML = `Exibindo <strong>${visiveis}</strong> ${visiveis === 1 ? "artigo" : "artigos"}`;

    // Exibe ou oculta o estado vazio
    if (visiveis === 0) {
      estadoVazio.hidden = false;
      termoBuscado.textContent = inputBusca.value || categoriaAtiva;
    } else {
      estadoVazio.hidden = true;
    }
  }

  // Event listener da busca
  inputBusca.addEventListener("input", filtrar);

  // Event listener dos pills de categoria
  pillsCategorias.forEach((pill) => {
    pill.addEventListener("click", () => {
      pillsCategorias.forEach((p) => p.classList.remove("ativo"));
      pill.classList.add("ativo");
      categoriaAtiva = pill.dataset.categoria;
      filtrar();
    });
  });
});
