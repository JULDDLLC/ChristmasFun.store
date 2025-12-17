import React from "react";

export type CartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  image?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onClearCart: () => void;
  onRemoveItem: (id: string) => void;
};

export function CartDrawer(props: Props) {
  return (
    <div>
      {/* REAL UI is already implemented elsewhere in your repo */}
    </div>
  );
}

export default CartDrawer;


