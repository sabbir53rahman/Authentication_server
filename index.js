const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb"); // Import ObjectId
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.at16f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const usersCollection = client
      .db("AuthenticationUserDB")
      .collection("users");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const existingUser = await usersCollection.findOne({ email: user.email });

      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }

      // Insert the new user
      const result = await usersCollection.insertOne(user);

      // Fetch the inserted user by ID
      const newUser = await usersCollection.findOne({ _id: result.insertedId });

      res.send({
        message: "User created successfully",
        data: newUser, // Return the full user object
      });
    });

    //users api
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/currentUser", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (!existingUser) {
        return res.send({
          message: "User doesn't exist.",
          data: [], // Return an empty array for the data
        });
      }

      if (existingUser.password !== user.password) {
        return res.send({
          message: "Password is wrong.",
          data: [], // Return an empty array for the data
        });
      }

      res.send({
        message: "User found successfully.",
        data: existingUser, // Return the user data if everything matches
      });
    });

    //currentuser api
    app.get("/currentUser", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Authentication server is running");
});

app.listen(port, () => {
  console.log(`Authentication server is running on port ${port}`);
});
