import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { AiOutlineClose } from "react-icons/ai";
import Swal from "sweetalert2";
import { Inertia } from "@inertiajs/inertia";
import { Item, User } from "@/types/types";
import { resolveSrc } from "@/utils/resolveSrc";
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

  const imageSrc = resolveSrc(item.images[0] ?? "/assets/images/missing_image.png");

  return (
    <div
      className="relative group  border-1 border-black/30 dark:border-white/20 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 w-full h-full flex flex-col"
    >
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
        href={route("item", { id: item.id })}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="block flex-grow"
      >
        <div className="w-full aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800 ">
          <img
            src={imageSrc}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-3 flex flex-col justify-between font-Poppins text-center h-28">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
              {item.name}
            </h3>
            <p className="text-base font-bold text-black dark:text-gray-100">£{item.price}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <StaticStarRating rating={item.average_rating ?? 0} size={14} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.reviews?.length ?? 0} review{(item.reviews?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ItemCard;
