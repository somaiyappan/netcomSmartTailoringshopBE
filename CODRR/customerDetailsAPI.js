import express from "express";
import mongoose from "mongoose"
import generateUniqueId from "generate-unique-id";
import randomColor from "randomcolor";

import CustomerSchema from "../schema/CustomerSchema.js";
import addOrderSchema from "../schema/addOrderSchema.js";
import mongoDBConnect from "../commonJSFile/mongoDBConnect.js"
import personNames from "../commonJSFile/personNames.js";


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



router.post("/addCustomerData", async (req, res) => {
  console.log("addCustomerData");
  try {
    await mongoDBConnect(req.body.username)
    let reqData = req.body
    console.log(reqData)
    const id = generateUniqueId({
      length: 5,
      useLetters: false,
    });
    var custId = "cus-" + id;
    const color = randomColor({
      luminosity: "bright",
      format: "rgb",
    });
    let currentdate = new Date().toISOString();
    const postPerson = await new CustomerSchema({ cusDate: currentdate, cusName: req.body.cusName, cusEmail: req.body.cusEmail, cusMobNo: req.body.cusMobNo, cusAddress: req.body.cusAddress, cusId: custId, cusColor: color, });
    try {
      var results = await CustomerSchema.find({ cusMobNo: req.body.cusMobNo })
      if (results.length != 0) {
        return res.json({ success: "false", message: "UserExists" });
      } else {
        const savePersons = postPerson.save();
        return res.json({ success: "true", message: "RegistrationSuccess" });
      }
    } catch (e) {
      console.log("cat" + e)
      return res.json({ 'success': false, message: 'Server Down' })
    }
  } catch (error) {
    console.log("addCustomerDataCatcherror")
    return res.json({ 'success': false, message: error })
  }

});

router.post("/getCustomerData", async (req, res) => {
  console.log("getCustomerData");
  var user = req.body.user;
  await mongoDBConnect(req.body.username)
  try {
    var results = await CustomerSchema.findOne(
      { cusMobNo: req.body.cusMobNo },
      { _v: 0, _id: 0 }
    ).lean();

    var orderlist = await addOrderSchema.find({ mobNo: results.cusMobNo });
    let temp = personNames(orderlist);
    console.log(temp);
    let salwarPersonObj = temp[0];
    let blousePersonObj = temp[1];
    let shirtPersonObj = temp[2];
    let pantPersonObj = temp[3];
    var meregeObj = Object.assign(
      salwarPersonObj,
      results,
      blousePersonObj,
      shirtPersonObj,
      pantPersonObj
    );
    return res.json({ success: true, message: meregeObj });
  } catch (err) {
    console.log("getCustomerDataCatchError" + err)
    return res.json({ success: false, message: err });
  }

});

router.post("/allCustomerData", async (req, res) => {
  console.log("allCustomerData");
  try {
    await mongoDBConnect(req.body.username)

    var results = await CustomerSchema.find({}, { _id: 0, __v: 0 }).lean();

    if (results.length != 0) {
      var temp = {};
      var tempArr = [];
      for (let i in results) {
        let mobNo = results[i]["cusMobNo"];
        let orderDataforNo = await addOrderSchema.find({ mobNo: mobNo }, { blouseData: 0, salwarData: 0, _id: 0, __v: 0 }).lean();
        if (orderDataforNo.length != 0) {
          for (let j in orderDataforNo) {
            var salwarCountNo = orderDataforNo[j].salwarCount;
            var blouseCountNo = orderDataforNo[j].blouseCount;
            var finalAmount = orderDataforNo[j].finalAmount;
            temp["cusMobNo"] = mobNo;
            temp["salwarCount"] = salwarCountNo;
            temp["blouseCount"] = blouseCountNo;
            temp["finalAmount"] = finalAmount;
            tempArr.push(temp);
            temp = {};
          }
        }
      }
      let obj = {};
      tempArr.forEach((item) => {
        if (obj[item.cusMobNo]) {
          obj[item.cusMobNo].salwarCount =
            obj[item.cusMobNo].salwarCount + item.salwarCount;
          obj[item.cusMobNo].blouseCount =
            obj[item.cusMobNo].blouseCount + item.blouseCount;
          obj[item.cusMobNo].finalAmount =
            obj[item.cusMobNo].finalAmount + item.finalAmount;
        } else {
          obj[item.cusMobNo] = item;
        }
      });
      let valuesArr = Object.values(obj);

      let merge = results.map((t1) => ({
        ...t1,
        ...valuesArr.find((t2) => t2.cusMobNo === t1.cusMobNo),
      }));
      const addSBF = merge.map((v) => ({
        ...v,
        salwarCount: 0,
        blouseCount: 0,
        finalAmount: 0,
      }));
      let merge1 = addSBF.map((t1) => ({
        ...t1,
        ...valuesArr.find((t2) => t2.cusMobNo === t1.cusMobNo),
      }));

      var wantKeys = ["cusId", "cusName", "cusMobNo", "finalAmount"];

      var result = merge1.map((obj) => Object.fromEntries(wantKeys.map((key) => obj.hasOwnProperty(key) && [key, obj[key]])));

      var top10 = result.sort(function (a, b) { return a.finalAmount < b.finalAmount ? 1 : -1; }).slice(0, 10);

      return res.json({ success: true, message: merge1, top10Customer: top10, });
    } else {
      return res.json({ success: "false", message: [] });
    }
  } catch (e) {
    console.log("allCustomerDataCatchError")
    return res.json({ success: false, message: e });
  }

});

