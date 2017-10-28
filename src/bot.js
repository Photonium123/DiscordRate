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
  others: [{ id: String, last: Date, times: Number }],
  messages: [{ id: String, raters: [{id: String, rating: Number}], timestamp: Date }]
});

User = mongoose.model('User', userSchema);

client.on('ready', () => {
  console.log("bot ready");

  client.guilds.array().forEach(guild => {
    guild.members.array().forEach(member => {
      User.findOne({ 'id': member.user.id }, (err, user) => {
        if(user != null || member.user.id == client.user.id) return;

        let newUser = new User({
          id: member.user.id,
          username: member.user.username,
          count: 1,
          total: 3,
          others: [],
          messages: []
        });

        newUser.save(err => {
          if(err) return console.error(err);

          let name = member.nickname;
          if(member.nickname == null) {
            name = member.user.username;
          }
          
          if(name.length > 24) {
            member.setNickname("3.00/5", "name too long");
          }
          else{
            member.setNickname(name + ": 3.00/5", "default rating");
          }
        });
      });
    });
  });
});

client.on('message', message => {
  if(message.author.id == 177914322561925120) {
    if(message == ">reset messages all") {
      User.find({}, (err, users) => {
        if(err) return console.error(err);

        users.forEach((user) => {
          user.messages = [];
          user.save((err) => {
            if(err) return handleError(err);
            console.log("Reset " + user.username + " messages");
          });
        });
      });
    }
  }
  
  if(message.content === "$add") {
    addUser(message)
  }

  else if(message.toString().charAt(0) == '#') {
    User.findOne({ 'id': message.author.id }, (err, user) => {
      if(err) return console.error(err);
      if(user == null) return;

      user.messages = user.messages.concat({ id: message.id, raters: [], timestamp: new Date() });
      user.save((err) => {
        if(err) return handleError(err);
        console.log("Message added to " + user.username);
      });

      for(i = 1; i <= 5; i++) {
        let k = i;
        setTimeout(() => message.react(k + "%E2%83%A3"), 500*(k-1));
      }
    });
  }
});

client.on('messageReactionAdd', (reaction, rater) => {
  if(reaction.message.toString().charAt(0) == '#'
    && reaction.emoji.identifier.slice(1) === "%E2%83%A3" 
    && reaction.emoji.identifier[0] >= 1
    && reaction.emoji.identifier[0] <= 5
    && rater.id != client.user.id) {

    console.log("Rating attempt!");

    if(reaction.message.author.id === rater.id) {
      console.log(rater.username + " tried to rate himself!");
      return;
    }

    // rate
    User.findOne({ 'id': reaction.message.author.id}, (err, user) => {
      if(err) return console.error(err);
      if(user == null) return console.log(rater.username + " tried to rate a user not in the database!");

      user.count++;
      user.total = Number(user.total) + Number(reaction.emoji.identifier[0]);
      
      let index = -1;
      for(let i = 0; i < user.messages.length; i++) {
        if(user.messages[i].id == reaction.message.id) {
          index = i;
          break;
        }     
      }

      if(index > -1) {
        let found = false;
        for(let i = 0; i < user.messages[index].raters.length; i++) {
          if(rater.id == user.messages[index].raters[i].id) {
            found = true;
            break;
          }
        }

        if(!found) {
          user.messages[index].raters.push({ id: rater.id, rating: reaction.emoji.identifier[0] });
        
          user.save(err => {
            if(err) return console.error(err);
           
            let avg = user.total / user.count;
            
            let name = reaction.message.member.nickname;
            let newName = name.substring(0, name.length - 8) + ": " + avg.toFixed(2) + "/5";
            member.setNickname(newName, "rating update");

            console.log(rater.username + " rated " + reaction.message.author.username + "'s message with a " + reaction.emoji.identifier[0]);
          });
        }
        else {
          console.log(rater.username + " tried to rate a message twice!");
        }
      }
      else {
        console.log(rater.username + " tried to rate a message not in the db!");
      }
    
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

function addUser(discordMessage) {
  User.findOne({ 'id': discordMessage.author.id }, (err, user) => {
    if(err) return console.error(err);
   
    if(user != null) {
      discordMessage.reply("You're already in!"); 
    }
    
    else {
      let newUser = new User({
        id: discordMessage.author.id,
        username: discordMessage.author.username,
        count: 1,
        total: 3,
        others: [],
        messages: []
      });

      newUser.save(err => {
        if(err) return console.error(err);
        discordMessage.reply("Added!");
      }); 
    }
  });
}
