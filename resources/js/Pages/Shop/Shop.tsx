import { useEffect } from "react";
import Swal from "sweetalert2";
import { Head } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

import FilterButton from "@/Components/Buttons/FilterButton";
import SortDropdown from "@/Components/Dropdown/SortDropdown";
import AddItemButton from "@/Components/Buttons/AddItemButton";
import ProductCard from "@/Pages/Shop/ShopFront/ProductCard";
import Breadcrumb from "@/Components/Nav/Breadcrumb";

import { ShopProvider, useShop } from "@/Contexts/Shop/ShopContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

interface ShopProps {
  auth: { user: any } | null;
  items: any[];
  category: string;
  message: string;
  showFilter: boolean;
  clearCart: boolean;
}

const filters = [
  { label: 'New Arrivals', value: 'new' },
  { label: 'Best Sellers', value: 'best-sellers' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const ShopContent: React.FC<ShopProps> = ({ auth, items, category, message, clearCart }) => {
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const { filteredItems } = useShop();
  const { clearCart: clearCartContext } = useCart();

  useEffect(() => {
    if (message) {
      Swal.fire({
        title: "Success!",
        text: typeof message === "string" ? message : JSON.stringify(message),
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  }, [message, clearCart, clearCartContext]);

  return (
    <Layout
      header={
        <div className=" z-10 w-full  h-[5vh] overflow-visible flex justify-between items-center ">
          <Breadcrumb 
            items={[
              { label: "SHOP", link: route("shop") },
              { label: category, link: route("shop", { category }) },
            ]}
          />
          <div className="flex items-center gap-4 h-full ">
            <FilterButton  />
            <SortDropdown />
            <AddItemButton />
          </div>
        </div>
      }
    >
      <Head title="Shop" />
      <div className="mx-auto min-h-[88vh]  max-w-7xl sm:px-6 lg:px-8 b">
        {filteredItems && filteredItems.length === 0 ? (
        <div className="w-full h-full text-center p-20">
            <h1 className="font-Audrey text-[80px] leading-tight text-black/80 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-t dark:from-[#e7e77a] dark:to-white dark:text-shadow-beige-glow">
            COMING SOON
            </h1>
        </div>
        ) : (
        <div className="grid grid-cols-3 h-full bg- grid-rows-2 gap-6 rounded-lg py-5 transition-all duration-500">
            {filteredItems?.map((product) => (
            <ProductCard key={product.id} product={product} />
            ))}
        </div>
        )}
      </div>
    </Layout>
  );
};

const Shop: React.FC<ShopProps> = (props) => (
  <ShopProvider items={props.items}>
    <ShopContent {...props} />
  </ShopProvider>
);

export default Shop;
