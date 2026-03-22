# CASIPass - Plataforma de Ingressos Universitários

> Sistema de venda, validação e controle de ingressos para eventos do **CASI (Centro Acadêmico de Sistemas de Informação)** da UFRA.

![CASIPass Banner](https://via.placeholder.com/800x200?text=CASIPass+Platform)

## 📌 Visão Geral

O **CASIPass** é uma aplicação web mobile-first desenvolvida para digitalizar todo o ciclo de vida de ingressos universitários: desde a compra com validação de matrícula até o check-in na portaria via QR Code. O design segue a identidade visual **Retro-Futurista / Alan Turing**, inspirada em circuitos analógicos, engrenagens e a estética industrial dos anos 40/50.

### Principais Funcionalidades:
- **Catálogo de Eventos:** Listagem completa com filtros por tipo de ingresso (Calouro, Veterano, Externo).
- **Fluxo de Compra:** Processo otimizado com upload de comprovante de matrícula para validação.
- **Painel Administrativo:** Área restrita para verificação de documentos e aprovação de pedidos.
- **Pagamentos:** Integração simulada para pagamentos via PIX (Mercado Pago).
- **Carteira Digital:** Acesso rápido aos ingressos adquiridos com QR Code dinâmico.
- **Scanner de Portaria:** Leitura em tempo real de ingressos utilizando a câmera do dispositivo móvel.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com ferramentas modernas para garantir performance e escalabilidade:

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Roteamento:** [React Router](https://reactrouter.com/)
- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/)
- **UI Components:** [Lucide React](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)

---

## 🎲 Como Rodar Localmente

Para rodar o projeto na sua máquina e testar todas as funcionalidades:

### 1. Pré-requisitos
- Node.js instalado (v18 ou superior recomendado)

### 2. Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/Imagineixon/CASIpass.git
    cd CASIpass
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Inicie o servidor local**
    ```bash
    npm run dev
    ```

4.  **Acesse o projeto**
    Abra o link que aparecerá no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

---

### 🔑 Credenciais de Teste (Mock Data)

O sistema utiliza dados simulados, então você pode usar estas contas para testar os diferentes perfis:

| Perfil | Email | Senha | O que testar |
| :--- | :--- | :--- | :--- |
| **Estudante** | `maria.silva@universidade.br` | `CASIPass2026` | Compra de ingressos, carrinho, upload de atestado, carteira digital. |
| **Staff/Admin** | `admin@casi.ufra.br` | `admin123` | Validação de documentos, scanner de QR Code (requer câmera). |

---

## 4. Arquitetura de Pastas

```
src/
  app/
    App.tsx                    # Entrypoint (RouterProvider + Toaster + session listener)
    routes.ts                  # Todas as rotas (createBrowserRouter)
    components/
      app-shell.tsx            # Layout principal (catalogo de eventos)
      cart-drawer.tsx           # Drawer lateral do carrinho (US-24: limite 2)
      event-card.tsx            # Card de evento
      event-detail.tsx          # Detalhe do evento + selecao de ingresso
      digital-ticket.tsx        # Ingresso digital com QR Code
      ticket-card.tsx           # Card de ingresso na carteira
      auth/
        login-screen.tsx        # Login (email + senha)
        register-screen.tsx     # Cadastro (com validacao CPF algoritmica)
        forgot-password-screen.tsx
        my-account-screen.tsx   # Perfil (CPF e email imutaveis)
        staff-login-screen.tsx  # Login restrito a staff/admin
      checkout/
        checkout-flow.tsx       # Fluxo condicional (upload atestado ou pagamento direto)
      orders/
        my-orders.tsx           # Lista de pedidos (com polling 15s para pendentes)
      wallet/
        my-tickets.tsx          # Carteira digital de ingressos
      admin/
        verification-panel.tsx  # Painel de verificacao de documentos
      staff/
        scanner.tsx             # Scanner de portaria (html5-qrcode + entrada manual)
    services/
      api.ts                   # Axios + JWT interceptors + refresh queue + CPF validator
      endpoints.ts             # Todos os endpoints tipados (auth, pedidos, docs, pagamentos, ingressos, admin, scanner, eventos, lotes)
      mock-data.ts             # Mock service para desenvolvimento sem backend
    store/
      auth-store.ts            # Estado de autenticacao (Zustand)
      cart-store.ts            # Carrinho com limite US-24 (Zustand)
      orders-store.ts          # Pedidos + fluxo de checkout (Zustand)
  styles/
    fonts.css                  # Import Google Fonts (Bree Serif, Inter, Fira Code)
    theme.css                  # Design tokens CSS + Tailwind v4 @theme
```

---

## 📂 Estrutura do Projeto

A organização das pastas segue uma arquitetura modular por funcionalidades:

```
src/
├── app/
│   ├── components/      # Componentes UI reutilizáveis e específicos
│   │   ├── admin/       # Painel administrativo
│   │   ├── auth/        # Telas de autenticação (Login, Registro)
│   │   ├── checkout/    # Fluxo de pagamento
│   │   ├── staff/       # Scanner e ferramentas da equipe
│   │   └── ui/          # Componentes base (Botões, Inputs, Modais)
│   ├── services/        # Integrações com API e Mock Data
│   ├── store/           # Gerenciamento de estado global (Zustand)
│   └── routes.ts        # Definição das rotas da aplicação
├── styles/              # Arquivos CSS globais e tokens do tema
└── main.tsx             # Ponto de entrada da aplicação
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Adicionando nova feature'`)
4. Faça o Push para a Branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 👥 Equipe de Desenvolvimento

- **Saymon Miranda** (Diretor de Projetos CASI) — *UI/UX & Front-End*
- **Natasha Pinho** (Diretora de Marketing CALC) — *UI/UX & Front-End*
- **Anderson Martins** (Vice-Diretor de Projetos CASI) — *Back-End*
- **Willian Rodrigo** (Presidente do CASI) — *Back-End*
- **Ingrid Silva** (Ouvidoria) — *Gestão de Tarefas*

---

Desenvolvido para o **CASI - Centro Acadêmico de Sistemas de Informação**.

