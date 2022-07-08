import 'dotenv/config'
import express from "express";
import generateUniqueId from "generate-unique-id";
import salwarSchema from "./schema/salwarSchema.js";
import blouseSchema from "./schema/blouseSchema.js";
import userCreationalSchema from "./schema/userCreationalSchema.js";
import emailDetailSchema from "./schema/emailCreationalSchema.js";
import shirtSchema from "./schema/shirtSchema.js";
import pantSchema from "./schema/pantSchema.js";
import mongoose from "mongoose"
import randomColor from "randomcolor";

import registerSchema from "./schema/registerSchema.js";
import EmployeeSchema from "./schema/employeeAddSchema.js";


import jwt from 'jsonwebtoken'


const TOKEN_KEY = "STONER"

const router = express.Router()
router.use(express.json());

var Admin = mongoose.mongo.Admin

let cdate = new Date();

let userCreationalfun = async (req, res) => {
    let loginData = [{ username: "admin", password: "123" }, { username: "user", password: "321" },];
    let findLogin = await userCreationalSchema.find({}).lean();
    for (let i in loginData) {
        if (findLogin.length === 0) {
            let addLogin = await userCreationalSchema.insertMany({ username: loginData[i]["username"], password: loginData[i]["password"], });
        } else {
            return;
        }
    }
};

let rateSalwarInitial = async (req, res) => {
    let salwarData = [{
        dateTime: cdate, salwarId: "sal" + generateUniqueId({ length: 4, useLetters: false }), salwarCost:
            { Basic: 790, "With Lining": 100, "Without Lining": 0, "Piping - Neck": 360, "Piping - Neck Sleeve": 460, Pocket: 30, Rope: 30, Zip: 50, "With Elastic": 75 }
    }];
    let findSalwarData = await salwarSchema.find({}).lean();

    for (let i in salwarData) {
        if (findSalwarData.length === 0) {
            let addSalwar = await salwarSchema.insertMany(salwarData[i]);
        } else {
            return;
        }
    }
};

let rateBlouseInitial = async (req, res) => {
    let blouseData = [
        {
            dateTime: cdate,
            blouseId: "blo" + generateUniqueId({ length: 4, useLetters: false }),
            blouseCost: {
                Basic: 500,
                "With Lining": 150,
                "Without Lining": 0,
                "Rope": 30,
                "Zip": 75,
                "Saree Falls": 50,
                "Tazzles": 75,
                "Piping - Neck": 250,
                "Piping - Neck Sleeve": 350,
                "Double Piping - Neck Sleeve": 450,
                "Trible Piping - Neck Sleeve": 550,
                "Straight Cut": 0,
                "Cross Cut": 0,
                "Princess Cut": 290,
                "Katori Cut": 290,
                "Boat - Neck": 100,
                "Collar - Neck": 100,

            },
        },
    ];
    let findBlouseData = await blouseSchema.find({}).lean();

    for (let i in blouseData) {
        if (findBlouseData.length === 0) {
            let addblouse = await blouseSchema.insertMany(blouseData[i]);
        } else {
            return;
        }
    }
};

let rateShirtInitial = async (req, res) => {
    let shirtData = [
        {
            dateTime: cdate,
            shirtId: "shi" + generateUniqueId({ length: 4, useLetters: false }),
            shirtCost: {
                Basic: 300,
            },
        },
    ];
    let findShirtData = await shirtSchema.find({}).lean();

    for (let i in shirtData) {
        if (findShirtData.length === 0) {
            let addShirt = await shirtSchema.insertMany(shirtData[i]);
        } else {
            return;
        }
    }
};

let ratePantInitial = async (req, res) => {
    let pantData = [{ dateTime: cdate, pantId: "Pan" + generateUniqueId({ length: 4, useLetters: false }), pantCost: { Basic: 500 } }];
    let findPantData = await pantSchema.find({}).lean();

    for (let i in pantData) {
        if (findPantData.length === 0) {
            let addPant = await pantSchema.insertMany(pantData[i]);
        }
        else {
            return;
        }
    }
};

let email = async (req, res) => {
    let findEmail = await emailDetailSchema.find({}).lean();
    if (findEmail.length === 0) {
        let getpassword = await emailDetailSchema.find({});


        let emailDetails = await emailDetailSchema.insertMany({
            fromUsername: "netcom.steven@gmail.com",
            fromPassword: "Netcom123",
            toUsername: "development@ncpli.com",
        });
    } else {
        let getpassword = await emailDetailSchema.find({});


        return;
    }
};


