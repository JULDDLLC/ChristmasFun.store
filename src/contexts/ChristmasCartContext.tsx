import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ChristmasCartItem {
  id: string;
  type: 'santa_letter' | 'christmas_note';
  designNumber?: number;
  noteNumber?: number;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface ChristmasCartContextType {
  items: ChristmasCartItem[];
  addToCart: (item: ChristmasCartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (itemId: string) => boolean;
}

const ChristmasCartContext = createContext<ChristmasCartContextType | undefined>(undefined);

const CHRISTMAS_CART_STORAGE_KEY = 'christmas_shopping_cart';

export const ChristmasCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ChristmasCartItem[]>(() => {
    const savedCart = localStorage.getItem(CHRISTMAS_CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem(CHRISTMAS_CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: ChristmasCartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        return prevItems;
      }

      return [...prevItems, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getCartCount = () => {
    return items.length;
  };

  const isInCart = (itemId: string) => {
    return items.some((item) => item.id === itemId);
  };

  return (
    <ChristmasCartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
      }}
    >
      {children}
    </ChristmasCartContext.Provider>
  );
};

export const useChristmasCart = () => {
  const context = useContext(ChristmasCartContext);
  if (context === undefined) {
    throw new Error('useChristmasCart must be used within a ChristmasCartProvider');
  }
  return context;
};
