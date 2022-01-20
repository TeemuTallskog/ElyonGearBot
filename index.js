const {Client, Intents}= require("discord.js");
require('dotenv').config();
const mongoose = require('./database/mongoose');
const User = require('./models/user');
const commands = require('./commands/slashcommands');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const prefix = "!";

client.on('ready', () => {
    console.log('Logged in as ${client.user.tag}!')
});


client.on("messageCreate", (message)=> {
    if(message.content.startsWith(prefix + "add")){
        addGear(message).then();
        /*
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

         */
    }else if(message.content.startsWith(prefix + "update")){
        let arr = message.content.split(" ");
        if(arr.length == 1){message.reply("To update type:\n`!update gearscore (gearscore)`\n`!update level (level)`\n`!update name (name)`\n`!update class (class)`")}
        if(arr[1] == "gearscore"){updateGear(message)}
        if(arr[1] == "level"){console.log("placeholder")}
        if(arr[1] == "name"){console.log("placeholder")}
        if(arr[1] == "class"){console.log("placeholder")}
    }
})

const addGear = function (message){
    let arr = message.content.split(" ");
    if(arr.length == 1){
        message.reply("To add gear type:\n`!add (playername) (Class) (level) (gearscore)`");
        return
    }else if(arr.length < 5){
        message.reply("Missing information!");
        return
    }
    console.log(arr);
    const userid = message.author.id;
    let username = "";
    let pClass = "";
    let level = 0;
    let gearscore = 0;
    if (arr[1].match("^([A-Za-z0-9]{1,20})$")) {
        username = arr[1];
    } else {
        message.reply("Incorrectly formatted name");
        return
    }
    if (arr[2].match("^([A-Za-z]{1,20})$")) {
        pClass = arr[2];
    } else {
        console.log(arr[2]);
        message.reply("Incorrect Class");
        return
    }
    if (arr[3].match("^([0-9]{1,20})$")) {
        level = arr[3];
    } else {
        message.reply("Incorrect Level");
        return
    }
    if (arr[4].match("^([0-9\.]{1,20})$")) {
        gearscore = arr[4];
    } else {
        message.reply("Incorrect Gearscore");
        return
    }
    const input = new User({
        userid: userid,
        name: username,
        gearscore: gearscore,
        class: pClass,
        level: level
    });
    console.log("we're here");
    User.countDocuments({userid: userid},
        function (err, count){
            if(count == 0){
                input.save()
                    .then((result) => {
                        console.log(result);
                        message.reply("Successfully added your gear!");
                    })
                    .catch((err) => console.log(err));
            }else{
                message.reply("You've already added your gear!\nTo update your gear type `!update`");
            }
        });
}

const updateGear = function (message){
    let arr = message.content.split(" ");
    if(arr.length < 3){
        message.reply("Missing information!")
        return
    }
    if(arr[2].match("^([0-9\.]{1,20})$")){
        User.updateOne({userid: message.author.id},
            {$set: {'gearscore' : arr[2]}}).catch((err) =>{
            console.log(err);
            return
        });
        message.reply("Successfully updated gearscore!");
    }
}


mongoose.init();

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