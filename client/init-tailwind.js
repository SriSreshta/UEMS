// init-tailwind.js
import { writeFileSync } from "fs";

// Tailwind config
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

// PostCSS config
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

// Write files
writeFileSync("tailwind.config.js", tailwindConfig);
writeFileSync("postcss.config.js", postcssConfig);

console.log("✅ Tailwind config files created successfully!");
