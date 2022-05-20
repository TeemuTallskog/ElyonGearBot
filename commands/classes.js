const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("classes")
        .setDescription("Display class division."),

    async execute(interaction) {
        await classesList(interaction);
    }
}

const classesList = async function (interaction){
    const arr = await User.find().then((result)=>{
        if(result.length < 1){
            interaction.reply("Oops seems like there's no data...");
            return null;
        }
        return result;
    }).catch((err)=>{
        console.log(err);
        interaction.reply("Database error!");
        return null;
    });

    if(arr === null) return;

    let classArr = []
    for(const element of arr){
        let index = classArr.findIndex(obj =>{
            return obj.class === element.lclass;
        });
        if(index !== -1){
            classArr[index].n += 1;
        }else{
            let c = {
                class: element.lclass,
                n: 1
            }
            classArr.push(c);
        }
    }
    classArr.sort(function (a,b){
        return b.n - a.gearscore;
    });

    let postStr = "```"
    for(const element of classArr){
        element.class = element.class.charAt(0).toUpperCase() + element.class.substring(1);
        postStr += "\n" + element.class + " - " + element.n;
    }
    postStr += "```"
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Class division (" + arr.length + ")")
        .setDescription(postStr);
    interaction.reply({embeds:[embed]});
}