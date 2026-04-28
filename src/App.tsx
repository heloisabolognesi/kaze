import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * 🗄️ SQL PARA RODAR NO SUPABASE (Caso as colunas não existam)
 * 
 * -- Corrigir tabela reservas
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS phone TEXT;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS email TEXT;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS pessoas INTEGER;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS tipo_mesa TEXT;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS ocasiao TEXT;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS observacoes TEXT;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS mesa_numero INTEGER;
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
 * ALTER TABLE reservas ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMPTZ DEFAULT NOW();
 * 
 * -- Corrigir tabela pedidos
 * ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS data_pedido TIMESTAMPTZ DEFAULT NOW();
 * ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'recebido';
 * ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS valor_total REAL;
 * 
 * -- Corrigir tabela itens_pedido
 * ALTER TABLE itens_pedido ADD COLUMN IF NOT EXISTS quantidade INTEGER;
 * ALTER TABLE itens_pedido ADD COLUMN IF NOT EXISTS preco_unitario REAL;
 * 
 * -- Corrigir tabela pagamentos
 * ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS tipo TEXT;
 * ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
 * ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS valor REAL;
 * 
 * -- Corrigir tabela clientes
 * ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nome TEXT;
 * ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefone TEXT;
 * ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_cadastro DATE DEFAULT CURRENT_DATE;
 */

import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  UtensilsCrossed,
  History,
  Menu as MenuIcon,
  X,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Truck,
  Store,
  CheckCircle2,
  Award,
  Users,
  Flame,
  Leaf,
  Castle,
  Armchair,
  Info
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Types
interface Product {
  id_produto: number;
  nome: string;
  descricao: string;
  preco: number;
  id_categoria: number;
  categoria_nome: string;
  imagem_url: string;
}

interface Category {
  id_categoria: number;
  nome: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id_pedido: number;
  data_pedido: string;
  status: string;
  valor_total: number;
  itens_pedido?: any[];
}

interface Reservation {
  id_reserva: number;
  nome: string;
  phone: string;
  email?: string;
  data: string;
  horario: string;
  pessoas: number;
  tipo_mesa?: string;
  ocasiao?: string;
  observacoes?: string;
  mesa_numero?: number;
  status: string;
  data_criacao?: string;
}

