# Chefkoch

Discord Bot to manage your `"How much is your Outfit worth"` evenings.

## Configuration

Steps to follow to setup this Bot for your own Discord-Server.

1. Add a new file `./config/discord.json`
1. Generate the `Token` for your Bot -> see [Discord Doc](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token)
1. Add following contents to `./config/discord.json`:

```json
{ 
  "BOT_TOKEN": "Y0urT0k3n.X_S5wd.8afj8q92S8asfjs8FHd"
}
```

## Usage

If you added the Bot to your Discord-Server then you can access following commands:

- `!help` : show all commands
- `!rules` : show rule-set
- `!ping` : check connection to Bot
- `!start drinking` : start the party
- `!join` : join a party
- `!leave` : leave the party
- `!kick` : kick a party member
- `!round` : initiate a new round
- `!price` : terminate a round
- `!disconnect` : end the party
