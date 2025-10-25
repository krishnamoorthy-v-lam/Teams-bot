const { createRAGVectorStore } = require("../utils/Rag");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const ticketSchema = z.object({
  message: z.string().min(1).describe("User question to search FAQs"),
});

let ragStore;

const getRagStore = async () => {
  if (!ragStore) {
    ragStore = await createRAGVectorStore();
  }
  return ragStore;
};

const FreqQues = tool(
  async ({ message }) => {
    const store = await getRagStore();
    console.log(message, "message");
    console.log("store: ", store);
    const results = await store.similaritySearch(message, 5);
    console.log(results, "-->", message);
    return results[0]?.metadata?.solution || "No solution found.";
  },
  {
    name: "RAGRetriever",
    description: `
        Use this tool to answer user questions from FAQ documents
      `,
    schema: ticketSchema,
  }
);

module.exports = { FreqQues };
