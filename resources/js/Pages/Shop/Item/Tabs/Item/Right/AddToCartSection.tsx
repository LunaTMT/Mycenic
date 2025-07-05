import React from "react";
import ItemCounter from "../../../ItemCounter";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { useItemContext } from "@/Contexts/Shop/ItemContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

const AddToCartSection: React.FC = () => {
  const { quantity, setQuantity, stock, price, item, selectedOptions, selectedImage } = useItemContext();
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
    <div className="mt-4">
      <div className="flex w-full gap-16 justify-between items-center">
        <ItemCounter quantity={quantity} onQuantityChange={setQuantity} itemId={item?.id ?? 0} className="w-30 h-10" />
        <p className="text-4xl font-semibold text-black dark:text-white tracking-tight">
          £{(parseFloat(price) * quantity).toFixed(2)}
        </p>
      </div>

      <PrimaryButton onClick={handleAddToCart} disabled={stock === 0} className="w-full mt-4">
        {stock > 0 ? "Add to cart" : "Out of Stock"}
      </PrimaryButton>

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{stock} in stock</p>
    </div>
  );
};

export default AddToCartSection;
