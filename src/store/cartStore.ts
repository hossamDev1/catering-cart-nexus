import { create } from 'zustand';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  extrasListIDs: string[];
}

interface CartState {
  items: CartItem[];
  total: number;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setTotal: (total: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({
    items: [...state.items.filter(i => i.productId !== item.productId), item]
  })),
  updateItem: (productId, quantity) => set((state) => ({
    items: state.items.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    )
  })),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.productId !== productId)
  })),
  clearCart: () => set({ items: [], total: 0 }),
  setTotal: (total) => set({ total })
}));