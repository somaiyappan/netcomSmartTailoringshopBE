import express from "express";
import generateUniqueId from "generate-unique-id";

import nodemailer from "nodemailer";
import CustomerSchema from "./schema/CustomerSchema.js";
import addOrderSchema from "./schema/addOrderSchema.js";

import userCreationalSchema from "./schema/userCreationalSchema.js";
import emailDetailSchema from "./schema/emailCreationalSchema.js";


import jwtTokenVerifyFile from "./commonJSFile/jwtTokenVerify.js"
import mongoDBConnect from "./commonJSFile/mongoDBConnect.js";
import registerSchema from "./schema/registerSchema.js";

import mongoose from "mongoose";

var Admin = mongoose.mongo.Admin;



const router = express.Router();

router.use(express.json());

let cdate = new Date();
let currentyear = cdate.getUTCFullYear();

var tenDays = new Date(new Date().getTime() + 11 * 24 * 60 * 60 * 1000);
let currentDate = cdate.toISOString();
let myDate1 = tenDays.toISOString();
let nextTenthDay = myDate1.split("T")[0];
let currentDateSplit = currentDate.split("T")[0];
let todayDate = currentDateSplit + "T00:00:00.000+00:00";
let nextTenDays = nextTenthDay + "T00:00:00.000+00:00";
console.log(nextTenDays);
var myDate = new Date("2022-03-12");









router.post("/resetUserCreational", async (req, res) => {
  console.log("resetUserCreational");
  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        let updatepassword = await userCreationalSchema.updateOne({ username: req.body.username }, { $set: { password: req.body.password } });
        return res.json({ success: true, message: updatepassword });

      } catch (error) {
        console.log("resetUserCreationalCatchError")
        return res.json({ success: false, message: error });
      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }



});

router.post("/email", async (req, res) => {
  console.log("email");
  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        let randomNumbers = generateUniqueId({ length: 4, useLetters: false });
        let emailUpdate = await emailDetailSchema.find({});

        var transporter = nodemailer.createTransport({ service: "gmail", auth: { user: emailUpdate[0].fromUsername, pass: emailUpdate[0].fromPassword, }, });
        var mailOptions = {
          from: emailUpdate[0].fromUsername,
          to: emailUpdate[0].toUsername,
          subject: "OTP from KOMALA Creations",
          html:
            " <p style='font-size:1.1em'>Hi,</p>  <p>Your OTP Verification Code for Resetting Password</p> <h2 style='background: #000000;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px'>" +
            randomNumbers +
            "</h2><p style='font-size:0.9em'>Regards,<br />Komala Creations</p> ",
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            res.json({ success: false, message: "OTP not Sen" });
          } else {
            console.log("Email sent: " + info.response);
            res.json({ success: true, message: randomNumbers });
          }
        });

      } catch (error) {
        console.log("emailCatchError")
        return res.json({ success: false, message: error });
      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }



});

router.post("/login", async (req, res) => {
  console.log("login");
  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        let login = await userCreationalSchema.find({
          $and: [{ username: req.body.username }, { password: req.body.password }],
        });
        if (login.length === 1) {
          if (req.body.username === "admin") {
            return res.json({ success: true, message: "Shop Owner" });
          } else if (req.body.username === "user") {
            return res.json({ success: true, message: "Designing Team" });
          }
        } else {
          return res.json({ success: false, message: "" });
        }


      } catch (error) {
        console.log("loginCatchError")
        return res.json({ success: false, message: error });
      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }



});






router.post("/getCustomerPage", async (req, res) => {
  console.log("getCustomerPage");
  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        var mobNo = req.body.cusMobNo;
        var customerDet = await addOrderSchema.find({ mobNo: mobNo }, { salwarData: 0, blouseData: 0, __v: 0, _id: 0 });
        res.json({ success: true, message: customerDet });

      } catch (error) {
        console.log("getCustomerPageCatchError")
        return res.json({ success: false, message: error });
      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }




});


