import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

// ── SQLite setup ──────────────────────────────────────────────────────────────
const DB_PATH = path.join(process.cwd(), "kaze.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    id_categoria INTEGER REFERENCES categorias(id_categoria),
    imagem_url TEXT,
    ativo INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    telefone TEXT,
    data_cadastro TEXT DEFAULT CURRENT_DATE
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    valor_total REAL,
    status TEXT DEFAULT 'Pendente',
    data_pedido TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS itens_pedido (
    id_item INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER REFERENCES pedidos(id_pedido),
    id_produto INTEGER REFERENCES produtos(id_produto),
    quantidade INTEGER,
    preco_unitario REAL
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id_reserva INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    phone TEXT,
    email TEXT,
    data TEXT,
    horario TEXT,
    pessoas INTEGER,
    tipo_mesa TEXT DEFAULT 'Interna',
    ocasiao TEXT DEFAULT 'Nenhuma',
    observacoes TEXT,
    mesa_numero INTEGER,
    status TEXT DEFAULT 'pendente',
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mesas (
    id_mesa INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER UNIQUE,
    capacidade INTEGER,
    zona TEXT,
    status TEXT DEFAULT 'livre'
  );
`);

// ── Seed ──────────────────────────────────────────────────────────────────────
function seedDatabase() {
  const catCount = (db.prepare("SELECT COUNT(*) as c FROM categorias").get() as any).c;
  if (catCount > 0) return;

  const cats = ["Entradas", "Combinados", "Sushis", "Sashimis", "Temakis", "Pratos Quentes", "Bebidas", "Sobremesas"];
  const insertCat = db.prepare("INSERT OR IGNORE INTO categorias (nome) VALUES (?)");
  for (const c of cats) insertCat.run(c);

  const getCatId = (name: string): number =>
    (db.prepare("SELECT id_categoria FROM categorias WHERE nome = ?").get(name) as any)?.id_categoria;

  const products = [
    // Entradas
    { nome: "Missoshiru", descricao: "Sopa tradicional de missô com tofu e cebolinha", preco: 14.0, cat: "Entradas",
      img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80" },
    { nome: "Gyoza (6 un.)", descricao: "Pastéis japoneses grelhados com carne suína e legumes", preco: 28.0, cat: "Entradas",
      img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80" },
    { nome: "Harumaki (4 un.)", descricao: "Rolinho primavera crocante recheado com legumes", preco: 22.0, cat: "Entradas",
      img: "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=600&q=80" },
    { nome: "Sunomono", descricao: "Salada agridoce de pepino com gergelim", preco: 18.0, cat: "Entradas",
      img: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=600&q=80" },
    { nome: "Edamame", descricao: "Vagens de soja cozidas e levemente salgadas", preco: 16.0, cat: "Entradas",
      img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
    // Combinados
    { nome: "Combinado Clássico (20 peças)", descricao: "10 sashimis + 10 sushis variados", preco: 89.0, cat: "Combinados",
      img: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?auto=format&fit=crop&w=600&q=80" },
    { nome: "Combinado Especial (40 peças)", descricao: "Sashimis, niguiris, uramakis e hot rolls", preco: 159.0, cat: "Combinados",
      img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80" },
    { nome: "Combinado Premium (60 peças)", descricao: "Seleção do chef com peixes nobres", preco: 229.0, cat: "Combinados",
      img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80" },
    // Sushis
    { nome: "Niguiri de Salmão (2 un.)", descricao: "Sushi tradicional com fatia de salmão fresco", preco: 18.0, cat: "Sushis",
      img: "https://images.unsplash.com/photo-1617196034099-cb2b73c71966?auto=format&fit=crop&w=600&q=80" },
    { nome: "Niguiri de Atum (2 un.)", descricao: "Sushi tradicional com fatia de atum fresco", preco: 20.0, cat: "Sushis",
      img: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=600&q=80" },
    { nome: "Niguiri de Camarão (2 un.)", descricao: "Sushi com camarão temperado", preco: 19.0, cat: "Sushis",
      img: "https://images.unsplash.com/photo-1635361177735-4083abb84570?auto=format&fit=crop&w=600&q=80" },
    { nome: "Joe de Salmão (2 un.)", descricao: "Com cream cheese e molho especial", preco: 22.0, cat: "Sushis",
      img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80" },
    // Sashimis
    { nome: "Sashimi de Salmão (10 fatias)", descricao: "Fatias frescas de salmão premium", preco: 65.0, cat: "Sashimis",
      img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80" },
    { nome: "Sashimi de Atum (10 fatias)", descricao: "Fatias frescas de atum premium", preco: 70.0, cat: "Sashimis",
      img: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=600&q=80" },
    { nome: "Sashimi Misto (15 fatias)", descricao: "Seleção de peixes variados do chef", preco: 95.0, cat: "Sashimis",
      img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80" },
    // Temakis
    { nome: "Temaki de Salmão", descricao: "Cone de alga com salmão fresco e arroz de sushi", preco: 26.0, cat: "Temakis",
      img: "https://images.unsplash.com/photo-1617196034096-e3d28cb1c3c8?auto=format&fit=crop&w=600&q=80" },
    { nome: "Temaki de Salmão com Cream Cheese", descricao: "Cone de alga com salmão e cream cheese", preco: 29.0, cat: "Temakis",
      img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80" },
    { nome: "Temaki Califórnia", descricao: "Kani, manga e pepino em cone de alga", preco: 24.0, cat: "Temakis",
      img: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?auto=format&fit=crop&w=600&q=80" },
    { nome: "Temaki Hot", descricao: "Camarão empanado e crocante com molho especial", preco: 27.0, cat: "Temakis",
      img: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80" },
    // Pratos Quentes
    { nome: "Yakissoba", descricao: "Frango, carne ou misto — macarrão japonês salteado", preco: 45.0, cat: "Pratos Quentes",
      img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80" },
    { nome: "Teppan de Salmão", descricao: "Salmão grelhado com legumes frescos na chapa", preco: 68.0, cat: "Pratos Quentes",
      img: "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=600&q=80" },
    { nome: "Tempurá de Camarão (6 un.)", descricao: "Camarões empanados em massa leve e crocante", preco: 55.0, cat: "Pratos Quentes",
      img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80" },
    { nome: "Frango Teriyaki", descricao: "Frango grelhado com molho agridoce japonês", preco: 48.0, cat: "Pratos Quentes",
      img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80" },
    // Bebidas
    { nome: "Refrigerantes", descricao: "Lata 350ml gelada", preco: 8.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80" },
    { nome: "Sucos Naturais", descricao: "Laranja, limão ou maracujá", preco: 12.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80" },
    { nome: "Chá Verde", descricao: "Chá verde japonês quente ou gelado", preco: 10.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80" },
    { nome: "Saquê", descricao: "Destilado japonês de arroz, quente ou frio", preco: 22.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=600&q=80" },
    { nome: "Água com Gás", descricao: "Água mineral gaseificada gelada 500ml", preco: 6.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80" },
    { nome: "Cerveja Sapporo", descricao: "Cerveja japonesa gelada long neck 330ml", preco: 18.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80" },
    { nome: "Chá de Jasmim", descricao: "Chá floral japonês quente ou gelado", preco: 11.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80" },
    { nome: "Limonada Japonesa", descricao: "Limonada com gengibre e hortelã frescos", preco: 14.0, cat: "Bebidas",
      img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80" },
    // Sobremesas
    { nome: "Mochi", descricao: "Doce japonês de arroz glutinoso recheado", preco: 16.0, cat: "Sobremesas",
      img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80" },
    { nome: "Harumaki Doce", descricao: "Rolinho crocante de banana com chocolate", preco: 18.0, cat: "Sobremesas",
      img: "https://images.unsplash.com/photo-1559181567-c3190ca9d714?auto=format&fit=crop&w=600&q=80" },
    { nome: "Tempurá de Sorvete", descricao: "Sorvete empanado e levemente frito, crocante por fora e gelado por dentro", preco: 20.0, cat: "Sobremesas",
      img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80" },
  ];

  const insertProd = db.prepare(
    "INSERT INTO produtos (nome, descricao, preco, id_categoria, imagem_url, ativo) VALUES (?, ?, ?, ?, ?, 1)"
  );
  for (const p of products) {
    insertProd.run(p.nome, p.descricao, p.preco, getCatId(p.cat), p.img);
  }

  const mesas = [
    { numero: 1, capacidade: 2, zona: "salao" }, { numero: 2, capacidade: 2, zona: "salao" },
    { numero: 3, capacidade: 4, zona: "salao" }, { numero: 4, capacidade: 4, zona: "salao" },
    { numero: 5, capacidade: 6, zona: "salao" }, { numero: 6, capacidade: 6, zona: "salao" },
    { numero: 7, capacidade: 2, zona: "externa" }, { numero: 8, capacidade: 2, zona: "externa" },
    { numero: 9, capacidade: 4, zona: "externa" }, { numero: 10, capacidade: 4, zona: "externa" },
    { numero: 11, capacidade: 4, zona: "tatame" }, { numero: 12, capacidade: 4, zona: "tatame" },
    { numero: 13, capacidade: 6, zona: "tatame" },
  ];
  const insertMesa = db.prepare("INSERT OR IGNORE INTO mesas (numero, capacidade, zona, status) VALUES (?, ?, ?, 'livre')");
  for (const m of mesas) insertMesa.run(m.numero, m.capacidade, m.zona);

  console.log("✅ Banco de dados populado com sucesso!");
}

seedDatabase();

// ── Express ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // GET /api/categories
  app.get("/api/categories", (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM categorias ORDER BY nome").all();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/products
  app.get("/api/products", (_req, res) => {
    try {
      const data = db.prepare(`
        SELECT p.*, c.nome AS categoria_nome
        FROM produtos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE p.ativo = 1
      `).all();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/products/featured
  app.get("/api/products/featured", (_req, res) => {
    try {
      const data = db.prepare(`
        SELECT p.*, c.nome AS categoria_nome
        FROM produtos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE p.ativo = 1
        LIMIT 6
      `).all();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/orders
  app.get("/api/orders", (_req, res) => {
    try {
      const orders = db.prepare("SELECT * FROM pedidos ORDER BY data_pedido DESC").all() as any[];
      const getItems = db.prepare(`
        SELECT ip.quantidade, ip.preco_unitario, p.nome AS produto_nome
        FROM itens_pedido ip
        LEFT JOIN produtos p ON ip.id_produto = p.id_produto
        WHERE ip.id_pedido = ?
      `);
      const result = orders.map((o) => ({
        ...o,
        itens_pedido: getItems.all(o.id_pedido).map((item: any) => ({
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          produtos: { nome: item.produto_nome },
        })),
      }));
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/orders
  app.post("/api/orders", (req, res) => {
    try {
      const { items, total, customerName, email } = req.body;
      const emailKey = email || `anon_${Date.now()}@kaze.com`;

      db.prepare(`
        INSERT INTO clientes (nome, email, data_cadastro)
        VALUES (?, ?, date('now'))
        ON CONFLICT(email) DO UPDATE SET nome = excluded.nome
      `).run(customerName || "Cliente Anônimo", emailKey);

      const client = db.prepare("SELECT id_cliente FROM clientes WHERE email = ?").get(emailKey) as any;

      const orderResult = db.prepare(`
        INSERT INTO pedidos (id_cliente, valor_total, status, data_pedido)
        VALUES (?, ?, 'Pendente', datetime('now'))
      `).run(client?.id_cliente ?? null, total);

      const orderId = orderResult.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
        VALUES (?, ?, ?, ?)
      `);
      for (const item of items) {
        insertItem.run(orderId, item.id_produto, item.quantity, item.preco);
      }

      res.json({ success: true, orderId });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // PATCH /api/orders/:id/status
  app.patch("/api/orders/:id/status", (req, res) => {
    try {
      const statusFlow: Record<string, string> = {
        Pendente: "Preparando",
        Preparando: "Pronto",
        Pronto: "Entregue",
        Entregue: "Entregue",
      };
      const order = db.prepare("SELECT status FROM pedidos WHERE id_pedido = ?").get(parseInt(req.params.id)) as any;
      if (!order) { res.status(404).json({ error: "Pedido não encontrado" }); return; }
      const nextStatus = statusFlow[order.status] ?? "Entregue";
      db.prepare("UPDATE pedidos SET status = ? WHERE id_pedido = ?").run(nextStatus, parseInt(req.params.id));
      res.json({ success: true, status: nextStatus });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/reservations
  app.get("/api/reservations", (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM reservas ORDER BY data ASC").all();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/reservations
  app.post("/api/reservations", (req, res) => {
    try {
      const { nome, phone, telefone, email, data, horario, pessoas, tipo_mesa, ocasiao, observacoes, mesa_numero, status } = req.body;
      const result = db.prepare(`
        INSERT INTO reservas (nome, phone, email, data, horario, pessoas, tipo_mesa, ocasiao, observacoes, mesa_numero, status, data_criacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        nome, phone || telefone || null, email || null,
        data, horario, parseInt(pessoas),
        tipo_mesa || "Interna", ocasiao || "Nenhuma",
        observacoes || null, mesa_numero ? parseInt(mesa_numero) : null,
        status || "pendente"
      );
      res.json({ success: true, reservationId: result.lastInsertRowid });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/mesas
  app.get("/api/mesas", (_req, res) => {
    try {
      const data = db.prepare("SELECT * FROM mesas ORDER BY numero ASC").all();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // PATCH /api/mesas/:numero
  app.patch("/api/mesas/:numero", (req, res) => {
    try {
      const { status } = req.body;
      db.prepare("UPDATE mesas SET status = ? WHERE numero = ?").run(status, parseInt(req.params.numero));
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/products (admin add)
  app.post("/api/products", (req, res) => {
    try {
      const { nome, descricao, preco, id_categoria, imagem_url } = req.body;
      const result = db.prepare(`
        INSERT INTO produtos (nome, descricao, preco, id_categoria, imagem_url, ativo)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(nome, descricao, preco, id_categoria, imagem_url);
      res.json({ success: true, id_produto: result.lastInsertRowid });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // DELETE /api/products/:id (admin soft-delete)
  app.delete("/api/products/:id", (req, res) => {
    try {
      db.prepare("UPDATE produtos SET ativo = 0 WHERE id_produto = ?").run(parseInt(req.params.id));
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/seed (compatibility — no-op, seed runs at boot)
  app.post("/api/seed", (_req, res) => {
    res.json({ success: true, message: "Database seeded at startup" });
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
    console.log(`📦 SQLite: ${DB_PATH}`);
  });
}

startServer();
