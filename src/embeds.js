const Discord = require("discord.js");
const { icon } = require("./../config/config.json");

const commonEmbed = () =>
  new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setAuthor("Barkeeper")
    .attachFiles([icon])
    .setThumbnail("attachment://icon.png");

function sendEmbed(message, embedConverter, channels) {
  const embed = embedConverter(message);
  if (embed) {
    channels.forEach((channel) => {
      channel.send(embed);
    });
  }
}

function guessEmbed(guesses) {
  return commonEmbed()
    .setTitle("Hier sind die Schätzungen")
    .addFields(
      guesses.map((guess) => {
        return {
          name: guess.client.username,
          value: guess.guess <= 0 ? `Keine Schätzung` : `${guess.guess}€`,
          inline: true,
        };
      })
    );
}

function ruleEmbed(rules) {
  return commonEmbed()
    .setTitle("Regeln")
    .addFields(
      rules.map((rule) => {
        return { name: rule, value: rule, inline: true };
      })
    );
}

function scoreEmbed(score) {
  return commonEmbed()
    .setTitle("Die Ergebnisse der letzten Runde")
    .setDescription(`Der richtige Preis war: ${score.actual}€`)
    .addFields(
      score.places.map((ele, ind) => {
        return {
          name:
            (ind === 0 ? "👑 " : "") + ele.place + ". " + ele.client.username,
          value: ele.guess <= 0 ? `Keine Schätzung` : `${ele.guess}€`,
          inline: true,
        };
      })
    );
}

function commandEmbed(commands) {
  return commonEmbed()
    .setTitle("Hier sind alle Befehle aufgelistet")
    .addFields(
      commands.map(({ name, desc, aliases }) => {
        var commandname = name;
        return {
          name: `!${commandname}${aliases.length != 0 ? ` (${aliases})` : ""}`,
          value: `${desc.text} ${
            desc.param ? `\nParameter: ${desc.param}` : ""
          }`,
        };
      })
    );
}

module.exports = { sendEmbed, scoreEmbed, guessEmbed, commandEmbed, ruleEmbed };