router.post('/login', async (req, res) => {

    var requestData = req.body



    var emailID = requestData.username
    var findAdmin = emailID.split("@")[1]
    var admin = findAdmin.substring(0, 9)
    if (admin === "gmail.com") {


        let dbName = requestData.username.split('@')[0] + 'SmartTailorShopDB'

        try {

            mongoose.disconnect()


            var isExists = false
            let mongoURL = 'mongodb://localhost/' + dbName

            var connection = await mongoose.createConnection(mongoURL);

            const temp = await connection.on('open', function () {
                new Admin(connection.db).listDatabases(async function (err, result) {
                    var allDatabases = result.databases.map((item, index) => { return item.name });



                    if (allDatabases.includes(dbName)) {


                        connection.close()
                        const db = await mongoose.connect(mongoURL)
                        const filter = { "emailId": requestData.username, "password": requestData.password }
                        const omit = { _id: 0, __v: 0 }
                        let foundData = await registerSchema.find(filter, omit).lean()
                        const date = new Date().toISOString()

                        const myArray = date.split("T");
                        let currentDate = myArray[0]

                        let expiryDate = foundData[0].planExpiryDate.toISOString()
                        const myArray1 = expiryDate.split("T");
                        let planExpiryDate = myArray1[0]

                        let suspendUser = foundData[0].suspendUser




                        if (foundData.length === 1) {

                            if (planExpiryDate >= currentDate && suspendUser === false) {




                                let token = jwt.sign({ userData: { ...foundData[0], currentUser: "owner", currentUserName: foundData[0].name } }, TOKEN_KEY, { expiresIn: '2h' })



                                return res.json({ 'success': true, message: 'Welcome', token })
                            }
                            else {

                                return res.json({ 'success': false, message: 'Your Plan has been Expired. Please Contact Netcom' })

                            }
                        }
                        else {
                            return res.json({ 'success': false, message: ' Invalid Email/ Password' })
                        }
                    } else {

                        return res.json({ 'success': false, message: 'Invalid Email/ Password' })
                    }
                });

            });


            return isExists
        } catch (error) {

            return res.json({ 'success': false, message: 'Server Down' })
        }
    }

    else {

        var EmaildbName = requestData.username.split("@")[1]
        var removeDotCom = EmaildbName.replace(/.com/g, "")
        var dbName = removeDotCom.replace(/smarttailorshop/g, "SmartTailorShopDB")
        try {
            mongoose.disconnect()


            var isExists = false
            let mongoURL = 'mongodb://localhost/' + dbName

            var connection = await mongoose.createConnection(mongoURL);

            const temp = await connection.on('open', function () {
                new Admin(connection.db).listDatabases(async function (err, result) {
                    var allDatabases = result.databases.map((item, index) => { return item.name });



                    if (allDatabases.includes(dbName)) {


                        connection.close()
                        const db = await mongoose.connect(mongoURL)

                        let foundData = await registerSchema.find({ "dbName": dbName }).lean()

                        const date = new Date().toISOString()

                        const myArray = date.split("T");
                        let currentDate = myArray[0]

                        let expiryDate = foundData[0].planExpiryDate.toISOString()
                        const myArray1 = expiryDate.split("T");
                        let planExpiryDate = myArray1[0]

                        let suspendUser = foundData[0].suspendUser


                        const filter = { "empCompanyMail": requestData.username, "empId": requestData.password }
                        const omit = { _id: 0, __v: 0 }
                        let foundEmployee = await EmployeeSchema.find(filter, omit)
                        let foundEmpName = foundEmployee[0].empName


                        if (foundEmployee.length === 1) {

                            if (planExpiryDate >= currentDate && suspendUser === false) {


                                foundData[0]["currentUser"] = "employee"

                                let token = jwt.sign({ userData: { ...foundData[0], currentUser: "employee", currentUserName: foundEmpName } }, TOKEN_KEY, { expiresIn: '2h' })



                                return res.json({ 'success': true, message: 'Welcome', token })
                            }
                            else {

                                return res.json({ 'success': false, message: 'Your Plan has been Expired. Please Contact Netcom' })

                            }
                        }
                        else {
                            return res.json({ 'success': false, message: ' Invalid Email/ Password' })
                        }
                    } else {

                        return res.json({ 'success': false, message: 'Invalid Email/ Password' })
                    }
                });

            });


            return isExists
        } catch (error) {

            return res.json({ 'success': false, message: 'Server Down' })
        }




    }

})




router.post('/register', async (req, res) => {

    try {
        mongoose.disconnect()


        let mongoURL = 'mongodb://localhost/'

        var connection = await mongoose.createConnection(mongoURL);

        var allDatabases = []
        const temp = await connection.on('open', function () {
            new Admin(connection.db).listDatabases(async function (err, result) {
                allDatabases = result.databases.map((item, index) => { return item.name })
                if (allDatabases.length <= 15) {
                    var requestData = req.body
                    let dbName = requestData.emailId.split("@")[0] + 'SmartTailorShopDB'
                    let userID = "userID-" + generateUniqueId({ length: 8, useLetters: false })
                    let date = new Date()


                    var numberOfDaysToAdd = 10;
                    var result = date.setDate(date.getDate() + numberOfDaysToAdd);
                    const planExpiryDate = new Date(result).toISOString()

                    requestData['userID'] = userID
                    requestData['dbName'] = dbName
                    requestData['color'] = randomColor({ luminosity: 'dark', hue: 'random' })
                    requestData['planExpiryDate'] = planExpiryDate
                    requestData['suspendUser'] = false
                    requestData['maxCustomerCount'] = 50
                    requestData['maxOrderCount'] = 50
                    requestData['maxEmployeeCount'] = 5
                    requestData['plan'] = "free"
                    requestData['shopCode'] =  generateUniqueId({ length: 5, useLetters: false })





                    let obj = await createCustomDB(dbName, requestData)

                    return res.json(obj)
                }
                else {
                    
                    return res.json({ 'success': false, message: 'Registration are not accepted right now. Please Contact Netcom' })

                }

            });
        });

        

    } catch (error) {

        return res.json({ 'success': false, message: 'Server Down' })
    }

})


async function createCustomDB(name, requestData) {

    try {

        let mongoURL = 'mongodb://localhost/' + name
        const db = await mongoose.connect(mongoURL)
        let foundLength = (await registerSchema.find({})).length

        if (foundLength === 1) {
            db.disconnect()
            return { success: false, message: 'Email ID Already Exists' }
        }
        await registerSchema.insertMany(requestData)
        await userCreationalfun();
        await email();
        await rateSalwarInitial();
        await rateBlouseInitial();
        await rateShirtInitial();
        await ratePantInitial();
        db.disconnect()
        return { success: true, message: 'Registration Success.Enjoy Using Smart Tailor Shop :)' }
    }
    catch (error) {

        return { success: false, message: 'Server Down...' }
    }

}



export default router