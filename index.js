const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const http = require("http");
const cors = require("cors");
const HashedPassword = require("./utils/HashPassword");
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
async function run() {
  const DB = client.db("onedu");
  const userColl = DB.collection("user");
  try {
    // add any user
    app.post("/user/register", async (req, res) => {
      const {
        name,
        email,
        password,
        photo_url = "",
        address = "",
        gender = "",
        phone = "",
      } = req.body;
      const hashedpass = HashedPassword(password);
      const doc = {
        name: name,
        email: email,
        hashedPassword: hashedpass,
        photo_url: photo_url,
        address: address,
        gender: gender,
        phone: phone,
        role: "user",
      };
      const result = await userColl.insertOne(doc);

      res.status(201).send(result);
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
