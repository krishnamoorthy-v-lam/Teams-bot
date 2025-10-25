const { ActivityTypes } = require("@microsoft/agents-activity");
const {
  AgentApplication,
  MemoryStorage,
} = require("@microsoft/agents-hosting");
const { ChatOpenAI } = require("@langchain/openai");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { createTicket, getTicketByUser } = require("./Tools/Ticket");
const config = require("./config");
const path = require("path");
const dotenv = require("dotenv");
const { FreqQues } = require("./Tools/FrequentProblem");
const { detectIntent, inferTitle } = require("./utils/Intent");
const { getGraphToken } = require("./utils/Token");
const getUserEmail = require("./utils/UserInfo");

dotenv.config({
  path: path.resolve(__dirname, ".env.playground.user"),
});

const client = new ChatOpenAI({
  apiKey: config.openAIKey,
  model: config.openAIModelName || "gpt-4o-mini",
});
// createTicket, getTicketByUser,
const agent = createReactAgent({
  tools: [FreqQues, createTicket, getTicketByUser],
  llm: client,
  systemPrompt: ` 
  You are an AI agent that can interact with users to manage support tickets.

    Rule 1: For users questions about any issues ALWAYS call the 'FreqQues' tool first.
      - Pass the user's query to 'FreqQues' for similarity search.
      - If a relevant solution is found, return it directly to the user.
    Rule 2: Only if 'FreqQues' returns no solution, ask the user if they want to create a new ticket.
      - If yes, call 'createTicket' with the user's name, AAD Object ID, description, and issue type (hardware/software).
    Rule 3: You can fetch tickets for a user using 'getTicketByUser'.
      - Use the AAD Object ID to find the user's tickets.
    Rule 4: Always respond clearly in natural language.

  `,
  memory: true,
});

const storage = new MemoryStorage();
const agentApp = new AgentApplication({ storage });

agentApp.onConversationUpdate("membersAdded", async (context) => {
  await context.sendActivity(`Hi there! I'm an agent to chat with you.`);
});

const toolRouter = {
  queryFAQ: FreqQues,
  createTicket: createTicket,
  getTickets: getTicketByUser,
};

agentApp.onActivity(ActivityTypes.Message, async (context) => {
  try {
    const userMessage = context.activity.text;

    let intent = await detectIntent(userMessage);
    const selectedTool = toolRouter[intent];
    console.log("intent: ", intent);

    if (!selectedTool) {
      return await context.sendActivity(
        "Sorry, I cannot handle this request yet."
      );
    }

    if (intent === "queryFAQ") {
      result = await selectedTool.invoke({ message: userMessage });
      if (!result || result === "No solution found.") {
        return await context.sendActivity(
          "No FAQ solution found. Do you want to create a ticket?"
        );
      }
      return await context.sendActivity(result);
    }

    if (intent === "createTicket") {
 
      const title = await inferTitle.invoke({ description: userMessage });
      console.log({title: title})
      result = await selectedTool.invoke({
        title,
        name: context.activity.from?.name,
        aadObjectId: context.activity.from?.aadObjectId,
        description: userMessage,
      });
      return await context.sendActivity(`${result}`);
    }

    if (intent === "getTickets") {
      result = await selectedTool.invoke({
        aadObjectId: context.activity.from?.aadObjectId,
      });
      return await context.sendActivity(result);
    }

    // const result = await agent.invoke({
    // messages: [
    //   {
    //     role: "user",
    //     content: `
    //       aadObjectId: ${context.activity.from?.aadObjectId}
    //       userName: ${context.activity.from?.name},
    //       message: ${context.activity.text}
    //     `,
    //   },
    // ],
    // });

    // const aiResponse =
    //   result?.messages?.[result.messages.length - 1]?.content ||
    //   "Sorry, I didn’t understand that.";

    // console.log("Agent:", aiResponse);
    // await context.sendActivity(aiResponse);
  } catch (error) {
    console.error("Error:", error);
    await context.sendActivity(
      "Oops! Something went wrong processing your message."
    );
  }
});

module.exports = { agentApp };
