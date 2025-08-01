import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cartApi, ProductPhotosList } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Package,
  Clock,
  Truck,
  Shield,
  DollarSign,
} from 'lucide-react';

interface CartList {
  productId: string;
  productCount: number;
  products: CartItem;
}
interface CartItem {
  productId: string;
  productName: string;
  productARName: string;
  productSpcefication: string;
  categoryId: string;
  categoryName: string;
  productCode: string;
  parentProductId: string;
  productPrice: string;
  stockAmount: string;
  viewingCount: number;
  isFavourite: boolean;
  isCustomProduct: boolean;
  active: boolean;
  productPhotosList: ProductPhotosList[];
}

interface OrderCalculation {
  discountAmount: number;
  subTotalAmount: number;
  totalAmount: number;
  totalPaidBalance: number;
  totalPaidCash: number;
}

interface UserAddress {
  addressId: string;
  detailedAddress: string;
  mapLocation: string;
  cityId: string;
  countryId: string;
  userId: string;
  title: string;
  area: string;
  streetName: string;
  buildingNumber: string;
  floor: string;
  apartment: string;
  active: boolean;
}

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartList[]>([]);
  const [orderCalculation, setOrderCalculation] =
    useState<OrderCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );

  const loadUserAddresses = async () => {
    try {
      const response = await cartApi.getUserAddresses();
      setUserAddresses(response.data || []);
      console.log('User addresses:', response.data);
      if (response.data && response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading user addresses:', error);
      toast({
        title: 'Error loading addresses',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

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
        title: 'Error loading cart',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadUserAddresses();
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    setIsUpdating(productId);
    try {
      await cartApi.manageCart({
        productId,
        quantity: newQuantity,
        extrasListIDs: [],
      });

      if (newQuantity === 0) {
        toast({
          title: 'Item removed',
          description: 'Product has been removed from your cart',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Cart updated',
          description: 'Quantity has been updated',
          variant: 'success',
        });
      }

      await loadCart(); // Reload cart to get updated data
    } catch (error) {
      toast({
        title: 'Error updating cart',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    await updateQuantity(productId, 0);
  };

  const handleCheckout = async () => {
    if (orderNotes.trim() === '') {
      toast({
        title: 'Order notes required',
        description: 'Please add order notes before proceeding with checkout',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      await cartApi.checkout({
        addressId: selectedAddress?.addressId || '',
        orderNotes: orderNotes,
        discountCode: discountCode,
      });

      toast({
        title: 'Order placed successfully!',
        description: 'Your order has been submitted and is being processed',
        variant: 'success',
      });

      // Clear cart and reload
      await loadCart();
    } catch (error) {
      toast({
        title: 'Checkout failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner
              size="lg"
              className="mx-auto mb-4"
            />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <ShoppingCart
              className="text-primary-foreground"
              size={32}
            />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-foreground">Your Cart</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Review your items and proceed to checkout. Your order will be
            delivered to your workplace.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="text-center py-16">
              <Package
                size={64}
                className="mx-auto text-muted-foreground mb-6"
              />
              <h3 className="text-2xl font-semibold mb-3">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Start browsing our delicious menu to add items to your cart
              </p>
              <Button
                onClick={() => (window.location.href = '/add-to-cart')}
                className="btn-primary px-8 py-3 text-lg"
              >
                Start Ordering
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-elevated">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ShoppingCart
                      size={24}
                      className="text-primary"
                    />
                    Order Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-6 border rounded-xl bg-gradient-card hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.products.productPhotosList[0].photoURL}
                          alt={item.products.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">
                          {item.products.productName}
                        </h3>
                        <h5 className="text-muted-foreground text-sm">
                          {item.products.categoryName}
                        </h5>
                        <p className="text-muted-foreground text-sm">
                          {item.products.productSpcefication}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-medium">
                            EG {item.products.productPrice} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                Math.max(0, item.productCount - 1)
                              )
                            }
                            disabled={isUpdating === item.productId}
                            className="h-10 w-10 p-0 rounded-lg"
                          >
                            <Minus size={16} />
                          </Button>

                          <div className="w-12 text-center">
                            {isUpdating === item.productId ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <span className="font-semibold text-lg">
                                {item.productCount}
                              </span>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.productCount + 1
                              )
                            }
                            disabled={isUpdating === item.productId}
                            className="h-10 w-10 p-0 rounded-lg"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-semibold text-lg">
                            EG{' '}
                            {(
                              (Number(item.products.productPrice) || 0) *
                              item.productCount
                            ).toFixed(2)}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                          disabled={isUpdating === item.productId}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10 p-0 rounded-lg"
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
            <div className="space-y-6">
              <Card className="card-elevated">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard
                      size={20}
                      className="text-primary"
                    />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderCalculation && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span className="font-medium">
                            EG{' '}
                            {(orderCalculation.subTotalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-medium">
                            EG{' '}
                            {(orderCalculation.discountAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Delivery
                          </span>
                          <span className="font-medium">
                            EG{' '}
                            {(orderCalculation.totalPaidBalance || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          EG {(orderCalculation.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Discount Code and Order Notes */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <Label
                        htmlFor="discountCode"
                        className="text-sm font-medium"
                      >
                        Discount Code
                      </Label>
                      <Input
                        id="discountCode"
                        type="text"
                        placeholder="Enter discount code (optional)"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="input-focus"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="orderNotes"
                        className="text-sm font-medium"
                      >
                        Order Notes <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="orderNotes"
                        placeholder="Please add Location Details (Address, Floor, Apartment, etc.)"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className={`input-focus min-h-[80px] resize-none ${
                          orderNotes.trim() === ''
                            ? 'border-destructive focus:border-destructive'
                            : ''
                        }`}
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={
                      isCheckingOut ||
                      cartItems.length === 0 ||
                      orderNotes.trim() === ''
                    }
                    className="w-full btn-primary h-12 text-base font-medium"
                  >
                    {isCheckingOut ? (
                      <>
                        <LoadingSpinner
                          size="sm"
                          className="mr-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard
                          size={18}
                          className="mr-2"
                        />
                        Proceed to Checkout
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
