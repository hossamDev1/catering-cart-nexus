import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cartApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Package } from 'lucide-react';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price?: number;
  total?: number;
}

interface OrderCalculation {
  subtotal?: number;
  tax?: number;
  delivery?: number;
  total?: number;
}

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderCalculation, setOrderCalculation] = useState<OrderCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadCart = async () => {
    try {
      const cartResponse = await cartApi.getCart();
      console.log('Cart response:', cartResponse.data); // Debug log
      setCartItems(cartResponse.data || []);
      
      // Calculate order totals
      if (cartResponse.data && cartResponse.data.length > 0) {
        try {
          const calculationResponse = await cartApi.calculateOrder();
          console.log('Calculation response:', calculationResponse.data); // Debug log
          setOrderCalculation(calculationResponse.data);
        } catch (calcError) {
          console.error('Error calculating order:', calcError);
          setOrderCalculation(null);
        }
      } else {
        setOrderCalculation(null);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error loading cart",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    setIsUpdating(productId);
    try {
      await cartApi.manageCart({
        productId,
        quantity: newQuantity,
        extrasListIDs: []
      });

      if (newQuantity === 0) {
        toast({
          title: "Item removed",
          description: "Product has been removed from your cart"
        });
      } else {
        toast({
          title: "Cart updated",
          description: "Quantity has been updated"
        });
      }

      await loadCart(); // Reload cart to get updated data
    } catch (error) {
      toast({
        title: "Error updating cart",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    await updateQuantity(productId, 0);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await cartApi.checkout({
        addressId: "90287fd7-1e8f-4096-9def-29c12763357e", // Default address ID
        orderNotes: ""
      });

      toast({
        title: "Order placed successfully!",
        description: "Your order has been submitted and is being processed"
      });

      // Clear cart and reload
      await loadCart();
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="text-primary-foreground" size={24} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
          <p className="text-muted-foreground">
            Review your items and proceed to checkout
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="shadow-elevated bg-gradient-card">
            <CardContent className="text-center py-12">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to add items to your cart
              </p>
              <Button 
                onClick={() => window.location.href = '/add-to-cart'}
                className="bg-gradient-primary hover:opacity-90"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-elevated bg-gradient-card">
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 border rounded-md bg-background/50">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${(item.price || 0).toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                            disabled={isUpdating === item.productId}
                            className="h-8 w-8 p-0"
                          >
                            <Minus size={14} />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">
                            {isUpdating === item.productId ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={isUpdating === item.productId}
                            className="h-8 w-8 p-0"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">${(item.total || 0).toFixed(2)}</p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          disabled={isUpdating === item.productId}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="shadow-elevated bg-gradient-card">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderCalculation && (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${(orderCalculation.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${(orderCalculation.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>${(orderCalculation.delivery || 0).toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${(orderCalculation.total || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cartItems.length === 0}
                    className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-soft"
                  >
                    {isCheckingOut ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} className="mr-2" />
                        Checkout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};