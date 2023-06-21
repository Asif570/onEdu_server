const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const http = require("http");
const cors = require("cors");
const TokenGenerate = require("./utils/JwtToken");
const verifyJWT = require("./utils/VerifyJwt");
const { getTime } = require("date-fns");
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
  if (!user) {
    return res.status(401).send({ error: "Unauthorized access!" });
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
      const { email } = req.body;
      const token = TokenGenerate({ email });

      res.status(201).send({ token });
    });
    // find current userdetails
    app.post("/currentuser", async (req, res) => {
      const { email } = req.body;
      const result = await userColl.findOne({ email: email });

      res.status(200).send({ result });
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
      const allreadyUser = await userColl.findOne({ email: email });
      if (allreadyUser) {
        const token = TokenGenerate({ email });

        res.status(201).send({ token });
        return;
      }

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
      // res.cookie("token", token);

      res.status(201).send({ result, token });
    });
    // add any class
    app.post("/class", verifyJWT, IsInstructor, async (req, res) => {
      const {
        class_name,
        instructor,
        email,
        class_photo_url,
        status = "pending",
        seats = 0,
        students = [],
        price = 0,
      } = req.body;
      const doc = {
        class_name: class_name,
        instructor: instructor,
        email: email,
        class_photo_url: class_photo_url,
        status: status,
        seats: parseInt(seats),
        students: students,
        price: parseInt(price),
        issueDate: getTime(new Date()),
      };
      const result = await classColl.insertOne(doc);
      res.status(201).send(result);
    });
    // get classes
    app.get("/class", async (_req, res) => {
      const result = await classColl.find().sort({ issueDate: -1 }).toArray();
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
