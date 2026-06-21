/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'apple-bg': '#F5F5F7',
        'apple-dark': '#1D1D1F',
        'apple-blue': '#6366F1',
        'apple-blue-hover': '#4F46E5',
        'apple-gray': '#6E6E73',
        'apple-light-gray': '#E8E8ED',
        'apple-white': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      maxWidth: {
        'content': '1100px',
      },
    },
  },
  plugins: [],
};
