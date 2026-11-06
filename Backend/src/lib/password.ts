import { randomBytes, scrypt as scryptCallback } from "node:crypto";

// Cifrar la contraseña utilizando scrypt.
// La contraseña original nunca se guarda en la base de datos.
export function generarPasswordHash(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, 64, (error, resultado) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`scrypt$${salt}$${resultado.toString("hex")}`);
    });
  });
}

