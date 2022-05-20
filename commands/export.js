const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");
const {MessageEmbed} = require("discord.js");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("export")
        .setDescription("Export a CSV table of members."),

    async execute(interaction) {
        const adminroles = process.env.ADMIN_ROLES.split(" ");
        if (adminroles.some( r => interaction.member.roles.cache.has(r))) {
            await exportCvs(interaction);
        } else {
            interaction.reply("Missing permissions!");
        }
    }
}

let exportCvs = async function (message){
    let arr = [];
    await User.find().then((result)=>{
        if(result === null){
            message.reply("Oops seems like there's no data...");
            return
        }
        arr = Object.values(result);
    }).catch((err)=>{
        console.log(err);
        message.reply("Database error!");
    });

    const csvWriter = createCsvWriter({
        path: "gearlist.csv",
        header: [
            {id: "_id", title: "_id"},
            {id: "userid", title: "userid"},
            {id: "name", title: "name"},
            {id: "gearscore", title: "gearscore"},
            {id: "class", title: "class"},
            {id: "level", title: "level"},
            {id: "lname", title: "lname"},
            {id: "lclass", title: "lclass"},
            {id: "__v", title: "__v"},
            {id: "updatedAt", title: "updatedAt"},
            {id: "createdAt", title: "createdAt"},
        ]
    });

    csvWriter.writeRecords(arr).then(() => {
        console.log("File written successfully")
    });

    try{
        message.reply({
            files: [{
                attachment: path.join(path.basename(path.dirname('gearlist.csv')).toString(), 'gearlist.csv'),
                name: 'gearlist.csv'
            }]
        }).then(console.log('File retrieved successfully')).catch(console.error);
    }catch (e){
        console.log(e)
    }
}