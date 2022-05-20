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
        .setName("average")
        .setDescription("Display averages")
        .addSubcommand(subcommand =>
            subcommand
            .setName("level")
            .setDescription("Display average level of members.")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName("gearscore")
            .setDescription("Display average gearscore of members.")
        ),

    async execute(interaction) {
        await average(interaction, interaction.options.getSubcommand());
    }
}

const average = async function (interaction, subcommand){
    let arr = await User.find().then((result)=>{
        return result;
    }).catch((err)=>{
        console.log(err);
        interaction.reply("Database error!");
        return null;
    })
    if(arr === null) return;
    let val = 0;
    if(subcommand === "level"){
        for(const element of arr){
            val += element.level;
        }
    }else if(subcommand === "gearscore"){
        for(const element of arr){
            val += element.gearscore;
        }
    }
    val = val/arr.length;
    const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Guild average")
        .setDescription("The average " + subcommand + " is " + val.toFixed(1) + " with " + arr.length + " Members");
    interaction.reply({embeds:[embed]});
}