# 🍣 Kaze Premium Sushi

Bem-vindo ao repositório do **Kaze**, uma aplicação web completa para um restaurante de sushi premium. Esta aplicação permite aos clientes visualizarem o cardápio, fazerem pedidos online e reservarem mesas. Além disso, conta com um painel administrativo para o gerenciamento de produtos, pedidos e reservas.

## ✨ Funcionalidades

- **Área do Cliente:**
  - Visualização de "Destaques do Cardápio" com pratos selecionados.
  - Cardápio completo com filtros por categoria (Entradas, Combinados, Sushis, Sashimis, Temakis, Pratos Quentes, Bebidas e Sobremesas).
  - Sistema de Carrinho de Compras e Finalização de Pedido (Mock).
  - Sistema de Reservas de Mesas com mapa visual de mesas disponíveis e ocupadas.

- **Painel Administrativo:**
  - **Dashboard:** Estatísticas em tempo real de pedidos, reservas e estimativa de receita.
  - **Cardápio:** Gerenciamento do catálogo de produtos (Adicionar, Editar e Remover).
  - **Reservas:** Visualização e aprovação de reservas feitas pelos clientes.
  - **Pedidos:** Acompanhamento do status dos pedidos em andamento.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend:** Node.js, Express
- **Banco de Dados:** SQLite (better-sqlite3) e Supabase (Mockado localmente para facilitar testes de desenvolvimento)

## 📦 Como Rodar Localmente

O projeto está configurado para funcionar completamente em ambiente local (offline do Supabase), usando dados mockados na API para facilitar os testes de fluxo (pedidos e reservas).

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/heloisabolognesi/kaze.git
   cd kaze
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Renomeie ou copie o arquivo `.env.example` para `.env` (se necessário). As chaves do Supabase não são estritamente necessárias para a execução local graças ao modo mock.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação:**
   Abra seu navegador em `http://localhost:3000`

---
> 💡 Desenvolvido com foco na melhor experiência de usuário, design impecável e funcionalidades robustas.
