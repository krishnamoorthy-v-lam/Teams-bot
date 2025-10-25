
const path = require("path")
const { Pinecone } = require("@pinecone-database/pinecone");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, ".env.playground.user"),
});
console.log(process.env.PINECONE_API_KEY)
const pinecone = new Pinecone({
  apiKey: "pcsk_2XftZ8_2SQUJqG8qyL8Qvi2wqLQENt1RpsA18W7fdYd3xeReH3TRYBnL2ohbwqidz2MpTr"
});

async function initPinecone() {
  const indexName = "frequent-problems";

  // Check if index exists; if not, create it
  const existingIndexes = await pinecone.listIndexes();
  if (!existingIndexes.indexes.map(i => i.name).includes(indexName)) {
    console.log("Creating new Pinecone index...");
    await pinecone.createIndex({
      name: indexName,
      dimension: 3072, // use 1536 if using text-embedding-3-small
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    console.log("Index created successfully!");
  } else {
    console.log("Index already exists ✅");
  }

  const index = pinecone.index(indexName);
  return index;
}

module.exports = { initPinecone };
