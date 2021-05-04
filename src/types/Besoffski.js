const ClientChannel = require("./ClientChannel");
const { bar } = require("../../config/config.json");
const { random } = require("./../utils");

class Besoffski extends ClientChannel {
  constructor(barkeeper, client) {
    super(barkeeper, client);
  }
  send(msg) {
    this.handle((dm) => dm.send(msg));
  }
  collectGuess(token) {
    return new Promise((res, rej) => {
      this.handle((dm) => {
        const collector = dm.createMessageCollector(
          (m) => !m.author.bot && parseInt(m.content),
          { max: 1, time: bar.voteTimer, errors: ["time"] }
        );
        collector.on("collect", (msg) => {
          res({
            client: this.client,
            guess: parseInt(msg.content),
          });
        });
        collector.on("end", (e, reason) => {
          switch (reason) {
            case "close":
              dm.send("Der Barkeeper schließt die Runde");
              res({
                client: this.client,
                guess: random(1, 10001),
              });
              break;
            case "time":
              dm.send("Die Zeit zum schätzen ist vorbei");
              res({
                client: this.client,
                guess: Number.MIN_SAFE_INTEGER,
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
        token.cancel = () => {
          collector.stop("close");
        };
      });
    });
  }
}

module.exports = Besoffski;
