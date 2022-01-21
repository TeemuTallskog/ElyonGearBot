const {Client, Intents, MessageEmbed}= require("discord.js");
require('dotenv').config();
const mongoose = require('./database/mongoose');
const User = require('./models/user');
const commands = require('./commands/slashcommands');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const prefix = "!";

client.on('ready', () => {
    console.log('Bot has logged in!')
});


client.on("messageCreate", (message)=> {
    if(message.author.bot || !message.content.startsWith(prefix)){
        return
    }
    if(message.content.startsWith(prefix + "add")){
        addGear(message);
    }else if(message.content.startsWith(prefix + "update")){
        let arr = message.content.split(" ");
        if(arr.length == 1){message.reply("To update type:\n`!update gearscore (gearscore)`\n`!update level (level)`\n`!update name (name)`\n`!update class (class)`")}
        if(arr[1] == "gearscore"){updateGear(message)}
        if(arr[1] == "level"){updateLevel(message)}
        if(arr[1] == "name"){updateName(message)}
        if(arr[1] == "class"){updateClass(message)}
    }else if(message.content.startsWith(prefix + "list")){
        fetchData(message);
    }else if(message.content.startsWith(prefix + "delete")){
        if(message.member.roles.cache.has("933174109137956964") || message.member.roles.cache.has("933173816350347304") || message.member.roles.cache.has("315963187742900237")){
            deleteUser(message);
        }else{message.reply("Missing permissions!")}
    }else if(message.content.startsWith(prefix + "help")){
        sendHelp(message);
    }else if(message.content.startsWith(prefix + "avg")){
        average(message);
    }else if(message.content.startsWith(prefix + "classes")){
        classesList(message);
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
    if (arr[4].match("^([0-9]{1,4}[\.]{0,1})$")) {
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
        level: level,
        lname: username.toLowerCase(),
        lclass: pClass.toLowerCase()
    });

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



const updateGear = async function (message){
    let arr = message.content.split(" ");
    if(arr.length < 3){
        message.reply("Missing information!")
        return
    }
    if(arr[2].match("^([0-9]{1,20}[\.]{0,1})$")){
        await User.updateOne({userid: message.author.id},
            {$set: {'gearscore' : arr[2]}}).then((result)=>{
            if(result.matchedCount == 1 && result.modifiedCount == 1){
                message.reply("Successfully updated gearscore!");
            }else if(result.matchedCount == 1 && result.modifiedCount == 0){
                message.reply("Something went wrong!");
            }else{
                message.reply("Please add your gear first by typing !add");
            }
        }).catch((err) =>{
            console.log(err);
            message.reply("Database error!");
            return
        });
    }else{
        message.reply("Incorrect values");
    }
}



const updateLevel = async function (message){
    let arr = message.content.split(" ");
    if(arr.length < 3){
        message.reply("Missing information!")
        return
    }
    if(arr[2].match("^([0-9]{1,20})$")){
        await User.updateOne({userid: message.author.id},
            {$set: {'level' : arr[2]}}).then((result)=>{
            if(result.matchedCount == 1 && result.modifiedCount == 1){
                message.reply("Successfully updated Level!");
            }else if(result.matchedCount == 1 && result.modifiedCount == 0) {
                message.reply("Something went wrong!");
            }else{
                message.reply("Please add your gear first by typing !add");
            }
        }).catch((err) =>{
            console.log(err);
            message.reply("Database error!");
            return
        });
    }else{
        message.reply("Incorrect values");
    }
}



const updateName = async function (message){
    let arr = message.content.split(" ");
    if(arr.length < 3){
        message.reply("Missing information!")
        return
    }
    if(arr[2].match("^([a-zA-Z]{1,20})$")){
        await User.updateOne({userid: message.author.id},
            {$set: {'name' : arr[2], 'lname' : arr[2].toLowerCase()}}).then((result)=>{
            if(result.matchedCount == 1 && result.modifiedCount == 2){
                message.reply("Successfully updated username!");
            }else if(result.matchedCount == 1 && result.modifiedCount == 0) {
                message.reply("Something went wrong!");
            }else{
                message.reply("Please add your gear first by typing !add");
            }
        }).catch((err) =>{
            console.log(err);
            message.reply("Database error!");
            return
        });
    }else{
        message.reply("Incorrect values");
    }
}



const updateClass = async function (message){
    let arr = message.content.split(" ");
    if(arr.length < 3){
        message.reply("Missing information!")
        return
    }
    if(arr[2].match("^([a-zA-Z]{1,20})$")){
        await User.updateOne({userid: message.author.id},
            {$set: {'class' : arr[2], 'lclass' : arr[2].toLowerCase()}}).then((result)=>{
                if(result.matchedCount == 1 && result.modifiedCount == 1){
                    message.reply("Successfully updated Class!");
                }else if(result.matchedCount == 1 && result.modifiedCount == 0) {
                    message.reply("Something went wrong!");
                }else{
                    message.reply("Please add your gear first by typing !add");
                }
        }).catch((err) =>{
            console.log(err);
            message.reply("Database error!");
            return
        });
    }else{
        message.reply("Incorrect values");
    }
}



const fetchData = async function (message){
    let arr = message.content.split(" ");
    if(arr.length > 1){
        if(arr[1].match("^([a-zA-Z]{1,20})$")){
            await User.find({lclass: arr[1].toLowerCase()}).then((result)=>{
                postList(result, message);
            }).catch((err)=>{console.log(err)})
        }else{
            message.reply("Incorrect value!");
            return
        }
    }else{
        User.find().then((result)=>{
            postList(result, message);
        }).catch((err)=>{console.log(err)});
    }
}



const postList = function (arr, message){
    if(arr.length != 0){
        if(arr.length != 1){
            arr.sort(function (a,b){
                return b.gearscore - a.gearscore;
            });
        }
    }else {
        message.reply("Oops seems like there's no data...");
        return
    }
    let listStr = "```Name(class): gearscore level";
    for(let i = 0; i < arr.length; i++){
        arr[i].lclass = arr[i].lclass.charAt(0).toUpperCase() + arr[i].lclass.substring(1);
        listStr += "\n" + arr[i].name + "(" + arr[i].lclass + "): " + arr[i].gearscore + " " + arr[i].level;
    }
    listStr += "```";
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('List of members sorted by gearscore')
        .setDescription(listStr);
    message.channel.send({embeds: [embed]});
}



const deleteUser = function (message){
    let arr = message.content.split(" ");
    if(arr.length < 2) {
        message.reply("To delete a user type:\n`!delete (username)`");
        return
    }
    User.deleteOne({name: arr[1]}).then((result) =>{
        if(result.deletedCount == 1){
            message.reply("Deleted user: " + arr[1]);
        }else{
            message.reply("Couldn't find user " + arr[1]);
        }

    }).catch((err) =>{
        console.log(err);
    })
}



const sendHelp = function (message){
    const helpstr = "```!help\n!add\n!update\n!list\n!avg\n!classes\n!delete```"
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("List of commands")
        .setDescription(helpstr)
        .setFooter({text: 'For support @GasGas#8390'});
    message.reply({embeds:[embed]});
}



const average = function (message){
    let arr = message.content.split(" ");
    if(arr.length < 2){
        message.reply("Available commands:\n``!avg gearscore``\n``!avg level``");
    }else if(arr[1] == "gearscore"){
        averageGear(message);
    }else if(arr[1] == "level"){
        averageLevel(message);
    }
}

const averageGear = async function (message){
    let arr = [];
    await User.find().then((result)=>{
        arr = result;
    }).catch((err)=>{
        console.log(err);
        message.reply("Database error!");
        return
    })
    let gs = 0;
    for(let i = 0; i < arr.length; i++){
        gs += arr[i].gearscore;
    }
    gs = gs/arr.length;
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Guild average")
        .setDescription("The average gearscore is " + gs.toFixed(2) + " with " + arr.length + " Members");
    message.reply({embeds:[embed]});
}

const averageLevel = async function (message){
    let arr = [];
    await User.find().then((result)=>{
        arr = result;
    }).catch((err)=>{
        console.log(err);
        message.reply("Database error!");
        return
    })
    let gs = 0;
    for(let i = 0; i < arr.length; i++){
        gs += arr[i].level;
    }
    gs = gs/arr.length;
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Guild average")
        .setDescription("The average Level is " + gs.toFixed(1) + " with " + arr.length + " Members");
    message.reply({embeds:[embed]});
}

const classesList = async function (message){
    let arr = [];
    let empty = false
    await User.find().then((result)=>{
        if(result.length < 1){
            message.reply("Oops seems like there's no data...");
            empty = true;
        }
        arr = result;
    }).catch((err)=>{
        console.log(err);
        message.reply("Database error!");
    });

    if(empty) return;

    let classArr = []
    for(let i = 0; i < arr.length; i++){
        let index = classArr.findIndex(obj =>{
            return obj.class === arr[i].lclass;
        });
        if(index != -1){
            classArr[index].n += 1;
        }else{
            let c = {
                class: arr[i].lclass,
                n: 1
            }
            classArr.push(c);
        }
    }
    classArr.sort(function (a,b){
        return b.n - a.gearscore;
    });

    let postStr = "```"
    for(let i = 0; i < classArr.length; i++){
        classArr[i].class = classArr[i].class.charAt(0).toUpperCase() + classArr[i].class.substring(1);
        postStr += "\n" + classArr[i].class + " - " + classArr[i].n;
    }
    postStr += "```"
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Class division (" + arr.length + ")")
        .setDescription(postStr);
    message.reply({embeds:[embed]});
}

mongoose.init();

client.login(process.env.TOKEN).then(r => {
    console.log("Successful login");
});
