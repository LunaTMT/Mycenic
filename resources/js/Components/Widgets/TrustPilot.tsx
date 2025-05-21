import { useEffect } from 'react';

export default function TrustpilotWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://invitejs.trustpilot.com/tp.min.js';
    script.async = true;
    script.onload = () => {
      if (window.tp) {
        window.tp('register', 'sxv5StylVDv7vqle');
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      {/* Trustpilot widget */}


      {/* Trustpilot clickable icon */}
      <a
        href="https://uk.trustpilot.com/review/yourdomain.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Trustpilot Reviews"
        className="inline-flex items-center gap-2 mt-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 36 36"
          width="45"
          height="45"
          className="inline-block"
        >
          <path
            fill="#00B67A"
            d="M18 0C8.058 0 0 8.058 0 18s8.058 18 18 18 18-8.058 18-18S27.942 0 18 0zm6.864 25.37-6.355-4.328-6.355 4.328 2.43-7.44-6.354-4.328h7.848L18 6.375l2.922 7.227h7.848l-6.354 4.328 2.43 7.44z"
          />
        </svg>
        <span className="text-lg font-Poppins text-white">Trustpilot</span>
      </a>
    </div>
  );
}
