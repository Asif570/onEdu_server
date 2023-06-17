const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const http = require("http");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
app.use([express.json(), cors()]);
app.get("/", (req, res) => {
  res.send("Running");
});

const uri = `mongodb+srv://islamasif570:${process.env.MONGO_PASS}@cluster0.zedao6i.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch {
    (e) => console.log(e);
  }
}
run();

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log("Server is Running At " + PORT);
});
