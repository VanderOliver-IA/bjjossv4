import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, DollarSign, User, Search, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockProducts, mockStudents } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const Cantina = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const cantinaProducts = mockProducts.filter(p => p.category === 'cantina');
  const lojaProducts = mockProducts.filter(p => p.category === 'loja');

  const filteredCantina = cantinaProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof mockProducts[0]) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cantina / Loja</h1>
        <p className="text-muted-foreground">POS - Ponto de Venda</p>
      </div>

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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCantina.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-lg font-bold text-primary">R$ {product.price}</p>
                    <p className="text-xs text-muted-foreground">Estoque: {product.stock}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loja Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lojaProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-all text-left"
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-lg font-bold text-secondary">R$ {product.price}</p>
                    <p className="text-xs text-muted-foreground">Estoque: {product.stock}</p>
                  </button>
                ))}
              </div>
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
                    {mockStudents.slice(0, 10).map(student => (
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
                        <p className="text-xs text-muted-foreground">R$ {item.price} cada</p>
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
                          onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price, category: 'cantina', stock: 0 })}
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
                    R$ {total.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={clearCart} disabled={cart.length === 0}>
                    Limpar
                  </Button>
                  <Button className="btn-presence text-white" disabled={cart.length === 0}>
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
    </div>
  );
};

export default Cantina;
