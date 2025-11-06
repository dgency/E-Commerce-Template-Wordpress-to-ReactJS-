/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from "react";

interface CartDrawerContextProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartDrawerContext = createContext<CartDrawerContextProps | undefined>(undefined);

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext);
  if (!context) throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  return context;
};

export const CartDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CartDrawerContext.Provider>
  );
};
