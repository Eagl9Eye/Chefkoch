const ChannelListener = require("./types/ChannelListener");
const { Barkeeper, Status } = require("./types/Barkeeper");
const Discord = require("discord.js");
const { BOT_TOKEN } = require("../config/discord.json");
const { icon, prefix } = require("../config/config.json");

const client = new Discord.Client();
const processor = new ChannelListener(prefix);
const barkeeper = new Barkeeper(client);

console.log("Discord-Bot is running!");

processor
  .register("ping")
  .addDesc("Testet die Verbindung zum Bot")
  .with((msg, par) => {
    const timeTaken = Date.now() - msg.createdTimestamp;
    msg.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  });

processor
  .register("help")
  .addAlias("h")
  .addDesc("Zeigt dir alle Befehle und deren Beschreibung")
  .with((msg, par) => {
    msg.channel.send(
      new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Hier sind alle Befehle aufgelistet")
        .attachFiles([icon])
        .setThumbnail("attachment://icon.png")
        .addFields(
          processor.commands.map(({ name, desc, aliases }) => {
            var commandname = name;
            return {
              name: `! ${commandname}${
                aliases.length != 0 ? ` (${aliases})` : ""
              }`,
              value: `${desc.text} ${
                desc.param ? `\nParameter: ${desc.param}` : ""
              }`,
            };
          })
        )
    );
  });

processor
  .register("start drinking")
  .addAlias("start")
  .addDesc("Wenn du die Party starten Willst")
  .with((msg, par) => {
    if (barkeeper.status != Status.BAR) {
      barkeeper.update(Status.BAR);
      msg.reply("Die Bar wurde geöffnet");
    } else {
      msg.reply("Die Bar ist bereits offen");
    }
  });

processor
  .register("disconnect")
  .addAlias("dc")
  .addDesc("Wenn du die Party beenden willst")
  .with((msg, par) => {
    barkeeper.update(Status.NONE);
    msg.reply("Die Bar wurde geschlossen");
  });

processor
  .register("join")
  .addAlias("j")
  .addDesc("Wenn du dich an den Tresen begeben möchtest")
  .with((msg, par) =>
    barkeeper
      .join(msg.author)
      .then((member) => member.send("Willkommen an der Bar"))
      .catch((e) => {
        msg.reply("Die Bar ist leider nicht geöffnet");
      })
  );

processor
  .register("kick")
  .addAlias("k")
  .addDesc("Jemanden von der Theke entfernen")
  .addParamdesc("Name des unerwünschten Gastes")
  .with((msg, par) => {
    barkeeper
      .disconnect(par.join(" "))
      .then(({ username }) => {
        msg.react("👢");
        msg.reply(`${username} wurde von der Bar entfernt`);
      })
      .catch((name) => msg.reply(`${name} ist nicht an der Bar!`));
  });

processor
  .register("round")
  .addAlias("r")
  .addDesc("Um eine neue Runde einzuleuten")
  .with((msg, par) => {
    msg.react("⏱");
    barkeeper
      .startRound()
      .then((embed) => {
        barkeeper.sendToAll(embed);
        msg.channel.send(embed);
      })
      .catch((message) => {
        msg.reply(message);
      });
  });

processor
  .register("price")
  .addAlias("p")
  .addDesc("Wenn der Preis bekannt ist")
  .addParamdesc("Preis")
  .with((msg, par) => {
    barkeeper
      .endRound(par[0])
      .then((embed) => {
        barkeeper.sendToAll(embed);
        msg.channel.send(embed);
      })
      .catch((message) => {
        msg.reply(message);
      });
  });

processor
  .register("rules")
  .addDesc("Gibt dir die Regeln aus")
  .addParamdesc("Name des Spiels")
  .with((msg, par) => {
    msg.channel.send(
      new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`Regeln für ${par[0]}`)
        .setAuthor("Barkeeper")
        .attachFiles([icon])
        .setThumbnail("attachment://icon.png")
        .addFields()
    );
  });

client.on("message", (m) => processor.handle(m));
client.login(BOT_TOKEN);
