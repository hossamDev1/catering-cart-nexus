import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Building2, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),

  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        registrationOption: 1,
      });

      const { tokenCode, name, id } = response.data;
      setUser(tokenCode, name, id);

      toast({
        title: 'Login successful!',
        description: 'Welcome to CateringPlus',
        variant: 'success',
      });

      navigate('/add-to-cart');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <img src="/Catering-plus.png" alt="CateringPlus Logo" className="w-16 h-16 object-contain" />
          </div>

        </div> */}

        {/* Login Card */}
        <Card className="card-elevated">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-primary/20">
              <img
                src="/Catering-plus.png"
                alt="CateringPlus Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to access your workplace food ordering account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your work email"
                    {...register('email')}
                    className="input-focus pl-10 h-11"
                  />
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="input-focus pl-10 pr-10 h-11"
                  />
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={16}
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
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    {...register('rememberMe')}
                    className="rounded border-border focus:ring-2 focus:ring-primary/20"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-muted-foreground"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner
                      size="sm"
                      className="mr-2"
                    />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Portal'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                Secure access to your workplace food ordering system
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
