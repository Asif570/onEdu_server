const jwt = require("jsonwebtoken");
const TokenGenerate = (payload) => {
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  return token;
};
module.exports = TokenGenerate;
