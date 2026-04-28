# 🍣 Kaze Premium Sushi

Bem-vindo ao repositório do **Kaze**, uma aplicação web de alta performance para um restaurante de sushi premium. Esta aplicação permite aos clientes visualizarem o cardápio, fazerem pedidos online e reservarem mesas em tempo real. Conta também com um painel administrativo robusto para gestão completa do restaurante.

## ✨ Funcionalidades

- **Área do Cliente:**
  - **Experiência Visual:** Design premium com animações suaves (Framer Motion) e modo escuro.
  - **Cardápio Inteligente:** Filtros por categoria e busca de pratos em tempo real.
  - **Checkout Completo:** Sistema de carrinho com escolha de entrega (Delivery/Retirada) e formas de pagamento.
  - **Reservas Dinâmicas:** Mapa de mesas interativo com status em tempo real (Supabase).
  - **Confirmação Detalhada:** Modais premium de sucesso após pedidos e reservas com resumo completo.

- **Painel Administrativo:**
  - **Dashboard Analytics:** Visão geral de vendas, reservas e receita estimada.
  - **Gestão de Cardápio:** CRUD completo de produtos integrado ao banco de dados.
  - **Controle de Pedidos:** Fluxo de status dos pedidos (Recebido -> Preparando -> Pronto -> Entregue).
  - **Gestão de Mesas:** Alteração de status das mesas diretamente pelo painel.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express.
- **Banco de Dados & Auth:** **Supabase (Cloud)** - Migrado de SQLite local para nuvem, garantindo persistência e escalabilidade.

## 📦 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- Conta no [Supabase](https://supabase.com/)

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

3. **Configuração do Banco de Dados (Supabase):**
   - Crie um novo projeto no Supabase.
   - Execute o script SQL localizado em `supabase/migrations/001_initial.sql` no Editor SQL do seu projeto Supabase para criar as tabelas e popular os dados iniciais.

4. **Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com suas chaves:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

5. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

6. **Acesse:** `http://localhost:3000`

---
> 💡 Desenvolvido com foco na excelência gastronômica e tecnológica.
