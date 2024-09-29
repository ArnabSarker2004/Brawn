/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // Dark mode configuration
  content: [
    './pages/**/*.{js,jsx}', 
    './components/**/*.{js,jsx}', 
    './app/**/*.{js,jsx}', 
    './src/**/*.{js,jsx}'
  ], // Paths for Tailwind to scan
  prefix: "", // No prefix needed
  corePlugins: {
    preflight: false, // Disable Tailwind's CSS reset (Preflight)
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: '#1aac83',
        brandHover: '#159670',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" }
        },
        blinkCaret: {
          "50%": { borderColor: "transparent" }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        typewriter: "typewriter 2s steps(11) forwards",
        caret: 'typewriter 2s steps(11) forwards, blink 1s steps(11) infinite 2s',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar': {
          'scrollbar-width': 'none', /* Firefox */
          '-ms-overflow-style': 'none',  /* IE and Edge */
          '&::-webkit-scrollbar': {
            display: 'none',  /* Chrome, Safari, and Opera */
          },
        },
      });
    },
  ],
}
