import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // ----------------------------------
  // Global ignores
  // ----------------------------------
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ----------------------------------
  // Admin boundary enforcement
  // ----------------------------------
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/admin/*"],
              message:
                "Admin components may only be imported by admin routes.",
            },
          ],
        },
      ],
    },
  },

  // ----------------------------------
  // Allow admin pages to import admin components
  // ----------------------------------
  {
    files: ["app/admin/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);
