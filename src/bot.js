const Discord = require('discord.js');
const client = new Discord.Client();
const mongoose = require('mongoose');

// Connect to db
mongoose.connect('mongodb://localhost/mydb', { useMongoClient: true });

let userSchema = new mongoose.Schema({
  id: String,
  username: String,
  count: Number,
  total: Number,
  others: [{ id: String, last: Date, times: Number  }],
  messages: [{ raters: [{id: String, rating: Number}], timestamp: Date }]
});

User = mongoose.model('User', userSchema);

client.on('ready', () => {
  console.log("bot ready");
});

client.on('message', message => {
  if(message.content === "$add") {
    addUser(message.author) ? message.reply("Added") : message.reply("You're already in");
  }

  else if(message.toString().charAt(0) == '#') {
    User.findOne({ 'id': message.author.id }, (err, user) => {
      if(err) return console.error(err);
      console.log(user);
    });
  }
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("Connected!");

  // Launch discord server
  client.login(process.argv[2]);
}); 

function addUser(discordUser) {
  User.findOne({ 'id': discordUser.id }, (err, user) => {
    if(user != null) {
      console.log("user already exists!");
      return false;
    }
    
    else {
      let newUser = new User({
        id: discordUser.id,
        username: discordUser.username,
        count: 1,
        total: 3,
        others: [],
        messages: []
      });

      newUser.save((err) => {
        if(err) return console.error(err);
      }); 

      return true;
    }
  });
}
