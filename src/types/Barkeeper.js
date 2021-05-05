const Besoffski = require("./Besoffski");
const Status = {
  NONE: "NONE", // Initial
  BAR: "BAR", // Eine neue Runde kann gestartet werden
  WAITING: "WARTET", // Guesses wurden gesammelt und auf das Ende warten
  FINISH: "FINISH",
};
const {
  BAR_OPEN,
  BAR_OPENED,
  BAR_WORKING,
  BAR_CLOSED,
  BAR_NOT_OPEN,
  GUESS_NOT_COLLECTED,
  GUESS_COLLECTED,
  NOT_CANCELLABLE,
} = require("./Messages");

class Barkeeper {
  constructor(bot) {
    this.bot = bot;
    this.currentRound = -1;
    this.status = Status.NONE;
    this.members = [];
    this.rounds = [];
    this.token = [];
  }
  open() {
    return new Promise((res, rej) => {
      if ([Status.WAITING, Status.FINISH, Status.BAR].includes(this.status))
        rej(BAR_OPEN);
      else {
        this.update(Status.BAR);
        res(BAR_OPENED);
      }
    });
  }
  close() {
    return new Promise((res, rej) => {
      if (this.status === Status.WAITING) rej(BAR_WORKING);
      else {
        this.update(Status.NONE);
        res(BAR_CLOSED);
      }
    });
  }
  join(client) {
    return new Promise((res, rej) => {
      if (this.status === Status.NONE) rej(BAR_NOT_OPEN);
      else {
        let newMember = this.searchId(client.id);
        if (!newMember) {
          newMember = new Besoffski(this.bot, client);
          this.members.push(newMember);
          res(newMember);
        }
        rej(`${newMember.client.username} ist schon an der Bar!`);
      }
    });
  }
  leave(client) {
    return new Promise((res, rej) => {
      if (this.status === Status.WAITING) rej(GUESS_NOT_COLLECTED);
      else {
        const left = this.disconnect(client.id);
        !left ? rej(`${client.username} ist nicht an der Bar!`) : res(left);
      }
    });
  }
  kick(name) {
    return new Promise((res, rej) => {
      if (!name) rej("Unbekannt");
      else {
        const removed = this.disconnect(name);
        !removed ? rej(name) : res(removed);
      }
    });
  }
  addRound(round) {
    this.update(Status.FINISH);
    this.rounds[++this.currentRound] = round;
  }
  startRound() {
    return new Promise((res, rej) => {
      if (this.status === Status.WAITING) rej(BAR_WORKING);
      if (![Status.BAR, Status.FINISH].includes(this.status)) rej(BAR_NOT_OPEN);
      else {
        this.update(Status.WAITING);
        res(
          Promise.all(
            this.members.map((member) => {
              member.send("Dein Tipp für die nächste Runde:");
              return member.collectGuess(this.token);
            })
          )
        );
      }
    });
  }
  forceEnd() {
    return new Promise((res, rej) => {
      if (this.status === Status.NONE) rej(BAR_NOT_OPEN);
      if (this.status != Status.WAITING) rej(GUESS_COLLECTED);
      if (this.token.length === 0) rej(NOT_CANCELLABLE);
      else {
        this.token.forEach((token) => token.cancel());
        this.token = [];
        res();
      }
    });
  }
  endRound(expected) {
    return new Promise((res, rej) => {
      if (this.status === Status.NONE) rej(BAR_NOT_OPEN);
      if (!expected || this.status != Status.FINISH) rej(GUESS_NOT_COLLECTED);
      else {
        this.update(Status.BAR);
        res(calcPlace(expected, this.rounds[this.currentRound]));
      }
    });
  }
  disconnect(signature) {
    return this.members.find(({ client }, index) => {
      if (client.username === signature || client.id === signature) {
        return this.members.splice(index, 1);
      }
    });
  }
  sendTo(member, message) {
    this.searchId(member.id).send(message);
  }
  send(message) {
    this.members.forEach((member) => member.send(message));
  }
  searchId(id) {
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

function calcPlace(expected, round) {
  return round
    .sort((a, b) => {
      return (
        Math.abs(a.guess - parseInt(expected)) -
        Math.abs(b.guess - parseInt(expected))
      );
    })
    .map((cur, ind) => {
      return { ...cur, place: ind + 1 };
    });
}

module.exports = { Barkeeper: Barkeeper, Status: Status };
