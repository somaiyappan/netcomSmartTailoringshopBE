import express from "express";
import generateUniqueId from "generate-unique-id";

import nodemailer from "nodemailer";
import CustomerSchema from "./schema/CustomerSchema.js";
import addOrderSchema from "./schema/addOrderSchema.js";

import userCreationalSchema from "./schema/userCreationalSchema.js";
import emailDetailSchema from "./schema/emailCreationalSchema.js";


import jwtTokenVerifyFile from "./commonJSFile/jwtTokenVerify.js"



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



router.post("/customerLoginData", async (req, res) => {
  console.log("customerLoginData");
  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        let reqCusId = req.body.cusId;
        let reqCusMobNo = req.body.cusMobNo;
        var reqOrderId = req.body.orderID;
        var customerData = await CustomerSchema.find({ $and: [{ cusMobNo: reqCusMobNo }, { cusId: reqCusId }], });
        if (customerData.length === 0) {
          res.json({ success: false, message: "Customer Data Not Found" });
        } else {
          var customerDet = await addOrderSchema.find({ $and: [{ orderID: reqOrderId }, { mobNo: reqCusMobNo }] }, { __v: 0, _id: 0, gst: 0 });
          res.json({ success: true, message: customerDet });
        }

      } catch (error) {
        console.log("customerLoginDataCatchError")
        return res.json({ success: false, message: error });
      }



    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }

});



router.get("/apiCheck", async (req, res) => {
  return res.json({ success: "true", message: "API Running" });
});

export default router;


