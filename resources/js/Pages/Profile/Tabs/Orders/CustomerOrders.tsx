import Item from "@/Pages/Cart/Left/Item";
import { OrderProvider, useOrders } from "@/Contexts/Orders/OrdersContext";


function CustomerOrdersContent() {


  const { orders, loading } = useOrders();
  console.log(orders);


  if (loading)
    return <p className="text-center">Loading orders...</p>;

  if (!orders.length)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="rounded-xl shadow-lg border border-black/20 bg-white dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 text-lg text-center p-5">
          No orders found.
        </p>
      </div>
    );

  return (
    <div className="w-full h-[85vh] flex flex-col gap-6 overflow-auto">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg bg-white dark:bg-[#424549] border-black/20 dark:border-white/20 p-4 shadow-lg">
          {/* Order Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Order #{order.id}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(order.created_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Order Items */}
          <div className="flex flex-col gap-4">
            {order.cart?.items?.map((item: any) => {
              
              return <Item key={item.id} item={item} canChange={false} />;
            })}
          </div>

          {/* Order Summary */}
          <div className="mt-4 border-t border-black/20 dark:border-white/20 pt-4 flex flex-col gap-2 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>£{order.cart.subtotal}</span>
            </div>
            {order.cart?.shipping_cost && (
              <div className="flex justify-between text-green-600">
                <span>Shipping</span>
                <span>£{order.cart.shipping_cost}</span>
              </div>
            )}
            {order.cart?.discount && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-£{order.cart.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>£{order.cart.total}</span>
            </div>

            {/* Shipping status */}
            <div className="mt-2">
              <span className="font-medium">Status:</span>{" "}
              <span className="text-sm">{order.shipping_status || "Pending"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Wrap the page with OrderProvider so useOrders works
export default function CustomerOrders() {
  console.log("CustomerOrders render");
  return (
    <OrderProvider>
      <CustomerOrdersContent />
    </OrderProvider>
  );
}
