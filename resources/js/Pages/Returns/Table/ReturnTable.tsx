import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";
import ReturnRow from "./Row/ReturnRow";

import type { Return } from "@/types"; // Adjust this import to match your project

type ReturnTableProps = {
  returns: Return[];
};

export default function ReturnTable({ returns }: ReturnTableProps) {
  const { props } = usePage();
  const auth = props.auth;

  return (
    <motion.div className="w-full h-full overflow-hidden rounded-xl shadow-lg border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200">
      <table className="w-full">
        <thead className="text-black bg-white dark:bg-[#1e2124] dark:text-white">
          <tr>
            <th className="py-3">Return ID</th>
            <th className="py-3">Return Status</th>
            <th className="py-3">Shipping Status</th>
            <th className="py-3">Payment Status</th>
            <th className="py-3">Completed At</th>
            {auth?.user?.role === "admin" && <th className="py-3">Customer</th>}
            <th className="py-3 text-center align-middle"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-black/20 dark:divide-white/20">
          {returns.map((ret) => (
            <ReturnRow key={ret.id} returnData={ret}  />
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
