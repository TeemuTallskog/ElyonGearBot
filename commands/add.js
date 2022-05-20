const { SlashCommandBuilder } = require("@discordjs/builders");
const User = require("./../models/user");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("Add your gear to the database!")
        .addSubcommand(subCommand =>
        subCommand
            .setName("gear")
            .setDescription("Add your gear to the gearbot!")
            .addStringOption(option =>
                option
                    .setName("name")
                    .setDescription("Character name")
                    .setRequired(true))
            .addStringOption(option =>
                option
                    .setName("class")
                    .setDescription("Class")
                    .setRequired(true))
            .addIntegerOption(option =>
                option
                    .setName("level")
                    .setDescription("Level")
                    .setRequired(true))
            .addIntegerOption(option =>
                option
                    .setName("gearscore")
                    .setDescription("Item level")
                    .setRequired(true))
        )
        .addSubcommand(subCommand =>
         subCommand
             .setName("image")
             .setDescription("Add a link to an image of your gear.")
             .addStringOption(option =>
             option
                 .setName("url")
                 .setDescription("Must end in .png or .jpg")
                 .setRequired(true))
        ),



    async execute(interaction){
        if(interaction.options.getSubcommand() === "gear"){
            await addGear(interaction);
        }
        if(interaction.options.getSubcommand() === "image"){
            await addImg(interaction);
        }
    },
}

const addGear = async function (interaction){
    const userid = interaction.user.id;
    let username = "";
    let pClass = "";
    let level = 0;
    let gearscore = 0;
    if (interaction.options.getString("name").match("^([A-Za-z0-9]{1,20})$")) {
        username = interaction.options.getString("name");
    } else {
        interaction.reply("Incorrectly formatted name");
        return
    }
    if (interaction.options.getString("class").match("^([A-Za-z]{1,20})$")) {
        pClass = interaction.options.getString("class");
    } else {
        console.log(arr[2]);
        interaction.reply("Incorrect Class");
        return
    }
    if (interaction.options.getInteger("level") < 1000 && interaction.options.getInteger("level") > 0) {
        level = interaction.options.getInteger("level");
    } else {
        interaction.reply("Incorrect Level");
        return
    }
    if (interaction.options.getInteger("gearscore") < 10000 && interaction.options.getInteger("gearscore") > 0) {
        gearscore = interaction.options.getInteger("gearscore");
    } else {
        interaction.reply("Incorrect Gearscore");
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

    await User.countDocuments({userid: userid},
        function (err, count){
            if(count == 0){
                input.save()
                    .then((result) => {
                        console.log(result);
                        interaction.reply("Successfully added your gear!");
                    })
                    .catch((err) => console.log(err));
            }else{
                interaction.reply("You've already added your gear!\nTo update your gear type `!update`");
            }
        });
}

const addImg = async function(interaction){
    let url = interaction.options.getString("image url");
    if(!isImg(url)){
        interaction.reply("Invalid image... Link must end with .png or .jpg and be under 250char\nType ``!add img (your link)``\nOr attach an image to command ``!add img``");
    }
    await User.updateOne({userid: interaction.user.id},
        {$set: {'link' : url}}).then((result) =>{
        if(result.matchedCount == 1 && result.modifiedCount == 1){
            interaction.reply("Successfully updated gearscore!");
        }else if(result.matchedCount == 1 && result.modifiedCount == 0){
            interaction.reply("Something went wrong!");
        }else{
            interaction.reply("Please add your gear first by typing !add");
        }
    }).catch((err)=>{
        console.log(err);
    })
}

const isImg = function (url){
    let check = true;
    if(!url.startsWith("http://") && !url.startsWith("https://")){
        check = false;
    }else if(!url.endsWith(".png") && !url.endsWith(".jpg")){
        check = false;
    }else if(url.length > 250){
        check = false;
    }
    return check;
}