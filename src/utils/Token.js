const qs = require("qs");
const axios = require("axios")

async function getGraphToken() {
  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: process.env.clientId,
    client_secret: process.env.clientSecret,
    scope: "https://graph.microsoft.com/.default",
  });

  const tokenRes = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    data,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return tokenRes.data.access_token;
}

module.exports = { getGraphToken };
