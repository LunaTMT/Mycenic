import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { AiOutlineClose } from "react-icons/ai";
import Swal from "sweetalert2";
import { Inertia } from "@inertiajs/inertia";
import { User } from "@/types/User";
import { Item } from "@/types/Item";

import StaticStarRating from "../../../Components/Stars/StaticStarRating";

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const isAdmin = auth?.user?.is_admin ?? false;

  const confirmDelete = (itemId: number) => {
    Swal.fire({
      title: "Are you sure?",
      html: "Do you really want to delete this item? <br>This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Inertia.delete(`/items/${itemId}`);
        Swal.fire({
          title: "Success!",
          text: "Item removed",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    });
  };

  return (
    <div className="relative group border-1 border-black/30 dark:border-white/20 bg-white/50 dark:bg-[#424549]/80 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 w-full h-full flex flex-col">
      {isAdmin && (
        <button
          className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
          onClick={() => confirmDelete(item.id)}
          aria-label="Delete item"
        >
          <AiOutlineClose size={16} />
        </button>
      )}

      <Link
        href={route("items.show", { item: item.id })}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="block flex-grow"
      >
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Full overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <StaticStarRating rating={item.average_rating ?? 0} size={16} />
              <p className="text-xs text-gray-200">
                {item.reviews_count} review{item.reviews_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 text-center h-14 flex items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {item.name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default ItemCard;
