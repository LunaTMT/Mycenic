import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";

import { useCart } from "@/Contexts/CartContext";
import { useDarkMode } from "@/Contexts/DarkModeContext";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

import ItemCounter from "./ItemCounter";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

import "react-toastify/dist/ReactToastify.css";

interface ItemProps {
  auth: { user: any } | null;
  item: {
    id: number;
    name: string;
    price: string;
    stock: number;
    category: string;
    images: string;
    description: string;
    isPsyilocybinSpores: boolean;
  };
}

const Item: React.FC<ItemProps> = ({ auth, item }) => {
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const { addToCart, getStock } = useCart();

  const images: string[] = JSON.parse(item.images);
  const [selectedImage, setSelectedImage] = useState<string>(images[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [stock, setStock] = useState<number>(item.stock);

  useEffect(() => {
    const fetchStock = async () => {
      const updatedStock = await getStock(item.id);
      setStock(updatedStock);
      if (updatedStock === 0) setQuantity(1);
      else if (quantity > updatedStock) setQuantity(updatedStock);
    };
    fetchStock();
  }, [item.id, getStock, quantity]);

  const handleAddToCart = () => {
    if (stock < quantity) return;
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image: selectedImage,
        quantity,
        total: parseFloat(item.price) * quantity,
        weight: 0.1,
        category: item.category,
        isPsyilocybinSpores: item.isPsyilocybinSpores,
      },
      quantity
    );
  };

  const descriptionParagraphs = item.description.split("\n\n");

  return (
    <Layout
      header={
        <div className="h-[5vh] w-full flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: "SHOP", link: route("shop") },
              { label: item.category, link: route("shop", { category: item.category }) },
              { label: item.name },
            ]}
          />
        </div>
      }
    >
      <Head title={`${item.category}/${item.name}`} />

      {/* Background Video */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative w-full h-[85vh] py-6 flex gap-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex w-full h-full gap-6 bg-white rounded-lg">
          {/* Product Info Panel */}
          <div className="w-[35%] h-full p-6 flex flex-col justify-between font-Poppins
                         border-black/20 bg-white dark:bg-[#424549] dark:border-white/20
                          rounded-2xl overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {item.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                {item.category}
              </p>

              <div className="h-fit overflow-y-auto text-gray-700 dark:text-gray-300 pr-2 mb-4">
                {descriptionParagraphs.map((p, i) => (
                  <p key={i} className="mb-2 whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group w-full aspect-square cursor-pointer"
                    onClick={() => setSelectedImage(src)}
                  >
                    <img
                      src={`/${src}`}
                      alt={item.name}
                      className={`rounded-md w-full h-full object-cover border transition-all duration-200 ${
                        selectedImage === src
                          ? "border-gray-400 dark:border-white/50"
                          : "border-transparent"
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex w-full gap-16 justify-between items-center">
                <ItemCounter
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  itemId={item.id}
                  className="w-30 h-10"
                />
                <p className="text-4xl font-semibold text-black dark:text-white tracking-tight">
                  £{(parseFloat(item.price) * quantity).toFixed(2)}
                </p>
              </div>
              <PrimaryButton
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="w-full mt-4"
              >
                {stock > 0 ? "Add to cart" : "Out of Stock"}
              </PrimaryButton>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                {stock} in stock
              </p>
            </div>
          </div>

          {/* Main Image */}
          <div className="w-[65%] h-full flex items-center justify-center
                          bg-white  border border-black/20 dark:bg-[#424549]/80 dark:border-white/20
                           overflow-hidden">
            <img
              src={`/${selectedImage}`}
              alt="Selected"
              className="object-cover w-full h-full p-20"
            />
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </Layout>
  );
};

export default Item;
