export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255,255,255,0.08)",
        neon: "#7c7cff",
        darkbg: "#0b0f1a",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
