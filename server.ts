import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ── Supabase setup ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Express ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // GET /api/categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nome");
      if (error) throw error;
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/products
  app.get("/api/products", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*, categorias(nome)")
        .eq("ativo", 1);
      if (error) throw error;
      const result = (data ?? []).map((p: any) => ({
        ...p,
        categoria_nome: p.categorias?.nome,
      }));
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/products/featured
  app.get("/api/products/featured", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*, categorias(nome)")
        .eq("ativo", 1)
        .limit(6);
      if (error) throw error;
      const result = (data ?? []).map((p: any) => ({
        ...p,
        categoria_nome: p.categorias?.nome,
      }));
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/orders
  app.get("/api/orders", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`*, itens_pedido(quantidade, preco_unitario, produtos(nome))`)
        .order("data_pedido", { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/orders
  app.post("/api/orders", async (req, res) => {
    try {
      const { items, total, customerName, email } = req.body;
      const emailKey = email || `anon_${Date.now()}@kaze.com`;

      // Upsert cliente
      await supabase.from("clientes").upsert(
        { nome: customerName || "Cliente Anônimo", email: emailKey },
        { onConflict: "email" }
      );
      const { data: clientData, error: clientError } = await supabase
        .from("clientes")
        .select("id_cliente")
        .eq("email", emailKey)
        .single();
      if (clientError) throw clientError;

      // Insert pedido
      const { data: orderData, error: orderError } = await supabase
        .from("pedidos")
        .insert({ id_cliente: clientData?.id_cliente, valor_total: total, status: "Pendente" })
        .select("id_pedido")
        .single();
      if (orderError) throw orderError;

      const orderId = orderData.id_pedido;

      // Insert itens
      const itensList = items.map((item: any) => ({
        id_pedido: orderId,
        id_produto: item.id_produto,
        quantidade: item.quantity,
        preco_unitario: item.preco,
      }));
      const { error: itemsError } = await supabase.from("itens_pedido").insert(itensList);
      if (itemsError) throw itemsError;

      res.json({ success: true, orderId });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // PATCH /api/orders/:id/status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const statusFlow: Record<string, string> = {
        Pendente: "Preparando",
        Preparando: "Pronto",
        Pronto: "Entregue",
        Entregue: "Entregue",
      };
      const { data: order, error: fetchError } = await supabase
        .from("pedidos")
        .select("status")
        .eq("id_pedido", parseInt(req.params.id))
        .single();
      if (fetchError || !order) { res.status(404).json({ error: "Pedido não encontrado" }); return; }
      const nextStatus = statusFlow[order.status] ?? "Entregue";
      const { error } = await supabase
        .from("pedidos")
        .update({ status: nextStatus })
        .eq("id_pedido", parseInt(req.params.id));
      if (error) throw error;
      res.json({ success: true, status: nextStatus });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/reservations
  app.get("/api/reservations", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .order("data", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/reservations
  app.post("/api/reservations", async (req, res) => {
    try {
      const { nome, phone, telefone, email, data, horario, pessoas, tipo_mesa, ocasiao, observacoes, mesa_numero, status } = req.body;
      const { data: result, error } = await supabase
        .from("reservas")
        .insert({
          nome,
          phone: phone || telefone || null,
          email: email || null,
          data,
          horario,
          pessoas: parseInt(pessoas),
          tipo_mesa: tipo_mesa || "Interna",
          ocasiao: ocasiao || "Nenhuma",
          observacoes: observacoes || null,
          mesa_numero: mesa_numero ? parseInt(mesa_numero) : null,
          status: status || "pendente",
        })
        .select("id_reserva")
        .single();
      if (error) throw error;
      res.json({ success: true, reservationId: result.id_reserva });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/mesas
  app.get("/api/mesas", async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from("mesas")
        .select("*")
        .order("numero", { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // PATCH /api/mesas/:numero
  app.patch("/api/mesas/:numero", async (req, res) => {
    try {
      const { status } = req.body;
      const { error } = await supabase
        .from("mesas")
        .update({ status })
        .eq("numero", parseInt(req.params.numero));
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/products (admin add)
  app.post("/api/products", async (req, res) => {
    try {
      const { nome, descricao, preco, id_categoria, imagem_url } = req.body;
      const { data, error } = await supabase
        .from("produtos")
        .insert({ nome, descricao, preco, id_categoria, imagem_url, ativo: 1 })
        .select("id_produto")
        .single();
      if (error) throw error;
      res.json({ success: true, id_produto: data.id_produto });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // DELETE /api/products/:id (admin soft-delete)
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { error } = await supabase
        .from("produtos")
        .update({ ativo: 0 })
        .eq("id_produto", parseInt(req.params.id));
      if (error) throw error;
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/seed (no-op — seed runs via SQL migration)
  app.post("/api/seed", (_req, res) => {
    res.json({ success: true, message: "Seed feito via supabase/migrations/001_initial.sql" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🍣 Kaze Server → http://localhost:${PORT}`);
    console.log(`☁️  Supabase: ${SUPABASE_URL}`);
  });
}

startServer();
