const express = require('express')
const cookieParser = require('cookie-parser');
const connectDB = require('./database/db')
const app = express();
const authRoute = require('./routes/auth.route')


connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.get('/',(req,res)=>{
    res.send("hello world !") 
});
app.use('/',authRoute) // auth register


module.exports = app;