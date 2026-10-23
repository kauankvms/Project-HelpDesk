# Project HelpDesk

> Sistema web de Help Desk e Gestão de Chamados de TI, desenvolvido com foco em boas práticas de arquitetura front-end, semântica, responsividade e código limpo.

---

## Sobre o Projeto

O **HelpDesk** é uma solução para gerenciamento de suporte técnico corporativo, permitindo que usuários abram chamados e analistas controlem filas de atendimento, prioridades, categorias e cumprimento de SLAs.

Atualmente, o projeto está na etapa de desenvolvimento do front-end completo (HTML5 semântico, CSS3 modular e JavaScript Vanilla ES6+), preparando a base para futura integração com APIs e banco de dados.

---

## Telas Desenvolvidas

- **Autenticação (`index.html`):** Tela de login moderna com suporte a banco local ou Active Directory, alternância de visibilidade de senha e design responsivo.
- **Dashboard (`dashboard.html`):** Painel de controle com cards de métricas (chamados abertos, em andamento, resolvidos), gráficos por status e categorias, lista de chamados recentes e monitoramento de SLA por fila.
- **Listagem de Chamados (`chamados.html`):** Tabela completa com filtros múltiplos simultâneos em tempo real (Status, Fila, Categoria, Prioridade, Técnico e Busca textual) e paginação dinâmica.
- **Abertura de Chamado (`novo-chamado.html`):** Formulário em layout de duas colunas com área de arrastar e soltar anexos (Dropzone) e cálculo dinâmico de previsão de SLA conforme a prioridade.

---

## Tecnologias Utilizadas

- **HTML5:** Semântica adequada, tags estruturais (`<header>`, `<aside>`, `<main>`, `<section>`) e acessibilidade com atributos ARIA.
- **CSS3 Moderno:**
  - Layout flexível com **CSS Grid** e **Flexbox**;
  - Arquitetura modular (`base.css`, `layout.css`, `componentes.css` e CSS específico por página);
  - Variáveis globais (`:root`) e uso de `color-mix()` para transparências dinâmicas em badges e status.
- **JavaScript (Vanilla ES6+):** Manipulação de DOM pura, filtros compostos em tempo real, paginação matemática dinâmica e controle de anexos.

---

## Estrutura de Pastas

```text
Project_HelpDesk/
├── css/
│   ├── base.css           # Variáveis globais, reset e tipografia
│   ├── layout.css         # Estrutura principal (grid do app, topbar, sidebar)
│   ├── componentes.css    # Cards, tabelas, badges, paginação e botões
│   ├── login.css          # Estilos específicos do login
│   ├── dashboard.css      # Widgets e gráficos do dashboard
│   ├── chamados.css       # Filtros da listagem de chamados
│   └── novo-chamado.css   # Formulário em duas colunas e dropzone
├── js/
│   ├── layout.js          # Controle de recolhimento da sidebar e navegação
│   ├── login.js           # Interações da tela de login
│   ├── chamados.js        # Filtros em tempo real e paginação
│   └── novo-chamado.js    # Upload de anexos e cálculo de SLA
├── pages/
│   ├── dashboard.html
│   ├── chamados.html
│   └── novo-chamado.html
├── imagens/               # Logos, ícones e wallpapers
├── index.html             # Ponto de entrada (Login)
└── README.md
```
