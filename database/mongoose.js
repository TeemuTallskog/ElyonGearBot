const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        };

        mongoose.connect(process.env.MONGODB_SRV, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() =>{
            console.log("Connected");
        }).catch((err) =>{
            console.log(err);
        });
        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('The bot has connected to mongoose');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('The bot has disconnected from mongoose');
        });

        mongoose.connection.on('err', (err) => {
            console.log('database error: ' + err);
        });

        process.on('exit', () =>{
            mongoose.connection.close();
            console.log("Closing connection");
            process.exit();
        })
        process.on('SIGINT', () =>{
            mongoose.connection.close();
            console.log("Closing connection");
            process.exit();
        })
    }
}
