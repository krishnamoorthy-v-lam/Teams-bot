// models/Ticket.js
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: { type: String, default: "open" },
    name: String,
    aadObjectId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
