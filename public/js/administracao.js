// =========================================================
// PAINEL DE ADMINISTRAÇÃO — ABAS, FILTROS E MODAL
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Controle de Abas
  const botoesAbas = document.querySelectorAll(".btn-aba");
  const conteudosAbas = document.querySelectorAll(".conteudo-aba");

  botoesAbas.forEach((btn) => {
    btn.addEventListener("click", () => {
      const abaAlvo = btn.dataset.aba;

      botoesAbas.forEach((b) => b.classList.remove("ativo"));
      conteudosAbas.forEach((c) => c.classList.remove("ativo"));

      btn.classList.add("ativo");
      const conteudoAlvo = document.getElementById(`aba-${abaAlvo}`);
      if (conteudoAlvo) {
        conteudoAlvo.classList.add("ativo");
      }
    });
  });

  // 2. Filtros de Usuários (Busca e Perfil)
  const inputBusca = document.getElementById("busca-usuario");
  const selectPerfil = document.getElementById("filtro-perfil-admin");
  const linhasUsuarios = document.querySelectorAll("#tabela-usuarios tbody tr");

  function normalizar(texto) {
    return texto
      ? texto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
      : "";
  }

  function filtrarUsuarios() {
    const termo = normalizar(inputBusca ? inputBusca.value : "");
    const perfilFiltro = selectPerfil ? selectPerfil.value : "";

    linhasUsuarios.forEach((linha) => {
      const colunas = linha.querySelectorAll("td");
      if (colunas.length < 3) return;

      const nome = normalizar(colunas[0].textContent);
      const email = normalizar(colunas[1].textContent);
      const perfil = colunas[2].textContent.trim();

      const bateBusca = !termo || nome.includes(termo) || email.includes(termo);
      const batePerfil = !perfilFiltro || perfil === perfilFiltro;

      linha.style.display = bateBusca && batePerfil ? "" : "none";
    });
  }

  if (inputBusca) inputBusca.addEventListener("input", filtrarUsuarios);
  if (selectPerfil) selectPerfil.addEventListener("change", filtrarUsuarios);

  // 3. Modal de Novo Usuário
  const modal = document.getElementById("modal-usuario");
  const btnAbrirModal = document.getElementById("btn-abrir-modal-usuario");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const btnCancelarModal = document.getElementById("btn-cancelar-modal");

  function abrirModal() {
    if (modal) modal.hidden = false;
  }

  function fecharModal() {
    if (modal) modal.hidden = true;
  }

  if (btnAbrirModal) btnAbrirModal.addEventListener("click", abrirModal);
  if (btnFecharModal) btnFecharModal.addEventListener("click", fecharModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener("click", fecharModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModal();
    });
  }
});
