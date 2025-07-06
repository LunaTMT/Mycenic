import React from "react";
import ItemCounter from "./ItemCounter";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { useItemContext } from "@/Contexts/Shop/ItemContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

const AddToCartSection: React.FC = () => {
  const {
    quantity,
    setQuantity,
    stock,
    price,
    item,
    selectedOptions,
    selectedImage,
  } = useItemContext();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (stock === 0 || !item) return;

    addToCart(
      {
        id: item.id,
        name: item.name,
        price: parseFloat(price),
        image: selectedImage,
        quantity,
        total: parseFloat(price) * quantity,
        weight: 0.1,
        category: item.category,
        isPsyilocybinSpores: item.isPsyilocybinSpores,
        selectedOptions,
      },
      quantity
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Quantity + Total Price */}
      <div className="flex items-center justify-between gap-6">
        <ItemCounter
          quantity={quantity}
          onQuantityChange={setQuantity}
          itemId={item?.id ?? 0}
          className="w-32 h-12"
        />

        <p className="text-3xl font-bold tracking-tight text-black dark:text-white whitespace-nowrap">
          £{(parseFloat(price) * quantity).toFixed(2)}
        </p>
      </div>

      {/* Button and Stock in one row */}
      <div className="flex items-center justify-between mt-2">
        <PrimaryButton
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="w-1/2 py-3 text-base font-semibold"
        >
          {stock > 0 ? "Add to cart" : "Out of Stock"}
        </PrimaryButton>

        <p className="text-sm text-right text-gray-500 dark:text-gray-400 ml-4 whitespace-nowrap">
          {stock} {stock === 1 ? "item" : "items"} in stock
        </p>
      </div>
    </div>
  );
};

export default AddToCartSection;
