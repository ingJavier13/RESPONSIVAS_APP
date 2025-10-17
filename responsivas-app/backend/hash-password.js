const bcrypt = require('bcrypt');
const password = 'IGbiogas.2023'; // Cambia esto por la contraseña que quieras usar
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Tu hash es:');
  console.log(hash);
});