router.post("/getAllCustomerData", async (req, res) => {
  console.log("getAllCustomerData");

  try {

    await mongoDBConnect(req.body.username)

    var pageNo = req.body.page;
    let size = req.body.size;

    var result2 = 0;
    for (let i = 1; i <= pageNo; i++) {
      result2 = i * size;
    }
    var totalCustomerCount = await CustomerSchema.count();

    var skips = totalCustomerCount - result2;

    if (skips <= 0) {
      size = size + skips;
      skips = 0;
    }

    var results = []

    if (req.body.searchQuery === "") {
      results = await CustomerSchema.find({}, { _id: 0, __v: 0 }).limit(size).skip(skips).lean();
    }
    else if (req.body.searchQuery !== "") {

      var fieldName = req.body.field
      var searchValue = '\\b' + req.body.searchQuery + '[a-zA-Z0-9]*'


      if (pageNo > 1) {
        var newSkips = 0;
        newSkips = ((pageNo) - 1) * size
        results = await CustomerSchema.find({ [fieldName]: { $regex: searchValue, $options: "i" } }).limit(size).skip(newSkips).lean()
      }
      else {
        results = await CustomerSchema.find({ [fieldName]: { $regex: searchValue, $options: "i" } }).limit(size).lean()
      }


      totalCustomerCount = (await CustomerSchema.find({ [fieldName]: { $regex: searchValue, $options: "i" } }).lean()).length

    }


    if (results.length != 0) {
      var temp = {};
      var tempArr = [];
      for (let i in results) {
        let mobNo = results[i]["cusMobNo"];
        let orderDataforNo = await addOrderSchema.find({ mobNo: mobNo }, { blouseData: 0, salwarData: 0, _id: 0, __v: 0 }).lean();
        if (orderDataforNo.length != 0) {

          for (let j in orderDataforNo) {
            var salwarCountNo = orderDataforNo[j].salwarCount;
            var blouseCountNo = orderDataforNo[j].blouseCount;
            var finalAmount = orderDataforNo[j].finalAmount;
            temp["cusMobNo"] = mobNo;
            temp["salwarCount"] = salwarCountNo;
            temp["blouseCount"] = blouseCountNo;
            temp["finalAmount"] = finalAmount;
            tempArr.push(temp);
            temp = {};
          }
        }
      }
      let obj = {};
      tempArr.forEach((item) => {
        if (obj[item.cusMobNo]) {
          obj[item.cusMobNo].salwarCount =
            obj[item.cusMobNo].salwarCount + item.salwarCount;
          obj[item.cusMobNo].blouseCount =
            obj[item.cusMobNo].blouseCount + item.blouseCount;
          obj[item.cusMobNo].finalAmount =
            obj[item.cusMobNo].finalAmount + item.finalAmount;
        } else {
          obj[item.cusMobNo] = item;
        }
      });
      let valuesArr = Object.values(obj);
      let merge = results.map((t1) => ({ ...t1, ...valuesArr.find((t2) => t2.cusMobNo === t1.cusMobNo), }));
      const addSBF = merge.map((v) => ({ ...v, salwarCount: 0, blouseCount: 0, finalAmount: 0, }));
      let merge1 = addSBF.map((t1) => ({ ...t1, ...valuesArr.find((t2) => t2.cusMobNo === t1.cusMobNo), }));

      var wantKeys = ["cusId", "cusName", "cusMobNo", "finalAmount"];

      var result = merge1.map((obj) =>
        Object.fromEntries(
          wantKeys.map((key) => obj.hasOwnProperty(key) && [key, obj[key]])
        )
      );

      var top10 = result.sort(function (a, b) { return a.finalAmount < b.finalAmount ? 1 : -1; }).slice(0, 10);

      return res.json({ success: true, message: merge1, top10Customer: top10, totalCustomerCount: totalCustomerCount, });
    } else {
      return res.json({ success: "false", message: [] });
    }
  } catch (e) {
    console.log("getAllCustomerDataCatchError");
    return res.json({ success: "catchfalse", message: e });
  }

});

