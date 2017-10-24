const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

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

if(process.argv.length < 3) {
  console.log("Usage: node bot.js <token>"); 
}
else {
  client.login(process.argv[2]);
}
