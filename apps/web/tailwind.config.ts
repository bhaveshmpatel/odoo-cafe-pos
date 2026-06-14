import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      colors: {
        // FIXED: Added missing semantic tokens for your React page code
        foreground: "#111111", 
        "muted-foreground": "#6b7280",
        
        primary: "#111111",
        "primary-active": "#242424",
        "primary-disabled": "#e5e7eb",
        ink: "#111111",
        body: "#374151",
        muted: "#6b7280",
        "muted-soft": "#898989",
        hairline: "#e5e7eb",
        "hairline-soft": "#f3f4f6",
        canvas: "#ffffff",
        "surface-soft": "#f8f9fa",
        "surface-card": "#f5f5f5",
        "surface-strong": "#e5e7eb",
        "surface-dark": "#101010",
        "surface-dark-elevated": "#1a1a1a",
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "on-dark-soft": "#a1a1aa",
        brand: "#3b82f6",
        "brand-dark": "#2563eb",
        "brand-accent": "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        "badge-orange": "#fb923c",
        "badge-pink": "#ec4899",
        "badge-violet": "#8b5cf6",
        "badge-emerald": "#34d399",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Cal Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
      },
      spacing: {
        // FIXED: Prefixed with 'custom-' to stop overriding layout widths
        "custom-xxs": "4px",
        "custom-xs": "8px",
        "custom-sm": "12px",
        "custom-md": "16px",
        "custom-lg": "24px",
        "custom-xl": "32px",
        "custom-xxl": "48px",
        "custom-section": "96px",
      },
    },
  },
  plugins: [],
};

export default config;
