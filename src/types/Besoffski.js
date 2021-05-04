const ClientChannel = require("./ClientChannel");
const { bar } = require("../../config/config.json");

class Besoffski extends ClientChannel {
  constructor(barkeeper, client) {
    super(barkeeper, client);
  }
  send(msg) {
    this.handle((dm) => dm.send(msg));
  }
  collectGuess() {
    return new Promise((res, rej) => {
      this.handle((dm) => {
        const collector = dm.createMessageCollector(
          (m) => !m.author.bot && parseInt(m.content),
          { max: 1, time: bar.voteTimer, errors: ["time"] }
        );
        collector.on("collect", (msg) => {
          res({
            guess: parseInt(msg.content),
            name: this.client.username,
            id: this.client.id,
          });
        });
        collector.on("end", (e, reason) => {
          switch (reason) {
            case "close":
              dm.send("Der Barkeeper schließt die Runde");
              break;
            case "time":
              dm.send("Die Zeit zum schätzen ist vorbei");
              res({
                guess: Number.MIN_VALUE,
                name: this.client.username,
                id: this.client.id,
              });
              break;
            case "limit":
              dm.send("Deine Gebot wurde aufgenommen");
              break;
            default:
              dm.send(
                "Dein Gebot konnte nicht aufgenommen werden, wende dich an den Barkeeper"
              );
          }
        });
      });
    });
  }
}

module.exports = Besoffski;
