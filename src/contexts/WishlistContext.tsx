import { createContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export type WishlistItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  inStock?: boolean;
};

interface WishlistContextType {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  isWished: (id: string) => boolean;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const storageKey = useMemo(() => `wishlist_${user?.id ?? 'guest'}`, [user?.id]);
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setItems(JSON.parse(raw));
      else setItems([]);
    } catch {
      setItems([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const add = (item: WishlistItem) => {
    setItems((prev) => (prev.find((i) => i.id === item.id) ? prev : [item, ...prev]));
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggle = (item: WishlistItem) => {
    setItems((prev) => (prev.find((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [item, ...prev]));
  };

  const isWished = (id: string) => items.some((i) => i.id === id);

  const clear = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, add, remove, toggle, isWished, clear }}>
      {children}
    </WishlistContext.Provider>
  );
};

export { WishlistContext };
