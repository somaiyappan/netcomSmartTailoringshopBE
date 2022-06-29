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






const StichedImageToS3Transporter = async ( dataImGet, prevOrderData, dressData, dressOrderID, patternIDName, patternIDImage ) => {
  for (let i in dataImGet[dressData]) {
    let obj = dataImGet[dressData][i];

    try {
      prevSalwarArr =
        prevOrderData[
        dressData === "stichedSalwarImage" ? "salwarData" : "blouseData"
        ];
    } catch (e) {
      prevSalwarArr = [];
    }

    let prevSalwarObj = prevSalwarArr.filter(function (el) {
      return (
        el[
        dressData === "stichedSalwarImage" ? "salwarOrderId" : "blouseOrderId"
        ] ===
        obj[
        dressData === "stichedSalwarImage" ? "salwarOrderId" : "blouseOrderId"
        ]
      );
    })[0];

    if (
      obj.hasOwnProperty(patternIDImage) &&
      obj[patternIDImage].slice(0, 4) !== "http"
    ) {
      var neckPatternIDImage = obj[patternIDImage];
      let neckResult = await s3Methods.uploadFileToS3(
        neckPatternIDImage,
        obj[dressOrderID] + obj[patternIDName] + currentDate + ".jpeg"
      );
      obj[patternIDImage] = neckResult.Key;
    } else if (
      obj.hasOwnProperty(patternIDImage) &&
      obj[dressOrderID] === prevSalwarObj[dressOrderID]
    ) {
      obj[patternIDImage] = prevSalwarObj[patternIDImage];
    }
  }

  if (prevOrderData !== undefined) {
    let newOrderNeckKeys = dataImGet[dressData].map((el) => el[patternIDImage]);
    let prevOrderNeckKeys = prevOrderData[dressData].map(
      (el) => el[patternIDImage]
    );

    let keyToRemove = prevOrderNeckKeys.filter(
      (e) => !newOrderNeckKeys.includes(e)
    );

    keyToRemove.map(async (text) => {
      const result = await s3Methods.deleteFile(text);
    });
  }

  return dataImGet;
};



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

        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUpdate[0].fromUsername,
            pass: emailUpdate[0].fromPassword,
          },
        });
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


