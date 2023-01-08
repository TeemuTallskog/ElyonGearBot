### Available commands:
- **/add** &larr; _Used to add your gear to the bot_
<br>├- gear 
<br>   ├- url
<br>   └- attachment
- **/update** &larr; _Used to update your own statistics_
<br>   ├- level
<br>   ├- gearscore
<br>   ├- name
<br>   └- class
- **/average** &larr; _Shows guild averages_
<br>   ├- level
<br>   └- gearscore
- **/list (class)** &larr; _Lists everyone sorted by their gearscore, you can also specify to only show certain classes_
- **/classes** &larr; _Lists all classes and how many of them are in the guild_
- **/inspect (user)** &larr; _Show a gear card of a specific user_
- **/help** &larr; _List of commands_
- **/export | admin req** &larr; _Used to export a .csv of everyones statistics_
- **/events | admin req** &larr; _Lists people attending/missing from discord events_
<br>    ├- attending
<br>    └- missing
- **/delete | admin** req &larr; _used to delete users_
- **/attendance | admin req** &larr; _Commands for attendance events_
<br>    ├- create (name) (description) (unique id)
<br>    ├- attending (id)
<br>    ├- signedoff (id)
<br>    ├- missing (id)
<br>    └- delete (id) // id is optional, leaving it out deletes all events
- **/remind | admin req** &larr; _Used to send out reminder DM's_
<br>    ├- remind all (attendance event id) // sends out reminders to people who haven't marked their attendance
<br>    └- remind user (member) (attendance event id)

### Gear list
![Gearlist](resources/Gear_List_discord_blurred.png)
### Attendance event
![Attendance_event](resources/Attendance_discord.png)