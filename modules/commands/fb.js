const axios = require('axios');
const moment = require('moment');

module.exports.config = {
  name: "fb",
  version: "1.0.0",
  hasPermission: 0,
  credits: "", 
  description: "Get detailed Facebook account info by ID",
  commandCategory: "Member",
  usages: "fb [uid]",
  cooldowns: 5,
};

const originalCredits = "";
module.exports.run = async function({ api, event, args }) {
  if (module.exports.config.credits !== originalCredits) {
    return api.sendMessage("Stop messing with credits", event.threadID);
  }
  if (!args[0]) {
    return api.sendMessage("❌ Please enter a UID.\nTo get a UID, use the command /uid to get your UID or /uid [@tag|link] to get someone else's UID.", event.threadID);
  }  

  const fbId = args[0];
  const apiUrl = `https://api.sumiproject.net/facebook/getinfov2?uid=${fbId}&apikey=apikeysumi`;
  
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    
    if (data) {
      const followersCount = data["subscribers"]["summary"]["total_count"];
      const formattedFollowers = followersCount.toLocaleString('en-US');
      
      let resultMessage = "╭──────Facebook Info───────⭓\n";
      resultMessage += "┌ 👤 User Info\n";
      resultMessage += `├ Name: ${data["name"]}\n`;
      resultMessage += `├ ID: ${data["id"]}\n`;
      resultMessage += `├ Username: ${data["username"]}\n`;
      resultMessage += `├ Language: ${data["locale"]}\n`;
      resultMessage += `├ Hometown: ${data["hometown"] ? data["hometown"]["name"] : "N/A"}\n`;
      resultMessage += `├ FB Link: ${data["link"]}\n`;
      resultMessage += `├ Last Updated: ${moment(data["updated_time"]).format('DD-MM-YYYY')}\n`;
      resultMessage += `├ Account Created: ${moment(data["created_time"]).format('DD-MM-YYYY')}\n`;
      resultMessage += `├ Followers: ${formattedFollowers}\n`;
      resultMessage += `├ About: ${data["about"] ? data["about"] : "N/A"}\n`;
      resultMessage += `├ Birthday: ${data["birthday"] ? moment(data["birthday"], 'MM/DD/YYYY').format('DD/MM/YYYY') : "N/A"}\n`;
      
      let gender = data["gender"] ? data["gender"] : "N/A";
      if (gender === "male") gender = "Male";
      else if (gender === "female") gender = "Female";
      resultMessage += `├ Gender: ${gender}\n`;
      
      resultMessage += `├ Relationship Status: ${data["relationship_status"] ? data["relationship_status"] : "N/A"}\n`;
      resultMessage += `├ Significant Other: ${data["significant_other"] ? data["significant_other"]["name"] : "N/A"}\n`;
      resultMessage += `└─ Favorite Quote: ${data["quotes"] ? data["quotes"] : "N/A"}\n\n`;

      if (data["work"] && data["work"].length > 0) {
        resultMessage += "┌ 💼 Work\n";
        data["work"].forEach((job, index) => {
          resultMessage += `├ Job ${index + 1}:\n`;
          resultMessage += `│ ├ Company: ${job["employer"]["name"]}\n`;
          resultMessage += `│ ├ Position: ${job["position"] ? job["position"]["name"] : "N/A"}\n`;
          resultMessage += `│ ├ Location: ${job["location"] ? job["location"]["name"] : "N/A"}\n`;
          resultMessage += `│ ├ Start Date: ${moment(job["start_date"]).format('DD/MM/YYYY')}\n`;
          resultMessage += `│ └ Description: ${job["description"] ? job["description"] : "N/A"}\n`;
        });
        resultMessage += "╰─────────────⭓\n\n";
      }

      if (data["education"] && data["education"].length > 0) {
        resultMessage += "┌ 🎓 Education\n";
        data["education"].forEach((edu, index) => {
          resultMessage += `├ Education ${index + 1}:\n`;
          resultMessage += `│ ├ School: ${edu["school"]["name"]}\n`;
          resultMessage += `│ ├ Type: ${edu["type"]}\n`;
          resultMessage += `│ ├ Major: ${edu["concentration"] ? edu["concentration"].map(c => c.name).join(", ") : "N/A"}\n`;
          resultMessage += `│ └ Year: ${edu["year"] ? edu["year"]["name"] : "Unknown"}\n`;
        });
        resultMessage += "╰─────────────⭓\n\n";
      }

      resultMessage += "┌ 🛡️ Privacy\n";
      resultMessage += `├ Description: ${data["privacy"] && data["privacy"]["description"] ? data["privacy"]["description"] : "Public"}\n`;
      resultMessage += `├ Who can see: ${data["privacy"] && data["privacy"]["value"] ? data["privacy"]["value"] : "Everyone"}\n`;
      resultMessage += "╰─────────────⭓";

      api.sendMessage(resultMessage, event.threadID);
    } else {
      api.sendMessage("No information found or an error occurred.", event.threadID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("An error occurred while fetching information, possibly due to API issues.", event.threadID);
  }
};
