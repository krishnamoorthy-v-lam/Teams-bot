const axios = require("axios");

async function getUserEmail(aadObjectId, token) {
  const url = `https://graph.microsoft.com/v1.0/users/${aadObjectId}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.mail || response.data.userPrincipalName;
}


module.exports = getUserEmail