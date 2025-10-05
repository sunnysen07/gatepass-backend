const adminModel =  require('../models/Admin.model')
const studentModel = require('../models/student.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//  Admin register 
async function adminRegister(req,res){
    // res.send("sunny is here")
    const {username,email,password,role} = req.body
    
    const isAlreadyAdmin = await adminModel.findOne({
        email,
    })
    if(isAlreadyAdmin){
        return res.status(400).json({
            message:"user Already exist"
        })
    }
    const hashPassword =  await bcrypt.hash(password,10);

    const newAdmin = await adminModel.create({
        username,
        email,
        role,
        password : hashPassword
    })
    const token = jwt.sign({
        id:newAdmin._id
    },process.env.JWT_SECRET)

    res.cookie("token",token)

    return res.status(201).json({
        message: "Admin registered successfully",
        admin: {
            id: newAdmin._id,
            username: newAdmin.username,
            email: newAdmin.email,
            role: newAdmin.role
        }
    });
}
// Admin Login
async function adminLogin(req,res){
    const {email , password } = req.body;

    const Admin = await adminModel.findOne({
        email
    })
    if(!Admin){
        return res.status(400).json({
            message:"email or passwprd invalid"
        })
    }
    const isValidPassword = await bcrypt.compare(password,Admin.password)
    if(!isValidPassword){
        return  res.status(400).json({
            message:"email or password invalid",
            
        })
    }
    const token = jwt.sign({
        id :Admin._id
    },process.env.JWT_SECRET)
    res.cookie("token",token)
    return res.status(200).json({
        message:"loggin successful",
        admin: {
                id: Admin._id,
                username: Admin.username,
                email: Admin.email,
                role: Admin.role
            }
    })
}
// Admin logout
function adminlogout(req,res){
    res.clearCookie("token");
    res.status(200).json({
        message:"Admin loggedOut"
    })
}






// student register via admin
async function studentRegister(req,res){
    const {name,id,email,password} = req.body;
    const isAlreadyStudent = await studentModel.findOne({
            email
    })
    if(isAlreadyStudent){
        return res.status(400).json({
            message:"student already exist"
        })
    }
    const hashPassword =  await bcrypt.hash(password,10);

    const newStudent = await studentModel.create({
        name,
        id,
        email,
        password : hashPassword
    })
    const token = jwt.sign({ 
        id:newStudent._id
    },process.env.JWT_SECRET)

    res.cookie("token",token)

    return res.status(201).json({
        message: "Student registered successfully",
        student: {
            id: newStudent._id,
            name: newStudent.name,
            email: newStudent.email
        }
    });
}
// student login
async function studentLogin(req,res){
    const {id , password } = req.body;
    const student = await studentModel.findOne({
        id
    })
    if(!student){
        return res.status(400).json({
            message:"id or passwprd invalid"
        })
    }
    const isValidPassword = await bcrypt.compare(password,student.password)
    if(!isValidPassword){
        return  res.status(400).json({
            message:"id or password invalid"
        })
    }
    const token = jwt.sign({
        id :student._id
    },process.env.JWT_SECRET)
    res.cookie("token",token)
    return res.status(200).json({
        message:"loggin successful"
    })
}
// student logout
function studentlogout(req,res){
    res.clearCookie("token");
    res.status(200).json({
        message:"Student loggedOut"
    })
}
module.exports ={
    adminRegister,
    adminLogin,
    adminlogout,
    studentLogin,
    studentlogout
}