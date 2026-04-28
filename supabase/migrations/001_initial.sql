-- ============================================================
-- Kaze - Schema inicial para Supabase
-- Execute no painel: Supabase > SQL Editor > New query
-- ============================================================

-- Tabelas
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produtos (
  id_produto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco FLOAT NOT NULL,
  id_categoria BIGINT REFERENCES categorias(id_categoria),
  imagem_url TEXT,
  ativo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT,
  email TEXT UNIQUE,
  telefone TEXT,
  data_cadastro DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente BIGINT REFERENCES clientes(id_cliente),
  valor_total FLOAT,
  status TEXT DEFAULT 'Pendente',
  data_pedido TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id_item BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT REFERENCES pedidos(id_pedido),
  id_produto BIGINT REFERENCES produtos(id_produto),
  quantidade INTEGER,
  preco_unitario FLOAT
);

CREATE TABLE IF NOT EXISTS reservas (
  id_reserva BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mesas (
  id_mesa BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  numero INTEGER UNIQUE,
  capacidade INTEGER,
  zona TEXT,
  status TEXT DEFAULT 'livre'
);

-- Desabilitar RLS (desenvolvimento)
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;
ALTER TABLE mesas DISABLE ROW LEVEL SECURITY;

-- Seed: Categorias
INSERT INTO categorias (nome) VALUES
  ('Entradas'), ('Combinados'), ('Sushis'), ('Sashimis'),
  ('Temakis'), ('Pratos Quentes'), ('Bebidas'), ('Sobremesas')
ON CONFLICT (nome) DO NOTHING;

-- Seed: Produtos
INSERT INTO produtos (nome, descricao, preco, id_categoria, imagem_url, ativo) VALUES
  ('Missoshiru', 'Sopa tradicional de missô com tofu e cebolinha', 14.0, (SELECT id_categoria FROM categorias WHERE nome = 'Entradas'), 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', 1),
  ('Gyoza (6 un.)', 'Pastéis japoneses grelhados com carne suína e legumes', 28.0, (SELECT id_categoria FROM categorias WHERE nome = 'Entradas'), 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80', 1),
  ('Harumaki (4 un.)', 'Rolinho primavera crocante recheado com legumes', 22.0, (SELECT id_categoria FROM categorias WHERE nome = 'Entradas'), 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=600&q=80', 1),
  ('Sunomono', 'Salada agridoce de pepino com gergelim', 18.0, (SELECT id_categoria FROM categorias WHERE nome = 'Entradas'), 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=600&q=80', 1),
  ('Edamame', 'Vagens de soja cozidas e levemente salgadas', 16.0, (SELECT id_categoria FROM categorias WHERE nome = 'Entradas'), 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 1),
  ('Combinado Clássico (20 peças)', '10 sashimis + 10 sushis variados', 89.0, (SELECT id_categoria FROM categorias WHERE nome = 'Combinados'), 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?auto=format&fit=crop&w=600&q=80', 1),
  ('Combinado Especial (40 peças)', 'Sashimis, niguiris, uramakis e hot rolls', 159.0, (SELECT id_categoria FROM categorias WHERE nome = 'Combinados'), 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80', 1),
  ('Combinado Premium (60 peças)', 'Seleção do chef com peixes nobres', 229.0, (SELECT id_categoria FROM categorias WHERE nome = 'Combinados'), 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80', 1),
  ('Niguiri de Salmão (2 un.)', 'Sushi tradicional com fatia de salmão fresco', 18.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sushis'), 'https://images.unsplash.com/photo-1617196034099-cb2b73c71966?auto=format&fit=crop&w=600&q=80', 1),
  ('Niguiri de Atum (2 un.)', 'Sushi tradicional com fatia de atum fresco', 20.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sushis'), 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=600&q=80', 1),
  ('Niguiri de Camarão (2 un.)', 'Sushi com camarão temperado', 19.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sushis'), 'https://images.unsplash.com/photo-1635361177735-4083abb84570?auto=format&fit=crop&w=600&q=80', 1),
  ('Joe de Salmão (2 un.)', 'Com cream cheese e molho especial', 22.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sushis'), 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80', 1),
  ('Sashimi de Salmão (10 fatias)', 'Fatias frescas de salmão premium', 65.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sashimis'), 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80', 1),
  ('Sashimi de Atum (10 fatias)', 'Fatias frescas de atum premium', 70.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sashimis'), 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=600&q=80', 1),
  ('Sashimi Misto (15 fatias)', 'Seleção de peixes variados do chef', 95.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sashimis'), 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80', 1),
  ('Temaki de Salmão', 'Cone de alga com salmão fresco e arroz de sushi', 26.0, (SELECT id_categoria FROM categorias WHERE nome = 'Temakis'), 'https://images.unsplash.com/photo-1617196034096-e3d28cb1c3c8?auto=format&fit=crop&w=600&q=80', 1),
  ('Temaki de Salmão com Cream Cheese', 'Cone de alga com salmão e cream cheese', 29.0, (SELECT id_categoria FROM categorias WHERE nome = 'Temakis'), 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=600&q=80', 1),
  ('Temaki Califórnia', 'Kani, manga e pepino em cone de alga', 24.0, (SELECT id_categoria FROM categorias WHERE nome = 'Temakis'), 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?auto=format&fit=crop&w=600&q=80', 1),
  ('Temaki Hot', 'Camarão empanado e crocante com molho especial', 27.0, (SELECT id_categoria FROM categorias WHERE nome = 'Temakis'), 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80', 1),
  ('Yakissoba', 'Frango, carne ou misto — macarrão japonês salteado', 45.0, (SELECT id_categoria FROM categorias WHERE nome = 'Pratos Quentes'), 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80', 1),
  ('Teppan de Salmão', 'Salmão grelhado com legumes frescos na chapa', 68.0, (SELECT id_categoria FROM categorias WHERE nome = 'Pratos Quentes'), 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=600&q=80', 1),
  ('Tempurá de Camarão (6 un.)', 'Camarões empanados em massa leve e crocante', 55.0, (SELECT id_categoria FROM categorias WHERE nome = 'Pratos Quentes'), 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', 1),
  ('Frango Teriyaki', 'Frango grelhado com molho agridoce japonês', 48.0, (SELECT id_categoria FROM categorias WHERE nome = 'Pratos Quentes'), 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80', 1),
  ('Refrigerantes', 'Lata 350ml gelada', 8.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80', 1),
  ('Sucos Naturais', 'Laranja, limão ou maracujá', 12.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80', 1),
  ('Chá Verde', 'Chá verde japonês quente ou gelado', 10.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', 1),
  ('Saquê', 'Destilado japonês de arroz, quente ou frio', 22.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=600&q=80', 1),
  ('Água com Gás', 'Água mineral gaseificada gelada 500ml', 6.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80', 1),
  ('Cerveja Sapporo', 'Cerveja japonesa gelada long neck 330ml', 18.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80', 1),
  ('Chá de Jasmim', 'Chá floral japonês quente ou gelado', 11.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', 1),
  ('Limonada Japonesa', 'Limonada com gengibre e hortelã frescos', 14.0, (SELECT id_categoria FROM categorias WHERE nome = 'Bebidas'), 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=80', 1),
  ('Mochi', 'Doce japonês de arroz glutinoso recheado', 16.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sobremesas'), 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', 1),
  ('Harumaki Doce', 'Rolinho crocante de banana com chocolate', 18.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sobremesas'), 'https://images.unsplash.com/photo-1559181567-c3190ca9d714?auto=format&fit=crop&w=600&q=80', 1),
  ('Tempurá de Sorvete', 'Sorvete empanado e levemente frito, crocante por fora e gelado por dentro', 20.0, (SELECT id_categoria FROM categorias WHERE nome = 'Sobremesas'), 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80', 1)
ON CONFLICT DO NOTHING;

-- Seed: Mesas
INSERT INTO mesas (numero, capacidade, zona, status) VALUES
  (1, 2, 'salao', 'livre'), (2, 2, 'salao', 'livre'),
  (3, 4, 'salao', 'livre'), (4, 4, 'salao', 'livre'),
  (5, 6, 'salao', 'livre'), (6, 6, 'salao', 'livre'),
  (7, 2, 'externa', 'livre'), (8, 2, 'externa', 'livre'),
  (9, 4, 'externa', 'livre'), (10, 4, 'externa', 'livre'),
  (11, 4, 'tatame', 'livre'), (12, 4, 'tatame', 'livre'),
  (13, 6, 'tatame', 'livre')
ON CONFLICT (numero) DO NOTHING;
