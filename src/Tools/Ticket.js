const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const ticketModel = require("../model/Ticket");

//Define schema
const ticketSchema = z.object({
  title: z
    .enum(["hardware", "software", "construction", "other"])
    .describe("Type of issue: hardware or software"),
  description: z
    .string()
    .describe("Specify description about the ticket you going to create"),
  name: z.string().describe("User Name"),
  aadObjectId: z.string().describe("unique id that help to identify user"),
});

const createTicket = tool(
  async ({ title, description, name, aadObjectId }) => {
    let payload = {
      description,
      name,
      aadObjectId,
      title,
    };
    return await ticketModel.create(payload);
  },
  {
    name: "create_ticket",
    description: `
      Create a support ticket by gathering all required fields.
      - Ask the user in natural language for the type of issue (hardware, software, construction, etc.)
      - Do not infer the type automatically from user description
      - Ask until the title is clear
    `,
    schema: ticketSchema,
  }
);

const getTicketByUser = tool(
  async ({ aadObjectId }) => {
    return await ticketModel
      .find({ aadObjectId })
      .sort({ status: -1, createdAt: 1 });
  },
  {
    name: "get_open_ticket_by_user",
    description: `
          Use this tool only when the user wants to view their tickets.
      `,
    schema: ticketSchema,
  }
);

module.exports = { createTicket, getTicketByUser };
