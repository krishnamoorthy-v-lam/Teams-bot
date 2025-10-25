const fs = require("fs");
const path = require("path");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { initPinecone } = require("../pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const config = require("../config");

async function createRAGVectorStore() {
  // Step 1: Load your problem-solution JSON
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../frequentProblems.json"), "utf-8")
  );

  // Step 2: Prepare texts and metadata
  const texts = data.map(
    (item) => `${item.problem}\nSolution: ${item.solution}`
  );
  const metadatas = data.map((item, index) => ({
    problem: item.problem,
    solution: item.solution,
    id: index + 1,
  }));

  // Step 3: Create embeddings using OpenAI
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    apiKey: config?.openAIKey,
  });

  // Step 4: Create an in-memory vector store (no persistence)
  const pineconeIndex = await initPinecone();

  const store = await PineconeStore.fromTexts(texts, metadatas, embeddings, {
    pineconeIndex,
    namespace: "mobile-issues",
  });

  console.log(`✅ Uploaded ${texts.length} entries to Pinecone`);
  return store;
}

module.exports = { createRAGVectorStore };
