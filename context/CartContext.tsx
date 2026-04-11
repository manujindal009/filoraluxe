"use client";

import React, { createContext, useContext, useEffect, useReducer, ReactNode, useRef } from "react";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; selectedOptions?: Record<string, string> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => ({
      total: acc.total + item.product.price * item.quantity,
      itemCount: acc.itemCount + item.quantity,
    }),
    { total: 0, itemCount: 0 }
  );
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, selectedOptions } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
      );

      const newItems = [...state.items];
      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems.push({
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          selectedOptions,
        });
      }

      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => 
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity: number, selectedOptions?: Record<string, string>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  const isInitialMount = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("filoraluxe_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch (e) {
        console.error("Failed to parse cart from local storage", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem("filoraluxe_cart", JSON.stringify(state));
  }, [state]);

  const addToCart = (product: Product, quantity: number, selectedOptions?: Record<string, string>) => dispatch({ type: 'ADD_ITEM', payload: { product, quantity, selectedOptions } });
  const removeFromCart = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ ...state, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
