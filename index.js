"use strict";

try {
  const {
    default: makeWASocket,
    DisconnectReason,
    makeInMemoryStore,
    useSingleFileAuthState,
    downloadContentFromMessage
  } = require("@adiwajshing/baileys");
  const { Boom } = require("@hapi/boom");
  const fs = require("fs");
  const logg = require("pino");
  const cfonts = require("cfonts");
  const chalk = require("chalk");
  const { fetchJson, runtime, em, getGroupAdmin, fswrite, getBuffer, gid, parseMention, serialize } = require("./lib/func");
  const Exif = require("./lib/set_WM_Sticker");
  const exif = new Exif();
  const spam = require("./lib/func_Spam");
  const { exec } = require("child_process");
  const { color } = require("./lib/color");
  const scr = require("@bochilteam/scraper");
  const moment = require("moment-timezone");
  const ffmpeg = require("fluent-ffmpeg");
  const brainly = require("brainly-scraper");
  const { igApi } = require("insta-fetcher");
  const cron = require("cron");
  const tt = require("tiktok-scraper");
  const { JsonDB, Config } = require("node-json-db");
  const user = new JsonDB(new Config("./database/user", true, false, "/", true));
  const { setDb, getDb, chDb } = require("./lib/db");
  new cron.CronJob("0 0 0 * * *", async () => {
    var limm = await user.filter("/", (x => x.limit <= 0));
    if (limm.length === 0) return;
    for (var lims of limm) {
      var no = lims.user;
      chDb(user, "user", no, 10, "limit");
    }
  }, null, true, "Asia/Jakarta");
  const { menu, rules, donasi, listrank } = require("./help");
  const setting = JSON.parse(fs.readFileSync("./config.json"));
  const res = JSON.parse(fs.readFileSync("./database/response.json"));
  const antiVirtex = JSON.parse(fs.readFileSync("./database/antivirtex.json"));
  const afk = JSON.parse(fs.readFileSync("./database/afk.json"));
  const simi = JSON.parse(fs.readFileSync("./database/simi.json"));
  const adminonly = JSON.parse(fs.readFileSync("./database/adminonly.json"));
  const tebakgambar = JSON.parse(fs.readFileSync("./database/game/tebakgambar.json"));
  const { joox } = require("./lib/scrape_joox");
  const tgc = JSON.parse(fs.readFileSync("./database/tg.json"));
  const owner = setting.ownerNumber;
  const botName = setting.botName;
  const apih = setting.apih;
  const session = `./${setting.sessionName}.json`;
  const { state, saveState } = useSingleFileAuthState(session);
  var org_spam = [];
  var selese = false;
  function nocache(module, cb = () => { }) {
    console.log(`File ${module} sedang diperhatikan terhadap perubahan`);
    fs.watchFile(require.resolve(module), async () => {
      await uncache(require.resolve(module));
      cb(module);
    });
  }

  function uncache(module = ".") {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(module)];
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  const store = makeInMemoryStore({ logger: logg().child({ level: "silent", stream: "store" }) });

  const connectToWhatsApp = async () => {
    const conn = makeWASocket({
      printQRInTerminal: true,
      logger: logg({ level: "silent" }),
      auth: state,
      browser: [setting.botName, "Safari", "1.0.0"],
      qrTimeout: 60000
    });
    store.bind(conn.ev);
    cfonts.say(`${setting.botName}`, {
      font: "chrome",
      align: "center",
      gradient: ["#8F00FF", "red"]
    });
    cfonts.say(`Owner: Edit-Ini-Di-index.js`, {
      font: "console",
      align: "center",
      gradient: ["#8F00FF", "red"]
    });
    conn.ev.on("group-participants.update", async (arg) => {
      const gcnya = await conn.groupMetadata(arg.id);
      if (arg.action === "promote") {
        conn.sendMessage(arg.id, { text: `@${arg.participants[0].split("@")[0]} Telah di promote.`, mentions: arg.participants });
      }
      if (arg.action === "demote") conn.sendMessage(arg.id, { text: `@${arg.participants[0].split("@")[0]} Telah di demote.`, mentions: arg.participants });
      if (arg.action === "add") conn.sendMessage(arg.id, { text: `Welcome ${arg.participants.length === 1 ? `@${arg.participants[0].split("@")[0]}` : `@${arg.participants.join(", @")}`} di group *${gcnya.subject}*. member ke *${gcnya.size}*`, mentions: arg.participants });
      if (arg.action === "remove") conn.sendMessage(arg.id, { text: `Selamat jalan @${arg.participants[0].split("@")[0]} 😭`, mentions: arg.participants });
    });
    conn.ev.on("call", (call) => {
      const c = call.find(x => x.status === "offer");
      if (c.isGroup) return reply("Jangan telpon");
      reply(`Anda akan diblokir dalam 5 detik, karna anda melakukan panggilan *${c.isVideo ? "video" : "suara"}*. Jika tidak sengaja, chat owner untuk membuka blokir. https://wa.me/${owner}?text=buka+blokir`);
      setTimeout(() => {
        if (c.from.split("@")[0] === owner) return reply("Karna anda owner, tidak akan diblokir.");
        conn.updateBlockStatus(c.from, "block");
      }, 5000);
      function reply(txt = "") {
        conn.sendMessage(c.from, { text: txt });
      }
    });
    /*setInterval(async () => {
      var now = Date.now();
      var prem = await await user.find("/", x => x.premExpiry <= now && x.premExpiry !== 0);
      var premm = typeof prem === "undefined" ? "" : prem;
      var isExp = typeof prem === "undefined" ? false : true;
      console.log(premm);
      if (isExp) {
        chDb(user, "premium", true)
      }
    }, 1000);*/
    conn.ev.on("messages.upsert", async (m) => {
      var msg = m.messages[0];
      if (!m.messages) return;
      msg = serialize(conn, msg);
      const { quotedMsg } = msg;
      var type = "";
      try {
        type = Object.keys(msg.message)[0];
      } catch (e) {
        type = null;
      }
      const from = msg.key.remoteJid;
      const chat = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage?.text ? msg.message.extendedTextMessage?.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : "";
      const chats = typeof chat === "undefined" ? "" : chat === null ? "" : chat;
      const isMulti = setting.multiPrefix;
      const prefix = isMulti ? /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : setting.prefix : setting.prefix;
      res.user = res.user.replace("{prefix}", prefix);
      res.ver = res.ver.replace("{prefix}", prefix);
      const body = chats.startsWith(prefix) ? chats : "";
      const budy = prefix + body.slice(1).trim();
      const args = budy.split(/ +/).slice(1);
      const command = budy.slice(1).split(/ +/).shift().toLowerCase();
      const isCmd = body.startsWith(prefix);
      const cmd = isCmd ? chats : "";
      const isGroup = msg.key.remoteJid.endsWith("@g.us");
      const isPriv = msg.key.remoteJid.endsWith("@s.whatsapp.net");
      const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.key.participant) : msg.key.remoteJid;
      const nom = sender.split("@")[0];
      const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
      const isOwner = owner.includes(nom);
      const isAdmin = setting.adminNumber.includes(sender);
      const isUser = typeof await user.find("/", (x => x.user === nom)) === "undefined" ? false : true;
      const usernya = isUser ? await user.find("/", (x => x.user === nom)) : "";
      const isPrem = usernya.premium;
      const isBan = usernya.banned;
      const pushname = msg.pushName;
      const groupMetadata = isGroup ? await conn.groupMetadata(from) : "";
      const groupMembers = isGroup ? groupMetadata.participants : "";
      const groupAdmin = isGroup ? getGroupAdmin(groupMembers) : "";
      const isBga = groupAdmin.includes(botNumber);
      const isGcAdmin = groupAdmin.includes(sender);
      const isAdminonly = adminonly.includes(from);
      const limit = usernya.limit;
      const nolim = limit <= 0;
      const balance = usernya.balance;
      const bal = Number(usernya.balance);
      const lim = Number(usernya.limit) - 1;
      const dataAfk = afk.find(x => x.user === nom);
      const isAfk = typeof dataAfk === "undefined" ? false : true;
      const listAfk = afk.map(x => x.user);
      for (var listAfkk of listAfk) {
        const isTagAfk = chats.includes(listAfkk);
      }
      const isTg = typeof tgc.find(x => x.jid === from) === "undefined" ? false : true;
      const isSimi = simi.includes(from);
      const isImage = type === "imageMessage";
      const isVideo = type === "videoMessage";
      const isQuotedImage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.type === "imageMessage";
      const isQuotedSticker = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.type === "stickerMessage";
      const isAntiVirtex = antiVirtex.includes(from);
      const participant = isGroup ? await groupMetadata.participants : "";
      const groupName = isGroup ? groupMetadata.subject : "";
      const q = args.join(" ").trim();
      const waktu = moment(Date.now()).tz("Asia/Jakarta").format("HH:mm:ss");
      const sendContact = async (numbers, name, quoted, mn) => {
        let number = numbers.replace(/[^0-9]/g, '')
        const vcard = 'BEGIN:VCARD\n'
          + 'VERSION:3.0\n'
          + 'FN:' + name + '\n'
          + 'ORG:;\n'
          + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
          + 'END:VCARD'
        await conn.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions: mn ? mn : [] }, { quoted: quoted })
      }
      conn.readMessages([msg.key]);
      this.game = this.game ? this.game : {}
      let room = Object.values(this.game).find(room => room.id && room.game && room.state && room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(sender) && room.state == 'PLAYING')
      if (isAntiVirtex && chats.length > 3500 && !msg.key.fromMe) {
        conn.sendMessage(from, { text: "Afakah ituh virtex?" });
        conn.groupParticipantsUpdate(from, [sender], "remove");
      }
      spam.ResetSpam(org_spam);
      function diaSpam() {
        spam.addSpam(sender, org_spam);
        reply(`Jangan spam. delay *${spam.delays / 1000}* detik.`);
      }
      var ppklah = chats.toLowerCase().includes("list rank") || chats.toLowerCase().includes("rank list") && !msg.key.fromMe
      if (isCmd && spam.isFiltered(sender) && !msg.key.fromMe) return diaSpam();
      if (isCmd && args.length < 1 && !msg.key.fromMe) spam.addFilter(sender);
      if (ppklah) reply(listrank());
      if (isSimi) {
        if (!isCmd && !isAfk && !room && !isTg) {
          if (msg.key.fromMe) return;
          if (isBan) return;
          if (msg.message === null) return;
          if (msg.message.stickerMessage) return;
          if (msg.message.imageMessage) return;
          var sim = await fetchJson(`https://simsimi.info/api/?text=${chats}&lc=id`);
          var resu = sim.message;
          reply(resu);
        }
      }
      if (isCmd && !msg.key.fromMe) {
        console.log(`${color("「", "yellow")} ${color(isGroup ? "GROUP" : "PRIVATE", "blue")} ${color("」", "yellow")}${isGroup ? " " + color("(", "yellow") + color(groupName, "magenta") + color(")", "yellow") : ""} ${color(waktu, "red")} ${color(pushname, "green")}: ${cmd}`);
      }
      if (isTg && !msg.key.fromMe && !isCmd && type !== "stickerMessage") {
        var tg = tgc.find(x => x.jid === from);
        var answer = tg.answer;
        if (chats.toLowerCase() === answer.toLowerCase()) {
          var index = tgc.findIndex(x => x.jid === from);
          tgc.splice(index, 1);
          fswrite("./database/tg.json", tgc);
          reply(`@${nom} Benar!`, [sender]);
          selese = true;
        } else reply("Salah!");
      }
      if (isAfk && !msg.key.fromMe) {
        var index = afk.findIndex(x => x.user === sender.split("@")[0]);
        afk.splice(index, 1);
        var olds = new Date(dataAfk.time);
        var news = Date.now();
        var diff = Math.round((news - olds) / 1000);
        var day = Math.floor(diff / (24 * 60 * 60)); // though I hope she won't be working for consecutive days :) 
        diff = diff - (day * 24 * 60 * 60);
        var hou = Math.floor(diff / (60 * 60));
        diff = diff - (hou * 60 * 60);
        var min = Math.floor(diff / (60));
        diff = diff - (min * 60);
        var sec = diff;
        var lamafk = `${day === 0 ? "" : `${day} hari, `}${t(hou)}:${t(min)}:${t(sec)}`;
        fswrite("./database/afk.json", afk, 0);
        var txt = `${type === "reactionMessage" ? `(reaction) @${dataAfk.user}` : "Anda"} telah berhenti afk dengan alasan *${dataAfk.alasan}* selama *${lamafk}*.`;
        return reply(txt, parseMention(txt));
      }
      function t(num = 0) {
        return num < 10 ? "0" + num : num;
      }
      if (isAdminonly) {
        if (!groupAdmin.includes(sender)) return;
      }
      if (room) {
        var text = chats;
        let ok
        let isWin = !1
        let isTie = !1
        let isSurrender = !1
        // m.reply(`[DEBUG]\n${parseInt(m.text)}`)
        if (!/^([1-9]|(me)?nyerah|surr?ender|off|skip)$/i.test(text)) return
        isSurrender = !/^[1-9]$/.test(text)
        if (sender !== room.game.currentTurn) { // nek wayahku
          if (!isSurrender) return !0
        }
        if (!isSurrender && 1 > (ok = room.game.turn(sender === room.game.playerO, parseInt(text) - 1))) {
          reply({
            '-3': 'Game telah berakhir',
            '-2': 'Invalid',
            '-1': 'Posisi Invalid',
            0: 'Posisi Invalid',
          }[ok])
          return !0
        }
        if (sender === room.game.winner) isWin = true
        else if (room.game.board === 511) isTie = true
        let arr = room.game.render().map(v => {
          return {
            X: '❌',
            O: '⭕',
            1: '1️⃣',
            2: '2️⃣',
            3: '3️⃣',
            4: '4️⃣',
            5: '5️⃣',
            6: '6️⃣',
            7: '7️⃣',
            8: '8️⃣',
            9: '9️⃣',
          }[v]
        })
        if (isSurrender) {
          room.game._currentTurn = sender === room.game.playerX
          isWin = true
        }
        let winner = isSurrender ? room.game.currentTurn : room.game.winner
        let str = `Room ID: ${room.id}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\n${isWin ? `@${winner.split('@')[0]} Menang!` : isTie ? `Game berakhir` : `Giliran ${['❌', '⭕'][1 * room.game._currentTurn]} (@${room.game.currentTurn.split('@')[0]})`}\n❌: @${room.game.playerX.split('@')[0]}\n⭕: @${room.game.playerO.split('@')[0]}\n\nKetik *nyerah* untuk menyerah dan mengakui kekalahan`
        if ((room.game._currentTurn ^ isSurrender ? room.x : room.o) !== from)
          room[room.game._currentTurn ^ isSurrender ? 'x' : 'o'] = from
        if (room.x !== room.o) await conn.sendMessage(room.x, { text: str, mentions: parseMention(str) });
        await conn.sendMessage(room.o, { text: str, mentions: parseMention(str) });
        if (isTie || isWin) {
          delete this.game[room.id]
        }
      }
      switch (command) {
        case "verify":
          if (isUser) return reply(res.alVer);
          var obj = {
            id: gid(),
            user: nom,
            limit: 10,
            balance: 30000,
            premium: false,
            premExpiry: 0,
            banned: false
          }
          setDb(user, obj);
          conn.sendMessage(from, {
            text: res.ver,
            footer: "Klik untuk melihat rules.",
            mentions: [sender],
            buttons: [
              {
                buttonId: prefix + "rules",
                buttonText: {
                  displayText: "RULES"
                },
                type: 1
              }
            ],
          }, { quoted: msg });
          break;
        case "menu":
        case "menus":
        case "help":
          if (!isUser) return reply(res.user); if (isBan) return reply(res.ban);
          var time2 = moment().tz("Asia/Jakarta").format("HH:mm:ss");
          if (time2 < "24:59:00") {
            var ucapanWaktu = "malam";
          }
          if (time2 < "19:00:00") {
            var ucapanWaktu = "senja";
          }
          if (time2 < "18:00:00") {
            var ucapanWaktu = "sore";
          }
          if (time2 < "15:00:00") {
            var ucapanWaktu = "siang";
          }
          if (time2 < "11:00:00") {
            var ucapanWaktu = "pagi";
          }
          if (time2 < "05:00:00") {
            var ucapanWaktu = "malam";
          }
          var id = usernya.id;
          const statuss = isOwner ? "owner" : isAdmin ? "admin" : isPrem ? "premium" : isUser ? "user" : "";
          const menus = menu(sender.split("@")[0], statuss, abbreviateNumber(balance), waktu, botName, setting.ownerNumber, prefix, isMulti ? "「 MULTI PREFIX 」" : prefix, runtime(process.uptime()), await user.count("/"), limit, ucapanWaktu, id);
          reply(menus, parseMention(menus));
          break;
        case "req":
        case "request":
          if (!isUser) return reply(res.user); if (isBan) return reply(res.ban);
          if (em(q)) return ex("pekob");
          reply("Berhasil request fitur.");
          var f = `╭───「 *REQUEST* 」\n`;
          f += `│ Dari: @${nom}\n`;
          f += `│ Fitur: *${q}*\n`;
          f += `╰───「 *${botName}* 」`;
          conn.sendMessage(owner + "@s.whatsapp.net", { text: f, mentions: parseMention(f) });
          break;
        //OWNER MENU
        case "addprem":
          if (!isOwner) return reply(res.owner);
          var sp = q.split("|");
          var no = num(sp[0]);
          var expi = sp[1];
          if (em(no) || em(expi)) return ex("<mentions/number>|<tgl/bln/thn>");
          if (!await cuser(no)) return reply(res.nover);
          var premcok = await user.find("/", (x => x.user === no));
          if (premcok.premium) return reply(`@${no} sudah premium.`, [no + "@s.whatsapp.net"]);
          chDb(user, "user", no, true, "premium");
          var expir = expi.split("/");
          var datee = new Date();
          var expirr = new Date(expir[2], expir[1], expir[0], datee.getHours(), datee.getMinutes(), datee.getSeconds()).getTime();
          chDb(user, "user", no, expirr, "premExpiry");
          reply(`Berhasil menambahkan @${no} premium. sampai ${expi}`, [no + "@s.whatsapp.net"]);
          break;
        case "delprem":
          if (!isOwner) return reply(res.owner);
          var no = num(q);
          if (em(no)) return ex("<number>/<mentions>");
          if (!await cuser(no)) return reply(res.nover);
          var isPremm = await user.find("/", (x => x.user === no));
          if (!isPremm.premium) return reply(`@${no} tidak premium.`, [no + "@s.whatsapp.net"]);
          chDb(user, "user", no, false, "premium");
          chDb(user, "user", no, 0, "premExpiry");
          reply(`Berhasil menghapus premium @${no}`, [no + "@s.whatsapp.net"]);
          break;
        case "set":
          if (!isOwner) return reply(res.owner);
          const opt = args[0];
          if (em(opt)) return replyBut(ex("<multiprefix/prefix/botname/admin/simi>", true), [
            {
              buttonId: `${cmd} multiprefix`,
              buttonText: {
                displayText: "MULTIPREFIX"
              },
              type: 1
            },
            {
              buttonId: `${cmd} simi`,
              buttonText: {
                displayText: "SIMI"
              },
              type: 1
            }
          ]);
          if (opt === "multiprefix") {
            if (isMulti) {
              setting.multiPrefix = false;
              fswrite("./config.json", setting);
              reply(`Mengubah prefix ke ${prefix}`);
            } else {
              setting.multiPrefix = true;
              fswrite("./config.json", setting);
              reply(`Mengubah prefix ke multiprefix`);
            }
          } else if (opt === "prefix") {
            const pref = args[1];
            if (em(pref)) return ex("prefix <prefix>");
            setting.prefix = pref;
            fswrite("./config.json", setting);
            reply(`Mengubah prefix ke ${pref}`);
          } else if (opt === "botname") {
            const newbot = args[1];
            if (em(newbot)) return ex("botname <nama baru>");
            setting.botName = newbot;
            fswrite("./config.json", setting);
            reply(`Berhasil mengubah nama bot menjadi *${newbot}*`);
          } else if (opt === "admin") {
            var adnum = setting.adminNumber;
            var newAd = num(gq());
            if (em(newAd)) return ex("<mentions/number>");
            if (newAd === "random") {
              if (!isGroup) return reply(res.grub);
              function ra() {
                return groupMembers[Math.floor(Math.random() * groupMembers.length)].id;
              }
              var fi = adnum.includes(ra());
              if (fi) newAd = ra().split("@")[0]; else newAd = ra().split("@")[0];
            }
            newAd = Number(newAd);
            if (isNaN(newAd)) return reply("Harus nomor.");
            var net = newAd + "@s.whatsapp.net";
            if (adnum.includes(net)) {
              var index = adnum.indexOf(net);
              if (index > -1) adnum.splice(index, 1);
              fswrite("./config.json", setting);
              return reply(`Mengahapus admin @${newAd}`, [net]);
            } else {
              setting.adminNumber.push(net);
              fswrite("./config.json", setting);
              reply(`Berhasil menambahkan @${newAd} ke admin.`, [net]);
            }
          } else if (opt === "simi") {
            if (isSimi) {
              var index = simi.indexOf(from);
              simi.splice(index, 1);
              fswrite("./database/simi.json", simi);
              reply(`Simi nonaktif.`);
            } else {
              simi.push(from);
              fswrite("./database/simi.json", simi);
              reply(`Simi aktif.`);
            }
          } else {
            reply(`Options tidak ada.`);
          }
          break;
        case "uptime":
          if (!isOwner) return reply(res.owner);
          reply(`Uptime: ${runtime(process.uptime())}`);
          break;
        case "restart":
          if (!isOwner) return reply(res.owner);
          if (!process.send) throw 'Dont: node main.js\nDo: node index.js';
          process.send("reset");
          reply("Berhasil restart");
          break;
        //MAIN MENU
        case "owner":
          await sendContact(owner, "AhmadAmin", msg);
          await reply("Chat jika ada kepentingan.");
          break;
        case "admin":
          var txt = "╭───「 *ADMIN LIST* 」\n";
          var i = 0;
          for (var ad of setting.adminNumber) {
            i++;
            txt += `│ ${i}. @${ad.split("@")[0]}\n`;
          }
          txt += `╰───「 *${botName}* 」`;
          reply(txt, setting.adminNumber);
          break;
        case "rules":
          reply(rules(prefix));
          break;
        case "donasi":
          reply(donasi());
          break;
        //PREMIUM MENU
        case "join":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isPrem) return reply(res.prem);
          if (!isBga) return reply(res.bot);
          const link = args[0];
          if (em(link)) return ex("https://chat.whatsapp.com/EU1SOmJQ5oTJyHMMZ52G94");
          if (!link.startsWith("https://chat.whatsapp.com/")) return reply("Link invalid.");
          const code = link.split("/")[3];
          if (em(code)) return reply("Link invalid.");
          conn.groupAcceptInvite(code);
          const ggii = await conn.groupGetInviteInfo(code);
          reply(`Berhasil masuk ke group ${ggii.subject}`);
          break;
        //ISLAMIC MENU
        case "surah":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          li();
          const surah = fs.readFileSync("./database/surah.json");
          const srh = JSON.parse(surah);
          var txt = `Contoh: ${cmd} an-nas\n\n╭───「 *LIST SURAH* 」\n`;
          for (var dt of srh.data) {
            txt += `│ ${dt.number}. *${dt.asma.id.short}* (${dt.asma.translation.id})\n`;
          }
          txt += `╰───「 *${botName}* 」`;
          if (em(q)) return reply(txt);
          var d = srh.data.find((v) => v.number === Number(q) || v.asma.id.short.toLowerCase() === q.toLowerCase());
          if (typeof d === "undefined") return reply("Surah tidak ditemukan.");
          var t = "╭───「 *SURAH* 」\n";
          t += `│ Surah: *${d.asma.id.short}* (${d.asma.ar.short})\n`;
          t += `│ Arti: *${d.asma.translation.id}*\n`;
          t += `│ Surah ke: *${d.number}*\n`;
          t += `│ Ayat: *${d.ayahCount}* ayat\n`;
          t += `│ Diturunkan di: *${d.type.id}*\n`;
          t += `│ Tafsir: *${d.tafsir.id}*\n`;
          t += `╰───「 *${botName}* 」`;
          reply(t);
          sendAudio(d.recitation.full, d.asma.id.long);
          break;
        case "jadwalsholat":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          chDb(user, "user", nom, lim, "limit");
          var d = await fetchJson(`https://api.myquran.com/v1/sholat/kota/semua`);
          var txt = "╭───「 *LIST KOTA* 」\n";
          for (var dt of d) {
            txt += `│ ${dt.id}. ${dt.lokasi}\n`;
          }
          txt += `╰───「 *${botName}* 」`;
          if (em(q)) return reply(txt);
          var a = d.find(x => x.lokasi.toLowerCase() === q.toLowerCase());
          if (typeof a === "undefined") return reply("Kota salah atau tidak ada.");
          var date = new Date();
          var id = a.id;
          var thn = date.getFullYear();
          var bln = date.getMonth() + 1;
          var tgl = date.getDate();
          reply(res.wait);
          var r = await fetchJson(`https://api.myquran.com/v1/sholat/jadwal/${id}/${thn}/${bln}/${tgl}`);
          var data = r.data;
          var txt = "╭───「 *JADWAL SHOLAT* 」\n";
          txt += `│ Lokasi: ${data.lokasi}\n`;
          txt += `│ Daerah: ${data.daerah}\n`;
          txt += `│ Tanggal: ${data.jadwal.tanggal}\n`;
          txt += `│ Imsak: *${data.jadwal.imsak}*\n`;
          txt += `│ Subuh: *${data.jadwal.subuh}*\n`;
          txt += `│ Terbit: *${data.jadwal.terbit}*\n`;
          txt += `│ Dhuha: *${data.jadwal.dhuha}*\n`;
          txt += `│ Dzuhur: *${data.jadwal.dzuhur}*\n`;
          txt += `│ Ashar: *${data.jadwal.ashar}*\n`;
          txt += `│ Maghrib: *${data.jadwal.maghrib}*\n`;
          txt += `│ Isya: *${data.jadwal.isya}*\n`;
          txt += `╰───「 *${botName}* 」`;
          reply(txt);
          break;
        //GROUP MENU
        case "linkgroup":
        case "linkgc":
        case "linkgrub":
        case "linkgrup":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (nolim) return reply(res.nolim);
          chDb(user, "user", nom, lim, "limit");
          const codes = await conn.groupInviteCode(from);
          reply(`Link: https://chat.whatsapp.com/${codes}`);
          break;
        case "promote":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (!isGcAdmin) return reply(res.adminGc);
          if (nolim) return reply(res.nolim);
          const n = num(q);
          if (em(n)) return ex("<mentions>");
          chDb(user, "user", nom, lim, "limit");
          var net = n + "@s.whatsapp.net";
          if (groupAdmin.includes(net)) return reply(`${n} sudah admin.`, [net]);
          conn.groupParticipantsUpdate(from, [net], "promote");
          break;
        case "demote":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (!isGcAdmin) return reply(res.adminGc);
          if (nolim) return reply(res.nolim);
          const n_ = num(q);
          if (em(n_)) return ex("<mentions>");
          const net_ = n_ + "@s.whatsapp.net";
          if (net_ === groupMetadata.owner) return reply(`Tidak bisa demote owner group.`);
          if (!groupAdmin.includes(net_)) return reply(`@${n_} sekarang tidak admin.`, [net_]);
          li();
          conn.groupParticipantsUpdate(from, [net_], "demote");
          break;
        case "add":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (!isBga) return reply(res.bot);
          if (nolim) return reply(res.nolim);
          var no = num(q);
          if (em(no)) return ex(`<number>`);
          chDb(user, "user", nom, lim, "limit");
          var net = no + "@s.whatsapp.net";
          var p1 = await conn.groupParticipantsUpdate(from, [net], "add");
          if (p1[0].status !== "200") reply(res.error);
          break;
        case "kick":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (!isBga) return reply(res.bot);
          if (nolim) return reply(res.nolim);
          var no = num(q);
          if (em(no)) return ex("<number/mentions>");
          if (no + "@s.whatsapp.net" === groupMetadata.owner) return reply("Tidak bisa kick owner group.");
          chDb(user, "user", nom, lim, "limit");
          var net = no + "@s.whatsapp.net";
          const p = await conn.groupParticipantsUpdate(from, [net], "remove");
          if (p[0].status !== "200") reply(res.error);
          break;
        case "group":
        case "gc":
        case "grub":
        case "grup":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isBga) return reply(res.bot);
          if (!isGcAdmin) return reply(res.adminGc);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex(`<open/close/antivirtex>`);
          chDb(user, "user", nom, lim, "limit");
          if (q === "open") {
            conn.groupSettingUpdate(from, "not_announcement");
          } else if (q === "close") {
            conn.groupSettingUpdate(from, "announcement");
          } else if (q === "antivirtex") {
            if (isAntiVirtex) {
              var index = antiVirtex.indexOf(from);
              antiVirtex.splice(index, 1);
              fswrite("./database/antivirtex.json", antiVirtex, 0);
              reply("Menonaktifkan antiVirtex untuk group ini.");
            } else {
              antiVirtex.push(from);
              fswrite("./database/antivirtex.json", antiVirtex, 0);
              reply("Mengaktifkan antiVirtex untuk group ini.");
            }
          } else {
            reply("Options tidak ada.");
          }
          break;
        case "hidetag":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<text>");
          chDb(user, "user", nom, Number(limit) - 3, "limit");
          var mem = [];
          groupAdmin.map(i => mem.push(i.id));
          console.log(mem);
          send(q, mem);
          break;
        case "tagall":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (nolim) return reply(res.nolim);
          chDb(user, "user", nom, Number(limit) - 3, "limit");
          var txt = "╭───「 *TAG ALL* 」\n";
          for (var mem of participant) {
            txt += `│ ❏ @${mem.id.split("@")[0]}\n`;
          }
          txt += `╰───「 *${botName}* 」`;
          reply(txt, participant.map(a => a.id));
          break;
        //STALKER MENU
        case "servermc":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isPrem) return reply(res.prem);
          if (em(args[0])) return ex(`<java/bedrock>`);
          if (nolim) return reply(res.nolim);
          var arg = args[1];
          if (em(arg)) return ex(`<ip:port>`, false, "Jika port kosong, port akan diganti ke default.");
          var sp = arg.split(":");
          var ip = sp[0];
          var port = sp[1];
          chDb(user, "user", nom, lim, "limit");
          if (args[0] === "java") {
            if (em(port)) port = "25565";
            reply(res.wait);
            var srv = await fetchJson(`https://api.mcsrvstat.us/2/${ip}:${port}`);
            if (srv.debug?.dns?.hasOwnProperty("error") || srv.hasOwnProperty("error")) return reply("Ip tidak ditemukan.");
            var on = srv.online;
            var txt = "╭───「 *SERVER MINECRAFT* 」\n";
            txt += `│ ❏ Server: java\n`;
            txt += `│ ❏ Ip: ${ip}\n`;
            txt += `│ ❏ Port: ${port}\n`;
            txt += `│ ❏ Versi: ${on ? srv.version : "server offline"}\n`;
            txt += `│ ❏ Status: ${on ? "online" : "offline"}\n`;
            txt += `│ ❏ Player: ${on ? srv.players.online : "0"}/${on ? srv.players.max : "0"}\n`;
            txt += `╰ ❏ Motd: \n${on ? srv.motd.clean.join("\n") : "server offline"}`;
            sendImg(txt, `https://api.mcsrvstat.us/icon/${ip}`);
          } else if (args[0] === "bedrock") {
            if (em(port)) port = "19132";
            reply(res.wait);
            var srv = await fetchJson(`https://api.mcsrvstat.us/bedrock/2/${ip}:${port}`);
            if (srv.debug?.dns?.hasOwnProperty("error") || srv.hasOwnProperty("error")) return reply("Ip tidak ditemukan.");
            var on = srv.online;
            var txt = "╭───「 *SERVER MINECRAFT* 」\n";
            txt += `│ ❏ Server: bedrock\n`;
            txt += `│ ❏ Ip: ${ip}\n`;
            txt += `│ ❏ Port: ${port}\n`;
            txt += `│ ❏ Versi: ${on ? srv.version : "server offline"}\n`;
            txt += `│ ❏ Status: ${on ? "online" : "offline"}\n`;
            txt += `│ ❏ Player: ${on ? srv.players.online : "0"}/${on ? srv.players.max : "0"}\n`;
            txt += `╰ ❏ Motd: ${on ? srv.motd.clean.join("\n") : "server offline"}`;
            reply(txt);
          } else {
            reply("Server type not found.");
          }
          break;
        case "github":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<username>");
          chDb(user, "user", nom, lim, "limit");
          var gh = await fetchJson(`https://api.github.com/users/${q}`);
          var ms = gh.message || "";
          if (ms === "Not Found") return reply(`Username ${q} tidak ada.`);
          var txt = "╭───「 *GITHUB* 」\n";
          txt += `│ ❏ Username: ${gh.login}\n`;
          txt += `│ ❏ Followers: ${gh.followers}\n`;
          txt += `│ ❏ Following: ${gh.following}\n`;
          txt += `│ ❏ Bio: ${gh.bio === null ? "Tidak Ada" : gh.bio}\n`;
          txt += `│ ❏ Email: ${gh.email === null ? "Tidak Ada" : gh.email}\n`;
          txt += `│ ❏ Location: ${gh.location === null ? "Tidak Ada" : gh.location}\n`;
          txt += `│ ❏ Url: ${gh.html_url}\n`;
          txt += `╰───「 *${botName}* 」`;
          sendImg(txt, gh.avatar_url);
          break;
        case "brainly":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          setDb("limit", lim);
          if (em(q)) return ex("<query>");
          var txt = "╭──「 *BRAINLY* 」\n";
          var br = await brainly(q, 3);
          if (!br.success) return reply(res.error);
          for (var b of br.data) {
            txt += `╭─────────────\n`
            txt += `│ ${b.pertanyaan}\n`;
            for (var j of b.jawaban) {
              txt += `│ Jawaban: ${j.text}\n`;
            }
            txt += `╰─────────────\n\n`;
          }
          txt += `──「 *${botName}* 」──`;
          reply(txt);
          break;
        case "pinterest":
        case "pr":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<query>");
          reply(res.wait);
          chDb(user, "user", nom, lim, "limit");
          var pr = await scr.pinterest(q);
          sendImg(q, pr[Math.floor(Math.random() * pr.length)]);
          break;
        case 'sticker': case 's': case 'stiker':
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (isImage || isQuotedImage) {
            chDb(user, "user", nom, lim, "limit");
            await conn.downloadAndSaveMediaMessage(msg, "image", `./sticker/${sender.split("@")[0]}.jpeg`)
            let buffer = fs.readFileSync(`./sticker/${sender.split("@")[0]}.jpeg`)
            reply(res.wait)
            var rand1 = 'sticker/' + getRandom('.jpeg')
            var rand2 = 'sticker/' + getRandom('.webp')
            fs.writeFileSync(`${rand1}`, buffer)
            ffmpeg(`./${rand1}`)
              .on("error", console.error)
              .on("end", () => {
                exec(`webpmux -set exif ./sticker/data.exif ./${rand2} -o ./${rand2}`, async (error) => {
                  conn.sendMessage(from, { sticker: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
                  fs.unlinkSync(`./${rand1}`)
                  fs.unlinkSync(`./sticker/${sender.split("@")[0]}.jpeg`)
                  fs.unlinkSync(`./${rand2}`)
                })
              }).addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat('webp').save(`${rand2}`)
          } else {
            reply(`Kirim gambar dengan caption *${prefix + command}* atau balas gambar yang sudah dikirim`)
          }
          break;
        case "setwm":
          if (!isOwner) return reply(res.owner);
          if (em(q)) return ex("<packname|authorname>");
          var s = q.split("|");
          var packname = s[0];
          var authorname = s[1];
          if (em(packname)) return reply("Packname harus di isi.");
          if (em(authorname)) return reply("Authorname harus di isi.");
          exif.create(packname, authorname);
          reply("Berhasil setwm.");
          break;
        case "sound":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          setDb("limit", lim);
          if (em(args[0])) return ex("<number>");
          if (Number(args[0]) > 74) return reply("Max 74");
          if (typeof Number(args[0]) !== "number") return reply("Harus nomor.");
          reply(res.wait);
          var buf = await getBuffer(`https://github.com/saipulanuar/Api-Github/raw/main/sound/sound${args[0]}.mp3`);
          conn.sendMessage(from, { audio: buf, mimetype: "audio/mpeg", ptt: true }, { quoted: msg });
          break;
        case "tiktok": case "tt":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (em(q)) return ex("<username>");
          reply(res.wait);
          var ttlu = (await new tt.TikTokScraper().getUserProfileInfo()).user;
          console.log(ttlu);
          return reply(res.mt);
          var r = t.result;
          var txt = "╭───「 *TIK TOK* 」\n";
          txt += `│ Username: *${r.username}*\n`;
          txt += `│ Nickname: *${r.nickname}*\n`;
          txt += `│ Bio: ${r.bio}\n`;
          txt += `│ Followers: *${abbreviateNumber(r.followers)}*\n`;
          txt += `│ Following: *${abbreviateNumber(r.followings)}*\n`;
          txt += `│ Likes: *${abbreviateNumber(r.likes)}*\n`;
          txt += `│ Video: *${abbreviateNumber(r.video)}*\n`;
          txt += `╰───「 *${botName}* 」`;
          sendImg(txt, r.user_picture);
          break;
        case "instagram":
        case "ig":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<username>");
          reply(res.wait);
          var igs = new igApi("sessionid=56833551764%3A9sV4Bl8cUPwAwb%3A17%3AAYd5sJlDro61QRM3zAgoEew_zTsbjTivCyInswQGaA; ds_user_id=56833551764; csrftoken=vraSOzBkxgwwlmzdNzOxYyECbUJ87N7R");
          var ig = await igs.fetchUser(q);
          var txt = "╭───「 *INSTAGRAM* 」\n";
          txt += `│ ❏ Name: *${ig.fullname}* (${ig.username})\n`;
          txt += `│ ❏ Bio: ${ig.biography}\n`;
          txt += `│ ❏ Posts: *${abbreviateNumber(ig.post_count, true)}*\n`;
          txt += `│ ❏ Followers: *${abbreviateNumber(ig.followers, true)}*\n`;
          txt += `│ ❏ Following: *${abbreviateNumber(ig.following, true)}*\n`;
          txt += `│ ❏ Email: ${ig.public_email}\n`;
          txt += `╰───「 *${botName}* 」`;
          sendImg(txt, ig.hd_profile_pic_url_info.url, parseMention(ig.biography));
          break;
        case "joox":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (em(q)) return ex("<lagu>");
          reply(res.wait);
          var j = await joox(q);
          console.log(j);
          return reply(res.mt);
          var r = d.result;
          var txt = "╭───「 *JOOX* 」\n";
          txt += `│ Lagu: *${r.info.song}*\n`;
          txt += `│ Artis: *${r.info.singer}*\n`;
          txt += `│ Album: *${r.info.album}*\n`;
          txt += `│ Durasi: *${r.info.duration}*\n`;
          txt += `│ Dibuat: *${r.info.date}*\n`;
          txt += `╰───「 *${botName}* 」\n`;
          txt += `_Audio sedang di kirim.._`;
          sendImg(txt, r.image);
          var l = r.audio[r.audio.length - 1].link;
          if (l === "") l = r.audio[0].link;
          sendAudio(l);
          break;
        case "ppcouple":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          reply(res.wait);
          chDb(user, "user", nom, lim, "limit");
          var d = await fetchJson(`https://saipulanuar.ga/api/random/couple`);
          sendImg("Cowok", d.result.male);
          sendImg("Cewek", d.result.female);
          break;
        case "ytmp3":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<link youtube>");
          reply(res.wait);
          var result = await fetchJson(`https://saipulanuar.ga/api/download/ytmp3?url=${q}`);
          if (result.status !== 200) return reply("Url invalid.");
          li();
          var ress = result.result;
          var txt = "╭───「 *YOUTUBE MP3* 」\n";
          txt += `│ ❏ Judul: *${ress.title}*\n`;
          txt += `│ ❏ Channel: *${ress.channel}*\n`;
          txt += `│ ❏ View: *${abbreviateNumber(ress.views, true)}*\n`;
          txt += `│ ❏ Publish: *${ress.published}*\n`;
          txt += `╰───「 *${botName}* 」\n_Audio sedang di kirim_`;
          console.log(ress.url);
          sendImg(txt, ress.thumb);
          await sendAudio(ress.url, ress.title, false);
          break;
        case "ban":
          if (!isOwner) if (!isAdmin) return reply(res.owmin);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<nomor/mentions>");
          var no = num(q);
          if (!await cuser(no)) return reply(res.nover);
          no = no + "@s.whatsapp.net";
          if (isBan) return reply(`@${no.split("@")[0]} sudah pernah diban.`, [no]);
          chDb(user, "user", no.split("@")[0], true, "banned");
          reply(`Berhasil membanned @${no.split("@")[0]}.`, [no]);
          break;
        case "unban":
          if (!isOwner || !isAdmin) return reply(res.owmin);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<nomor/mentions>");
          var no = num(q);
          if (!await cuser(no)) return reply(res.nover);
          var ppk = await user.find("/", x => x.user === no);
          if (!ppk.banned) return reply(`@${no} tidak dibanned.`, [no + "@s.whatsapp.net"]);
          chDb(user, "user", no, false, "banned");
          reply(`Berhasil unbanned @${no}.`, [no + "@s.whatsapp.net"]);
          break;
        case "banlist":
        case "listban":
          if (!isUser) return reply(res.user);
          var k = 0;
          var ban = await user.filter("/", x => x.banned === true);
          var bann = [];
          var txt = "╭───「 *LIST BANNED* 」\n";
          for (var i = 0; i < ban.length; i++) {
            var b = ban[i];
            bann.push(b.user + "@s.whatsapp.net");
            k++;
            txt += `│ ❏ ${k}. @${b.user}\n`;
          }
          txt += `╰───「 *${botName}* 」`;
          reply(txt, bann);
          break;
        case "premlist": case "listprem":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          break;
        case "afk":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (isAfk) return;
          var alasan = q;
          if (em(alasan)) alasan = "Tidak Ada";
          var times = Date.now();
          var obj = {
            user: sender.split("@")[0],
            alasan: alasan,
            time: times
          }
          afk.push(obj);
          fswrite("./database/afk.json", afk, 0);
          var txt = `Anda sedang afk dengan alasan *${alasan}*`;
          reply(txt, parseMention(txt));
          break;
        case "adminonly":
        case "onlyadmin":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          if (!isGcAdmin) return reply(res.adminGc);
          if (adminonly.includes(from)) {
            var index = adminonly.indexOf(from);
            adminonly.splice(index, 1);
            fswrite("./database/adminonly.json", adminonly, 0);
            reply("Sekarang semua bisa menggunakan perintah bot.");
          } else {
            adminonly.push(from);
            fswrite("./database/adminonly.json", adminonly, 0);
            reply("Sekarang hanya admin yang dapat menggunakan perintah bot.");
          }
          break;
        case "mybal": case "mybalance":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          reply(`Balance kamu *${abbreviateNumber(balance)}*`);
          break;
        case "slot": case "slots": case "judi":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isPriv) return reply(res.priv);
          var harga = 5000;
          var ba = bal - harga;
          if (bal < harga) return reply(res.nobal);
          chDb(user, "user", nom, ba, "balance");
          const slot = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
          const chances = [0.1, 5, 10, 30, 40, 50, 60, 70, 80, 99];
          var ar = [];
          var _1 = chance(slot, chances);
          var _2 = chance(slot, chances);
          var _3 = chance(slot, chances);
          ar.push(_1);
          ar.push(_2);
          ar.push(_3);
          var txt = `[ 🎰 | SLOTS ]\n╭	────────────\n│ ${slots(slot)} : ${slots(slot)} : ${slots(slot)}\n│ ${_1} : ${_2} : ${_3} <====│\n│ ${slots(slot)} : ${slots(slot)} : ${slots(slot)}\n╰────────────\n[ 🎰 | SLOTS ]\n\nKeterangan : Angka 1 = 100rb\n2 = 70rb\n3 = 50rb\nChance: 1=0.1%,2=5%,3=10%,4=30%,5=40%,6=50%,7=60%,8=70%,9=80%,10=99%\nJika 1 semua, akan mendapatkan 1m balance.\n\n -${abbreviateNumber(harga)} perslot.`;
          replyBut(txt, [
            {
              buttonId: `.slot`,
              buttonText: {
                displayText: "MAIN LAGI"
              },
              type: 1
            }
          ]);
          if (ar.includes("1️⃣")) {
            chDb(user, "user", nom, bal + 100000, "balance");
            reply("+ 100rb");
          } else if (ar.includes("2️⃣")) {
            chDb(user, "user", nom, bal + 70000, "balance");
            reply("+ 70rb");
          } else if (ar.includes("3️⃣")) {
            chDb(user, "user", nom, bal + 50000, "balance");
            reply("+ 50rb");
          }
          function slots(slot = [""]) {
            return slot[Math.floor(Math.random() * slot.length)];
          }
          break;
        case "transfer":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (em(args[0])) return ex("<jumlah> <mentions/number>");
          var jum = Number(args[0]);
          if (isNaN(jum)) return reply("Jumlah harus nomor.");
          var no = num(gq());
          if (em(no)) return ex(`<mentions/number>`);
          if (no === nom) return reply("Tidak bisa transfer diri sendiri.");
          if (jum > bal) return reply(res.nobal);
          var tar = await user.find("/", x => x.user === no);
          if (typeof tar === "undefined") return reply(res.nover);
          chDb(user, "user", no, Number(tar.balance) + jum, "balance");
          chDb(user, "user", nom, bal - jum, "balance");
          reply(`Berhasil transfer ${abbreviateNumber(jum)} ke @${no}`, [no + "@s.whatsapp.net"]);
          break;
        case "cekbal":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (em(q)) return ex("<mentions/number>");
          var no = num(q);
          var bala = await user.find("/", x => x.user === no);
          if (typeof bala === "undefined") return reply(res.nover);
          reply(`Balance @${no}: *${abbreviateNumber(bala.balance)}*`, [no + "@s.whatsapp.net"]);
          break;
        case "topbal": case "baltop":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          var txt = "╭───「 *TOP BALANCE* 」\n";
          var allBal = [];
          var usr = [];
          var uss = await user.getData("/");
          var ppk = "";
          for (var i = 0; i < uss.length; i++) {
            if (uss[i].balance !== 30000) {
              allBal.push(uss[i].balance);
              usr.push(uss[i].user);
              allBal.sort((a, b) => {
                return b - a;
              });
            }
          }
          /*for (var i = 0; i < allBal.length; i++) {
            var fin = await user.find("/", x => x.balance === allBal[i]);
            usr.push(fin.user);
          }
          var w = 0;
          for (var u = 0; u < allBal.length; u++) {
            w++;
            txt += `│ ❏ ${w}. @${usr[u]} - ${abbreviateNumber(allBal[u])}.\n`;
          }
          txt += `╰───「 *${botName}* 」`;
          var o = [];
          for (var k of usr) {
            o.push(k + "@s.whatsapp.net");
          }*/
          reply("sedang di fix");
          break;
        case "mylim": case "mylimit":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          reply(`Limit kamu *${limit}*`);
          break;
        case "ceklimit": case "ceklim":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (em(q)) return ex("<mentions/number>");
          var no = num(q);
          var limitt = await user.find("/", x => x.user === no)
          if (typeof limit === "undefined") return reply(res.nover);
          reply(`Limit @${no}: *${limitt.limit}*`, [no + "@s.whatsapp.net"]);
          break;
        case "buylimit": case "belimit": case "limitbuy": case "belilimit":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (em(q)) return ex("<jumlah>");
          var jum = Number(q);
          if (isNaN(jum)) return reply("Jumlah harus nomor.");
          var harga = 10000 * jum;
          if (bal < harga) return reply(res.nobal);
          chDb(user, "user", nom, bal - harga, "balance");
          chDb(user, "user", nom, Number(limit) + jum, "limit");
          reply(`Berhasil membeli *${jum}* limit, dengan harga *${abbreviateNumber(harga)}*.`);
          break;
        case "jadian":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          chDb(user, "user", nom, lim, "limit");
          var par = groupMembers;
          var aku = randomPick(par).id;
          var dia = randomPick(par).id;
          if (aku === dia || aku === botNumber || dia === botNumber) {
            aku = randomPick(par).id;
            dia = randomPick(par).id;
          }
          var txt = `@${aku.split("@")[0]} 💖 @${dia.split("@")[0]}`
          reply(txt, parseMention(txt));
          break;
        case 'ttc': case 'ttt': case 'tictactoe': {
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (!isGroup) return reply(res.grub);
          var text = q;
          let TicTacToe = require("./lib/tictactoe")
          this.game = this.game ? this.game : {}
          if (text === "end" || text === "keluar" || text === "stop" || text === "selesai") {
            if (this.game) {
              delete this.game;
              return reply("Keluar dari TicTacToe");
            } else if (!this.game) {
              return reply("Tidak ada TicTacToe");
            }
          }
          if (Object.values(this.game).find(room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(sender))) return reply('Kamu masih didalam game')
          let room = Object.values(this.game).find(room => room.state === 'WAITING' && (text ? room.name === text : true))
          if (room) {
            chDb(user, "user", nom, lim, "limit");
            room.o = from
            room.game.playerO = sender
            room.state = 'PLAYING'
            let arr = room.game.render().map(v => {
              return {
                X: '❌',
                O: '⭕',
                1: '1️⃣',
                2: '2️⃣',
                3: '3️⃣',
                4: '4️⃣',
                5: '5️⃣',
                6: '6️⃣',
                7: '7️⃣',
                8: '8️⃣',
                9: '9️⃣',
              }[v]
            })
            let str = `Room ID: ${room.id}\n\n${arr.slice(0, 3).join('')}\n${arr.slice(3, 6).join('')}\n${arr.slice(6).join('')}\n\nMenunggu @${room.game.currentTurn.split('@')[0]}\n\nKetik *nyerah* untuk menyerah dan mengakui kekalahan`
            if (room.x !== room.o) await conn.sendMessage(room.x, { text: str, mentions: parseMention(str) });
            await conn.sendMessage(room.o, { text: str, mentions: parseMention(str) });
          } else {
            room = {
              id: 'tictactoe-' + (+new Date),
              x: from,
              o: '',
              game: new TicTacToe(sender, 'o'),
              state: 'WAITING'
            }
            if (text) room.name = text
            var strr = 'Menunggu partner' + (text ? ` mengetik command dibawah ini ${prefix}${command} ${text}` : '')
            reply(strr, parseMention(strr))
            this.game[room.id] = room
          }
        }
          break;
        case "tebakgambar": case "tg":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (isTg) return reply("Masih ada tebak gambar di sini.");
          reply(res.wait);
          var tg = tebakgambar[Math.floor(Math.random() * tebakgambar.length)];
          var img = tg.image.replace("{url}", "https://jawabantebakgambar.net") + ".png";
          var wtg = tg.answer.split(" ").length * 30000;
          var txt = `Silahkan jawab. waktu *${wtg / 1000}* detik.`;
          var obj = {
            jid: from,
            answer: tg.answer
          }
          tgc.push(obj);
          fswrite("./database/tg.json", tgc);
          var timeout = setTimeout(() => {
            if (selese) {
              selese = false;
              clearTimeout(timeout);
            } else {
              var index = tgc.findIndex(x => x.jid === from);
              tgc.splice(index, 1);
              fswrite("./database/tg.json", tgc);
              reply("Waktu habis.");
            }
          }, wtg);
          sendImg(txt, img);
          break;
        case "tebakbendera": case "tb":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          var data = JSON.parse(fs.readFileSync("./database/game/tebakbendera.json"));
          data = data[Math.floor(Math.random() * data.length)];
          var flag = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"];
          var tx = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
          var arr = [];
          var flags = data.flag.split("");
          for (var i = 0; i < flags.length; i++) {
            var bndr = data.flag.split("");
            arr.push(searchStringInArray(bndr[i], tx));
          }
          var kata1 = flags[0].replace(flags[0], flag[arr[0]]);
          var kata2 = flags[1].replace(flags[1], flag[arr[1]]);
          reply(`${kata1 + kata2}\nBendera apa ini?`);
          function searchStringInArray(str = "", strArray = [""]) {
            for (var j = 0; j < strArray.length; j++) {
              if (strArray[j].match(str)) return j;
            }
            return -1;
          }
          break;
        case "tebaklirik": case "tl":
          reply("In progres..");
          break;
        case "siapakahaku":
          reply("In progres..");
          break;
        case "cekgay": case "ceklesbi": case "cekpinter": case "cekjelek": case "ceksange": case "cekahlak": case "ceksopan": case "cekganteng": case "cekcantik": case "cekwibu": case "cektolol": case "cekgoblok": case "cekpink": case "cekbego": case "cekautis": case "cekalim":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.ban);
          chDb(user, "user", nom, lim, "limit");
          var rand = Math.floor(Math.random() * 100).toFixed(1);
          var no = em(q) ? nom : num(q);
          var cek = command.split("cek")[1];
          var txt = `*${rand}%* @${no} *${cek}*.`;
          reply(txt, parseMention(txt));
          break;
        case "toimg": case "toimage":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (isQuotedSticker && !isVideo) {
            await conn.downloadAndSaveMediaMessage(msg, "sticker", `./sticker/${sender.split("@")[0]}.webp`)
            let buffer = fs.readFileSync(`./sticker/${sender.split("@")[0]}.webp`)
            var rand1 = 'sticker/' + getRandom('.webp')
            var rand2 = 'sticker/' + getRandom('.png')
            fs.writeFileSync(`./${rand1}`, buffer)
            reply(res.wait);
            exec(`ffmpeg -i ./${rand1} ./${rand2}`, (err) => {
              fs.unlinkSync(`./${rand1}`)
              if (err) return reply(res.err)
              chDb(user, "user", nom, lim, "limit");
              conn.sendMessage(from, { caption: `*Sticker Convert To Image!*`, image: fs.readFileSync(`./${rand2}`) }, { quoted: msg })
              fs.unlinkSync(`./${rand2}`)
              fs.unlinkSync(`./sticker/${sender.split("@")[0]}.webp`)
            })
          } else {
            reply(`*Reply sticker nya dengan pesan ${prefix}toimg*`);
          }
          break;
        case "happymod":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          var sp = q.split("|");
          if (em(sp[0])) return ex("<aplikasi>");
          var pg = Number(sp[1]);
          if (em(sp[1])) pg = 1;
          if (isNaN(pg)) return reply("list harus nomor.");
          reply(res.wait);
          var data = await fetchJson(`https://saipulanuar.ga/api/download/happymod?query=${sp[0]}`);
          if (pg > data.result.length) return reply(`Max list *${data.result.length}*.`);
          chDb(user, "user", nom, lim, "limit");
          var r = data.result[pg - 1];
          var txt = `╭───「 *HAPPY MOD* 」\n`;
          txt += `│ ❏ Aplikasi: *${r.judul.trim()}*\n`;
          txt += `│ ❏ Rating: *${r.rating}/5.0*\n`;
          txt += `│ ❏ Download: ${r.link}download.html\n`;
          txt += `│ ❏ List: *${pg}/${data.result.length}*\n`;
          txt += `╰───「 *${botName}* 」`;
          sendImg(txt, r.thumb);
          break;
        case "stickersearch": case "stikersearch": case "caristiker":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          if (em(q)) return ex("<query>");
          reply(res.wait);
          var data = await fetchJson(`https://saipulanuar.ga/api/download/stickersearch?text=${q}`);
          if (data.status !== 200) return reply(`Sticker *${q}* tidak ditemukan.`);
          chDb(user, "user", nom, lim, "limit");
          sendImg(`${data.result.title}\nUbah stiker manual`, data.result.url);
          break;
        case "tts":
          if (!isUser) return reply(res.user);
          if (isBan) return reply(res.ban);
          if (nolim) return reply(res.nolim);
          chDb(user, "user", nom, lim, "limit");
          var sp = q.split("|");
          if (em(sp[0])) return ex("<text>");
          var lang = sp[1];
          if (em(sp[1])) lang = "id";
          reply(res.wait);
          var data = `https://saipulanuar.ga/api/text-to-audio/tts?text=${sp[0]}&idbahasa=${lang}`;
          sendAudio(data, sp[0]);
          break;
      }
      function li() {
        chDb(user, "user", nom, lim, "limit");
      }
      function randomPick(array = ["", 0, true, { object: ""}]) {
        return array[Math.floor(Math.random() * array.length)];
      }
      function replyBut(txt = "", buttons = []) {
        conn.sendMessage(from, { text: txt, footer: `© *${botName}*`, buttons: buttons }, { quoted: msg });
      }
      function arrayShuffle(array) {
        for (var i = 0, length = array.length, swap = 0, temp = ''; i < length; i++) {
          swap = Math.floor(Math.random() * (i + 1));
          temp = array[swap];
          array[swap] = array[i];
          array[i] = temp;
        }
        return array;
      };

      function chance(values, chances) {
        for (var i = 0, pool = []; i < chances.length; i++) {
          for (var i2 = 0; i2 < chances[i]; i2++) {
            pool.push(i);
          }
        }
        return values[arrayShuffle(pool)['0']];
      };
      async function cuser(no = "") {
        return typeof await user.find("/", x => x.user === no) === "undefined" ? false : true;
      }
      function gq() {
        args.shift();
        return args.join(" ");
      }
      function num(jid = "", whatsapp = false) {
        if (!jid) return jid;
        jid = jid.replace("+", "").replace(" ", "").replace(/-/gi, "").replace("@", "");
        if (whatsapp) jid = jid + "@s.whatsapp.net";
        return jid;
      }
      function abbreviateNumber(value = 0, k = false) {
        if (k) {
          var newValue = value;
          if (value >= 1000) {
            var suffixes = ["", "rb", "jt", "m", "t", "kuad", "kuan", "sek", "sep", "okt", "no"];
            var suffixNum = Math.floor(("" + value).length / 3);
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
              shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
              var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
              if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
            newValue = shortValue + suffixes[suffixNum];
          }
          return newValue;
        } else {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR"
          }).format(value);
        }
      }
      function ex(arg = "", string = false, note = "") {
        if (em(note)) {
          if (string) return `Contoh:\n ${cmd} ${arg}`;
          reply(`Contoh:\n${cmd} ${arg}`);
        } else {
          reply(`Contoh:\n${cmd} ${arg}\nNOTE: ${note}`);
        }
      }
      async function reply(content = "", mentions = []) {
        if (mentions.length === 0) {
          await conn.sendMessage(from, { text: content, footer: `Author: ${setting.ownerName}` }, { quoted: msg });
        } else {
          await conn.sendMessage(from, { text: content, footer: `Author: ${setting.ownerName}`, mentions: mentions }, { quoted: msg });
        }
      }
      function getRandom(ext) {
        return `${Math.floor(Math.random() * 10000)}${ext}`;
      }
      function send(content = "", mentions = []) {
        if (mentions.length === 0) {
          conn.sendMessage(from, { text: content });
        } else {
          conn.sendMessage(from, { text: content, mentions: mentions });
        }
      }
      function sendImg(content = "", url = "", mentions = []) {
        if (typeof url === "object") {
          reply(res.error);
        } else {
          if (mentions.length === 0) {
            conn.sendMessage(from, { image: { url: url }, caption: content }, { quoted: msg });
          } else {
            conn.sendMessage(from, { image: { url: url }, caption: content, mentions: mentions }, { quoted: msg });
          }
        }
      }
      async function sendAudio(url = "", fileName = "", vn = false) {
        if (!vn) {
          await conn.sendMessage(from, { audio: { url: url }, mimetype: "audio/mpeg", fileName: `${em(fileName) ? botName : fileName}.mp3` }, { quoted: msg });
        } else {
          await conn.sendMessage(from, {
            audio: {
              url: url
            }, mimetype: "audio/mpeg", fileName: `${em(fileName) ? botName : fileName}.mp3`
          });
        }
      }
    });
    conn.ev.on("connection.update", (update) => {
      try {
        const { connection, lastDisconnect } = update;
        if (!em(update.qr)) {
          console.log(color("Silahkan scan qr code dibawah ini.. qr akan hilang dalam 1 menit", "magenta"));
        }
        if (connection === "close") {
          const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
          if (reason === DisconnectReason.badSession) {
            console.log(`Bad Session File, Please Delete Session and Scan Again`);
          } else if (reason === DisconnectReason.connectionClosed) {
            console.log("Connection closed, reconnecting....");
            connectToWhatsApp();
          } else if (reason === DisconnectReason.connectionLost) {
            console.log("Connection Lost from Server, reconnecting...");
            connectToWhatsApp();
          } else if (reason === DisconnectReason.connectionReplaced) {
            console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
          } else if (reason === DisconnectReason.loggedOut) {
            console.log(`Device Logged Out, Please Scan Again And Run.`);
          } else if (reason === DisconnectReason.restartRequired) {
            console.log("Restart Required, Restarting...");
            connectToWhatsApp();
          } else if (reason === DisconnectReason.timedOut) {
            console.log("Connection TimedOut, Reconnecting...");
            connectToWhatsApp();
          } else if (reason === DisconnectReason.multideviceMismatch) {
            console.log("Multi device mismatch, please scan again");
          } else console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
        }
        if (connection === "connecting") {
          console.log(color("Connecting..", "yellow"));
        }
        if (connection === "open") {
          const connected = chalk.hex("#39e75f");
          console.log(connected("Connected.."));
        }
      } catch (e) {
        connectToWhatsApp();
      }
    });
    conn.downloadAndSaveMediaMessage = async (msg, type_file, path_file) => {
      if (type_file === 'image') {
        var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === 'video') {
        var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === 'sticker') {
        var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      } else if (type_file === 'audio') {
        var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return path_file
      }
    }
    conn.ev.on("creds.update", () => saveState);
    return conn;
  }
  connectToWhatsApp().catch(err => console.log("Error"));
} catch (e) {
  console.log("Ada yang error.");
  console.error(e);
}