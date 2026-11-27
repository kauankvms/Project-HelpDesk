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
      const categoriaSlug = normalizar(card.dataset.categoria);
      const categoriaNome = normalizar(
        card.querySelector(".pill-label")?.textContent || "",
      );
      const descricao = normalizar(
        card.querySelector(".card-artigo-corpo p")?.textContent || "",
      );

      // Agora a busca pesquisa no título, na categoria/tag e no texto descritivo!
      const bateBusca =
        !busca ||
        titulo.includes(busca) ||
        categoriaSlug.includes(busca) ||
        categoriaNome.includes(busca) ||
        descricao.includes(busca);

      const bateCategoria =
        categoriaAtiva === "todos" || card.dataset.categoria === categoriaAtiva;

      if (bateBusca && bateCategoria) {
        card.style.display = ""; // Restaura exibição padrão
        visiveis++;
      } else {
        card.style.display = "none";
      }
    });

    // Atualiza o contador de resultados
    contador.innerHTML = `Exibindo <strong>${visiveis}</strong> ${visiveis === 1 ? "artigo" : "artigos"}`;

    // Exibe ou oculta o estado vazio
    if (visiveis === 0) {
      estadoVazio.style.display = "block";
      termoBuscado.textContent = inputBusca.value || categoriaAtiva;
    } else {
      estadoVazio.style.display = "none";
    }
  }

  // Event listener da busca por digitação
  inputBusca.addEventListener("input", filtrar);

  // Se o usuário apertar Esc dentro do campo de busca, limpa e refiltra
  inputBusca.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault(); // Impede que extensões sobrescrevam o placeholder
      inputBusca.value = "";
      filtrar();
    }
  });

  // Event listener dos botões (pills) de categoria
  pillsCategorias.forEach((pill) => {
    pill.addEventListener("click", () => {
      pillsCategorias.forEach((p) => p.classList.remove("ativo"));
      pill.classList.add("ativo");
      categoriaAtiva = pill.dataset.categoria;
      filtrar();
    });
  });

  // Inicializa o estado vazio como oculto
  if (estadoVazio) {
    estadoVazio.style.display = "none";
  }
});
