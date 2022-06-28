import express from "express";
import generateUniqueId from "generate-unique-id";
import randomColor from "randomcolor";
import nodemailer from "nodemailer";
import CustomerSchema from "./schema/CustomerSchema.js";
import addOrderSchema from "./schema/addOrderSchema.js";
import CustomerDetails from "./schema/CustomerSchema.js";
import salwarSchema from "./schema/salwarSchema.js";
import blouseSchema from "./schema/blouseSchema.js";
import DesignTeamOrderDetails from "./schema/DesignTeamOrderSchema.js";
import userCreationalSchema from "./schema/userCreationalSchema.js";
import emailDetailSchema from "./schema/emailCreationalSchema.js";
import shirtSchema from "./schema/shirtSchema.js";
import pantSchema from "./schema/pantSchema.js";
import orderIDSchema from "./schema/OrderIDSchema.js";
import s3Methods from "./s3.js";

import mongoose from "mongoose"


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
        Rope: 30,
        Zip: 75,
        "Piping - Neck": 250,
        "Piping - Neck Sleeve": 350,
        "Double Piping - Neck Sleeve": 450,
        "Trible Piping - Neck Sleeve": 550,
        "Straight Cut": 0,
        "Cross Cut": 0,
        "Katori Cut": 290,
        "Boat Neck": 290,
        "Princess Neck": 290,
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

    console.log(getpassword);
    let emailDetails = await emailDetailSchema.insertMany({
      fromUsername: "netcom.steven@gmail.com",
      fromPassword: "Netcom123",
      toUsername: "development@ncpli.com",
    });
  } else {
    let getpassword = await emailDetailSchema.find({});

    console.log(getpassword[0].fromPassword);
    return;
  }
};

let updateOrderDataFromDesignTeam = (stitchedImageSB, Data, OrderIdName) => {
  let updatedData = [];

  for (let j in stitchedImageSB) {
    let DressIdSB = stitchedImageSB[j]["DressID"];
    for (let i in Data) {
      console.log(Data[i][OrderIdName]);
      if (Data[i][OrderIdName] === DressIdSB) {
        console.log("enter if");
        Data[i]["stichedDressImage"] = stitchedImageSB[j]["stichedDressImage"];
        Data[i]["stichedDressImageName"] =
          stitchedImageSB[j]["stichedDressImageName"];
      }
    }
  }

  return Data;
};

userCreationalfun();
email();
rateSalwarInitial();
rateBlouseInitial();
rateShirtInitial();
ratePantInitial();

router.post("/resetUserCreational", async (req, res) => {
  console.log("resetUserCreational");
  if (req.body.user === "admin") {
    let updatepassword = await userCreationalSchema.updateOne(
      { username: req.body.username },
      { $set: { password: req.body.password } }
    );
    return res.json({ success: true, message: updatepassword });
  } else {
    return res.json({ success: false, message: [] });
  }
});

router.post("/email", async (req, res) => {
  console.log("email");
  let randomNumbers = generateUniqueId({ length: 4, useLetters: false });
  let emailUpdate = await emailDetailSchema.find({});
  if (req.body.user === "admin") {
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
  }
});

router.post("/login", async (req, res) => {
  console.log("login");
  if (req.body.user === "admin") {
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
  } else {
    return res.json({ success: false, message: "" });
  }
});


router.post("/designingTeamEdit", async (req, res) => {
  console.log("designingTeamEdit");
  var dataImGet = req.body;

  if (req.body.user === "admin") {
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

      DBOrderIDDataObj = await imageToS3Transporter(
        DBOrderIDDataObj,
        prevDBOrderIDDataObj,
        "salwarData",
        "salwarOrderId",
        "stichedDressImageName",
        "stichedDressImage"
      );
      DBOrderIDDataObj = await imageToS3Transporter(
        DBOrderIDDataObj,
        prevDBOrderIDDataObj,
        "blouseData",
        "blouseOrderId",
        "stichedDressImageName",
        "stichedDressImage"
      );

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
  }
});

//dataImGet, updateDelieveryStaus, "salwarData", "salwarOrderId", "stichedDressImageName", "stichedDressImage"



const insertFunction = async (dataImGet, id, mobNo, res) => {
  console.log("insertFunction");

  try {
    var results = await CustomerSchema.findOne(
      { cusMobNo: mobNo },
      async function (err, obj) {
        if (!err && obj) {
          dataImGet["cusColor"] = obj.cusColor;
          dataImGet["cusId"] = obj.cusId;
          var dbId = addOrderSchema.findOne({ orderID: id });
          try {
            if (dbId === null) {
              var StoreData = await addOrderSchema(dataImGet);
              StoreData.save((err) => {
                if (err) {
                  res.json({ success: false, message: "error" });
                } else {
                  res.json({ success: true, message: "DataStored" });
                }
              });
            } else {
              console.log("else");

              var DeleteData = await addOrderSchema.deleteOne({ orderID: id });
              var storeData = await addOrderSchema.insertMany(dataImGet);
              res.json({ success: true, message: "DataStored" });
            }
          } catch (error) { }
        } else {
          return res.json({ success: false, message: "nodata" });
        }
      }
    );
  } catch (e) {
    return;
  }
};


router.post("/getCustomerPage", async (req, res) => {
  console.log("getCustomerPage");
  if (req.body.user == "admin") {
    var mobNo = req.body.cusMobNo;
    var customerDet = await addOrderSchema.find( { mobNo: mobNo }, { salwarData: 0, blouseData: 0, __v: 0, _id: 0 } );
    res.json({ success: true, message: customerDet });
  } else {
    res.json({ success: false, message: "No Data" });
  }
});



router.post("/customerLoginData", async (req, res) => {
  console.log("customerLoginData");
  let reqCusId = req.body.cusId;
  let reqCusMobNo = req.body.cusMobNo;
  var reqOrderId = req.body.orderID;
  var customerData = await CustomerSchema.find({ $and: [{ cusMobNo: reqCusMobNo }, { cusId: reqCusId }], });
  if (customerData.length === 0) {
    res.json({ success: false, message: "Customer Data Not Found" });
  } else {
    var customerDet = await addOrderSchema.find( { $and: [{ orderID: reqOrderId }, { mobNo: reqCusMobNo }] }, { __v: 0, _id: 0, gst: 0 } );
    res.json({ success: true, message: customerDet });
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