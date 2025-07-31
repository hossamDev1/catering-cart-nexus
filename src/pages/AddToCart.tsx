import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { categoriesApi, cartApi, Category, Product } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Plus } from 'lucide-react';

const addToCartSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.number().min(1, 'Quantity must be at least 1')
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
      quantity: 1
    }
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
          title: "Error loading categories",
          description: "Please try again later",
          variant: "destructive"
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
          const response = await categoriesApi.getProductsByCategory(watchedCategoryId);
          setProducts(response.data);
          setValue('productId', ''); // Reset product selection
        } catch (error) {
          toast({
            title: "Error loading products",
            description: "Please try again later",
            variant: "destructive"
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
        extrasListIDs: []
      });

      toast({
        title: "Added to cart!",
        description: "Product has been added to your cart successfully"
      });

      // Reset form
      reset({
        categoryId: '',
        productId: '',
        quantity: 1
      });
      setProducts([]);
      setSelectedCategory('');
    } catch (error) {
      toast({
        title: "Error adding to cart",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === watchedProductId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-accent rounded-3xl flex items-center justify-center shadow-glow mb-6">
              <ShoppingCart className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Order Menu</h1>
            <p className="text-muted-foreground text-lg">
              Choose your delicious meal for today
            </p>
          </div>

          <Card className="bg-gradient-card border-0 shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Plus size={24} />
                Place Your Order
              </CardTitle>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                {isLoadingCategories ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <LoadingSpinner size="sm" />
                    <span className="text-muted-foreground">Loading categories...</span>
                  </div>
                ) : (
                  <Select
                    value={watchedCategoryId || ''}
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.categoryId && (
                  <p className="text-destructive text-sm">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                {isLoadingProducts ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <LoadingSpinner size="sm" />
                    <span className="text-muted-foreground">Loading products...</span>
                  </div>
                ) : (
                  <Select
                    value={watchedProductId || ''}
                    onValueChange={(value) => setValue('productId', value)}
                    disabled={!watchedCategoryId || products.length === 0}
                  >
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder={
                        !watchedCategoryId 
                          ? "Select a category first" 
                          : products.length === 0 
                            ? "No products available"
                            : "Select a product"
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{product.name}</span>
                            {product.price && (
                              <span className="text-muted-foreground ml-2">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.productId && (
                  <p className="text-destructive text-sm">{errors.productId.message}</p>
                )}
              </div>

              {/* Product Details */}
              {selectedProduct && (
                <div className="p-4 bg-accent/50 rounded-md border">
                  <h3 className="font-medium mb-2">Product Details</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Name:</strong> {selectedProduct.name}
                  </p>
                  {selectedProduct.price && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Price:</strong> ${selectedProduct.price.toFixed(2)}
                    </p>
                  )}
                  {selectedProduct.description && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Description:</strong> {selectedProduct.description}
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  {...register('quantity', { valueAsNumber: true })}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                {errors.quantity && (
                  <p className="text-destructive text-sm">{errors.quantity.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="success"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !watchedProductId}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding to cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};