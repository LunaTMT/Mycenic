import React, { useState } from "react";
import Counter from "@/Components/Buttons/Counter";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { v4 as uuidv4 } from "uuid"; // install uuid

const AddToCartSection: React.FC = () => {
  const { item, selectedOptions } = useItemContext();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

  if (!item) return null;

  const price = parseFloat(item.price as any) || 0;
  const stock = item.stock || 0;

  const handleAddToCart = () => {
    addToCart({
      item: {
        id: item.id,
        name: item.name,
        price: price,
        weight: item.weight,
        image: item.images[0].path,
        isPsyilocybinSpores: item.isPsyilocybinSpores,
      },
      quantity,
      selectedOptions,
    });
  };


  return (
    <div className="mt-6 space-y-4">
      {/* Quantity + Total Price Inline */}
      <div className="flex items-center gap-6">
        {/* Quantity Counter */}
        <div className="flex flex-col items-center">
          <Counter
            quantity={quantity}
            onChange={setQuantity}
            maxStock={stock}
            className="w-28 h-10"
          />
        </div>

        {/* Total Price */}
        <p className="text-3xl font-bold tracking-tight text-black dark:text-white whitespace-nowrap">
          £{(price * quantity).toFixed(2)}
        </p>
      </div>

      {/* Add to Cart Button */}
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
