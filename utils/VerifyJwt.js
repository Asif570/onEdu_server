const jwt = require("jsonwebtoken");
//middleware function for verifying token
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: "Unauthorized access!" });
  }

  // step -2 . Verify if the provided token is valid or not.
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: "Unauthorized access!" });
    }
    req.decoded = decoded;
    next();
  });
};
module.exports = verifyJWT;
