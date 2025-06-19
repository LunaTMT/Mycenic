import React from 'react';
import { Link } from '@inertiajs/react';
import CartCounter from './Counter';
import { useCart, CartItem } from "@/Contexts/CartContext";

interface CartItemProps {
  item: CartItem;
}

const Item: React.FC<CartItemProps> = ({ item }) => {
  const { changeItemQuantity } = useCart();

  return (
    <div className="relative flex gap-4 items-center p-4  w-full  rounded-xl border border-gray-400/60 dark:border-white/20 bg-white dark:bg-[#424549] shadow-sm hover:shadow-md transition ">
      
      {/* Image */}
      <div className="w-18 h-18 flex-shrink-0 relative group">
        <Link href={route("item", { id: item.id })}>
          <img
            src={`/${item.image}`}
            alt={item.name}
            className="w-full h-full border-gray-400/40 dark:border-white/10 object-contain rounded-md border "
          />
       
        </Link>
      </div>

      {/* Details */}
      <div className="flex-1">
        <Link href={route("item", { id: item.id })}>
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {item.name.split('-')[0]}
          </h2>
        </Link>
        <div className="mt-1 text-base text-gray-500 dark:text-gray-400">
          £{item.total.toFixed(2)}
        </div>
      </div>

      {/* Counter - Absolutely positioned */}
      <div className="absolute bottom-4 right-4">
        <CartCounter
          quantity={item.quantity}
          onQuantityChange={(newQuantity) =>
            changeItemQuantity(item.id, newQuantity)
          }
          itemId={item.id}
          className="w-24 h-9 p-1"
        />
      </div>
    </div>
  );
};

export default Item;
