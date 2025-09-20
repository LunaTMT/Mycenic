import React, { useState } from "react";
import { motion } from "framer-motion";

interface FilterProps {
  categories: string[];
}

const Filter: React.FC<FilterProps> = ({ categories }) => {
  const [selected, setSelected] = useState<string>("All");

  const handleCategorySelect = (category: string) => {
    setSelected(category);
    console.log(category);
  };

  return (
    <div className="relative 
                    flex flex-col justify-center items-center
                    w-full h-full 
                    bg-transparent border-black 
                    gap-[5%]
                    z-50">
      
      <h2 className="text-xl tracking-normal font-semibold">Cateogries</h2>

      <ul className="space-y-2">
        {categories.map((category, index) => (
          <li key={index}>
            <motion.button
              className={`w-full text-left px-4 py-2 rounded-md transition-all 
                ${selected === category? "bg-blue-500 text-white": "bg-white"}
                hover:underline
              `}

              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </motion.button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Filter;
