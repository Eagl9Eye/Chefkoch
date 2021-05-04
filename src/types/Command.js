class Command {
  constructor(name) {
    this.name = name;
    this.action = null;
    this.aliases = [];
    this.desc = { text: "" };
  }
  addDesc(desc) {
    this.desc["text"] = desc;
    return this;
  }
  addAlias(alias) {
    this.aliases.push(alias);
    return this;
  }
  addParamdesc(paramdesc) {
    this.desc["param"] = paramdesc;
    return this;
  }
  with(func) {
    this.action = func;
    return this;
  }
}

module.exports = Command;
