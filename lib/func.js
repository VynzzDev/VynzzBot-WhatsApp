const fetch = require("node-fetch");
const { writeFileSync, readFileSync } = require("fs");
const axios = require("axios");

function fetchJson(url = "", options) {
  return new Promise(async (resolve, reject) => {
    fetch(url, options)
      .then(response => response.json())
      .then(json => {
        resolve(json);
      })
      .catch((err) => {
        reject("Error");
      });
  });
}

function getGroupAdmin(participants) {
  let admins = [];
  for (let i of participants) {
    i.admin !== null ? admins.push(i.id) : '';
  }
  return admins;
}

function em(text = "") {
  return text.trim().length === 0;
}

function runtime(seconds = 0) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor(seconds % (3600 * 24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " d, " : " d, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " h, " : " h, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " m, " : " m, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function fswrite(file = "", value, space = 0) { return writeFileSync(file, JSON.stringify(value, null, space)); }

async function getBuffer(url, options) {
  try {
    options ? options : {};
    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (e) {
    console.log(`Error : ${e}`);
  }
}

function gid() {
  const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var res = "";
  for (var i = 0; i < 10; i++) {
    res += char.charAt(Math.floor(Math.random() * char.length));
  }
  return res;
}

function parseMention(text = '') {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

function serialize(conn, msg) {
  msg.isGroup = msg.key.remoteJid.endsWith('@g.us')
  try {
    const berak = Object.keys(msg.message)[0]
    msg.type = berak
  } catch {
    msg.type = null
  }
  try {
    const context = msg.message[msg.type].contextInfo.quotedMessage
    if (context["ephemeralMessage"]) {
      msg.quotedMsg = context.ephemeralMessage.message
    } else {
      msg.quotedMsg = context
    }
    msg.isQuotedMsg = true
    msg.quotedMsg.sender = msg.message[msg.type].contextInfo.participant
    msg.quotedMsg.fromMe = msg.quotedMsg.sender === conn.user.id.split(':')[0] + '@s.whatsapp.net' ? true : false
    msg.quotedMsg.type = Object.keys(msg.quotedMsg)[0]
    let ane = msg.quotedMsg
    msg.quotedMsg.chats = (ane.type === 'conversation' && ane.conversation) ? ane.conversation : (ane.type == 'imageMessage') && ane.imageMessage.caption ? ane.imageMessage.caption : (ane.type == 'documentMessage') && ane.documentMessage.caption ? ane.documentMessage.caption : (ane.type == 'videoMessage') && ane.videoMessage.caption ? ane.videoMessage.caption : (ane.type == 'extendedTextMessage') && ane.extendedTextMessage.text ? ane.extendedTextMessage.text : (ane.type == 'buttonsMessage') && ane.buttonsMessage.contentText ? ane.buttonsMessage.contentText : ""
    msg.quotedMsg.id = msg.message[msg.type].contextInfo.stanzaId
  } catch {
    msg.quotedMsg = null
    msg.isQuotedMsg = false
  }

  try {
    const mention = msg.message[msg.type].contextInfo.mentionedJid
    msg.mentioned = mention
  } catch {
    msg.mentioned = []
  }
    
  if (msg.isGroup) {
    msg.sender = msg.participant
  } else {
    msg.sender = msg.key.remoteJid
  }
  if (msg.key.fromMe) {
    msg.sender = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  }

  msg.from = msg.key.remoteJid
  msg.now = msg.messageTimestamp
  msg.fromMe = msg.key.fromMe

  return msg
}

module.exports = { fetchJson, getGroupAdmin, em, runtime, fswrite, getBuffer, gid, parseMention, serialize };