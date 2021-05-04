const Besoffski = require("./Besoffski");
const Discord = require("discord.js");
const Status = {
  NONE: "NONE", // Initial
  BAR: "BAR", // Eine neue Runde kann gestartet werden
  WAITING: "WARTET", // Guesses wurden gesammelt und auf das Ende warten
  FINISH: "FINISH",
  UNKNOWN: "",
};
const { icon } = require("../../config/config.json");

class Barkeeper {
  constructor(bot) {
    this.bot = bot;
    this.currentRound = -1;
    this.status = Status.NONE;
    this.members = [];
    this.rounds = [];
  }
  join(client) {
    return new Promise((res, rej) => {
      if (this.status != Status.BAR) rej(client);
      let newMember = this.searchMembers(client.id);
      if (!newMember) {
        newMember = new Besoffski(this.bot, client);
        this.members.push(newMember);
      }
      res(newMember);
    });
  }
  startRound() {
    return new Promise((res, rej) => {
      if (this.status === Status.WAITING) rej("Es läuft gerade eine Runde");
      if (this.status != Status.BAR && this.status != Status.FINISH) {
        rej("Die Bar ist leider nicht geöffnet");
      } else {
        this.update(Status.WAITING);
        Promise.all(
          this.members.map((member) => {
            member.send("Dein Tipp für die nächste Runde:");
            return member.collectGuess();
          })
        ).then((guesses) => {
          this.update(Status.FINISH);
          this.rounds[++this.currentRound] = guesses;
          res(guessEmbed(guesses));
        });
      }
    });
  }
  endRound(expected) {
    return new Promise((res, rej) => {
      if (!expected || this.status != Status.FINISH)
        rej("Der Barkeeper hat noch nicht alle Stimmen eingesammelt");
      calcPlace(expected, this.rounds[this.currentRound]).then((scr) => {
        this.update(Status.BAR);
        res(scoreEmbed(scr));
      });
    });
  }
  disconnect(name) {
    return new Promise((res, rej) => {
      if (!name) rej("Unbekannt");
      this.members.filter(({ client }, i) => {
        if (client.username === name) {
          // der name wird nicht vom server sondern vom discord client genommen
          this.sendTo(client, "Du wurdest aus der Bar geschmissen");
          this.members.splice(i, 1);
          res(client);
        }
      });
      rej(name);
    });
  }
  sendTo(member, message) {
    this.searchMembers(member.id).send(message);
  }
  sendToAll(message) {
    this.members.forEach((member) => member.send(message));
  }
  searchMembers(id) {
    return this.members.find((member) => member.client.id === id);
  }
  update(newState) {
    this.status = newState;
    switch (newState) {
      case Status.WAITING:
        this.bot.user.setActivity("eure Schätzungen", {
          type: "LISTENING",
        });
        break;
      case Status.BAR:
        this.bot.user.setActivity("Barkeeper", {
          type: "PLAYING",
        });
        break;
      case Status.FINISH:
        this.bot.user.setActivity("das Ende der Runde", {
          type: "PLAYING",
        });
        break;
      case Status.NONE:
        this.bot.user.setActivity("Wischt den Flur", {
          type: "CUSTOM_STATUS",
        });
        break;
      default:
        break;
    }
  }
}

function guessEmbed(guesses) {
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Hier sind die Schätzungen")
    .setAuthor("Barkeeper")
    .attachFiles([icon])
    .setThumbnail("attachment://icon.png")
    .addFields(
      guesses.map((guess) => {
        return {
          name: guess.name,
          value: guess.guess <= 0 ? `Keine Schätzung` : `${guess.guess}€`,
          inline: true,
        };
      })
    );
}

function scoreEmbed(score) {
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Die Ergebnisse der letzten Runde")
    .setAuthor("Barkeeper")
    .attachFiles([icon])
    .setThumbnail("attachment://icon.png")
    .addFields(
      score.map((ele, ind) => {
        return {
          name: (ind === 0 ? "👑 " : "") + ele.place + ". " + ele.name,
          value: ele.guess <= 0 ? `Keine Schätzung` : `${ele.guess}€`,
          inline: true,
        };
      })
    );
}

function calcPlace(expected, round) {
  return Promise.all(
    round
      .sort((a, b) => {
        return (
          Math.abs(a.guess - parseInt(expected)) >
          Math.abs(b.guess - parseInt(expected))
        );
      })
      .map((cur, ind) => {
        return { ...cur, place: ind + 1 };
      })
  );
}

module.exports = { Barkeeper: Barkeeper, Status: Status };
