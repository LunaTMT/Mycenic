import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const guides = [
  {
    heading: "Guides",
    content: [
      { title: "1. Getting Started", content: "Learn how to begin your mycology journey with our beginner-friendly instructions and essential tools." },
      { title: "2. Spore Storage Tips", content: "Maximize the shelf life of your spores with proper refrigeration and handling techniques." },
      { title: "3. Using Our Grow Kits", content: "Step-by-step instructions on how to set up and use your grow kit for optimal results." },
      { title: "4. Agar Culturing Basics", content: "Understand the fundamentals of agar use in mycology, including recipes and best practices." },
      { title: "5. Troubleshooting Contamination", content: "Identify common signs of contamination and learn effective prevention strategies." },
      { title: "6. Safety & Legal Use", content: "Important legal and safety information about our products and responsible usage." },
    ],
  },
];

export default function Guides() {
  return (
    <div className="w-full bg-transparent p-4">
      {guides[0].content.map((section, idx) => (
        <AnimatedSection key={idx} idx={idx}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {section.title}
          </h2>
          <p className="text-gray-800 dark:text-gray-200">{section.content}</p>
        </AnimatedSection>
      ))}
    </div>
  );
}

function AnimatedSection({ children, idx }: { children: React.ReactNode; idx: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="mb-6 will-change-transform will-change-opacity"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        opacity: { duration: 0.5, ease: "easeOut", delay: idx * 0.15 },
        y: { type: "spring", stiffness: 100, damping: 20, delay: idx * 0.15 },
      }}
    >
      {children}
    </motion.div>
  );
}
