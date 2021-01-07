const Discord = require("discord.js");
const discord_config = require("../config/discord.json");
const prefix = require("../config/config.json").prefix;

const client = new Discord.Client();

console.log("Discord-Bot is running!");

client.on("message", function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();
  switch (command) {
    case "help": // displays all commands
      break;
    case "ping":
      const timeTaken = Date.now() - message.createdTimestamp;
      message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
      break;
    case "test":
      message.reply(`Geiler Test um ${Date.now()}`);
      break;
    case "recipe": // creates new recipe with ingredients, preparation instructions
      message.reply(
        `Es wurde ein neues Rezept hinzuegefuegt: ${args.join(" und ")}`
      );
      break;
    case "idea": // adds an idea what can be cooked in an new recipe
      break;
    case "search": // searches in the web for recipes with a/ more given ingredients
      break;
    default:
      message.reply(`Unrecognized Command!`);
      break;
  }
});

client.login(discord_config.BOT_TOKEN);
