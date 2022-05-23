const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");
const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require("discord.js");
const CustomEvent = require("../models/customevent");
const listPrinter = require("../functions/listPrinter");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("attendance")
        .setDescription("Create an event and track attendance")
        .addSubcommand(subcommand =>
            subcommand
            .setName("create")
            .setDescription("Create an event")
            .addStringOption(option =>
                option
                .setName("name")
                .setDescription("Event name")
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName("description")
                .setDescription("Event description")
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName("id")
                .setDescription("Custom id to track event")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("attending")
            .setDescription("Display a gearlist of people attending")
            .addStringOption(option =>
                option
                .setName("id")
                .setDescription("ID of the event you want to display")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("signedoff")
            .setDescription("Display a gearlist of people who signed off")
            .addStringOption(option =>
                option
                .setName("id")
                .setDescription("ID of the event you want to display")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("missing")
            .setDescription("Display a gearlist of people missing")
            .addStringOption(option =>
                option
                .setName("id")
                .setDescription("ID of the event you want to display")
                .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName("delete")
            .setDescription("Delete existing events")
            .addStringOption(option =>
                option
                .setName("id")
                .setDescription("Custom id of the event you want to delete")
                .setRequired(false))),


    async execute(interaction) {
        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "signup":
                    await signUp(interaction, true);
                    break;
                case "signoff":
                    await signUp(interaction, false);
                    break;
                case "refresh":
                    await refreshList(interaction);
                    break;
            }
            return;
        }
        const adminroles = process.env.ADMIN_ROLES.split(" ");
        if (adminroles.some(r => interaction.member.roles.cache.has(r))) {
            const subcommand = interaction.options.getSubcommand();
            switch (subcommand) {
                case "create":
                    await createEvent(interaction);
                    break;
                case "attending":
                    await listAttending(interaction, true);
                    break;
                case "signedoff":
                    await listAttending(interaction, false);
                    break;
                case "missing":
                    await listMissing(interaction);
                    break;
                case "delete":
                    await deleteEvent(interaction);
                    break;
            }
        } else {
            interaction.reply("Missing permissions!");
        }
    }
}

let refreshCooldown = new Set();

const refreshList = async function (interaction) {
    if (refreshCooldown.has(interaction.message.embeds[0].footer.text)) {
        interaction.reply({
            content: "Refresh is on cooldown...",
            ephemeral: true
        })
        return;
    }
    const event = await CustomEvent.findOne({
        eventid: interaction.message.embeds[0].footer.text
    }).catch(console.error);

    let fields = interaction.message.embeds[0].fields;
    fields[0].value = "```\n";
    fields[1].value = "```\n";

    if (event != null) {
        for (const user of event.attendees) {
            if (user.attending) {
                fields[0].value += user.username + "\n";
            } else {
                fields[1].value += user.username + "\n";
            }
        }
    }

    fields[0].value += "```";
    fields[1].value += "```";

    const newEmbed = interaction.message.embeds[0].setFields(fields);
    interaction.message.edit({
        embeds: [newEmbed]
    });

    interaction.reply({
        ephemeral: true,
        content: "Success"
    });
    try {
        refreshCooldown.add(interaction.message.embeds[0].footer.text)
        setTimeout(() => refreshCooldown.delete(interaction.message.embeds[0].footer.text), 10000);
    } catch (err) {
        console.error(err)
    }
}

const deleteEvent = async function (interaction) {
    const eventid = interaction.options.getString("id");
    let event = [];
    if (!eventid) {
        const events = await CustomEvent.find().then(res => {
            return res;
        }).catch(err => {
            console.error(err)
        });
        const deleted = await CustomEvent.deleteMany({}).catch(err => {
            console.error(err);
        })
        if (deleted.deletedCount == 0) {
            interaction.reply("Couldn't find any events");
            return;
        }
        for (const e of events) {
            event.push(e);
        }
        interaction.reply("Successfully deleted all Attendance events!");
    } else {
        await CustomEvent.findOneAndDelete({
            eventid: eventid
        }).then(result => {
            if (result != null) {
                interaction.reply("Successfully deleted " + eventid);
                return event.push(result);
            } else {
                interaction.reply("Couldn't find an event with the eventid of " + eventid);
                return null;
            }
        }).catch(err => {
            console.error(err)
        });
    }
    if (event == null) {
        interaction.channel.send("Couldn't find any messages to delete");
        return;
    }
    deleteMessages(interaction, event);
}

const deleteMessages = async function (interaction, events) {
    const channels = interaction.guild.channels;
    events.forEach(async (event) => {
        try {
            const channel = await channels.fetch(event.messagechannel).then(res => {
                return res;
            }).catch(err => {
                console.error(err);
                throw Error;
            });
            if (channel != null) {
                await channel.messages.fetch(event.messageid).then(msg => {
                    msg.delete();
                });
            } else {
                throw Error;
            }
        } catch (err) {
            console.error(err);
            interaction.channel.send(event.name + " embed couldn't be found");
        }
    });
}

const listAttending = async function (interaction, attending) {
    const eventid = interaction.options.getString("id");
    const event = await CustomEvent.findOne({
        eventid: eventid
    }).catch(e => {
        console.error(err);
    });

    if (!event) {
        interaction.reply("Couldn't find an event with the given id");
        return;
    }
    interaction.reply("Found event " + event.name);
    let users = [];
    for (const user of event.attendees) {
        if (user.attending == attending) {
            users.push(user.userid);
        }
    }
    const gearList = await findUsers(users);
    const printString = await listPrinter.getPrintString(gearList);
    let title = event.name;
    if (attending) title += " | Attending users.";
    else title += " | Signed off users."
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(printString);
    await interaction.channel.send({
        embeds: [embed]
    });
}

const listMissing = async function (interaction) {
    const eventid = interaction.options.getString("id");
    const event = await CustomEvent.findOne({
        eventid: eventid
    }).catch(e => {
        console.error(err);
    });

    if (!event) {
        interaction.reply("Couldn't find an event with the given id");
        return;
    }
    interaction.reply("Found event " + event.name);
    let users = [];
    for (const user of event.attendees) {
        users.push(user.userid);
    }
    const gearList = await findMissingUsers(users);
    const printString = await listPrinter.getPrintString(gearList);
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(event.name + " | Missing users")
        .setDescription(printString);
    await interaction.channel.send({
        embeds: [embed]
    });
}

const findMissingUsers = async function (users) {
    const gearlist = await User.find().catch(error => {
        console.error(error);
    })
    return gearlist.filter(x => !users.some(e => e == x.userid));
}

const findUsers = async function (users) {
    try {
        return await User.find({
            userid: {
                $in: users
            }
        })
    } catch (error) {
        console.error(error);
    }
}

let cooldownList = new Set();

const signUp = async function (interaction, attending) {
    if (cooldownList.has(interaction.user.id)) {
        interaction.reply({
            ephemeral: true,
            content: "You're on cooldown..."
        })
        return;
    }

    const userdata = await CustomEvent.findOne({
        eventid: interaction.message.embeds[0].footer.text,
        attendees: {
            $elemMatch: {
                userid: interaction.user.id
            }
        }
    }).catch(e => {
        console.error(e);
        interaction.reply({
            content: "An error occured",
            ephemeral: true
        })
    })
    cooldownList.add(interaction.user.id);
    setTimeout(() => cooldownList.delete(interaction.user.id), 1000);
    let attendingstr = "attending";
    if (!attending) attendingstr = "not attending"
    if (userdata == null || userdata.attendees.size == 0) {
        await pushUserToEvent(interaction, attending);
        replyAttending(interaction, attending, null);
        interaction.reply({
            content: "Successfully marked as " + attendingstr,
            ephemeral: true
        });
    } else if (userdata.attendees[0].attending == attending) {
        interaction.reply({
            content: "You're already marked as " + attendingstr,
            ephemeral: true
        });
        return;
    } else {
        await editUserInEvent(interaction, attending);
        replyAttending(interaction, attending, userdata);
        let attendingstr = "not attending";
        if (attending) attendingstr = "attending";
        interaction.reply({
            content: "Successfully marked as " + attendingstr,
            ephemeral: true
        });
    }
}

const replyAttending = function (interaction, attending, userdata) {
    interaction.channel.messages.fetch(interaction.message.id).then(msg => {
        let fields = msg.embeds[0].fields;
        let index = [0, 1];
        if (attending) index = [1, 0];
        if (userdata != null) fields[index[0]].value = fields[index[0]].value.replace(userdata.attendees[0].username + "\n", "");
        fields[index[1]].value = fields[index[1]].value.slice(0, -3) + interaction.member.displayName + "\n```";
        const newEmbed = interaction.message.embeds[0].setFields(fields);
        msg.edit({
            embeds: [newEmbed]
        });
    }).catch(err => {console.log(err)});
}

const editUserInEvent = async function (interaction, attending) {
    const filter = {
        eventid: interaction.message.embeds[0].footer.text,
        'attendees.userid': interaction.user.id
    };
    await CustomEvent.updateOne(filter, {
        $set: {
            "attendees.$.attending": attending
        }
    }).catch(e => {
        console.error(e);
    });
}

const pushUserToEvent = async function (interaction, attending) {
    const user = {
        userid: interaction.user.id,
        username: interaction.member.displayName,
        attending: attending
    }
    CustomEvent.updateOne({
        eventid: interaction.message.embeds[0].footer.text
    }, {
        $push: {
            attendees: user
        }
    }).catch(e => {
        console.log(e)
    });

}

const createEvent = async function (interaction) {
    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const customid = interaction.options.getString("id");
    const msg = await interaction.reply({
        content: "Creating event...",
        fetchReply: true
    });
    const buttonRow = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('signup')
            .setLabel('Sign up')
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('signoff')
            .setLabel('Sign off')
            .setStyle('DANGER')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('refresh')
            .setLabel('Refresh')
            .setStyle(2)
        );
    const embed = new MessageEmbed()
        .setColor('0x00FFF')
        .setTitle(interaction.options.getString("name"))
        .setDescription(interaction.options.getString("description"))
        .addField('Attending:', "```\n```")
        .addField('Not attending:', "```\n```")
        .setFooter({
            text: customid
        });

    if (!await pushEventToDatabase(name, description, customid, msg)) {
        interaction.editReply("Something went wrong...");
        return;
    }
    await interaction.editReply({
        content: "Event:",
        embeds: [embed],
        components: [buttonRow]
    })
}

const pushEventToDatabase = async function (name, description, id, msg) {
    const event = new CustomEvent({
        eventid: id,
        messageid: msg.id,
        messagechannel: msg.channel.id,
        name: name,
        description: description,
        attendees: []
    });
    return event.save()
        .then(_res => {
            console.log("Successfully created event");
            return true;
        }).catch(err => {
            console.log("Something went wrong while creating event..." + err);
            return false;
        })
}