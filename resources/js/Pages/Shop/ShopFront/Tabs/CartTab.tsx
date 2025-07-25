// src/Pages/Shop/ShopFront/Tabs/CartTab.tsx
import React from "react";
import { useShop } from "@/Contexts/Shop/ShopContext";

const CartTab: React.FC = () => {
  const { cartItems } = useShop();

  return (
    <div className="p-4">
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <ul className="space-y-2">
          {cartItems.map((item) => (
            <li key={item.id} className="border p-2 rounded-md dark:border-white/20 border-black/20">
              {item.name} – {item.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartTab;
