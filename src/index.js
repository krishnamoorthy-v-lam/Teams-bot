const { startServer } = require("@microsoft/agents-hosting-express");
const { agentApp } = require("./agent");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://krish:krish@krish.xzlgpjf.mongodb.net/tickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongodb Connected"))
  .catch((err) => console.log(err));
startServer(agentApp);
