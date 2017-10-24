const fs = require('fs);
const client = require('discord.js').Client();

let token = "";
fs.readFile('./token.txt', 'utf8', (err, data) => {
  if(err) { return console.log(err) };
  token = data;
});

client.on('ready', () => {
  console.log("bot ready");
});

client.on('message', message => {
  if(message.content === "ping") {
    message.reply("Hello, ${message.author}!")
      .then(msg => console.log("Sent a reply to ${msg.author}"))
      .catch(console.error);
  }
});

client.login(token);
