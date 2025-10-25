const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const ticketModel = require("../model/Ticket");
const moment = require("moment");
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
    if (!title) {
      return "Please specify the type of issue: hardware, software, construction, or other.";
    }
    if (!name) {
      return "Please provide your full name for the ticket.";
    }
    if (!description) {
      return "Please provide a detailed description of the issue.";
    }
    if (!aadObjectId) {
      return "Cannot create ticket: missing user ID (aadObjectId).";
    }

    let payload = {
      description,
      name,
      aadObjectId,
      title,
    };
    let ticket = await ticketModel.create(payload);
    return `
    Ticket created successfully!  
    - Ticket ID: ${ticket?._id}  
    - Type: ${ticket?.title}  
    - Description: ${ticket?.description}  
    - Date: ${moment(ticket?.createdAt).format("DD/MM/YYYY HH:mm A")}`;
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
    let tickets = await ticketModel
      .find({ aadObjectId })
      .sort({ status: -1, createdAt: 1 });

    const formatted = tickets.map((ticket, index) => {
      return `
      **Ticket ${index + 1}**:\n
        - ID: ${ticket._id}
        - Type: ${ticket.title}
        - Status: ${ticket.status}
        - Description: ${ticket.description}
        - Created by: ${ticket.name}
        - Date: ${moment(ticket.createdAt).format("DD/MM/YYYY HH:mm A")}
        `;
    });

    return formatted.join(`\n`);
  },
  {
    name: "get_open_ticket_by_user",
    description: `
          Use this tool only when the user wants to view their tickets.
      `,
    schema: z.object({
      aadObjectId: z.string().describe("unique id that help to identify user"),
    }),
  }
);

module.exports = { createTicket, getTicketByUser };
