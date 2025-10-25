const { ChatOpenAI } = require("@langchain/openai");
const config = require("../config");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const client = new ChatOpenAI({
  apiKey: config.openAIKey,
  model: "gpt-4o-mini",
});
const ALLOWED_TITLES = ["hardware", "software", "construction", "other"];

module.exports.detectIntent = async (message) => {
  const prompt = `
    Determine the user intent from the following message.
    Possible intents: queryFAQ, createTicket, getTickets
    Respond only with the intent name.

    Message: "${message}"
  `;
  const response = await client.invoke(prompt);
  return response.text.trim();
};

module.exports.inferTitle = tool(
  async ({ description }) => {
    const prompt = `
      Read the user description and choose the type of issue.
      Only reply with one of these values: hardware, software, construction, other.
      Description: "${description}"
    `;
    console.log({ prompt });
    const llmResult = await client.invoke(prompt); // ChatOpenAI instance

    const title = llmResult.text?.trim().toLowerCase();
    if (!ALLOWED_TITLES.includes(title)) {
      return "other"; // fallback if LLM misclassifies
    }
    return  title 
  },
  {
    name: "infer_ticket_title",
    description: "Infer ticket title from user description safely.",
    schema: z.object({
      description: z
        .string()
        .describe("Specify description about the ticket you going to create"),
    }),
  }
);

// const intent = await detectIntent("Why does my app keep crashing?");
// console.log(intent);  // queryFAQ
