/// <reference types="node" />
import "dotenv/config";
import fs from "fs";
import { defineConfig } from "@hey-api/openapi-ts";

const { VITE_API_URL } = process.env;

const apiDir = `./src/api/queries`;

fs.rmSync(apiDir, { recursive: true, force: true });

console.log({ VITE_API_URL });

export default defineConfig({
  input: `${VITE_API_URL}/docs.json`,
  output: `${apiDir}/testCase`,
  plugins: ["@hey-api/client-fetch", "@tanstack/react-query"],
});
