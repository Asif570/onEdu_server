const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const http = require("http");
const cors = require("cors");
const TokenGenerate = require("./utils/JwtToken");
const verifyJWT = require("./utils/VerifyJwt");
const PORT = process.env.PORT || 5000;
const app = express();

require("dotenv").config();
app.use([express.json(), cors()]);
app.get("/", (req, res) => {
  res.send("Running");
});

const uri =
  "mongodb+srv://islamasif570:asem123@cluster0.zedao6i.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const DB = client.db("onedu");
const userColl = DB.collection("user");
const classColl = DB.collection("class");
// verify user role
const IsInstructor = async (req, res, next) => {
  const email = req.decoded.email;
  const user = await userColl.findOne({ email: email });
  console.log(email, user, user.role);
  if (!user) {
    return res.status(403).send({ error: "Unauthorized access!" });
  }
  if (user.role !== "instructoor") {
    return res.status(403).send({ error: "Unauthorized access!" });
  }
  req.role = user.role;
  next();
};
async function run() {
  try {
    // for jwt token renew
    app.post("/jwt", (req, res) => {
      const { email, name } = req.body;
      const token = TokenGenerate({ email, name });
      res.cookie("token", token);
      res.status(201).send("created");
    });
    // add any user
    app.post("/user/register", async (req, res) => {
      const {
        name,
        email,
        photo_url = "",
        address = "",
        gender = "",
        phone = "",
      } = req.body;
      const doc = {
        name: name,
        email: email,
        photo_url: photo_url,
        address: address,
        gender: gender,
        phone: phone,
        role: "user",
      };
      const result = await userColl.insertOne(doc);
      const token = TokenGenerate({ email, name });
      res.cookie("token", token);
      res.status(201).send(result);
    });
    // add any user
    app.post("/class", verifyJWT, IsInstructor, async (req, res) => {
      const {
        class_name,
        Instructor_name,
        email,
        photo_url,
        status = "pending",
        sits = 0,
        students = 0,
        price = 0,
      } = req.body;
      const doc = {
        class_name: class_name,
        Instructor_name: Instructor_name,
        email: email,
        photo_url: photo_url,
        status: status,
        sits: parseInt(sits),
        students: parseInt(students),
        price: parseInt(price),
      };
      const result = await classColl.insertOne(doc);
      res.status(201).send(result);
    });
    // get classes
    app.get("/class", async (_req, res) => {
      const result = await classColl.find().toArray();
      res.send(result);
    });
  } catch {
    (err) => console.log(err);
  }
}
run();

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log("Server is Running At " + PORT);
});