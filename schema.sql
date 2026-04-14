-- Script SQL para criação do banco de dados Kaze Modern Japanese (PostgreSQL/Supabase)

-- 1. CATEGORIAS
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nome TEXT NOT NULL
);

-- 2. CLIENTES
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUTOS
CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    id_categoria INTEGER REFERENCES categorias(id_categoria),
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT TRUE
);

-- 4. PEDIDOS
CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Pendente',
    valor_total DECIMAL(10,2) NOT NULL
);

-- 5. ITENS_PEDIDO
CREATE TABLE itens_pedido (
    id_item SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_produto INTEGER REFERENCES produtos(id_produto),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL
);

-- 6. ENDEREÇOS
CREATE TABLE enderecos (
    id_endereco SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    rua TEXT NOT NULL,
    numero TEXT NOT NULL,
    cidade TEXT NOT NULL,
    complemento TEXT
);

-- 7. PAGAMENTOS
CREATE TABLE pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'Cartão', 'Pix', 'Dinheiro'
    status TEXT DEFAULT 'Pendente',
    valor DECIMAL(10,2) NOT NULL
);

-- 8. ENTREGADORES
CREATE TABLE entregadores (
    id_entregador SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT
);

-- 9. ENTREGAS
CREATE TABLE entregas (
    id_entrega SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    id_entregador INTEGER REFERENCES entregadores(id_entregador),
    status TEXT DEFAULT 'Em preparo',
    tempo_estimado INTEGER -- em minutos
);

-- 10. AVALIAÇÕES
CREATE TABLE avaliacoes (
    id_avaliacao SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id_cliente),
    id_pedido INTEGER REFERENCES pedidos(id_pedido),
    nota INTEGER CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT
);

-- 11. RESERVAS
CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    pessoas INTEGER NOT NULL,
    tipo_mesa TEXT,
    ocasiao TEXT,
    observacoes TEXT,
    mesa_numero INTEGER,
    status TEXT DEFAULT 'pendente',
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. MESAS
CREATE TABLE mesas (
    id_mesa SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    capacidade INTEGER NOT NULL,
    zona TEXT NOT NULL, -- 'salao', 'externa', 'tatame'
    status TEXT DEFAULT 'livre' -- 'livre', 'ocupada'
);

-- INSERÇÃO DE DADOS INICIAIS (SEED)
INSERT INTO mesas (numero, capacidade, zona, status) VALUES 
(1, 2, 'salao', 'livre'), (2, 2, 'salao', 'livre'), (3, 4, 'salao', 'livre'), 
(4, 4, 'salao', 'livre'), (5, 6, 'salao', 'livre'), (6, 6, 'salao', 'livre'),
(7, 2, 'externa', 'livre'), (8, 2, 'externa', 'livre'), (9, 4, 'externa', 'livre'), (10, 4, 'externa', 'livre'),
(11, 4, 'tatame', 'livre'), (12, 4, 'tatame', 'livre'), (13, 6, 'tatame', 'livre');

INSERT INTO categorias (nome) VALUES 
('Sushi'), ('Sashimi'), ('Temaki'), ('Pratos Quentes'), ('Bebidas'), ('Sobremesas');

INSERT INTO produtos (nome, descricao, preco, id_categoria, imagem_url, ativo) VALUES 
('Combo Salmão 16pcs', '8 hossomaki, 4 niguiri, 4 uramaki', 55.00, 1, 'https://i.pinimg.com/736x/d5/c6/0c/d5c60c155f3ef6db769bb120d937532e.jpg', true),
('Sashimi Salmão 10pcs', 'Fatias frescas de salmão premium', 45.00, 2, 'https://i.pinimg.com/736x/7b/38/dc/7b38dca9a2cb4b7c835b94bf1a56e6d9.jpg', true),
('Temaki Filadélfia', 'Salmão, cream cheese e cebolinha', 28.00, 3, 'https://i.pinimg.com/1200x/89/dd/d8/89ddd890c09ad34b6f3e0de7ccd914cb.jpg', true),
('Yakisoba Misto', 'Carne, frango e legumes selecionados', 42.00, 4, 'https://i.pinimg.com/1200x/39/49/8d/39498ddcf52aa0ac9028a905696c7a4a.jpg', true),
('Uramaki Ebi', 'Camarão empanado e cream cheese', 35.00, 1, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800', true),
('Hot Roll 10pcs', 'Sushi empanado crocante com salmão', 32.00, 1, 'https://images.unsplash.com/photo-1559700015-59770675d3f9?auto=format&fit=crop&q=80&w=800', true);
