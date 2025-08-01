import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { categoriesApi, cartApi, Category, Product } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Utensils, Clock, DollarSign } from 'lucide-react';

const addToCartSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

type AddToCartForm = z.infer<typeof addToCartSchema>;

export const AddToCart = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddToCartForm>({
    resolver: zodResolver(addToCartSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const watchedCategoryId = watch('categoryId');
  const watchedProductId = watch('productId');

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        setCategories(response.data);
      } catch (error) {
        toast({
          title: 'Error loading categories',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load products when category changes
  useEffect(() => {
    if (watchedCategoryId && watchedCategoryId !== selectedCategory) {
      setSelectedCategory(watchedCategoryId);
      setIsLoadingProducts(true);

      const loadProducts = async () => {
        try {
          const response = await categoriesApi.getProductsByCategory(
            watchedCategoryId
          );
          setProducts(response.data);
          setValue('productId', ''); // Reset product selection
        } catch (error) {
          toast({
            title: 'Error loading products',
            description: 'Please try again later',
            variant: 'destructive',
          });
          setProducts([]);
        } finally {
          setIsLoadingProducts(false);
        }
      };

      loadProducts();
    }
  }, [watchedCategoryId, selectedCategory, setValue]);

  const onSubmit = async (data: AddToCartForm) => {
    setIsSubmitting(true);
    try {
      await cartApi.manageCart({
        productId: data.productId,
        quantity: data.quantity,
        extrasListIDs: [],
      });

      toast({
        title: 'Added to cart!',
        description: 'Product has been added to your cart successfully',
        variant: 'success',
      });

      // Reset form
      reset({
        categoryId: '',
        productId: '',
        quantity: 1,
      });
      setProducts([]);
      setSelectedCategory('');
    } catch (error) {
      toast({
        title: 'Error adding to cart',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(
    (p) => p.productId === watchedProductId
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Utensils className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-foreground">Order Food</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our selection of fresh, delicious meals perfect for your workplace. 
            Quick ordering, fast delivery, and great taste guaranteed.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Plus size={24} className="text-primary" />
                  Place Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-sm font-medium">Food Category</Label>
                    {isLoadingCategories ? (
                      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                        <LoadingSpinner size="sm" />
                        <span className="text-muted-foreground">
                          Loading categories...
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={watchedCategoryId || ''}
                        onValueChange={(value) => setValue('categoryId', value)}
                      >
                        <SelectTrigger className="input-focus h-12">
                          <SelectValue placeholder="Select a food category" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.categoryId && (
                      <p className="text-destructive text-sm">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="product" className="text-sm font-medium">Select Item</Label>
                    {isLoadingProducts ? (
                      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                        <LoadingSpinner size="sm" />
                        <span className="text-muted-foreground">
                          Loading products...
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={watchedProductId || ''}
                        onValueChange={(value) => setValue('productId', value)}
                        disabled={!watchedCategoryId || products.length === 0}
                      >
                        <SelectTrigger className="input-focus h-12">
                          <SelectValue
                            placeholder={
                              !watchedCategoryId
                                ? 'Select a category first'
                                : products.length === 0
                                ? 'No items available'
                                : 'Choose your meal'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {products.map((product) => (
                            <SelectItem
                              key={product.productId}
                              value={product.productId}
                            >
                              <div className="flex items-center gap-3 w-full py-1">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={product.productPhotosList[0].photoURL}
                                    alt={product.productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{product.productName}</div>
                                  {product.productPrice && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <DollarSign size={12} />
                                      {product.productPrice}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.productId && (
                      <p className="text-destructive text-sm">
                        {errors.productId.message}
                      </p>
                    )}
                  </div>

                  {/* Product Details */}
                  {selectedProduct && (
                    <div className="p-6 bg-gradient-card rounded-xl border border-border/50">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={selectedProduct.productPhotosList[0].photoURL}
                            alt={selectedProduct.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{selectedProduct.productName}</h3>
                          {selectedProduct.productPrice && (
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign size={16} className="text-primary" />
                              <span className="font-semibold text-lg">${selectedProduct.productPrice}</span>
                            </div>
                          )}
                          {selectedProduct.productSpcefication && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {selectedProduct.productSpcefication}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="space-y-3">
                    <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      {...register('quantity', { valueAsNumber: true })}
                      className="input-focus h-12"
                    />
                    {errors.quantity && (
                      <p className="text-destructive text-sm">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-primary h-12 text-base font-medium"
                    disabled={isSubmitting || !watchedProductId}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Adding to cart...
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <Clock size={16} className="text-primary" />
                    <div>
                      <p className="font-medium text-sm">Delivery Time</p>
                      <p className="text-muted-foreground text-sm">30-45 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <Utensils size={16} className="text-primary" />
                    <div>
                      <p className="font-medium text-sm">Fresh & Healthy</p>
                      <p className="text-muted-foreground text-sm">Quality ingredients</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};