// router.post("/updateCustomerData", async (req, res) => {
//   console.log("updateCustomerData");
//   if (req.body.user === "admin") {
//     try {
//       var results = await CustomerSchema.findOneAndUpdate(
//         { _id: req.body._id },
//         {
//           $set: {
//             cusDate: req.body.cusDate,
//             cusName: req.body.cusName,
//             cusEmail: req.body.cusEmail,
//             cusMobNo: req.body.cusMobNo,
//             cusAddress: req.body.cusAddress,
//           },
//         },
//         function (err, data) {
//           if (!err && data) {
//             return res.json({ success: true, message: "updated" });
//           } else {
//             return res.json({ success: false, message: "not inserted" });
//           }
//         }
//       );
//     } catch (e) {
//       return;
//     }
//   } else {
//     return res.json({ success: false, message: "Your not admin" });
//   }
// });

router.post("/deleteCustomerData", async (req, res) => {
  console.log("deleteCustomerData");
  await mongoDBConnect(req.body.username)
  try {
    var mobileNo = req.body.cusMobNo;
    var orderIdLength = 0;
    var countOrderId = await addOrderSchema.find({ mobNo: mobileNo });
    orderIdLength = countOrderId.length;
    if (orderIdLength === 0) {
      await CustomerSchema.deleteOne({ cusMobNo: mobileNo });
      res.json({ sucess: true, message: "Deleted" });
    } else {
      res.json({ sucess: true, message: "Please delete order first" });
    }
  } catch (error) {
    console.log("deleteCustomerDataCatchError");
    res.json({ sucess: false, message: console.error });
  }

});

router.post("/getAllCusMobNos", async (req, res) => {
  console.log("getAllCusMobNos");
  try {
    await mongoDBConnect(req.body.username)
    var multiOrderIdData = await CustomerSchema.find({}, { cusDate: 0, cusEmail: 0, cusAddress: 0, cusId: 0, cusColor: 0, __v: 0, _id: 0, });
    return res.json({ success: true, message: multiOrderIdData });
  } catch (error) {
    console.log("getAllCusMobNosCatchError")
    return res.json({ success: false, message: error });

  }

});

// dataToSend = {user:"admin", searchQuery: searchQuery, field:"CustomerName"}
router.post("/searchCustomerData", async (req, res) => {
  var search = req.body.searchQuery;
  try {
    await mongoDBConnect(req.body.username)
    console.log(req.body)
    return res.json({ success: true, searchedData: searchedData });
  } catch (error) {
    console.log("searchCustomerDataCatchError")
    return res.json({ success: false, message: error });

  }
});


router.post("/updateCustomerData", async (req, res) => {
  console.log("updateCustomerData");
  const data = req.body;

  try {
    await mongoDBConnect(req.body.username)
    var foundUser = await CustomerSchema.findOne({ cusId: data.cusId });
    if (foundUser.cusMobNo === data.cusMobNo) {
      await addOrderSchema.updateMany({ cusId: data.cusId }, { $set: { name: data.cusName, mobNo: data.cusMobNo } });
      var updateSameMobNo = await CustomerSchema.findOneAndUpdate({ cusId: data.cusId }, data);
      return res.json({ sucess: true, message: "updated" });
    } else if (foundUser.cusMobNo !== data.cusMobNo) {
      var id = await CustomerSchema.findOne({ cusId: data.cusId });
      var MobNo = await CustomerSchema.find({ cusMobNo: data.cusMobNo });
      var mobLength = MobNo.length;

      if (mobLength === 1) {
        return res.json({ sucess: true, message: "MobileNumberExists" });
      } else if (id !== null) {
        await addOrderSchema.updateMany({ cusId: data.cusId }, { $set: { name: data.cusName, mobNo: data.cusMobNo } });
        var updateMobNo = await CustomerSchema.findOneAndUpdate({ cusId: data.cusId }, data);
        return res.json({ sucess: true, message: "updated" });
      } else if (id === null) {
        await addOrderSchema.updateMany({ cusId: data.cusId }, { $set: { name: data.cusName, mobNo: data.cusMobNo } });
        var updateMobNo = await CustomerSchema.findOneAndUpdate({ cusId: data.cusId }, data);

        return res.json({ sucess: true, message: "updated" });
      }
    }
  } catch (error) {
    console.log("updateCustomerDataCatchError" + error)
    return res.json({ success: true, message: error });
  }


});

export default router
