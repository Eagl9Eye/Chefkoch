const Command = require("./Command");

/**
 * Handle channel messages for the Bot
 */
class ChannelListener {
  constructor(prefix) {
    this.prefix = prefix;
    this.commands = [];
  }
  register(name) {
    let command = new Command(name);
    this.commands.push(command);
    return command;
  }
  searchCommands(command) {
    return this.commands.filter(
      ({ name, aliases }) => name === command || aliases.includes(command)
    );
  }
  handle(msg) {
    if (msg.author.bot) return;
    if (msg.channel.type != "text") return;
    if (!msg.content.startsWith(this.prefix)) return;
    let parameter = msg.content.slice(this.prefix.length).split(" ");
    let method = parameter.shift().toLowerCase();
    console.log(`${msg.author}\t${method}\t(${parameter})`);
    this.searchCommands(method).forEach(({ action }) => action(msg, parameter));
  }
}

module.exports = ChannelListener;