router.post("/designingTeamEdit", async (req, res) => {
  console.log("designingTeamEdit");
  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        var dataImGet = req.body;
        var updateDelieveryStaus = [];
        var id = await dataImGet["orderID"];
        var mobNo = dataImGet["mobNo"];

        try {
          updateDelieveryStaus = await addOrderSchema.findOne({
            orderID: req.body.orderID,
          });
        } catch (err) {
          updateDelieveryStaus = [];
        }

        let foundObjectFullDate = dataImGet["orderDate"];

        let newFoundObjectFullDate = new Date(foundObjectFullDate);

        if (myDate < newFoundObjectFullDate) {
          let stitchedSalwarImageArr = dataImGet["stitchedSalwarImage"];
          let stitchedBlouseImageArr = dataImGet["stitchedBlouseImage"];

          let orderID = dataImGet["orderID"];
          var DBOrderIDDataArr = await addOrderSchema.find({ orderID: orderID });

          let DBOrderIDDataObj = DBOrderIDDataArr[0];
          let prevDBOrderIDDataObj = JSON.parse(
            JSON.stringify(DBOrderIDDataArr[0])
          );

          var d = {};
          var arr = [];

          for (let i = 0; i < stitchedSalwarImageArr.length; i++) {
            d = stitchedSalwarImageArr[i];

            if (d["DressID"] === DBOrderIDDataObj.salwarData[i]["salwarOrderId"]) {
              if (d.stichedDressImageName !== "" && d.stichedDressImage !== "") {
                DBOrderIDDataObj.salwarData[i]["stichedDressImageName"] =
                  d.stichedDressImageName;
                DBOrderIDDataObj.salwarData[i]["stichedDressImage"] =
                  d.stichedDressImage;
              }
            }
            delete d["DressID"];
          }

          for (let i = 0; i < stitchedBlouseImageArr.length; i++) {
            d = stitchedBlouseImageArr[i];

            if (d["DressID"] === DBOrderIDDataObj.blouseData[i]["blouseOrderId"]) {
              if (d.stichedDressImageName !== "" && d.stichedDressImage !== "") {
                DBOrderIDDataObj.blouseData[i]["stichedDressImageName"] =
                  d.stichedDressImageName;
                DBOrderIDDataObj.blouseData[i]["stichedDressImage"] =
                  d.stichedDressImage;
              }
            }
            delete d["DressID"];
          }

          DBOrderIDDataObj["orderStatus"] = dataImGet["orderStatus"];

          DBOrderIDDataObj = await imageToS3Transporter( DBOrderIDDataObj, prevDBOrderIDDataObj, "salwarData", "salwarOrderId", "stichedDressImageName", "stichedDressImage" );
          DBOrderIDDataObj = await imageToS3Transporter( DBOrderIDDataObj, prevDBOrderIDDataObj, "blouseData", "blouseOrderId", "stichedDressImageName", "stichedDressImage" );

          insertFunction(DBOrderIDDataObj, id, mobNo, res);
        } else if (myDate > newFoundObjectFullDate) {
          console.log("elseif");

          var stitchedSalwarImage = req.body.stitchedSalwarImage;
          var stitchedBlouseImage = req.body.stitchedBlouseImage;
          let salwarData = updateDelieveryStaus.salwarData;

          salwarData = updateOrderDataFromDesignTeam(
            stitchedSalwarImage,
            salwarData,
            "salwarOrderId"
          );

          let blouseData = updateDelieveryStaus.blouseData;
          blouseData = updateOrderDataFromDesignTeam(
            stitchedBlouseImage,
            blouseData,
            "blouseOrderId"
          );

          var updateDB = await addOrderSchema.updateMany({ orderID: req.body.orderID }, { $set: { salwarData: salwarData, blouseData: blouseData, orderStatus: req.body.orderStatus }, });

          if (updateDB.matchedCount === 1) {
            return res.json({ success: true, message: "DataStored" });
          } else {
            return res.json({ success: false, message: "Not updated" });
          }
        }

      } catch (error) {
        console.log("designingTeamEditCatchError")
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



// router.post("/generateOrderID", async (req, res) => {
//   console.log("generateOrderID");
//   var arr = [];
//   if (req.body.user === "admin") {
//     var orderId = 0;
//     var list = await addOrderSchema.find(
//       {},
//       {
//         orderDate: 0,
//         name: 0,
//         mobNo: 0,
//         deliveryDate: 0,
//         orderStatus: 0,
//         salwarCount: 0,
//         blouseCount: 0,
//         salwarData: 0,
//         blouseData: 0,
//         _id: 0,
//         __v: 0,
//       }
//     );
//     if (list.length !== 0) {
//       for (let i in list) {
//         arr.push(list[i].orderID);
//       }
//       var sortedOrderIds = arr.sort().reverse();
//       var lastOrderNo = parseInt(sortedOrderIds[0].match(/\d+$/)[0]);
//       if (lastOrderNo < 9) {
//         orderId = "00" + (lastOrderNo + 1);
//       } else if (lastOrderNo >= 9 && lastOrderNo < 99) {
//         orderId = "0" + (lastOrderNo + 1);
//       } else {
//         orderId = lastOrderNo + 1;
//       }
//       res.json({ success: true, message: "K" + orderId });
//     } else {
//       var tempStartNo = 0;
//       if (tempStartNo < 9) {
//         orderId = "00" + (tempStartNo + 1);
//       } else if (tempStartNo >= 9 && tempStartNo < 100) {
//         orderId = "0" + (tempStartNo + 1);
//       } else {
//         orderId = tempStartNo + 1;
//       }
//       res.json({ success: true, message: "K" + orderId });
//     }

//     // let orderIDArray = await orderIDSchema.find({})
//   }
// });



router.get("/apiCheck", async (req, res) => {
  return res.json({ success: "true", message: "API Running" });
});

export default router;


