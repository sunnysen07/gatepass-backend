const mongoose = require('mongoose')

function connectDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("mongoDB is connected ");
    }).catch((err)=>{
        console.log("mongoDB connection err",err);
    })
}
module.exports = connectDB