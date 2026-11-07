import dotenv from "dotenv";
import path from "node:path";

// src/config y dist/config se encuentran a dos niveles de Backend/.env.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
