/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        btn: {
          background: "hsl(var(--btn-background))",
          "background-hover": "hsl(var(--btn-background-hover))"
        }
      },
      animation: {
        "flash-green": "flash-green 0.3s",
        "flash-red": "flash-red 0.3s"
      },
      keyframes: {
        "flash-green": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "green" },
          "100%": { backgroundColor: "transparent" }
        },
        "flash-red": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "red" },
          "100%": { backgroundColor: "transparent" }
        }
      }
    }
  },
  plugins: []
}