export default function App() {
  const [perfilAtivo, setPerfilAtivo] = useState<"cliente" | "admin">("cliente");
  const [view, setView] = useState<"home" | "menu" | "reservations" | "orders">("home");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      // Seed if empty
      await fetch("/api/seed", { method: "POST" });
      
      const [catsRes, prodsRes, featRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products"),
        fetch("/api/products/featured")
      ]);
      setCategories(await catsRes.json());
      setProducts(await prodsRes.json());
      setFeaturedProducts(await featRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (view === "orders" || perfilAtivo === "admin") {
      fetch("/api/orders").then(res => res.json()).then(setOrders);
    }
    if (view === "reservations" || perfilAtivo === "admin") {
      fetch("/api/reservations").then(res => res.json()).then(setReservations);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, perfilAtivo]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    id: number;
    nome: string;
    itens: CartItem[];
    total: number;
    tipoPagamento: string;
    tipoEntrega: string;
  } | null>(null);
  const [reservaSuccess, setReservaSuccess] = useState<{
    nome: string;
    data: string;
    horario: string;
    pessoas: number;
    mesa: number;
    ocasiao: string;
    tipo_mesa: string;
  } | null>(null);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id_produto === product.id_produto);
      if (existing) {
        return prev.map(item => 
          item.id_produto === product.id_produto 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.nome} adicionado ao carrinho`);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id_produto !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id_produto === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total: cartTotal,
          customerName: "Visitante"
        })
      });
      if (res.ok) {
        toast.success("Pedido realizado com sucesso!");
        setCart([]);
        setView("orders");
      }
    } catch (error) {
      toast.error("Erro ao realizar pedido");
    }
  };

  const handleReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          phone: data.telefone, // Mapeando telefone para phone
          email: data.email,
          data: data.data,
          horario: data.horario,
          pessoas: parseInt(data.pessoas as string),
          tipo_mesa: data.tipo_mesa || 'Interna',
          ocasiao: data.ocasiao || 'Nenhuma',
          observacoes: data.observacoes,
          mesa_numero: data.mesa_numero ? parseInt(data.mesa_numero as string) : null,
          status: 'pendente'
        })
      });
      if (res.ok) {
        toast.success("Reserva solicitada com sucesso!");
        setView("reservations");
        fetchData(); // Atualizar dados
      }
    } catch (error) {
      toast.error("Erro ao solicitar reserva");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground japanese-pattern">
      <Toaster position="top-center" theme="dark" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("home")}>
                <div className="w-12 h-12 rounded-2xl red-gradient flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">風</div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tighter uppercase leading-none">Kaze</span>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Premium Sushi</span>
                </div>
              </div>

              {/* Profile Toggle */}
              <div className="hidden lg:flex items-center gap-2 ml-4">
                <button 
                  onClick={() => setPerfilAtivo("cliente")}
                  className={`btn-perfil ${perfilAtivo === "cliente" ? "ativo" : ""}`}
                >
                  🧑 Área do Cliente
                </button>
                <button 
                  onClick={() => setPerfilAtivo("admin")}
                  className={`btn-perfil ${perfilAtivo === "admin" ? "ativo" : ""}`}
                >
                  ⚙️ Painel Admin
                </button>
              </div>
            </div>
            
            {perfilAtivo === "cliente" && (
              <div className="hidden md:flex items-center gap-10">
                <button onClick={() => setView("home")} className={`text-xs font-bold uppercase tracking-widest transition-all hover:text-primary relative group ${view === "home" ? "text-primary" : "text-muted-foreground"}`}>
                  Início
                  <span className={`absolute -bottom-2 left-0 h-0.5 bg-primary transition-all ${view === "home" ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
                <button onClick={() => setView("menu")} className={`text-xs font-bold uppercase tracking-widest transition-all hover:text-primary relative group ${view === "menu" ? "text-primary" : "text-muted-foreground"}`}>
                  Cardápio
                  <span className={`absolute -bottom-2 left-0 h-0.5 bg-primary transition-all ${view === "menu" ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
                <button onClick={() => setView("reservations")} className={`text-xs font-bold uppercase tracking-widest transition-all hover:text-primary relative group ${view === "reservations" ? "text-primary" : "text-muted-foreground"}`}>
                  Reservas
                  <span className={`absolute -bottom-2 left-0 h-0.5 bg-primary transition-all ${view === "reservations" ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
                <button onClick={() => setView("orders")} className={`text-xs font-bold uppercase tracking-widest transition-all hover:text-primary relative group ${view === "orders" ? "text-primary" : "text-muted-foreground"}`}>
                  Pedidos
                  <span className={`absolute -bottom-2 left-0 h-0.5 bg-primary transition-all ${view === "orders" ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-6">
              {perfilAtivo === "cliente" && (
                <CartSheet 
                  cart={cart} 
                  updateQuantity={updateQuantity} 
                  removeFromCart={removeFromCart} 
                  total={cartTotal}
                  onCheckoutClick={() => setIsCheckoutOpen(true)}
                />
              )}
              <button className="md:hidden text-white">
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CheckoutDialog 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        cart={cart} 
        total={cartTotal} 
        onSuccess={(info) => {
          setCart([]);
          setOrderSuccess(info);
          setIsCheckoutOpen(false);
        }}
      />

      <OrderSuccessModal data={orderSuccess} onClose={() => setOrderSuccess(null)} />
      <ReservaSuccessModal data={reservaSuccess} onClose={() => setReservaSuccess(null)} />

      {/* Main Content */}
      <main className="pt-24">
        <AnimatePresence mode="wait">
          {perfilAtivo === "cliente" ? (
            <div key="cliente-view">
              {view === "home" && <HomeView setView={setView} featuredProducts={featuredProducts} addToCart={addToCart} />}
              {view === "menu" && (
                <MenuView 
                  products={products} 
                  categories={categories} 
                  addToCart={addToCart} 
                  loading={loading}
                />
              )}
              {view === "reservations" && (
                <ReservationsView 
                  reservations={reservations} 
                  onReservaSuccess={(info) => {
                    setReservaSuccess(info);
                    fetchData(); // Refresh data
                  }}
                />
              )}
              {view === "orders" && <OrdersView orders={orders} />}
            </div>
          ) : (
            <AdminView 
              products={products}
              categories={categories}
              reservations={reservations}
              orders={orders}
              refreshData={fetchData}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {perfilAtivo === "cliente" && (
        <footer className="bg-muted py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-16">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl red-gradient flex items-center justify-center text-white font-black text-2xl">風</div>
                  <span className="text-3xl font-black tracking-tighter uppercase">Kaze</span>
                </div>
                <p className="text-muted-foreground max-w-sm mb-10 text-lg leading-relaxed">
                  Elevando a culinária japonesa a um novo patamar de sofisticação e sabor. Uma experiência gastronômica desenhada para os paladares mais exigentes.
                </p>
                <div className="flex gap-6">
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-primary hover:text-background transition-all">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-primary hover:text-background transition-all">
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-primary hover:text-background transition-all">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold uppercase tracking-widest mb-8 text-xs text-primary">Navegação</h4>
                <ul className="space-y-5 text-sm font-medium">
                  <li><button onClick={() => setView("home")} className="text-muted-foreground hover:text-white transition-colors">Início</button></li>
                  <li><button onClick={() => setView("menu")} className="text-muted-foreground hover:text-white transition-colors">Cardápio</button></li>
                  <li><button onClick={() => setView("reservations")} className="text-muted-foreground hover:text-white transition-colors">Reservas</button></li>
                  <li><button onClick={() => setView("orders")} className="text-muted-foreground hover:text-white transition-colors">Meus Pedidos</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-widest mb-8 text-xs text-primary">Localização</h4>
                <ul className="space-y-6 text-sm text-muted-foreground">
                  <li className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <span className="leading-relaxed">Alameda Santos, 2159<br />Jardins, São Paulo - SP</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <span>+55 (11) 3088-0000</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <span>Diariamente: 18h - 00h</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-16 bg-white/5" />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
              <p>© 2026 KAZE PREMIUM JAPANESE. ALL RIGHTS RESERVED.</p>
              <div className="flex gap-10">
                <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function AdminView({ products, categories, reservations, orders, refreshData }: { 
  products: Product[], 
  categories: Category[], 
  reservations: Reservation[], 
  orders: Order[],
  refreshData: () => void
}) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter text-gradient">Painel Administrativo</h2>
          <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-black mt-2">Gestão Kaze Premium</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-white/5 p-1 rounded-xl border border-white/5 h-auto flex flex-wrap">
            <TabsTrigger value="dashboard" className="rounded-lg px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="cardapio" className="rounded-lg px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Cardápio</TabsTrigger>
            <TabsTrigger value="reservas" className="rounded-lg px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Reservas</TabsTrigger>
            <TabsTrigger value="pedidos" className="rounded-lg px-6 py-3 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Pedidos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-12">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card rounded-[2rem] p-8">
              <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-black mb-4">Pedidos Hoje</p>
              <h3 className="text-6xl font-black">{orders.length}</h3>
            </Card>
            <Card className="glass-card rounded-[2rem] p-8">
              <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-black mb-4">Reservas Hoje</p>
              <h3 className="text-6xl font-black">{reservations.length}</h3>
            </Card>
            <Card className="glass-card rounded-[2rem] p-8">
              <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-black mb-4">Receita Estimada</p>
              <h3 className="text-6xl font-black text-primary">R$ {orders.reduce((s, o) => s + o.valor_total, 0).toFixed(2)}</h3>
            </Card>
          </div>
        )}

        {activeTab === "cardapio" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tight">Gerenciar Cardápio</h3>
              <AddProductDialog categories={categories} onProductAdded={refreshData} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <Card key={product.id_produto} className="glass-card rounded-[2rem] overflow-hidden group">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400";
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={product.id_produto % 2 === 0 ? "bg-green-500" : "bg-primary"}>
                        {product.id_produto % 2 === 0 ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">{product.nome}</CardTitle>
                    <CardDescription className="text-xs line-clamp-1">{product.descricao}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-6 pt-0 flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest">Editar</Button>
                    <Button variant="destructive" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest">Excluir</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reservas" && (
          <Card className="glass-card rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-2xl font-black uppercase tracking-tight">Lista de Reservas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-primary">
                  <tr>
                    <th className="p-6">Cliente</th>
                    <th className="p-6">Data</th>
                    <th className="p-6">Hora</th>
                    <th className="p-6">Pessoas</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reservations.map(res => (
                    <tr key={res.id_reserva} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 font-bold">{res.nome}</td>
                      <td className="p-6 text-muted-foreground">{res.data}</td>
                      <td className="p-6 text-muted-foreground">{res.horario}</td>
                      <td className="p-6">{res.pessoas}</td>
                      <td className="p-6">
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Confirmada</Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg border-white/10">Cancelar</Button>
                          <Button size="sm" className="h-8 px-3 text-[8px] font-black uppercase tracking-widest rounded-lg bg-green-500 hover:bg-green-600">Concluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "pedidos" && (
          <div className="space-y-8">
            {orders.map(order => (
              <Card key={order.id_pedido} className="glass-card rounded-[2rem] overflow-hidden">
                <div className="p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pedido #{order.id_pedido} • {new Date(order.data_pedido).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                      <h4 className="text-2xl font-black uppercase tracking-tight">{order.status}</h4>
                    </div>
                  </div>
                  
                  {/* Lista de Itens */}
                  <div className="flex-1 w-full lg:px-8 border-y lg:border-y-0 lg:border-x border-white/5 py-4 lg:py-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Itens do Pedido</p>
                    {order.itens_pedido && order.itens_pedido.length > 0 ? (
                      <div className="space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                        {order.itens_pedido.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground"><strong className="text-white">{item.quantidade}x</strong> {item.produtos?.nome || 'Item avulso'}</span>
                            <span className="font-bold text-white/70">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Nenhum item registrado.</p>
                    )}
                  </div>

                  <div className="flex flex-row items-center gap-8 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                      <p className="text-2xl font-black text-primary">R$ {order.valor_total.toFixed(2)}</p>
                    </div>
                    <Button className="rounded-xl bg-primary text-white h-12 px-6 font-black uppercase tracking-widest text-[10px]">Avançar Status</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AddProductDialog({ categories, onProductAdded }: { categories: Category[], onProductAdded: () => void }) {
  const [imgMode, setImgMode] = useState<"url" | "upload">("url");
  const [preview, setPreview] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-primary text-white px-8 h-12 font-black uppercase tracking-widest text-[10px]">
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </DialogTrigger>
      <SheetContent className="bg-background/95 backdrop-blur-xl border-l border-white/5 w-full sm:max-w-xl p-10">
        <SheetHeader className="mb-10">
          <SheetTitle className="text-4xl font-black uppercase tracking-tighter">Adicionar Produto</SheetTitle>
          <SheetDescription className="uppercase tracking-[0.3em] text-[10px] font-black text-primary">Gestão de Cardápio</SheetDescription>
        </SheetHeader>
        
        <form className="space-y-8">
          <div className="space-y-3">
            <Label className="uppercase tracking-widest text-[10px] font-black text-muted-foreground">Nome do Produto</Label>
            <Input className="rounded-xl h-14 bg-white/5 border-white/10" placeholder="Ex: Sashimi Especial" />
          </div>
          <div className="space-y-3">
            <Label className="uppercase tracking-widest text-[10px] font-black text-muted-foreground">Descrição</Label>
            <Input className="rounded-xl h-14 bg-white/5 border-white/10" placeholder="Ex: 10 fatias de salmão maçaricado" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="uppercase tracking-widest text-[10px] font-black text-muted-foreground">Preço (R$)</Label>
              <Input type="number" step="0.01" className="rounded-xl h-14 bg-white/5 border-white/10" placeholder="0.00" />
            </div>
            <div className="space-y-3">
              <Label className="uppercase tracking-widest text-[10px] font-black text-muted-foreground">Categoria</Label>
              <select className="w-full rounded-xl h-14 bg-white/5 border-white/10 px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                {categories.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Label className="uppercase tracking-widest text-[10px] font-black text-muted-foreground">Imagem</Label>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  type="button"
                  onClick={() => setImgMode("url")}
                  className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${imgMode === "url" ? "bg-primary text-white" : "text-muted-foreground"}`}
                >
                  🔗 URL
                </button>
                <button 
                  type="button"
                  onClick={() => setImgMode("upload")}
                  className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${imgMode === "upload" ? "bg-primary text-white" : "text-muted-foreground"}`}
                >
                  📁 Upload
                </button>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-1">
                {imgMode === "url" ? (
                  <Input 
                    className="rounded-xl h-14 bg-white/5 border-white/10" 
                    placeholder="https://..." 
                    onChange={(e) => setPreview(e.target.value)}
                  />
                ) : (
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="rounded-xl h-14 bg-white/5 border-white/10 pt-4" 
                    onChange={handleFile}
                  />
                )}
              </div>
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 overflow-hidden shrink-0 flex items-center justify-center bg-white/5">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400";
                    }}
                  />
                ) : (
                  <Clock className="w-6 h-6 text-muted-foreground opacity-20" />
                )}
              </div>
            </div>
          </div>

          <Button type="button" className="w-full red-gradient text-white h-16 rounded-xl text-sm uppercase tracking-widest font-black shadow-xl shadow-primary/20">
            Salvar Produto
          </Button>
        </form>
      </SheetContent>
    </Dialog>
  );
}

function HomeView({ setView, featuredProducts, addToCart }: { setView: (v: any) => void, featuredProducts: Product[], addToCart: (p: Product) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 px-6 py-20 lg:px-16 lg:py-20 min-h-screen max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col w-full lg:w-1/2 lg:max-w-[50%] z-20 overflow-visible"
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-black w-fit">
              <Flame className="w-3 h-3 mr-2 fill-primary" /> The Ultimate Sushi Experience
            </Badge>
            <h1 className="uppercase mb-8">
              <span className="block text-white font-black tracking-tight"
                style={{fontSize: 'clamp(72px, 9vw, 130px)', lineHeight: '0.9', letterSpacing: '-2px'}}>
                EXPERIENCE
              </span>
              <span className="block font-bold tracking-widest"
                style={{
                  fontSize: 'clamp(32px, 4vw, 58px)', 
                  color: '#888888',
                  lineHeight: '1.1',
                  letterSpacing: '2px'
                }}>
                THE TASTE OF
              </span>
              <span className="block font-black tracking-tight"
                style={{
                  fontSize: 'clamp(72px, 9vw, 130px)', 
                  color: '#C0392B',
                  lineHeight: '0.9',
                  letterSpacing: '-2px'
                }}>
                EXCELLENCE
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
              Descubra a harmonia perfeita entre ingredientes frescos e técnicas contemporâneas em um ambiente desenhado para o prazer.
            </p>
            <div className="flex flex-wrap gap-6">
              <Button size="lg" className="red-gradient text-white px-12 h-16 text-sm rounded-2xl uppercase tracking-widest font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-all" onClick={() => setView("menu")}>
                Ver Cardápio <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white px-12 h-16 text-sm rounded-2xl uppercase tracking-widest font-black transition-all" onClick={() => setView("reservations")}>
                Reservar Mesa
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-white/5">
              <div>
                <p className="text-3xl font-black text-white mb-1">15+</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Anos de Tradição</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">20k+</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Clientes Felizes</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-1">4.9</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Avaliação Média</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full lg:w-[45%] lg:max-w-[45%] z-10"
          >
            <div className="relative w-full premium-shadow border-4 border-white/5 rounded-2xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=1200" 
                alt="Premium Sushi" 
                className="w-full h-auto max-h-[600px] object-cover transition-transform duration-1000 group-hover:scale-110 rounded-2xl"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e: any) => {
                  e.target.src = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </div>
            
            {/* Decorative Circle */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Promotion Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            whileHover={{ y: -5 }}
            className="w-full glass-card rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />
            
            <div className="relative z-10 max-w-xl">
              <Badge className="mb-6 bg-accent text-white border-none px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-black">Limited Offer</Badge>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
                Get <span className="text-primary">50% OFF</span> <br /> on your first order
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Use o cupom <span className="text-white font-bold">KAZEPREMIUM</span> no checkout e aproveite o melhor da nossa culinária pela metade do preço.
              </p>
              <Button size="lg" className="red-gradient text-white px-10 h-14 text-xs rounded-xl uppercase tracking-widest font-black" onClick={() => setView("menu")}>
                Order Now
              </Button>
            </div>
            
            <div className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden premium-shadow border-2 border-white/10">
              <img 
                src="https://i.pinimg.com/736x/f8/5e/8a/f85e8ac9e185b05ab64a90c83e239e7f.jpg" 
                alt="Promotion" 
                className="w-full h-auto max-h-[400px] object-cover object-center"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e: any) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800";
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-gradient">Onde Excelência <br />Encontra Sabor</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Cada detalhe de nossa experiência foi pensado para elevar seus sentidos a um novo patamar de satisfação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { 
                title: "Ingredientes de Elite", 
                desc: "Trabalhamos apenas com peixes de águas profundas e insumos importados diretamente do Japão.",
                img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=300"
              },
              { 
                title: "Mestres do Sushi", 
                desc: "Nossa equipe é composta por chefs com décadas de experiência nas técnicas mais refinadas da culinária oriental.",
                img: "https://i.pinimg.com/736x/b4/2b/57/b42b57cbd441f1a0a2ee09b58dddc07f.jpg"
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10 group"
              >
                <div className="w-[120px] h-[120px] rounded-[12px] overflow-hidden shrink-0">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = item.title === "Mestres do Sushi" 
                        ? "https://i.pinimg.com/736x/b4/2b/57/b42b57cbd441f1a0a2ee09b58dddc07f.jpg"
                        : "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300";
                    }}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Summary Grid */}
      <section className="py-32 bg-muted/30 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full japanese-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-gradient">Destaques do <br />Cardápio</h2>
              <p className="text-muted-foreground max-w-md">Uma seleção exclusiva das nossas peças mais desejadas.</p>
            </div>
            <Button size="lg" className="rounded-2xl bg-white text-background hover:bg-primary hover:text-background px-10 h-16 uppercase tracking-widest font-black transition-all" onClick={() => setView("menu")}>
              Ver Cardápio Completo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map((product, idx) => (
              <motion.div 
                key={product.id_produto}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="rounded-[2.5rem] border-white/5 bg-white/5 backdrop-blur-md overflow-hidden group hover:bg-white/10 transition-all duration-500 premium-shadow">
                  <div className="aspect-square overflow-hidden relative">
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-t-[2.5rem]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400";
                      }}
                    />
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-primary text-background font-black rounded-full px-4 py-1 border-none uppercase tracking-widest text-[10px]">Featured</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-2xl font-black uppercase tracking-tight">{product.nome}</CardTitle>
                      <span className="text-primary font-black text-xl">R$ {product.preco.toFixed(2)}</span>
                    </div>
                    <CardDescription className="text-muted-foreground line-clamp-2 leading-relaxed">{product.descricao}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-8 pt-4">
                    <Button 
                      className="w-full red-gradient text-white hover:scale-[1.02] transition-all h-14 rounded-xl uppercase tracking-widest font-black"
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-gradient">What Our <br />Guests Say</h2>
            <div className="flex items-center justify-center gap-2">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-6 h-6 fill-primary text-primary" />)}
              <span className="font-black text-xl ml-3">4.9/5.0</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Alex Thompson", text: "The best omakase experience I've had outside of Tokyo. The attention to detail is simply breathtaking.", role: "Food Critic" },
              { name: "Sarah Jenkins", text: "Kaze has become my weekly ritual. The salmon is always incredibly fresh and the atmosphere is so zen.", role: "Regular Guest" },
              { name: "Michael Chen", text: "A perfect fusion of traditional techniques and modern presentation. Highly recommended for special occasions.", role: "Chef" }
            ].map((t, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card rounded-[2.5rem] p-10 space-y-6 relative group"
              >
                <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-12 h-12" />
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="text-lg italic text-muted-foreground leading-relaxed">"{t.text}"</p>
                <div className="pt-6 border-t border-white/5">
                  <p className="font-black uppercase text-sm tracking-widest text-white">{t.name}</p>
                  <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em] mt-1">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chefs Section */}
      <section className="py-32 bg-muted/30 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-gradient">Meet Our Masters</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Os artistas por trás de cada prato, dedicados à perfeição em cada corte.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-start gap-12">
            {[
              { 
                name: "Kenji Sato", 
                specialty: "Mestre em Sashimi e Cortes Nobres", 
                experience: "20 anos de experiência em Tóquio",
                img: "https://i.pinimg.com/736x/d0/aa/21/d0aa21ad69cc2eeeb339f848da812c39.jpg" 
              },
              { 
                name: "Hiroshi Tanaka", 
                specialty: "Mestre em Sushi e Temaki", 
                experience: "15 anos especializando receitas tradicionais",
                img: "https://i.pinimg.com/736x/ce/2e/a3/ce2ea36129e097d6c3d1720b360af123.jpg" 
              }
            ].map((chef, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                className="bg-[#1a1a1a] rounded-2xl p-8 flex flex-col items-center text-center w-full max-w-sm transition-all duration-300"
              >
                <div className="w-[180px] h-[180px] rounded-full border-[3px] border-[#C0392B] overflow-hidden mx-auto mb-4 block">
                  <img 
                    src={chef.img} 
                    alt={chef.name} 
                    className="w-full h-full object-cover object-[center_top]" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://i.pinimg.com/736x/d0/aa/21/d0aa21ad69cc2eeeb339f848da812c39.jpg";
                    }}
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">{chef.name}</h3>
                <p className="text-[#C0392B] font-bold mb-2 uppercase tracking-tight text-sm text-center">{chef.specialty}</p>
                <p className="text-gray-400 text-sm text-center">{chef.experience}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000" 
            alt="Restaurant CTA" 
            className="w-full h-full object-cover opacity-20 grayscale"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e: any) => {
              e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-none text-gradient">Ready for a <br />Banquete?</h2>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
              Não deixe para depois. Reserve sua mesa ou faça seu pedido agora e descubra por que somos referência em culinária japonesa premium.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Button size="lg" className="red-gradient text-white px-16 h-20 text-lg rounded-2xl uppercase tracking-widest font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-all" onClick={() => setView("menu")}>
                Order Online
              </Button>
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white px-16 h-20 text-lg rounded-2xl uppercase tracking-widest font-black transition-all" onClick={() => setView("reservations")}>
                Book a Table
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

function MenuView({ products, categories, addToCart, loading }: { 
  products: Product[], 
  categories: Category[], 
  addToCart: (p: Product) => void,
  loading: boolean
}) {
  const [activeTab, setActiveTab] = useState('entradas');

  // Map database categories to our tab IDs
  const getTabId = (catName: string) => {
    const name = (catName || '').toLowerCase();
    if (name.includes('entrada')) return 'entradas';
    if (name.includes('combinado')) return 'combinados';
    if (name.includes('sushi')) return 'sushis';
    if (name.includes('sashimi')) return 'sashimis';
    if (name.includes('temaki')) return 'temakis';
    if (name.includes('quente')) return 'quentes';
    if (name.includes('bebida')) return 'bebidas';
    if (name.includes('sobremesa')) return 'sobremesas';
    return 'outros';
  };

  const tabs = [
    { id: 'entradas', label: 'Entradas' },
    { id: 'combinados', label: 'Combinados' },
    { id: 'sushis', label: 'Sushis' },
    { id: 'sashimis', label: 'Sashimis' },
    { id: 'temakis', label: 'Temakis' },
    { id: 'quentes', label: 'Pratos Quentes' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'sobremesas', label: 'Sobremesas' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-[1200px] mx-auto px-6 py-[60px] bg-black border-none outline-none shadow-none"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
          The <span className="text-primary">Menu</span>
        </h2>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Explore nossa seleção premium de pratos autênticos preparados com os melhores ingredientes.
        </p>
      </div>

      {/* Custom Tabs System */}
      <div className="flex justify-center flex-wrap gap-3 mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-[10px] rounded-[24px] font-bold transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-[#C0392B] text-white border-none' 
                : 'bg-transparent text-white border-2 border-[#C0392B] hover:bg-[#C0392B]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[400px] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products
            .filter(p => getTabId(p.categoria_nome || '') === activeTab)
            .map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={product.id_produto}
              >
                <Card className="flex flex-col bg-[#1a1a1a] rounded-[16px] overflow-hidden h-full border-none shadow-none group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{product.categoria_nome}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{product.nome}</h3>
                      <span className="text-primary font-black">R$ {product.preco.toFixed(2)}</span>
                    </div>
                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2 flex-1">{product.descricao}</p>
                    <Button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-white/5 hover:bg-primary text-white border border-white/10 hover:border-primary rounded-xl h-12 transition-all font-bold"
                    >
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
      )}
    </motion.div>
  );
}

function ReservationsView({ reservations, onReservaSuccess }: { 
  reservations: Reservation[], 
  onReservaSuccess: (info: any) => void 
}) {
  const [mesas, setMesas] = useState<any[]>([]);
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [filtroCapacidade, setFiltroCapacidade] = useState<number | "Todas">("Todas");
  const [tipoMesa, setTipoMesa] = useState("Interna");
  const [ocasiao, setOcasiao] = useState("Nenhuma");
  const [loading, setLoading] = useState(false);

  const carregarStatusMesas = async () => {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .order('numero', { ascending: true });
    
    if (data) setMesas(data);
    if (error) console.error("Erro ao carregar mesas:", error);
  };

  useEffect(() => {
    carregarStatusMesas();
  }, []);

  const selecionarMesa = (numero: number, capacidade: number, status: string) => {
    if (status === 'ocupada') return;
    setMesaSelecionada(numero);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mesaSelecionada) {
      toast.error("Selecione uma mesa no mapa");
      return;
    }

    setLoading(true);

    try {
      const reservaData: any = {
        nome: (document.getElementById('nomeReserva') as HTMLInputElement).value.trim(),
        phone: (document.getElementById('telefoneReserva') as HTMLInputElement).value.trim(),
        data: (document.getElementById('dataReserva') as HTMLInputElement).value,
        horario: (document.getElementById('horarioReserva') as HTMLSelectElement).value,
        pessoas: parseInt((document.getElementById('pessoasReserva') as HTMLInputElement).value),
        tipo_mesa: tipoMesa || 'interna',
        ocasiao: ocasiao || 'nenhuma',
        mesa_numero: mesaSelecionada,
        status: 'pendente'
      };

      // Adicionar campos opcionais apenas se preenchidos
      const email = (document.getElementById('emailReserva') as HTMLInputElement)?.value?.trim();
      if (email) reservaData.email = email;

      const obs = (document.getElementById('observacoesReserva') as HTMLTextAreaElement)?.value?.trim();
      if (obs) reservaData.observacoes = obs;

      // 1. Inserir reserva
      const { error: resError } = await supabase
        .from('reservas')
        .insert([reservaData]);

      if (resError) throw resError;

      // 2. Atualizar status da mesa
      const { error: mesaError } = await supabase
        .from('mesas')
        .update({ status: 'ocupada' })
        .eq('numero', mesaSelecionada);

      if (mesaError) throw mesaError;

      toast.success("✅ Reserva confirmada com sucesso!");
      onReservaSuccess({
        nome: reservaData.nome,
        data: reservaData.data,
        horario: reservaData.horario,
        pessoas: reservaData.pessoas,
        mesa: reservaData.mesa_numero,
        ocasiao: reservaData.ocasiao,
        tipo_mesa: reservaData.tipo_mesa
      });
      setMesaSelecionada(null);
      setTipoMesa("Interna");
      setOcasiao("Nenhuma");
      (e.target as HTMLFormElement).reset();
      carregarStatusMesas();
    } catch (error: any) {
      console.error('Erro na reserva:', error);
      toast.error("❌ Erro ao realizar reserva: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMesa = (numero: number, capacidade: number, zona: string) => {
    const mesaData = mesas.find(m => m.numero === numero);
    const status = mesaData?.status || 'livre';
    const isSelecionada = mesaSelecionada === numero;
    const isFiltrada = filtroCapacidade !== "Todas" && capacidade !== filtroCapacidade;

    return (
      <motion.div
        key={numero}
        whileHover={status === 'livre' ? { scale: 1.05 } : {}}
        onClick={() => !isFiltrada && selecionarMesa(numero, capacidade, status)}
        className={`
          relative w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2
          ${status === 'ocupada' ? 'bg-[#e74c3c] border-[#c0392b] cursor-not-allowed' : 
            isSelecionada ? 'bg-[#f39c12] border-[#d35400] shadow-lg shadow-orange-500/20' : 
            'bg-[#2ecc71] border-[#27ae60] hover:border-white/40'}
          ${isFiltrada ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}
        `}
      >
        <span className="text-xs font-black text-white mb-1">{numero}</span>
        <div className="flex items-center gap-1 text-[10px] font-bold text-white/90">
          <Users className="w-3 h-3" /> {capacidade}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 py-24"
    >
      <div className="text-center mb-20">
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none text-gradient">Book a <br /><span className="text-primary">Table</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xl leading-relaxed">
          Selecione sua mesa preferida no mapa e garanta uma experiência gastronômica inesquecível.
        </p>
      </div>

      <div className="grid lg:grid-cols-1 gap-16 mb-24">
        {/* Mapa de Mesas */}
        <div className="bg-[#111] rounded-[2.5rem] p-8 md:p-12 border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#2ecc71]" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Livre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#e74c3c]" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Ocupada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#f39c12]" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sua Seleção</span>
              </div>
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {["Todas", 2, 4, 6].map(cap => (
                <button
                  key={cap}
                  onClick={() => setFiltroCapacidade(cap as any)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filtroCapacidade === cap ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                  {cap === "Todas" ? "Todas" : `👥 ${cap}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Zona 1 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Flame className="w-5 h-5 text-primary" />
                <h4 className="font-black uppercase tracking-widest text-sm">Salão Principal</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {renderMesa(1, 2, 'salao')}
                {renderMesa(2, 2, 'salao')}
                {renderMesa(3, 4, 'salao')}
                {renderMesa(4, 4, 'salao')}
                {renderMesa(5, 6, 'salao')}
                {renderMesa(6, 6, 'salao')}
              </div>
            </div>

            {/* Zona 2 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Leaf className="w-5 h-5 text-green-500" />
                <h4 className="font-black uppercase tracking-widest text-sm">Área Externa</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderMesa(7, 2, 'externa')}
                {renderMesa(8, 2, 'externa')}
                {renderMesa(9, 4, 'externa')}
                {renderMesa(10, 4, 'externa')}
              </div>
            </div>

            {/* Zona 3 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Castle className="w-5 h-5 text-orange-500" />
                <h4 className="font-black uppercase tracking-widest text-sm">Tatame</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderMesa(11, 4, 'tatame')}
                {renderMesa(12, 4, 'tatame')}
                {renderMesa(13, 6, 'tatame')}
              </div>
            </div>
          </div>

          {mesaSelecionada && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-6 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl">
                  {mesaSelecionada}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Mesa Selecionada</p>
                  <p className="text-sm font-bold text-white">Mesa {mesaSelecionada} ({mesas.find(m => m.numero === mesaSelecionada)?.capacidade} pessoas)</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setMesaSelecionada(null)} className="text-muted-foreground hover:text-white">Alterar</Button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-24">
        <div className="space-y-12">
          <div>
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">Informações da Reserva</h3>
            <p className="text-muted-foreground leading-relaxed">Preencha os detalhes abaixo para confirmar sua reserva. Campos marcados com * são obrigatórios.</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="nomeReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">Nome Completo *</Label>
                <Input id="nomeReserva" name="nome" required className="rounded-xl h-14 bg-white/5 border-white/10 focus:border-primary" placeholder="Seu nome" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="telefoneReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">Telefone *</Label>
                <Input id="telefoneReserva" name="telefone" required className="rounded-xl h-14 bg-white/5 border-white/10 focus:border-primary" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="emailReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">E-mail (Opcional)</Label>
              <Input id="emailReserva" name="email" type="email" className="rounded-xl h-14 bg-white/5 border-white/10 focus:border-primary" placeholder="seu@email.com" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="dataReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">Data *</Label>
                <Input id="dataReserva" name="data" type="date" min={new Date().toISOString().split('T')[0]} required className="rounded-xl h-14 bg-white/5 border-white/10 focus:border-primary" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="horarioReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">Horário *</Label>
                <select id="horarioReserva" name="horario" required className="w-full rounded-xl h-14 bg-white/5 border-white/10 px-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary">
                  {["12:00", "13:00", "14:00", "19:00", "20:00", "21:00", "22:00"].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="pessoasReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">Pessoas *</Label>
                <Input id="pessoasReserva" name="pessoas" type="number" min="1" max="20" required className="rounded-xl h-14 bg-white/5 border-white/10 focus:border-primary" placeholder="1" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="uppercase tracking-widest text-[10px] font-black text-primary">Tipo de Mesa</Label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  {["Interna", "Externa", "Tatame"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoMesa(t)}
                      className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tipoMesa === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="uppercase tracking-widest text-[10px] font-black text-primary">Ocasião</Label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
                  {["Nenhuma", "Aniversário", "Encontro", "Comemoração"].map(o => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOcasiao(o)}
                      className={`px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${ocasiao === o ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="observacoesReserva" className="uppercase tracking-widest text-[10px] font-black text-primary">Observações</Label>
              <textarea id="observacoesReserva" name="observacoes" className="w-full rounded-xl min-h-[120px] bg-white/5 border-white/10 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Algum pedido especial?" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" required id="confirm" className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary" />
                <Label htmlFor="confirm" className="text-xs text-muted-foreground leading-relaxed">Confirmo minha reserva e estou ciente das regras</Label>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3 items-start">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                  ⚠️ Tolerância de 15 minutos. Cancelamentos devem ser feitos com 2h de antecedência.
                </p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full red-gradient text-white h-20 text-xl rounded-2xl uppercase tracking-widest font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
              {loading ? "Processando..." : "Confirmar Reserva"}
            </Button>
          </form>
        </div>

        <div className="glass-card rounded-[3rem] p-12 relative overflow-hidden h-fit sticky top-32">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
          <h3 className="text-3xl font-black uppercase tracking-tight mb-12 relative z-10">Histórico de Reservas</h3>
          <ScrollArea className="h-[600px] relative z-10">
            <div className="space-y-8">
              {reservations.length === 0 ? (
                <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2rem]">
                  <Calendar className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground italic uppercase tracking-widest text-xs">Nenhuma reserva encontrada.</p>
                </div>
              ) : (
                reservations.map(res => (
                  <Card key={res.id_reserva} className="rounded-[2rem] border-white/5 bg-white/5 shadow-none hover:bg-white/10 transition-all">
                    <CardContent className="p-8 flex justify-between items-center">
                      <div className="space-y-4">
                        <p className="font-black uppercase text-xl tracking-tight">{res.nome}</p>
                        <div className="flex flex-wrap items-center gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-2 text-white"><Calendar className="w-4 h-4 text-primary" /> {res.data}</span>
                          <span className="flex items-center gap-2 text-white"><Clock className="w-4 h-4 text-primary" /> {res.horario}</span>
                          <span className="flex items-center gap-2 text-white"><Users className="w-4 h-4 text-primary" /> {res.pessoas} Guests</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[8px] font-black px-4 py-1">Confirmada</Badge>
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
}

function OrdersView({ orders }: { orders: Order[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4 py-24"
    >
      <div className="text-center mb-24">
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 text-gradient">Order History</h2>
        <p className="text-muted-foreground uppercase tracking-[0.4em] text-xs font-black">Track your premium experience</p>
      </div>
      
      <div className="space-y-10">
        {orders.length === 0 ? (
          <div className="text-center py-40 glass-card rounded-[3rem]">
            <History className="w-20 h-20 mx-auto mb-8 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground text-xl uppercase tracking-widest font-black">No orders found yet.</p>
            <Button variant="link" className="text-primary mt-6 font-black uppercase tracking-widest text-sm">Explore the Menu</Button>
          </div>
        ) : (
          orders.map(order => (
            <Card key={order.id_pedido} className="rounded-[3rem] border-white/5 bg-white/5 shadow-none overflow-hidden hover:bg-white/10 transition-all premium-shadow">
              <div className="bg-white/5 p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-primary text-background px-4 py-1.5 rounded-full">#{order.id_pedido}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{new Date(order.data_pedido).toLocaleDateString()}</span>
                </div>
                <Badge className={
                  `rounded-full uppercase tracking-widest text-[8px] font-black px-6 py-1.5 ${
                    order.status === "Entregue" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                    order.status === "Saiu para entrega" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-primary/10 text-primary border-primary/20"
                  }`
                }>
                  {order.status}
                </Badge>
              </div>
              <CardContent className="p-12 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex items-center gap-10">
                  <div className="w-24 h-24 rounded-[2rem] red-gradient flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-black mb-2">Order Status</p>
                    <h4 className="text-4xl font-black uppercase tracking-tighter">{order.status}</h4>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-black mb-2">Total Amount</p>
                  <p className="text-5xl font-black text-white">R$ {order.valor_total.toFixed(2)}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-white/5 p-6 border-t border-white/5 flex justify-center">
                <Button variant="ghost" className="text-muted-foreground hover:text-white font-black uppercase tracking-widest text-[10px] transition-all">View Order Details</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Confirmation Modals ───────────────────────────────────────────────────────
function OrderSuccessModal({ data, onClose }: {
  data: { id: number; nome: string; itens: CartItem[]; total: number; tipoPagamento: string; tipoEntrega: string; } | null;
  onClose: () => void;
}) {
  if (!data) return null;
  const pagtIcons: Record<string, string> = { pix: '💠', cartao: '💳', dinheiro: '💵' };
  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-[#0d0d0d] border border-white/10 p-0 overflow-hidden rounded-[2rem]">
        <div className="bg-gradient-to-br from-[#C0392B]/20 to-transparent p-10 border-b border-white/5 text-center">
          <div className="w-20 h-20 rounded-full bg-[#C0392B]/20 border-2 border-[#C0392B]/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#C0392B]" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Pedido Confirmado!</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Obrigado, {data.nome} 🍣</p>
          <span className="inline-block mt-4 bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/30 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">#{data.id}</span>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Itens do Pedido</p>
            <div className="space-y-2">
              {data.itens.map(item => (
                <div key={item.id_produto} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm font-bold text-white">{item.nome} <span className="text-zinc-500">x{item.quantity}</span></span>
                  <span className="text-sm font-black text-[#C0392B]">R$ {(item.preco * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Total</p>
              <p className="text-lg font-black text-white">R$ {data.total.toFixed(2)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Pagamento</p>
              <p className="text-lg font-black text-white">{pagtIcons[data.tipoPagamento] || '💰'}</p>
              <p className="text-[9px] text-zinc-400 uppercase">{data.tipoPagamento}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Entrega</p>
              <p className="text-lg">{data.tipoEntrega === 'delivery' ? '🛵' : '🏪'}</p>
              <p className="text-[9px] text-zinc-400 uppercase">{data.tipoEntrega}</p>
            </div>
          </div>
          <div className="bg-[#C0392B]/5 border border-[#C0392B]/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#C0392B] shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Seu pedido foi recebido e está sendo preparado. Tempo estimado: <span className="text-white font-bold">30–45 min</span>.
            </p>
          </div>
          <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-[#C0392B] hover:bg-[#a93226] text-white font-black uppercase tracking-widest shadow-lg shadow-[#C0392B]/20">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReservaSuccessModal({ data, onClose }: {
  data: { nome: string; data: string; horario: string; pessoas: number; mesa: number; ocasiao: string; tipo_mesa: string; } | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] bg-[#0d0d0d] border border-white/10 p-0 overflow-hidden rounded-[2rem]">
        <div className="bg-gradient-to-br from-green-500/20 to-transparent p-10 border-b border-white/5 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Reserva Confirmada!</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Até logo, {data.nome} 🍣</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">📅 Data</p>
              <p className="text-sm font-black text-white">{data.data}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">🕐 Horário</p>
              <p className="text-sm font-black text-white">{data.horario}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">👥 Pessoas</p>
              <p className="text-sm font-black text-white">{data.pessoas} pessoa{data.pessoas > 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">🪑 Mesa</p>
              <p className="text-sm font-black text-white">Mesa {data.mesa} · {data.tipo_mesa}</p>
            </div>
            {data.ocasiao && data.ocasiao !== 'Nenhuma' && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 col-span-2">
                <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">🎉 Ocasião</p>
                <p className="text-sm font-black text-white">{data.ocasiao}</p>
              </div>
            )}
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Sua reserva está confirmada. Tolerância de <span className="text-white font-bold">15 minutos</span>. Cancelamentos com 2h de antecedência.
            </p>
          </div>
          <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CheckoutDialog({ 
  isOpen, 
  onClose, 
  cart, 
  total, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cart: CartItem[], 
  total: number,
  onSuccess: (info: { id: number; nome: string; itens: CartItem[]; total: number; tipoPagamento: string; tipoEntrega: string }) => void
}) {
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'delivery'>('retirada');
  const [tipoPagamento, setTipoPagamento] = useState<'pix' | 'cartao' | 'dinheiro'>('dinheiro');
  const [loading, setLoading] = useState(false);

  const finalizarPedido = async () => {
    try {
      const nome = (document.getElementById('nomeCliente') as HTMLInputElement).value.trim();
      const telefone = (document.getElementById('telefoneCliente') as HTMLInputElement).value.trim();
      
      if (!nome || !telefone) {
        toast.error('❌ Preencha nome e telefone');
        return;
      }

      if (cart.length === 0) {
        toast.error('❌ Carrinho vazio');
        return;
      }

      setLoading(true);

      // 1. Inserir cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert([{ 
          nome, 
          telefone,
          email: `anon_${Date.now()}@kaze.com`
        }])
        .select();

      if (clienteError) throw clienteError;
      const idCliente = clienteData[0].id_cliente;

      // 2. Calcular total
      const valorTotal = total;

      // 3. Inserir pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          id_cliente: idCliente,
          status: 'recebido',
          valor_total: valorTotal
        }])
        .select();

      if (pedidoError) throw pedidoError;
      const idPedido = pedidoData[0].id_pedido;

      // 4. Inserir itens do pedido
      const itens = cart.map(item => ({
        id_pedido: idPedido,
        id_produto: item.id_produto,
        quantidade: item.quantity,
        preco_unitario: item.preco
      }));

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itens);

      if (itensError) throw itensError;

      // 5. Pagamento registrado localmente (sem tabela separada)

      toast.success('✅ Pedido realizado com sucesso!');
      onSuccess({
        id: idPedido,
        nome: nome,
        itens: [...cart],
        total: valorTotal,
        tipoPagamento: tipoPagamento,
        tipoEntrega: tipoEntrega
      });
      onClose();

    } catch (err: any) {
      console.error('Erro no pedido:', err);
      toast.error('❌ Erro ao finalizar pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background border-white/5 p-0 overflow-hidden rounded-[2.5rem]">
        <DialogHeader className="p-8 bg-white/5 border-b border-white/5">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Finalizar Pedido</DialogTitle>
          <DialogDescription className="uppercase tracking-widest text-[10px] font-bold text-primary">Confirme seus dados para entrega</DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCliente" className="uppercase tracking-widest text-[10px] font-black text-primary">Nome *</Label>
              <Input id="nomeCliente" placeholder="Seu nome" className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefoneCliente" className="uppercase tracking-widest text-[10px] font-black text-primary">Telefone *</Label>
              <Input id="telefoneCliente" placeholder="(00) 00000-0000" className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="uppercase tracking-widest text-[10px] font-black text-primary">Tipo de Entrega</Label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTipoEntrega('retirada')}
                className={`entrega-btn flex items-center justify-center gap-3 h-14 rounded-xl border transition-all font-bold uppercase tracking-widest text-[10px] ${tipoEntrega === 'retirada' ? 'active bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
                data-tipo="retirada"
              >
                <Store className="w-4 h-4" /> Retirar no Local
              </button>
              <button 
                onClick={() => setTipoEntrega('delivery')}
                className={`entrega-btn flex items-center justify-center gap-3 h-14 rounded-xl border transition-all font-bold uppercase tracking-widest text-[10px] ${tipoEntrega === 'delivery' ? 'active bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
                data-tipo="delivery"
              >
                <Truck className="w-4 h-4" /> Delivery
              </button>
            </div>
          </div>

          {tipoEntrega === 'delivery' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="enderecoCliente" className="uppercase tracking-widest text-[10px] font-black text-primary">Endereço Completo *</Label>
              <Input id="enderecoCliente" placeholder="Rua, número, bairro..." className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>
          )}

          <div className="space-y-4">
            <Label className="uppercase tracking-widest text-[10px] font-black text-primary">Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-4">
              {['pix', 'cartao', 'dinheiro'].map((p) => (
                <button 
                  key={p}
                  onClick={() => setTipoPagamento(p as any)}
                  className={`pagamento-btn h-14 rounded-xl border transition-all font-bold uppercase tracking-widest text-[10px] ${tipoPagamento === p ? 'active bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
                  data-tipo={p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between text-xs uppercase tracking-widest font-bold">
              <span className="text-muted-foreground">Total do Pedido</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={finalizarPedido} 
            disabled={loading}
            className="w-full h-16 rounded-2xl red-gradient text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            {loading ? "Processando..." : "Confirmar Pedido"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CartSheet({ cart, updateQuantity, removeFromCart, total, onCheckoutClick }: {
  cart: CartItem[],
  updateQuantity: (id: number, d: number) => void,
  removeFromCart: (id: number) => void,
  total: number,
  onCheckoutClick: () => void
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative rounded-2xl bg-white/5 hover:bg-primary hover:text-background h-14 px-8 transition-all group border border-white/5">
          <ShoppingBag className="w-5 h-5 mr-3" />
          <span className="font-black uppercase tracking-widest text-[10px]">Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full red-gradient text-white text-xs font-black border-4 border-background shadow-2xl animate-in zoom-in flex items-center justify-center">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 rounded-none border-l border-white/5 bg-background/95 backdrop-blur-2xl">
        <SheetHeader className="p-10 border-b border-white/5 bg-white/5">
          <SheetTitle className="uppercase tracking-tighter text-5xl font-black text-gradient">Your Order</SheetTitle>
          <SheetDescription className="uppercase tracking-[0.3em] text-[10px] font-black text-primary mt-2">Premium Japanese Selection</SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-10">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-32 space-y-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 opacity-10" />
              </div>
              <p className="uppercase tracking-widest font-black text-xs">Your cart is empty.</p>
              <Button variant="outline" className="rounded-2xl border-white/10 uppercase tracking-widest font-black text-[10px] px-8 h-12">Start Ordering</Button>
            </div>
          ) : (
            <div className="space-y-10">
              {cart.map(item => (
                <div key={item.id_produto} className="flex gap-8 group">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border border-white/5 shrink-0 premium-shadow">
                    <img 
                      src={item.imagem_url} 
                      alt={item.nome} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e: any) => {
                        e.target.src = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black uppercase text-xl tracking-tight leading-none">{item.nome}</h4>
                      <button onClick={() => removeFromCart(item.id_produto)} className="text-muted-foreground hover:text-accent transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-primary font-black text-lg">R$ {item.preco.toFixed(2)}</p>
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                        <button onClick={() => updateQuantity(item.id_produto, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"><Minus className="w-3 h-3" /></button>
                        <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id_produto, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <SheetFooter className="p-10 border-t border-white/5 bg-white/5 flex-col gap-8">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Subtotal</span>
                <span className="font-black text-lg">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Delivery Fee</span>
                <span className="font-black text-primary uppercase text-[10px] tracking-widest">Complimentary</span>
              </div>
              <Separator className="bg-white/5 my-6" />
              <div className="flex justify-between items-center w-full">
                <span className="text-white uppercase text-xs font-black tracking-widest">Total</span>
                <span className="text-5xl font-black text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full red-gradient text-white h-24 rounded-[2rem] text-2xl uppercase tracking-widest font-black shadow-2xl shadow-primary/20 transition-all active:scale-95" onClick={onCheckoutClick}>
              Complete Order
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
