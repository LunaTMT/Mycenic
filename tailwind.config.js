const defaultTheme = require('tailwindcss/defaultTheme');
const forms = require('@tailwindcss/forms');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.tsx',
  ],

  theme: {
    extend: {
      fontFamily: {
        Audrey: ['Audrey', ...defaultTheme.fontFamily.sans],
        Poppins: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      textShadow: {
        default: '0 2px 0 #000',
        'beige-glow': '0 0 10px rgba(245, 245, 220, 0.8), 0 0 20px rgba(245, 245, 220, 0.6)',
        'slate-glow': '0 0 25px rgba(31, 41, 55, 1), 0 0 45px rgba(31, 41, 55, 0.7), 0 0 60px rgba(55, 65, 81, 1)',
        'golden-glow': '0 0 5px rgba(255, 215, 0, 0.8), 0 0 15px rgba(255, 215, 0, 0.5), 0 0 25px rgba(255, 215, 0, 0.3)',
      },
    },
  },

  darkMode: 'class',

  plugins: [forms, require('tailwindcss-textshadow')],

  corePlugins: {
    preflight: true,
  },

  // Custom scrollbar and additional utilities
  addComponents: {
    '.scrollbar-hidden::-webkit-scrollbar': {
      display: 'none',
    },
    '.scrollbar-hidden': {
      '-ms-overflow-style': 'none', // For Internet Explorer
      'scrollbar-width': 'none',    // For Firefox
    },
  },
};
