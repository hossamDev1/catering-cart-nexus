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
import { useIsMobile } from '@/hooks/use-mobile';
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
  Info,
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
  const isMobile = useIsMobile();

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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
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
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
            <ShoppingCart
              className="text-primary-foreground"
              size={isMobile ? 24 : 32}
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 text-foreground">
            Your Cart
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Review your items and proceed to checkout. Your order will be
            delivered to your workplace.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="text-center py-12 sm:py-16">
              <Package
                size={isMobile ? 48 : 64}
                className="mx-auto text-muted-foreground mb-4 sm:mb-6"
              />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg px-4">
                Start browsing our delicious menu to add items to your cart
              </p>
              <Button
                onClick={() => (window.location.href = '/add-to-cart')}
                className="btn-primary px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
              >
                Start Ordering
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card className="card-elevated">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <ShoppingCart
                      size={isMobile ? 20 : 24}
                      className="text-primary"
                    />
                    Order Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className={`${
                        isMobile
                          ? 'flex items-start gap-3 p-4'
                          : 'flex items-center gap-4 p-6'
                      } border rounded-xl bg-gradient-card hover:shadow-md transition-all duration-200`}
                    >
                      {/* Product Image */}
                      <div
                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0`}
                      >
                        <img
                          src={item.products.productPhotosList[0].photoURL}
                          alt={item.products.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1">
                          {item.products.productName}
                        </h3>
                        <h5 className="text-muted-foreground text-sm">
                          {item.products.categoryName}
                        </h5>
                        <p className="text-muted-foreground text-sm">
                          {item.products.productSpcefication}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-medium text-sm sm:text-base">
                            <span className="text-muted-foreground text-sm">
                              LE
                            </span>{' '}
                            {item.products.productPrice}
                          </span>
                        </div>
                      </div>

                      {/* Actions - Right Side */}
                      <div className="flex flex-col items-end gap-2 sm:gap-3">
                        {/* Quantity Controls and Remove Button */}
                        <div className="flex items-center gap-2">
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
                            className="h-8 w-8 p-0 rounded-lg"
                          >
                            <Minus size={14} />
                          </Button>

                          <div className="w-8 text-center">
                            {isUpdating === item.productId ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <span className="font-semibold text-sm">
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
                            className="h-8 w-8 p-0 rounded-lg"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right mt-1 w-full flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            disabled={isUpdating === item.productId}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </Button>
                          <p className="font-semibold text-base sm:text-lg">
                            <span className="text-muted-foreground text-sm">
                              LE
                            </span>{' '}
                            {(
                              (Number(item.products.productPrice) || 0) *
                              item.productCount
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="card-elevated">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard
                      size={isMobile ? 18 : 20}
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
                          <span className="text-muted-foreground text-sm sm:text-base">
                            Subtotal
                          </span>
                          <span className="font-medium text-sm sm:text-base">
                            LE{' '}
                            {(orderCalculation.subTotalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm sm:text-base">
                            Balance Amount
                          </span>
                          <span className="font-medium text-sm sm:text-base">
                            LE{' '}
                            {(orderCalculation.totalPaidBalance || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm sm:text-base">
                            {' '}
                            Cash Amount
                          </span>
                          <span className="font-medium text-sm sm:text-base">
                            LE{' '}
                            {(orderCalculation.totalPaidCash || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          LE {(orderCalculation.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Discount Code and Order Notes */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <Label
                        htmlFor="orderNotes"
                        className="text-sm font-medium"
                      >
                        Order Notes <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="orderNotes"
                        placeholder="Please add Location Details (Floor, Office, etc.)"
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
                      <p className="text-muted-foreground text-xs flex items-center gap-1">
                        <Info
                          size={14}
                          className="inline-block mr-1"
                        />{' '}
                        Minimum 3 characters
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={
                      isCheckingOut ||
                      cartItems.length === 0 ||
                      orderNotes.trim().length < 3
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
