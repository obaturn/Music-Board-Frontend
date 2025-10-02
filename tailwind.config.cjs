/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spotify-inspired color palette
        spotify: {
          black: '#121212',
          dark: '#181818',
          light: '#282828',
          gray: '#535353',
          'gray-light': '#b3b3b3',
          white: '#ffffff',
          green: '#1db954',
          'green-hover': '#1ed760',
          'green-dark': '#1aa34a',
        },
        // Keep existing brand colors for compatibility
        'brand-primary': '#1db954',
        'brand-secondary': '#121212',
        'brand-light': '#282828',
        'brand-gray': '#535353',
        'brand-text': '#ffffff',
        'brand-subtext': '#b3b3b3',
      },
      fontFamily: {
        // Spotify uses Circular, but we'll use system fonts
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
      },
      boxShadow: {
        'spotify': '0 4px 60px rgba(0, 0, 0, 0.5)',
        'spotify-hover': '0 8px 24px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
}