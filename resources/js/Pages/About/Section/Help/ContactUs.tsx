import React from "react";

const contactUs = [
  {
    heading: "Contact Us",
    content: [
      {
        title: "1. Customer Support",
        content:
          "Our dedicated customer support team is available Monday to Friday, 9am to 6pm GMT to assist you with any queries or issues.",
      },
      {
        title: "2. Email Us",
        content:
          "You can reach our support via email at support@example.com. We aim to respond within 24 hours.",
      },
      {
        title: "3. Call Us",
        content:
          "For immediate assistance, call us at +44 (0)20 1234 5678 during business hours.",
      },
      {
        title: "4. Live Chat",
        content:
          "Click the chat icon at the bottom right of your screen to start a live chat with our agents.",
      },
      {
        title: "5. Visit Us",
        content:
          "Our head office is located at 123 Mycenic Lane, London, UK. Visits are by appointment only.",
      },
      {
        title: "6. Feedback",
        content:
          "We value your feedback. Please share your thoughts via feedback@example.com.",
      },
    ],
  },
];

export default function ContactUs() {
  return (
    <div className="w-full dark:bg-[#424549] border border-black/20 dark:border-white/20 p-6 rounded-xl shadow-2xl">

      {contactUs[0].content.map((section, idx) => (
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