router.post("/getOrderId", async (req, res) => {
  console.log("getOrderId");
 

      console.log("TOken verifed Success")
      try {

        mongoose.disconnect();

        var allDBNames = [];
    
        var dataToRes = [];
    
        let mongoURL = "mongodb://localhost/";
    
        var connection = await mongoose.createConnection(mongoURL);
    
        const temp = await connection.on("open", function () {
          new Admin(connection.db).listDatabases(async function (err, result) {
            var allDatabases = result.databases.map((item, index) => {
              return item.name;
            });
    
            for (let i = 0; i < allDatabases.length; i++) {
              if (allDatabases[i].split("SmartTailorShopDB").length === 2) {
                allDBNames.push(allDatabases[i].split("SmartTailorShopDB")[0] + "SmartTailorShopDB");
              }
            }
    
    
            for (let i = 0; i < allDBNames.length; i++) {
              let url = "mongodb://localhost/" + allDBNames[i];
              connection.close();
              const db = await mongoose.connect(url);
    
              let foundData = await registerSchema.findOne({ shopCode: req.body.shopCode });
    
              if (foundData !== null) {
                dataToRes.push(foundData);
              }
              db.disconnect();
            }
    
    
            
    
      
    
            let dbNameCrop = dataToRes[0].dbName.replace("SmartTailorShopDB", "");
    
            await mongoDBConnect(dbNameCrop)
    
          
            
            var cusId = req.body.cusId;
            var cusMobNo = req.body.cusMobNo;
            var cusOrderId = await CustomerSchema.find({ $and: [{ cusMobNo: cusMobNo }, { cusId: cusId }], });
            if (cusOrderId.length === 0) {
              res.json({ success: false, message: "Customer Data Not Found" });
            } else {
              var customerDet = await addOrderSchema.find({ mobNo: cusMobNo }, { salwarData: 0, blouseData: 0, __v: 0, _id: 0, gst: 0, orderDate: 0, name: 0, mobNo: 0, deliveryDate: 0, orderStatus: 0, salwarCount: 0, finalAmount: 0, blouseCount: 0, });
              var arr = [];
              for (let i = 0; i < customerDet.length; i++) {
                arr.push(customerDet[i]["orderID"]);
              }
              res.json({ success: true, message: arr });
            }
    
          });
        });


      } catch (error) {
        console.log("getOrderIdCatchError")
        return res.json({ success: false, message: error });
      }

});



router.post("/customerLoginData", async (req, res) => {
  console.log("customerLoginData");


  console.log("TOken verifed Success")


  try {
    mongoose.disconnect();

    var allDBNames = [];

    var dataToRes = [];

    let mongoURL = "mongodb://localhost/";

    var connection = await mongoose.createConnection(mongoURL);

    const temp = await connection.on("open", function () {
      new Admin(connection.db).listDatabases(async function (err, result) {
        var allDatabases = result.databases.map((item, index) => {
          return item.name;
        });

        for (let i = 0; i < allDatabases.length; i++) {
          if (allDatabases[i].split("SmartTailorShopDB").length === 2) {
            allDBNames.push(allDatabases[i].split("SmartTailorShopDB")[0] + "SmartTailorShopDB");
          }
        }


        for (let i = 0; i < allDBNames.length; i++) {
          let url = "mongodb://localhost/" + allDBNames[i];
          connection.close();
          const db = await mongoose.connect(url);

          let foundData = await registerSchema.findOne({ shopCode: req.body.shopCode });

          if (foundData !== null) {
            dataToRes.push(foundData);
          }
          db.disconnect();
        }


        

       

        let dbNameCrop = dataToRes[0].dbName.replace("SmartTailorShopDB", "");

        await mongoDBConnect(dbNameCrop)

        

        let reqCusId = req.body.cusId;
        let reqCusMobNo = req.body.cusMobNo;
        var reqOrderId = req.body.orderID;
        var customerData = await CustomerSchema.find({ $and: [{ cusMobNo: reqCusMobNo }, { cusId: reqCusId }], });

        console.log(customerData)

        if (customerData.length === 0) {
          res.json({ success: false, message: "Customer Data Not Found" });
        } else {
          var customerDet = await addOrderSchema.find({ $and: [{ orderID: reqOrderId }, { mobNo: reqCusMobNo }] }, { __v: 0, _id: 0, gst: 0 });
          res.json({ success: true, message: customerDet });
        }



      });
    });
  } catch (error) {
    console.log(error + "ddd");
    return res.json({ success: false, message: "Server Down" });
  }









});



router.get("/apiCheck", async (req, res) => {
  return res.json({ success: "true", message: "API Running" });
});

export default router;


