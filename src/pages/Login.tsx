import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, User } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean()
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'eng.hossamafify@gmail.com',
      password: 'aaaaaa',
      rememberMe: true
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        registrationOption: 1
      });
      
      const token = response.data.tokenCode;
      setToken(token);
      
      toast({
        title: "Login successful!",
        description: "Welcome to CateringPlus"
      });
      
      navigate('/add-to-cart');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-4">
            <span className="text-2xl font-bold text-primary-foreground">CP</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CateringPlus</h1>
          <p className="text-muted-foreground mt-2">Employee Food Ordering System</p>
        </div>
        
        <Card className="bg-gradient-card border-0 shadow-elevated">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold">
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="rounded border-border"
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};