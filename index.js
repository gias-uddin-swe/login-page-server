const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqsch.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const adminCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("admin");
  const usersCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("users");

  app.post("/login", (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);
    adminCollection
      .find({ email: req.body.email })
      .toArray()
      .then((result) => {
        if (result.length < 1) {
          console.log("user not found");
          return res.send(false);
        }
        adminCollection
          .find({ pass: req.body.password })
          .toArray()
          .then((documents) => {
            if (documents.length < 1) {
              console.log("password not found");
              return res.send(false);
            } else {
              res.send(true);
              console.log("successfully logged in");
            }
          });
      });
  });

  app.post("/addUser", (req, res) => {
    usersCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/users", (req, res) => {
    usersCollection.find({}).toArray((err, result) => {
      res.send(result);
    });
  });

  app.delete("/deleteUser", (req, res) => {
    usersCollection
      .deleteOne({ _id: ObjectId(req.query.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
        console.log(result.deletedCount > 0);
      });
  });
});

app.listen(process.env.PORT || port);
