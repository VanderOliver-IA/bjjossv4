import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Minus, Search, Receipt, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductManagement from '@/components/cantina/ProductManagement';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'cantina' | 'loja';
  active: boolean;
}

interface Student {
  id: string;
  name: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const Cantina = () => {
  const { role, profile } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('venda');

  const canManageProducts = role === 'admin_ct' || role === 'atendente';

  const fetchData = useCallback(async () => {
    if (!profile?.ct_id) return;

    try {
      const [productsRes, studentsRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, stock, category, active')
          .eq('ct_id', profile.ct_id)
          .eq('active', true)
          .order('name'),
        supabase
          .from('students')
          .select('id, name')
          .eq('ct_id', profile.ct_id)
          .eq('status', 'ativo')
          .order('name')
          .limit(100),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (studentsRes.data) setStudents(studentsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.ct_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cantinaProducts = products.filter(p => p.category === 'cantina');
  const lojaProducts = products.filter(p => p.category === 'loja');

  const filteredCantina = cantinaProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLoja = lojaProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.productId !== productId));
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const clearCart = () => {
    setCart([]);
    setSelectedStudent('');
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) return;

    // For now, just clear the cart and show success
    toast({ title: 'Venda registrada!', description: `Total: R$ ${total.toFixed(2)}` });
    clearCart();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-32 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cantina / Loja</h1>
        <p className="text-muted-foreground">POS - Ponto de Venda</p>
      </div>

      {canManageProducts ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="venda" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Venda
            </TabsTrigger>
            <TabsTrigger value="produtos" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Gerenciar Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="venda" className="mt-6">
            <SalesView
              cart={cart}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredCantina={filteredCantina}
              filteredLoja={filteredLoja}
              students={students}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleFinalizeSale={handleFinalizeSale}
              total={total}
            />
          </TabsContent>

          <TabsContent value="produtos" className="mt-6">
            <ProductManagement />
          </TabsContent>
        </Tabs>
      ) : (
        <SalesView
          cart={cart}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredCantina={filteredCantina}
          filteredLoja={filteredLoja}
          students={students}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          handleFinalizeSale={handleFinalizeSale}
          total={total}
        />
      )}
    </div>
  );
};

interface SalesViewProps {
  cart: CartItem[];
  selectedStudent: string;
  setSelectedStudent: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filteredCantina: Product[];
  filteredLoja: Product[];
  students: Student[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  handleFinalizeSale: () => void;
  total: number;
}

const SalesView = ({
  cart,
  selectedStudent,
  setSelectedStudent,
  searchTerm,
  setSearchTerm,
  filteredCantina,
  filteredLoja,
  students,
  addToCart,
  removeFromCart,
  clearCart,
  handleFinalizeSale,
  total,
}: SalesViewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cantina Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cantina</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCantina.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum produto na cantina</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCantina.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-lg font-bold text-primary">R$ {Number(product.price).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Estoque: {product.stock || 0}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loja Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loja</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLoja.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum produto na loja</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredLoja.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-all text-left"
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-lg font-bold text-secondary">R$ {Number(product.price).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Estoque: {product.stock || 0}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Aluno (opcional)</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar aluno..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Carrinho vazio
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">R$ {Number(item.price).toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price, category: 'cantina', stock: 0, active: true })}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
                  Limpar
                </Button>
                <Button className="btn-presence text-white" disabled={cart.length === 0} onClick={handleFinalizeSale}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Finalizar
                </Button>
              </div>

              {/* Payment Methods */}
              {cart.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Dinheiro
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    PIX
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Cartão
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cantina;
