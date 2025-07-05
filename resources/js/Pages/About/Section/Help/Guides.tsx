import React from "react";

const guides = [
  {
    heading: "Guides",
    content: [
      {
        title: "1. Getting Started",
        content:
          "Learn how to begin your mycology journey with our beginner-friendly instructions and essential tools.",
      },
      {
        title: "2. Spore Storage Tips",
        content:
          "Maximize the shelf life of your spores with proper refrigeration and handling techniques.",
      },
      {
        title: "3. Using Our Grow Kits",
        content:
          "Step-by-step instructions on how to set up and use your grow kit for optimal results.",
      },
      {
        title: "4. Agar Culturing Basics",
        content:
          "Understand the fundamentals of agar use in mycology, including recipes and best practices.",
      },
      {
        title: "5. Troubleshooting Contamination",
        content:
          "Identify common signs of contamination and learn effective prevention strategies.",
      },
      {
        title: "6. Safety & Legal Use",
        content:
          "Important legal and safety information about our products and responsible usage.",
      },
    ],
  },
];

export default function Guides() {
  return (
    <div className="w-full   dark:bg-[#424549] border border-black/20 dark:border-white/20 p-6 rounded-xl shadow-2xl">
      {guides[0].content.map((section, idx) => (
        <div key={idx} className="mb-6"> 
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {section.title}
          </h2>
          <p className="text-gray-800 dark:text-gray-200">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
