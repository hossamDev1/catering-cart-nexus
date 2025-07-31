import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/add-to-cart');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return null;
};

export default Index;