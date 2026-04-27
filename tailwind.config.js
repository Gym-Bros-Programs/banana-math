/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        text: {
          active: "hsl(var(--text))",
          hover: "hsl(var(--text-hover))",
          inactive: "hsl(var(--muted-text))"
        },
        muted: "hsl(var(--muted-text))",
        border: "hsl(var(--input-border))",
        input: "hsl(var(--input-box))",
        shadow: "hsl(var(--shadow-bg))",
        bright: "hsl(var(--bright))",
        btn: {
          background: "hsl(var(--btn-background))",
          "background-hover": "hsl(var(--btn-background-hover))"
        },
        tab: {
          tab: "hsl(var(--tab-active))",
          "tab-hover": "hsl(var(--tab-hover))"
        }
      },
      animation: {
        "flash-green": "flash-green 0.3s",
        "flash-red": "flash-red 0.3s"
      },
      keyframes: {
        "flash-green": {
          "0%": { backgroundColor: "transparent", color: "black" },
          "50%": { backgroundColor: "green", color: "white" },
          "100%": { backgroundColor: "transparent", color: "black" }
        },
        "flash-red": {
          "0%": { backgroundColor: "transparent", color: "black" },
          "50%": { backgroundColor: "red", color: "white" },
          "100%": { backgroundColor: "transparent", color: "black" }
        }
      }
    }
  },
  plugins: []
}
