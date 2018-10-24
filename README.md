# Greggs Bot

An all purpose Discord bot for the Greggs guild on Draenor-EU.

## Building

Both prod and dev builds create `./dist/main.js`.

Create `environment.env` from the `environment.env.example` file. Populate with the following API keys:

 * DISCORD_TOKEN
   * Your own Discord test bot API token.
     * https://discordapp.com/developers/applications/
     * Create an application > Bot > Add Bot > Reveal Token
 * WCL_TOKEN
   * Your own Warcraft Logs token
     * https://www.warcraftlogs.com/profile
     * Found in the Web API Keys section

### Development build

`yarn dev` or `npm run dev`

Source maps are generated for debugging. See [debugging](#debugging) below.

### Production build

`yarn build` or `npm run build`

A docker container can also be created for Greggs bot. Check out the Dockerfile provided. You will need to provide the `environment.env` file to the container.

## Debugging

### Visual Studio Code
```
// Launch.json
"configurations": [
    {
        "type": "node",
        "request": "launch",
        "name": "Run Greggs Bot",
        "program": "${workspaceFolder}/dist/main.js",
        "envFile": "${workspaceFolder}/environment.env"
    }
]
```