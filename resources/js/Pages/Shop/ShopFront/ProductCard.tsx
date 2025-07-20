import React from 'react';
import { Link } from '@inertiajs/react';
import { AiOutlineClose } from "react-icons/ai";
import Swal from 'sweetalert2';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import { useShop } from '@/Contexts/Shop/ShopContext';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { auth } = usePage().props as any;
  const role = auth?.user?.role;
  const images = product.images ? JSON.parse(product.images) : [];
  const imageSources = product.image_sources ? JSON.parse(product.image_sources) : [];

  const { filterVisible } = useShop();

  const confirmDelete = (itemId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      html: "Do you really want to delete this item? <br> This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Inertia.delete(`/items/${itemId}`);
        Swal.fire({ title: "Success!", text: "Item removed", icon: "success", confirmButtonText: "OK" });
      }
    });
  };

  const resolveSrc = (src: string, sourceType?: string) => {
    if (sourceType === "test" || (src && src.startsWith("http"))) return src;
    return `/${src}`;
  };

  const imageSrc =
    imageSources.length > 0
      ? resolveSrc(imageSources[0], "test")
      : images.length > 0
      ? resolveSrc(images[0])
      : "/assets/images/missing_image.png";

  return (
    <div className="relative w-full h-full bg-white dark:bg-[#424549] dark:border-white/20 border border-black/20 shadow-2xl rounded-md overflow-hidden">
      {role === 'admin' && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            onClick={() => confirmDelete(product.id)}
          >
            <AiOutlineClose size={20} />
          </button>
        </div>
      )}

      <Link
        href={route('item', { id: product.id })}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="w-full aspect-square rounded-t-md flex items-center justify-center bg-white/10">
          <img
            src={imageSrc}
            alt="Product Image"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="w-full flex flex-col items-center justify-center p-4 font-Poppins">
          <p className="text-gray-800 dark:text-white">{product.name}</p>
          <p className="text-gray-700 dark:text-gray-300 italic">{product.category}</p>
          <p className="text-lg text-gray-900 dark:text-gray-200 font-semibold">£{product.price}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
