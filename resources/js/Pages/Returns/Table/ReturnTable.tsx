import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";
import ReturnRow from "./Row/ReturnRow";


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
            <th className="py-3">ID</th>
            <th className="py-3">Verdict</th>
            <th className="py-3">Shipping </th>
            <th className="py-3">Payment </th>
            <th className="py-3">Completed At</th>
            <th className="py-3"></th>
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
