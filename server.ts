import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const mockCategories = [
    { id_categoria: 1, nome: "Entradas" },
    { id_categoria: 2, nome: "Combinados" },
    { id_categoria: 3, nome: "Sushis" },
    { id_categoria: 4, nome: "Sashimis" },
    { id_categoria: 5, nome: "Temakis" },
    { id_categoria: 6, nome: "Pratos Quentes" },
    { id_categoria: 7, nome: "Bebidas" },
    { id_categoria: 8, nome: "Sobremesas" }
  ];

  const mockProducts = [
    { id_produto: 1, nome: "Missoshiru", descricao: "Sopa tradicional de missô com tofu e cebolinha", preco: 14.0, id_categoria: 1, categoria_nome: "Entradas", imagem_url: "https://i.pinimg.com/1200x/54/8d/70/548d707d6d37522122b47c86012495d7.jpg", ativo: true },
    { id_produto: 2, nome: "Gyoza (6 un.)", descricao: "Pastéis japoneses grelhados com carne suína e legumes", preco: 28.0, id_categoria: 1, categoria_nome: "Entradas", imagem_url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400", ativo: true },
    { id_produto: 3, nome: "Harumaki (4 un.)", descricao: "Rolinho primavera crocante", preco: 22.0, id_categoria: 1, categoria_nome: "Entradas", imagem_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400", ativo: true },
    { id_produto: 4, nome: "Sunomono", descricao: "Salada agridoce de pepino com gergelim", preco: 18.0, id_categoria: 1, categoria_nome: "Entradas", imagem_url: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400", ativo: true },
    { id_produto: 5, nome: "Edamame", descricao: "Vagens de soja cozidas e levemente salgadas", preco: 16.0, id_categoria: 1, categoria_nome: "Entradas", imagem_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400", ativo: true },
    { id_produto: 6, nome: "Combinado Clássico (20 peças)", descricao: "10 sashimis + 10 sushis variados", preco: 89.0, id_categoria: 2, categoria_nome: "Combinados", imagem_url: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400", ativo: true },
    { id_produto: 7, nome: "Combinado Especial (40 peças)", descricao: "Sashimis, niguiris, uramakis e hot rolls", preco: 159.0, id_categoria: 2, categoria_nome: "Combinados", imagem_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400", ativo: true },
    { id_produto: 8, nome: "Combinado Premium (60 peças)", descricao: "Seleção do chef com peixes nobres", preco: 229.0, id_categoria: 2, categoria_nome: "Combinados", imagem_url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400", ativo: true },
    { id_produto: 9, nome: "Niguiri de Salmão (2 un.)", descricao: "Sushi tradicional com fatia de salmão fresco", preco: 18.0, id_categoria: 3, categoria_nome: "Sushis", imagem_url: "https://images.unsplash.com/photo-1617196034099-cb2b73c71966?w=400", ativo: true },
    { id_produto: 10, nome: "Niguiri de Atum (2 un.)", descricao: "Sushi tradicional com fatia de atum fresco", preco: 20.0, id_categoria: 3, categoria_nome: "Sushis", imagem_url: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400", ativo: true },
    { id_produto: 11, nome: "Niguiri de Camarão (2 un.)", descricao: "Sushi com camarão temperado", preco: 19.0, id_categoria: 3, categoria_nome: "Sushis", imagem_url: "https://images.unsplash.com/photo-1617196034096-e3d28cb1c3c8?w=400", ativo: true },
    { id_produto: 12, nome: "Joe de Salmão (2 un.)", descricao: "Com cream cheese e molho especial", preco: 22.0, id_categoria: 3, categoria_nome: "Sushis", imagem_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400", ativo: true },
    { id_produto: 13, nome: "Sashimi de Salmão (10 fatias)", descricao: "Fatias frescas de salmão premium", preco: 65.0, id_categoria: 4, categoria_nome: "Sashimis", imagem_url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400", ativo: true },
    { id_produto: 14, nome: "Sashimi de Atum (10 fatias)", descricao: "Fatias frescas de atum premium", preco: 70.0, id_categoria: 4, categoria_nome: "Sashimis", imagem_url: "https://images.unsplash.com/photo-1648146703765-b1b3bb788e14?w=400", ativo: true },
    { id_produto: 15, nome: "Sashimi Misto (15 fatias)", descricao: "Seleção de peixes variados", preco: 95.0, id_categoria: 4, categoria_nome: "Sashimis", imagem_url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400", ativo: true },
    { id_produto: 16, nome: "Temaki de Salmão", descricao: "Cone de alga com salmão e arroz", preco: 26.0, id_categoria: 5, categoria_nome: "Temakis", imagem_url: "https://images.unsplash.com/photo-1617196034096-e3d28cb1c3c8?w=400", ativo: true },
    { id_produto: 17, nome: "Temaki de Salmão com Cream Cheese", descricao: "Cone de alga com salmão e cream cheese", preco: 29.0, id_categoria: 5, categoria_nome: "Temakis", imagem_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400", ativo: true },
    { id_produto: 18, nome: "Temaki Califórnia", descricao: "Kani, manga e pepino", preco: 24.0, id_categoria: 5, categoria_nome: "Temakis", imagem_url: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400", ativo: true },
    { id_produto: 19, nome: "Temaki Hot", descricao: "Empanado e crocante", preco: 27.0, id_categoria: 5, categoria_nome: "Temakis", imagem_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400", ativo: true },
    { id_produto: 20, nome: "Yakissoba", descricao: "Frango, carne ou misto — macarrão japonês salteado", preco: 45.0, id_categoria: 6, categoria_nome: "Pratos Quentes", imagem_url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400", ativo: true },
    { id_produto: 21, nome: "Teppan de Salmão", descricao: "Salmão grelhado com legumes na chapa", preco: 68.0, id_categoria: 6, categoria_nome: "Pratos Quentes", imagem_url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400", ativo: true },
    { id_produto: 22, nome: "Tempurá de Camarão (6 un.)", descricao: "Camarões empanados em massa leve e crocante", preco: 55.0, id_categoria: 6, categoria_nome: "Pratos Quentes", imagem_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", ativo: true },
    { id_produto: 23, nome: "Frango Teriyaki", descricao: "Frango grelhado com molho agridoce japonês", preco: 48.0, id_categoria: 6, categoria_nome: "Pratos Quentes", imagem_url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400", ativo: true },
    { id_produto: 24, nome: "Refrigerantes", descricao: "Lata 350ml gelada", preco: 8.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", ativo: true },
    { id_produto: 25, nome: "Sucos Naturais", descricao: "Laranja, limão ou maracujá", preco: 12.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400", ativo: true },
    { id_produto: 26, nome: "Chá Verde", descricao: "Chá verde japonês quente ou gelado", preco: 10.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", ativo: true },
    { id_produto: 27, nome: "Saquê", descricao: "Destilado japonês de arroz, quente ou frio", preco: 22.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400", ativo: true },
    { id_produto: 28, nome: "Água com Gás", descricao: "Água mineral gaseificada gelada", preco: 6.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400", ativo: true },
    { id_produto: 29, nome: "Cerveja Sapporo", descricao: "Cerveja japonesa gelada long neck 330ml", preco: 18.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", ativo: true },
    { id_produto: 30, nome: "Chá de Jasmim", descricao: "Chá floral japonês quente ou gelado", preco: 11.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400", ativo: true },
    { id_produto: 31, nome: "Limonada Japonesa", descricao: "Limonada com gengibre e hortelã", preco: 14.0, id_categoria: 7, categoria_nome: "Bebidas", imagem_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400", ativo: true },
    { id_produto: 32, nome: "Mochi", descricao: "Doce japonês de arroz recheado", preco: 16.0, id_categoria: 8, categoria_nome: "Sobremesas", imagem_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", ativo: true },
    { id_produto: 33, nome: "Harumaki Doce", descricao: "Rolinho de banana com chocolate", preco: 18.0, id_categoria: 8, categoria_nome: "Sobremesas", imagem_url: "https://images.unsplash.com/photo-1559181567-c3190ca9d714?w=400", ativo: true },
    { id_produto: 34, nome: "Tempurá de Sorvete", descricao: "Sorvete empanado e frito", preco: 20.0, id_categoria: 8, categoria_nome: "Sobremesas", imagem_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", ativo: true }
  ];

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/categories", async (req, res) => {
    try {
      res.json(mockCategories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      res.json(mockProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      res.json(mockProducts.slice(0, 6));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  let mockOrders: any[] = [];
  let mockReservations: any[] = [];
  let mockIdCounter = 1;

  app.get("/api/orders", async (req, res) => {
    try {
      res.json(mockOrders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, total, customerName, email } = req.body;
      const orderId = mockIdCounter++;
      const newOrder = {
        id_pedido: orderId,
        valor_total: total,
        status: "Pendente",
        data_pedido: new Date().toISOString(),
        itens_pedido: items.map((item: any) => ({
          quantidade: item.quantity,
          preco_unitario: item.preco,
          produtos: { nome: item.nome }
        }))
      };
      mockOrders = [newOrder, ...mockOrders];
      res.json({ success: true, orderId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reservations", async (req, res) => {
    try {
      res.json(mockReservations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const { 
        nome, 
        telefone, 
        phone, 
        email, 
        data, 
        horario, 
        pessoas, 
        tipo_mesa, 
        ocasiao, 
        observacoes, 
        mesa_numero, 
        status 
      } = req.body;

      const newReservation = {
        id_reserva: mockIdCounter++,
        nome,
        phone: phone || telefone,
        email,
        data,
        horario,
        pessoas: parseInt(pessoas),
        tipo_mesa: tipo_mesa || 'Interna',
        ocasiao: ocasiao || 'Nenhuma',
        observacoes,
        mesa_numero: mesa_numero ? parseInt(mesa_numero) : null,
        status: status || 'pendente',
        data_criacao: new Date().toISOString()
      };

      mockReservations = [newReservation, ...mockReservations];
      res.json({ success: true, reservationId: newReservation.id_reserva });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seed Endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      const correctCategories = [
        "Entradas", "Combinados", "Sushis", "Sashimis", "Temakis", "Pratos Quentes", "Bebidas", "Sobremesas"
      ];
      // Categorias antigas do migration (singular) que devem ser removidas
      const legacyCategories = ["Sushi", "Sashimi", "Temaki"];

      // 1. Remover categorias antigas (singular) para evitar conflito de filtro
      for (const legacyCat of legacyCategories) {
        const { data: legacyData } = await supabase.from("categorias").select("*").eq("nome", legacyCat);
        if (legacyData && legacyData.length > 0) {
          // Mover produtos dessas categorias para null antes de deletar
          await supabase.from("produtos").delete().eq("id_categoria", legacyData[0].id_categoria);
          await supabase.from("categorias").delete().eq("nome", legacyCat);
        }
      }

      // 2. Garantir categorias corretas (plural)
      const { data: existingCats } = await supabase.from("categorias").select("*");
      for (const catName of correctCategories) {
        if (!existingCats || !existingCats.find(c => c.nome === catName)) {
          await supabase.from("categorias").insert({ nome: catName });
        }
      }

      const { data: dbCats } = await supabase.from("categorias").select("*");
      const getCatId = (name: string) => dbCats?.find(c => c.nome === name)?.id_categoria;

      const products = [
        // Entradas
        { nome: "Missoshiru", descricao: "Sopa tradicional de missô com tofu e cebolinha", preco: 14.0, id_categoria: getCatId("Entradas"), imagem_url: "https://i.pinimg.com/1200x/54/8d/70/548d707d6d37522122b47c86012495d7.jpg", ativo: true },
        { nome: "Gyoza (6 un.)", descricao: "Pastéis japoneses grelhados com carne suína e legumes", preco: 28.0, id_categoria: getCatId("Entradas"), imagem_url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400", ativo: true },
        { nome: "Harumaki (4 un.)", descricao: "Rolinho primavera crocante", preco: 22.0, id_categoria: getCatId("Entradas"), imagem_url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400", ativo: true },
        { nome: "Sunomono", descricao: "Salada agridoce de pepino com gergelim", preco: 18.0, id_categoria: getCatId("Entradas"), imagem_url: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400", ativo: true },
        { nome: "Edamame", descricao: "Vagens de soja cozidas e levemente salgadas", preco: 16.0, id_categoria: getCatId("Entradas"), imagem_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400", ativo: true },
        // Combinados
        { nome: "Combinado Clássico (20 peças)", descricao: "10 sashimis + 10 sushis variados", preco: 89.0, id_categoria: getCatId("Combinados"), imagem_url: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400", ativo: true },
        { nome: "Combinado Especial (40 peças)", descricao: "Sashimis, niguiris, uramakis e hot rolls", preco: 159.0, id_categoria: getCatId("Combinados"), imagem_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400", ativo: true },
        { nome: "Combinado Premium (60 peças)", descricao: "Seleção do chef com peixes nobres", preco: 229.0, id_categoria: getCatId("Combinados"), imagem_url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400", ativo: true },
        // Sushis
        { nome: "Niguiri de Salmão (2 un.)", descricao: "Sushi tradicional com fatia de salmão fresco", preco: 18.0, id_categoria: getCatId("Sushis"), imagem_url: "https://images.unsplash.com/photo-1617196034099-cb2b73c71966?w=400", ativo: true },
        { nome: "Niguiri de Atum (2 un.)", descricao: "Sushi tradicional com fatia de atum fresco", preco: 20.0, id_categoria: getCatId("Sushis"), imagem_url: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400", ativo: true },
        { nome: "Niguiri de Camarão (2 un.)", descricao: "Sushi com camarão temperado", preco: 19.0, id_categoria: getCatId("Sushis"), imagem_url: "https://images.unsplash.com/photo-1617196034096-e3d28cb1c3c8?w=400", ativo: true },
        { nome: "Joe de Salmão (2 un.)", descricao: "Com cream cheese e molho especial", preco: 22.0, id_categoria: getCatId("Sushis"), imagem_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400", ativo: true },
        // Sashimis
        { nome: "Sashimi de Salmão (10 fatias)", descricao: "Fatias frescas de salmão premium", preco: 65.0, id_categoria: getCatId("Sashimis"), imagem_url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400", ativo: true },
        { nome: "Sashimi de Atum (10 fatias)", descricao: "Fatias frescas de atum premium", preco: 70.0, id_categoria: getCatId("Sashimis"), imagem_url: "https://images.unsplash.com/photo-1648146703765-b1b3bb788e14?w=400", ativo: true },
        { nome: "Sashimi Misto (15 fatias)", descricao: "Seleção de peixes variados", preco: 95.0, id_categoria: getCatId("Sashimis"), imagem_url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400", ativo: true },
        // Temakis
        { nome: "Temaki de Salmão", descricao: "Cone de alga com salmão e arroz", preco: 26.0, id_categoria: getCatId("Temakis"), imagem_url: "https://images.unsplash.com/photo-1617196034096-e3d28cb1c3c8?w=400", ativo: true },
        { nome: "Temaki de Salmão com Cream Cheese", descricao: "Cone de alga com salmão e cream cheese", preco: 29.0, id_categoria: getCatId("Temakis"), imagem_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400", ativo: true },
        { nome: "Temaki Califórnia", descricao: "Kani, manga e pepino", preco: 24.0, id_categoria: getCatId("Temakis"), imagem_url: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400", ativo: true },
        { nome: "Temaki Hot", descricao: "Empanado e crocante", preco: 27.0, id_categoria: getCatId("Temakis"), imagem_url: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400", ativo: true },
        // Pratos Quentes
        { nome: "Yakissoba", descricao: "Frango, carne ou misto — macarrão japonês salteado", preco: 45.0, id_categoria: getCatId("Pratos Quentes"), imagem_url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400", ativo: true },
        { nome: "Teppan de Salmão", descricao: "Salmão grelhado com legumes na chapa", preco: 68.0, id_categoria: getCatId("Pratos Quentes"), imagem_url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400", ativo: true },
        { nome: "Tempurá de Camarão (6 un.)", descricao: "Camarões empanados em massa leve e crocante", preco: 55.0, id_categoria: getCatId("Pratos Quentes"), imagem_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", ativo: true },
        { nome: "Frango Teriyaki", descricao: "Frango grelhado com molho agridoce japonês", preco: 48.0, id_categoria: getCatId("Pratos Quentes"), imagem_url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400", ativo: true },
        // Bebidas
        { nome: "Refrigerantes", descricao: "Lata 350ml gelada", preco: 8.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", ativo: true },
        { nome: "Sucos Naturais", descricao: "Laranja, limão ou maracujá", preco: 12.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400", ativo: true },
        { nome: "Chá Verde", descricao: "Chá verde japonês quente ou gelado", preco: 10.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", ativo: true },
        { nome: "Saquê", descricao: "Destilado japonês de arroz, quente ou frio", preco: 22.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400", ativo: true },
        { nome: "Água com Gás", descricao: "Água mineral gaseificada gelada", preco: 6.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400", ativo: true },
        { nome: "Cerveja Sapporo", descricao: "Cerveja japonesa gelada long neck 330ml", preco: 18.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", ativo: true },
        { nome: "Chá de Jasmim", descricao: "Chá floral japonês quente ou gelado", preco: 11.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400", ativo: true },
        { nome: "Limonada Japonesa", descricao: "Limonada com gengibre e hortelã", preco: 14.0, id_categoria: getCatId("Bebidas"), imagem_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400", ativo: true },
        // Sobremesas
        { nome: "Mochi", descricao: "Doce japonês de arroz recheado", preco: 16.0, id_categoria: getCatId("Sobremesas"), imagem_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", ativo: true },
        { nome: "Harumaki Doce", descricao: "Rolinho de banana com chocolate", preco: 18.0, id_categoria: getCatId("Sobremesas"), imagem_url: "https://images.unsplash.com/photo-1559181567-c3190ca9d714?w=400", ativo: true },
        { nome: "Tempurá de Sorvete", descricao: "Sorvete empanado e frito", preco: 20.0, id_categoria: getCatId("Sobremesas"), imagem_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", ativo: true }
      ];

      // Só inserir produtos se a tabela estiver vazia (evita duplicatas a cada reload)
      const { data: existingProducts } = await supabase.from("produtos").select("id_produto").limit(1);
      if (!existingProducts || existingProducts.length === 0) {
        await supabase.from("produtos").insert(products);
      }


      const mesas = [
        { numero: 1, capacidade: 2, zona: 'salao', status: 'livre' },
        { numero: 2, capacidade: 2, zona: 'salao', status: 'livre' },
        { numero: 3, capacidade: 4, zona: 'salao', status: 'livre' },
        { numero: 4, capacidad: 4, zona: 'salao', status: 'livre' },
        { numero: 5, capacidade: 6, zona: 'salao', status: 'livre' },
        { numero: 6, capacidade: 6, zona: 'salao', status: 'livre' },
        { numero: 7, capacidade: 2, zona: 'externa', status: 'livre' },
        { numero: 8, capacidade: 2, zona: 'externa', status: 'livre' },
        { numero: 9, capacidade: 4, zona: 'externa', status: 'livre' },
        { numero: 10, capacidade: 4, zona: 'externa', status: 'livre' },
        { numero: 11, capacidade: 4, zona: 'tatame', status: 'livre' },
        { numero: 12, capacidade: 4, zona: 'tatame', status: 'livre' },
        { numero: 13, capacidade: 6, zona: 'tatame', status: 'livre' }
      ];

      const { data: existingMesas } = await supabase.from("mesas").select("*");
      if (!existingMesas || existingMesas.length === 0) {
        await supabase.from("mesas").insert(mesas);
      }

      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image upload proxy (optional, but good for security)
  app.post("/api/upload", async (req, res) => {
    // This would handle file uploads to Supabase Storage
    // For now, we assume the client might do it directly or send a URL
    res.status(501).json({ error: "Upload via server not implemented. Use Supabase SDK on client or send URL." });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Supabase integration active: ${supabaseUrl}`);
  });
}

startServer();
