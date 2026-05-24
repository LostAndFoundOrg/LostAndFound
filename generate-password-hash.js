/**
 * Утилита для генерации BCrypt-хэша пароля администратора.
 * Запуск: node generate-password-hash.js
 *
 * Требует: npm install bcryptjs
 */
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter admin password: ", (password) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log("\n✅ BCrypt hash (paste into ADMIN_PASSWORD_HASH):");
  console.log(hash);
  rl.close();
});
