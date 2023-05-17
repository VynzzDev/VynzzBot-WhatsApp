const { fetchJson } = require("./lib/func");
const fs = require("fs");

async function start() {
  const game = "caklontong";
  const data = await fetchJson(`https://raw.githubusercontent.com/BochilTeam/database/master/games/${game}.json`);
  fs.writeFileSync(`./database/game/${game}.json`, JSON.stringify(data, null, 2));
  console.log(`Successfully write ${game}.`);
}

start();