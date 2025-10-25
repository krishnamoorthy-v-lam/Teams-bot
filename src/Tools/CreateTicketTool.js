// Tools/CreateTicketTool.js
const { tool } = require("langchain/core/tools");
const { z } = require("zod");
const Ticket = require("../model/Ticket");

const CreateTicketTool = tool(
  async ({
    title,
    description,
    priority = "medium",
    category = "general",
    createdBy,
  }) => {
    try {
      // Validate required fields
      if (!title || !description || !createdBy) {
        return "Error: Title, description, and createdBy are required fields.";
      }

      // Validate title length
      if (title.length < 5 || title.length > 100) {
        return "Error: Title must be between 5 and 100 characters.";
      }

      // Validate description length
      if (description.length < 10 || description.length > 1000) {
        return "Error: Description must be between 10 and 1000 characters.";
      }

      // Validate priority
      const validPriorities = ["low", "medium", "high", "critical"];
      if (!validPriorities.includes(priority)) {
        return "Error: Priority must be one of: low, medium, high, critical.";
      }

      // Validate category
      const validCategories = [
        "network",
        "hardware",
        "email",
        "software",
        "security",
        "general",
      ];
      if (!validCategories.includes(category)) {
        return "Error: Category must be one of: network, hardware, email, software, security, general.";
      }

      // Create ticket
      const ticket = new Ticket({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        createdBy: createdBy.trim(),
        assignedTo: getAssignedTeam(category),
      });

      await ticket.save();

      return (
        `✅ Ticket created successfully!\n\n` +
        `🎫 Ticket Number: ${ticket.ticketNumber}\n` +
        `📋 Title: ${ticket.title}\n` +
        `📊 Priority: ${ticket.priority.toUpperCase()}\n` +
        `🏷️ Category: ${ticket.category.toUpperCase()}\n` +
        `👤 Assigned to: ${ticket.assignedTo}\n` +
        `📅 Created: ${ticket.createdAt.toLocaleString()}\n` +
        `📝 Status: ${ticket.status.toUpperCase()}`
      );
    } catch (error) {
      console.error("Error creating ticket:", error);
      return `❌ Error creating ticket: ${error.message}`;
    }
  },
  {
    name: "create_ticket",
    description:
      "Creates a new support ticket. Use this when a user wants to create a new ticket.",
    schema: z.object({
      title: z
        .string()
        .describe("The title/summary of the ticket (5-100 characters)"),
      description: z
        .string()
        .describe("Detailed description of the issue (10-1000 characters)"),
      priority: z
        .enum(["low", "medium", "high", "critical"])
        .optional()
        .describe("Priority level of the ticket"),
      category: z
        .enum([
          "network",
          "hardware",
          "email",
          "software",
          "security",
          "general",
        ])
        .optional()
        .describe("Category of the ticket"),
      createdBy: z.string().describe("Email of the user creating the ticket"),
    }),
  }
);

// Helper function to assign tickets to appropriate teams
function getAssignedTeam(category) {
  const teamAssignments = {
    network: "Network Support Team",
    hardware: "Hardware Support Team",
    email: "Email Support Team",
    software: "Software Support Team",
    security: "Security Team",
    general: "General Support Team",
  };
  return teamAssignments[category] || "General Support Team";
}

module.exports = CreateTicketTool;
