import React from "react";

const aboutUs = [
  {
    heading: "About Us",
    content: [
      {
        title: "1. Our Mission",
        content:
          "At Mycenic, our mission is to empower enthusiasts and researchers by providing high-quality mycological products and educational resources.",
      },
      {
        title: "2. Our History",
        content:
          "Founded in 2020, we’ve grown from a small spore distributor to a full-fledged mycology hub offering spores, grow kits, and expert knowledge.",
      },
      {
        title: "3. Meet the Team",
        content:
          "Our team of biologists, hobbyists, and educators work together to ensure you have the best possible experience.",
      },
      {
        title: "4. Our Values",
        content:
          "We are committed to sustainability, scientific rigor, and fostering a responsible mycology community.",
      },
      {
        title: "5. Our Location",
        content:
          "Headquartered in London, UK, we ship worldwide and collaborate with labs and universities globally.",
      },
      {
        title: "6. Careers",
        content:
          "Interested in joining us? Check our careers page or email us at info@example.com for open positions.",
      },
    ],
  },
];

export default function AboutUs() {
  return (
    <div className="w-full dark:bg-[#424549] p-4">

      {aboutUs[0].content.map((section, idx) => (
        <div key={idx} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {section.title}
          </h2>
          <p className="text-gray-800 dark:text-gray-200">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
