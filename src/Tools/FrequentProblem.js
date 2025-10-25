const { createRAGVectorStore } = require("../utils/Rag");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const ticketSchema = z.object({
  input: z.string().min(1).describe("User question to search FAQs"),
});

let ragStore;

const getRagStore = async () => {
  if (!ragStore) {
    ragStore = await createRAGVectorStore();
  }
  return ragStore;
};

const FreqQues = tool(
  async ({ input }) => {
    const store = await getRagStore();
    console.log(input, "input");
    console.log("store: ", store);
    const results = await store.similaritySearch(input, 5);
    console.log(results, "-->", input);
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
