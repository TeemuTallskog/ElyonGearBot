const {
    SlashCommandBuilder
} = require("@discordjs/builders");
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
        .addSubcommand(subcommand =>
            subcommand
            .setName("url")
            .setDescription("URL to a .png or .jpg image of your gear")
            .addStringOption(option =>
                option
                .setName("url")
                .setDescription("URL must end in .png or .jpg")
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName("attachment")
            .setDescription("Image attachment of your gear")
            .addAttachmentOption(option =>
                option
                .setName("image")
                .setDescription("Attachment to an image")
                .setRequired(true))
        ),

    async execute(interaction) {
        const subcmd = interaction.options.getSubcommand();
        if (subcmd === "gear") {
            await addGear(interaction);
        }
        if (subcmd === "url" || subcmd === "attachment") {
            await addImg(interaction, subcmd === "attachment");
        }
    },
}

const addGear = async function (interaction) {
    const userid = interaction.user.id;
    const res = await checkIfExists(userid);
    if (res > 0) {
        interaction.reply("You've already added your gear!\nTo update your gear use command `/update`");
        return;
    } else if (res === -1) {
        interaction.reply("Error occured!");
        return;
    }
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
    if (res === 0) {
        input.save()
            .then((result) => {
                console.log(result);
                interaction.reply("Successfully added your gear!");
            })
            .catch((err) => console.log(err));
    }
}

const checkIfExists = async function (userid) {
    return User.countDocuments({
        userid: userid
    }).exec().catch(err => {
        console.error(err);
        return -1;
    });
}

const addImg = async function (interaction, isAttachement) {
    let url = "";
    if (isAttachement) {
        try{
            url = interaction.options.getAttachment("image").url;
        }catch(error){
            console.log(error);
            interaction.reply("Invalid attachment!");
            return;
        }
    } else {
        url = interaction.options.getString("url");
    }
    if (!isImg(url)) {
        interaction.reply("Invalid image... Link must end with .png or .jpg and be under 250char\nType ``/add img (your link)``\nOr attach an image to command ``!add img``");
        return;
    }
    await User.updateOne({
        userid: interaction.user.id
    }, {
        $set: {
            'link': url
        }
    }).then((result) => {
        if (result.matchedCount == 1 && result.modifiedCount == 1) {
            interaction.reply("Successfully added image!");
        } else if (result.matchedCount == 1 && result.modifiedCount == 0) {
            interaction.reply("Something went wrong!");
        } else {
            interaction.reply("Please add your gear first by using command /add gear");
        }
    }).catch((err) => {
        console.log(err);
    })
}

const isImg = function (url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return false;
    } else if (!url.endsWith(".png") && !url.endsWith(".jpg")) {
        return false;
    } else if (url.length > 250) {
        return false;
    }
    return true;
}