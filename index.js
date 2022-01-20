const {Client, Intents}= require("discord.js");
require('dotenv').config();
const mongoose = require('./database/mongoose');
const User = require('./models/user');
const commands = require('./commands/slashcommands');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const prefix = "!gear ";

client.on('ready', () => {
    console.log('Logged in as ${client.user.tag}!')
});


client.on("messageCreate", (message)=> {
    if(message.content.startsWith(prefix + "update")){
        let arr = message.content.split(" ");
        if(!isNaN(arr[2])){
         User.updateOne({userid: 123},
             {$set: {'gearscore' : arr[2]}}).catch((err) =>{
                 console.log(err);
         });
            message.reply("you did an update " + message.author.username);
        }else{
            message.reply("Invalid input");
        }
    }
})

mongoose.init();

commands.handleReq

const gear = new User({
    userid: 123,
    name: "GasGas",
    gearscore: 777.4,
    class: "Archer",
    level: 48
});

/*gear.save()
    .then((result) => console.log(result))
    .catch((err) => console.log(err));

 */

client.login(process.env.TOKEN).then(r => {
    console.log("Successful login");
});