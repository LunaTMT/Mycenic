import React, { useState } from "react";
import Counter from "@/Components/Buttons/Counter";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { v4 as uuidv4 } from "uuid";
import { CartItem } from "@/types/Cart/Cart";

const AddToCartSection: React.FC = () => {
  const { item, selectedOptions } = useItemContext();

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

  if (!item) return null;

  const price = parseFloat(item.price as any) || 0;
  const stock = item.stock || 0;

  const handleAddToCart = () => {
    if (!item) return;

    const cartItem: CartItem = {
      id: 0,             // backend ID will be set after saving
      tempId: uuidv4(),  // temporary frontend-only ID
      cart_id: 0,        // frontend temp; backend will set actual cart_id
      item_id: item.id,  // numeric ID of the item
      quantity,
      selected_options: selectedOptions || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      item: item,        // include the full Item object
    };

    addToCart(cartItem);
  };



  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <Counter
            quantity={quantity}
            onChange={setQuantity}
            maxStock={stock}
            className="w-28 h-10"
          />
        </div>
        <p className="text-3xl font-bold tracking-tight text-black dark:text-white whitespace-nowrap">
          £{(price * quantity).toFixed(2)}
        </p>
      </div>

      <div className="flex mt-2">
        <PrimaryButton
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="w-1/2 max-w-2xl py-3 text-base font-semibold"
        >
          {stock > 0 ? "Add to cart" : "Out of Stock"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AddToCartSection;
