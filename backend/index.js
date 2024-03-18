const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const app = express()
const PORT = config.get("serverPort")
const corsMiddleware = require("./middleware/cors.middleware")
const cors = require('cors');
const {readdirSync} = require('fs')
const bodyParser = require('body-parser');
const { taskScheduler } = require('./controllers/CronCont');


require('dotenv').config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(corsMiddleware)
app.use(express.json())
app.use(cors())

taskScheduler.start();
readdirSync('./routers').map((route) => app.use('/api/v1', require('./routers/' + route)))

const start = async () =>{
    try{
        await mongoose.connect(config.get("DbUrl"))
        app.listen(PORT,()=>{console.log('Server running on port: ',PORT)} )
        console.log('DB Connected')
    } 
    catch(e){
        console.log('DB Connection Error')
    }
}

start()