const bcrypt = require("bcrypt");
const saltRounds = 10;
const HashPassword = (planepass) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(planepass, salt);
  console.log(hash);
  return hash;
};

module.exports = HashPassword;
