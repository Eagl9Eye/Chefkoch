const ChannelListener = require("./types/ChannelListener");
const { Barkeeper, Status } = require("./types/Barkeeper");
const Discord = require("discord.js");
const { BOT_TOKEN } = require("../config/discord.json");
const { prefix } = require("../config/config.json");
const {
  sendEmbed,
  guessEmbed,
  scoreEmbed,
  ruleEmbed,
  commandEmbed,
} = require("./embeds");

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
    sendEmbed(processor.commands, commandEmbed, [msg.channel]);
  });

processor
  .register("start drinking")
  .addAlias("start")
  .addDesc("Wenn du die Party starten Willst")
  .with((msg, par) => {
    barkeeper
      .open()
      .then((message) => msg.react("🖐"))
      .catch((message) => msg.reply(message));
  });

processor
  .register("disconnect")
  .addAlias("dc")
  .addDesc("Wenn du die Party beenden willst")
  .with((msg, par) => {
    barkeeper
      .close()
      .then((message) => msg.react("🤏"))
      .catch((message) => msg.reply(message));
  });

processor
  .register("join")
  .addAlias("j")
  .addDesc("Wenn du dich an den Tresen begeben möchtest")
  .with((msg, par) =>
    barkeeper
      .join(msg.author)
      .then((member) => member.send("Willkommen an der Bar"))
      .catch((message) => msg.reply(message))
  );

processor
  .register("leave")
  .addAlias("l")
  .addDesc("Wenn du den Tresen verlassen möchstest")
  .with((msg, par) =>
    barkeeper
      .leave(msg.author)
      .then((member) => member.send("Bis zum nächsten Mal"))
      .catch((message) => msg.reply(message))
  );

processor
  .register("kick")
  .addAlias("k")
  .addDesc("Jemanden von der Theke entfernen")
  .addParamdesc("Name des unerwünschten Gastes")
  .with((msg, par) => {
    barkeeper
      .kick(par.join(" "))
      .then((kicked) => {
        msg.react("👢");
        msg.reply(`${kicked.client.username} wurde von der Bar entfernt`);
      })
      .catch((name) => msg.reply(`${name} ist nicht an der Bar!`));
  });

processor
  .register("round")
  .addAlias("r")
  .addDesc("Um eine neue Runde einzuleuten")
  .with((msg, par) => {
    // verbleibende Zeit als react anhaengen
    barkeeper
      .startRound()
      .then((guesses) => {
        barkeeper.addRound(guesses);
        sendEmbed(guesses, guessEmbed, [msg.channel, barkeeper]);
      })
      .catch((message) => msg.reply(message));
  });

processor
  .register("force quit")
  .addAlias("fq")
  .addDesc("Eine Runde direkt beenden")
  .with((msg, par) => {
    barkeeper
      .forceEnd()
      .then(() => msg.react("👮‍♂️"))
      .catch((message) => msg.reply(message));
  });

processor
  .register("price")
  .addAlias("p")
  .addDesc("Wenn der Preis bekannt ist")
  .addParamdesc("Preis")
  .with((msg, par) => {
    barkeeper
      .endRound(par[0])
      .then((result) =>
        sendEmbed({ places: [...result], actual: par[0] }, scoreEmbed, [
          msg.channel,
          barkeeper,
        ])
      )
      .catch((message) => msg.reply(message));
  });

processor
  .register("rules")
  .addDesc("Gibt dir die Regeln aus")
  .addParamdesc("Name des Spiels")
  .with((msg, par) => {
    sendEmbed(["Diggah"], ruleEmbed, [msg.channel]); // TODO add rules
  });

client.on("message", (m) => processor.handle(m));
client.login(BOT_TOKEN);
