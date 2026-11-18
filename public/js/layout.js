// =========================================================
// LAYOUT GERAL — CONTROLE DA SIDEBAR (PIN & HOVER INTELIGENTE)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("app-sidebar");
  const btnToggle = document.getElementById("btn-toggle-sidebar");

  let acabouDeRecolher = false;

  // 1. Clique no botão de travar/destravar sidebar
  if (btnToggle && sidebar) {
    btnToggle.addEventListener("click", () => {
      const estaRecolhida = document.body.classList.toggle("sidebar-recolhida");

      if (estaRecolhida) {
        // Se acabou de recolher pelo botão, fecha na hora e não expande no hover imediato
        sidebar.classList.remove("hover-expandida");
        acabouDeRecolher = true;
      }
    });

    // 2. Hover inteligente quando a sidebar estiver recolhida
    sidebar.addEventListener("mouseenter", () => {
      if (
        document.body.classList.contains("sidebar-recolhida") &&
        !acabouDeRecolher
      ) {
        sidebar.classList.add("hover-expandida");
      }
    });

    sidebar.addEventListener("mouseleave", () => {
      sidebar.classList.remove("hover-expandida");
      acabouDeRecolher = false; // Ao sair da barra, libera o hover para a próxima vez
    });

    // 3. Controle do Submenu de Filas
    const itemFilas = document.getElementById("item-filas");
    const btnSubmenuFilas = document.getElementById("btn-submenu-filas");

    if (btnSubmenuFilas && itemFilas) {
      btnSubmenuFilas.addEventListener("click", (e) => {
        e.stopPropagation();
        itemFilas.classList.toggle("aberto");
      });
    }
  }
});
