function menu(sender, statuss, balance, waktu, botName, owner, prefix, iniPrefix, uptime, user, limit, ucapan, id) {
  var total = 0;
  const obj = {
    menu: [
      {
        name: "INFO USER",
        list: [
          `Selamat *${ucapan}*, @${sender}`,
          `Status: *${statuss}*`,
          `Id: *${id}*`,
          `Waktu: *${waktu}* WIB`,
          `Balance: *${balance}*`,
          `Limit: *${limit}*`
        ]
      },
      {
        name: "INFO BOT",
        list: [
          `Bot: *${botName}*`,
          `Owner: @${owner}`,
          `Prefix: *${iniPrefix}*`,
          `Uptime: ${uptime}`,
          `User: ${user}`
        ]
      },
      {
        name: "MAIN MENU",
        list: [
          "owner",
          "rules",
          "donasi",
          "request",
          "reportbug"
        ]
      },
      {
        name: "OWNER MENU",
        list: [
          "addprem",
          "delprem",
          "uptime",
          "set",
          "ban",
          "unban",
          "banlist",
          "premlist",
          "givebal",
          "takebal"
        ]
      },
      {
        name: "GROUP MENU",
        list: [
          "promote",
          "demote",
          "add",
          "kick",
          "linkgroup",
          "hidetag",
          "tagall",
          "group",
          "join",
          "adminonly",
          "afk",
          "setdesk",
          "settitle"
        ]
      },
      {
        name: "ISLAMIC MENU",
        list: [
          "surah",
          "jadwalsholat"
        ]
      },
      {
        name: "STALKER MENU",
        list: [
          "github",
          "servermc",
          "ig"
        ]
      },
      {
        name: "SEARCH MENU",
        list: [
          "brainly",
          "pinterest",
          "joox",
          "ytsearch"
        ]
      },
      {
        name: "RANDOM MENU",
        list: [
          "stikerpatrick",
          "ppcouple",
          "slot",
          "randomtt",
          "memeindo",
          "meme"
        ]
      },
      {
        name: "BALANCE MENU",
        list: [
          "mybalance",
          "cekbalance",
          "transfer",
          "topbal"
        ]
      },
      {
        name: "LIMIT MENU",
        list: [
          "mylimit",
          "ceklimit",
          "buylimit"
        ]
      },
      {
        name: "GAME MENU",
        list: [
          "tictactoe",
          "tebakgambar",
          "tebakbendera",
          "tebakkata",
          "tebaklirik",
          "tebakkimia",
          "asahotak",
          "family100",
          "caklontong",
          "susunkata",
          "tebakkalimat",
          "tebaktebakan",
          "tekateki",
          "siapakahaku"
        ]
      },
      {
        name: "STICKER MENU",
        list: [
          "sticker",
          "stickersearch",
          "toimage",
          "tovideo"
        ]
      },
      {
        name: "DOWNLOADER MENU",
        list: [
          "ytmp3",
          "ytmp4",
          "happymod",
          "joox",
          "tiktok",
          "sound"
        ]
      },
      {
        name: "FUN MENU",
        list: [
          "cekgay",
          "ceklesbi",
          "cekpinter",
          "cekjelek",
          "ceksange",
          "ceksopan",
          "cekahlak",
          "cekganteng",
          "cekcantik",
          "cekwibu",
          "cektolol",
          "cekgoblok",
          "cekbego",
          "cekpink",
          "cekautis",
          "cekalim"
        ]
      }
    ]
  };
  var txt = `⋆ ˚｡⋆୨୧˚ 「 *${botName}* 」 ˚୨୧⋆｡˚ ⋆\n\n`;
  for (var menu of obj.menu) {
    txt += `╭───「 *${menu.name}* 」\n`;
    for (var i = 0; i < menu.list.length; i++) {
      switch (menu.name) {
        case "INFO USER":
        case "INFO BOT":
          txt += `│ ❏ ${menu.list[i]}\n`;
          break;
        default:
          total++;
          txt += `│ ❏ ${prefix + menu.list[i]}\n`;
          break;
      }
    }
    txt += `╰───────────────❏\n\n`;
  }
  txt += `Total *${total}* fitur.\n\n`;
  txt += `⍟─────「 © *${botName}* 」─────⍟`;
  return txt;
}

function rules(prefix) {
  return `*──「 RULES-BOT 」──*
  
  1. Jangan spam bot. 
  Sanksi: *WARN/SOFT BLOCK*
  
  2. Jangan telepon bot.
  Sanksi: *SOFT BLOCK*
  
  3. Jangan entod bot.
  Sanksi: *PERMANENT BLOCK*
  
  Jika sudah paham rulesnya
  Ketik *${prefix}menu* untuk memulai bot`
}

function donasi() {
  return `http://saweria.co`;
}

function listrank() {
  return `
  *⛄ Christmas Discount ⛄*
  
  ========================
  *RANK LIST*
  
  *VIP (10K)*
  4 sethome
  Backpack
  Feed
  + 5k ingame money
  + Token 250
  
  *VIP+ (25K)* SPECIAL OFFER (DECEMBER ONLY)
  8 sethome
  Fly
  Feed
  Ender chest
  Hat
  + 10k in game money
  + Token 250
  
  *MVP (40K)* SPECIAL OFFER (DECEMBER ONLY)
  12 sethome
  Fly
  Feed
  Heal
  Ender chest
  Repair
  Nick
  Hat
  + 20k in game money
  + Token 400
  
  *MVP+ (75K)* SPECIAL OFFER (DECEMBER ONLY)
  20 sethome
  Clear inventory
  Fly
  Feed
  Heal
  Ender chest
  Repair
  God
  Nick
  Hat
  Change nick colour
  + 100k in game money
  + Token 500
  
  *ARCHADIA (300K)*
  Include all MVP+ feature
  Custom Rank
  bypass tp cooldown
  Create Shopkeeper
  Create pwarp
  Private ACHADIA VOICE & CHAT at discord
  
  
  
  ========================
  *TOKEN*
  
  » 250 token  = 10k
  
  » 500 token  = 20k
  
  » 750 token  = 30k
  
  » 1000 token = 40k
  
  » 5000 token = 150k SPECIAL OFFER (DECEMBER ONLY)
  ========================
  
  💲 Payment:
  • Dana
  • Gopay
  • Pulsa Telkomsel (+10k)
  • Paypal
  • LinkAja
  
  Jika ingin membeli chat : 
  wa.me/6282152866630
  
  Atau buka ticket di discord`
}

module.exports = { menu, rules, donasi, listrank };