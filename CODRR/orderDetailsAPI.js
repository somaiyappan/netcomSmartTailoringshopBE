import express from "express";
import mongoose from "mongoose"
import generateUniqueId from "generate-unique-id";
import randomColor from "randomcolor";
import nodemailer from "nodemailer";
import CustomerSchema from "../schema/CustomerSchema.js";
import addOrderSchema from "../schema/addOrderSchema.js";
import salwarSchema from "../schema/salwarSchema.js";
import blouseSchema from "../schema/blouseSchema.js";
import DesignTeamOrderDetails from "../schema/DesignTeamOrderSchema.js";
import userCreationalSchema from "../schema/userCreationalSchema.js";
import emailDetailSchema from "../schema/emailCreationalSchema.js";
import shirtSchema from "../schema/shirtSchema.js";
import pantSchema from "../schema/pantSchema.js";
import orderIDSchema from "../schema/OrderIDSchema.js";
import s3Methods from "../s3.js";



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

const viewImageInS3 = async (foundObject, dressData, patternIDImage) => {
    for (let i in foundObject[dressData]) {
        let obj = foundObject[dressData][i];
        if (obj.hasOwnProperty(patternIDImage)) {
            var neckPatternIDImage = obj[patternIDImage];

            let neckResult = await s3Methods.viewFileFromS3(neckPatternIDImage);

            foundObject[dressData][i][patternIDImage] = neckResult;
        }
    }
    return foundObject
};

let findSkips = (pageNo, size, count) => {

    var result2 = 0;
    for (let i = 1; i <= pageNo; i++) {
        result2 = i * size;
    }
    var totalOrderCount = count


    var skips = totalOrderCount - result2;

    if (skips <= 0) {
        size = size + skips;
        skips = 0;
    }

    return [size, skips]
}

  const searchOrderDataFunc = async (pageNo, size, searchQuery, fieldName, objToSearch) => {
    var searchValue = '\\b' + searchQuery + '[a-zA-Z0-9]*'
    let results = []
  
    if (pageNo > 1) {
      var newSkips = 0;
      newSkips = ((pageNo) - 1) * size
  
      results = await addOrderSchema.find({ ...objToSearch, [fieldName]: { $regex: searchValue, $options: "i" } }).limit(size).skip(newSkips).lean()
    }
    else {
      results = await addOrderSchema.find({ ...objToSearch, [fieldName]: { $regex: searchValue, $options: "i" } }).limit(size).lean()
  
    }
    let totalOrderCount = (await addOrderSchema.find({ ...objToSearch, [fieldName]: { $regex: searchValue, $options: "i" } }).lean()).length
    return { results: results, totalOrderCount: totalOrderCount }
  }

  const imageToS3Transporter = async (
    dataImGet,
    prevOrderData,
    dressData,
    dressOrderID,
    patternIDName,
    patternIDImage
  ) => {
    for (let i in dataImGet[dressData]) {
      let obj = dataImGet[dressData][i];
      let prevSalwarArr = [];
  
      try {
        prevSalwarArr = prevOrderData[dressData];
      } catch (e) {
        prevSalwarArr = [];
      }
  
      let prevSalwarObj = prevSalwarArr.filter(function (el) {
        return el[dressOrderID] === obj[dressOrderID];
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
  
  const StichedImageToS3Transporter = async (
    dataImGet,
    prevOrderData,
    dressData,
    dressOrderID,
    patternIDName,
    patternIDImage
  ) => {
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
  router.post("/addOrder", async (req, res) => {
    console.log("addOrder");
    var dataImGet = req.body;
  
    var id = await dataImGet["orderID"];
    var mobNo = dataImGet["mobNo"];
    var prevOrderData = [];
    try {
      prevOrderData = (await addOrderSchema.find({ orderID: id }))[0];
    } catch (e) {
      prevOrderData = [];
    }
  
    let foundObjectFullDate = dataImGet["orderDate"];
  
    let newFoundObjectFullDate = new Date(foundObjectFullDate);
  
    console.log(newFoundObjectFullDate);
    console.log(myDate);
  
    if (myDate < newFoundObjectFullDate) {
      console.log(true);
      dataImGet = await imageToS3Transporter(
        dataImGet,
        prevOrderData,
        "salwarData",
        "salwarOrderId",
        "Neck Pattern ID name",
        "Neck Pattern ID image"
      );
      dataImGet = await imageToS3Transporter(
        dataImGet,
        prevOrderData,
        "salwarData",
        "salwarOrderId",
        "Sleeve Pattern ID name",
        "Sleeve Pattern ID image"
      );
      dataImGet = await imageToS3Transporter(
        dataImGet,
        prevOrderData,
        "salwarData",
        "salwarOrderId",
        "dressImageName",
        "dressImage"
      );
      dataImGet = await imageToS3Transporter(
        dataImGet,
        prevOrderData,
        "salwarData",
        "salwarOrderId",
        "stichedDressImageName",
        "stichedDressImage"
      );
  
      dataImGet = await imageToS3Transporter(
        dataImGet,
        prevOrderData,
        "blouseData",
        "blouseOrderId",
        "Neck Pattern ID name",
        "Neck Pattern ID image"
      );
      dataImGet = await imageToS3Transporter( dataImGet, prevOrderData, "blouseData", "blouseOrderId", "Sleeve Pattern ID name", "Sleeve Pattern ID image" );
      dataImGet = await imageToS3Transporter( dataImGet, prevOrderData, "blouseData", "blouseOrderId", "Work Blouse ID name", "Work Blouse ID image" );
      dataImGet = await imageToS3Transporter( dataImGet, prevOrderData, "blouseData", "blouseOrderId", "dressImageName", "dressImage" );
      dataImGet = await imageToS3Transporter( dataImGet, prevOrderData, "blouseData", "blouseOrderId", "stichedDressImageName", "stichedDressImage" );
  
      insertFunction(dataImGet, id, mobNo, res);
    } else {
      console.log(false);
      insertFunction(dataImGet, id, mobNo, res);
    }
  });
router.post("/generateOrderID", async (req, res) => {
    console.log("generateOrderID");

    try {
        await mongoDBConnect(req.body.username)

        let orderIDArray = await orderIDSchema.find({});
        var arr = [];
        var orderId = 0;

        var list = await addOrderSchema.find({}, { orderDate: 0, name: 0, mobNo: 0, deliveryDate: 0, orderStatus: 0, salwarCount: 0, blouseCount: 0, salwarData: 0, blouseData: 0, _id: 0, __v: 0, });
        if (orderIDArray.length === 0) {
            if (list.length !== 0) {
                for (let i in list) {
                    arr.push(list[i].orderID);
                }
                var sortedOrderIds = arr.sort().reverse();
                var lastOrderNo = parseInt(sortedOrderIds[0].match(/\d+$/)[0]);
                if (lastOrderNo < 9) {
                    orderId = "00" + (lastOrderNo + 1);
                } else if (lastOrderNo >= 9 && lastOrderNo < 99) {
                    orderId = "0" + (lastOrderNo + 1);
                } else {
                    orderId = lastOrderNo + 1;
                }
                res.json({ success: true, message: "K" + orderId });
            } else {
                var tempStartNo = 0;
                if (tempStartNo < 9) {
                    orderId = "00" + (tempStartNo + 1);
                } else if (tempStartNo >= 9 && tempStartNo < 100) {
                    orderId = "0" + (tempStartNo + 1);
                } else {
                    orderId = tempStartNo + 1;
                }
                res.json({ success: true, message: "K" + orderId });
            }

            await orderIDSchema.insertMany({ orderID: "K" + orderId });
        } else {
            let tempOrder = orderIDArray[0]["orderID"];
            if (tempOrder.length === 0) {
                {
                    if (list.length !== 0) {
                        for (let i in list) {
                            arr.push(list[i].orderID);
                        }
                        var sortedOrderIds = arr.sort().reverse();
                        var lastOrderNo = parseInt(sortedOrderIds[0].match(/\d+$/)[0]);
                        if (lastOrderNo < 9) {
                            orderId = "00" + (lastOrderNo + 1);
                        } else if (lastOrderNo >= 9 && lastOrderNo < 99) {
                            orderId = "0" + (lastOrderNo + 1);
                        } else {
                            orderId = lastOrderNo + 1;
                        }
                        res.json({ success: true, message: "K" + orderId });
                    } else {
                        var tempStartNo = 0;
                        if (tempStartNo < 9) {
                            orderId = "00" + (tempStartNo + 1);
                        } else if (tempStartNo >= 9 && tempStartNo < 100) {
                            orderId = "0" + (tempStartNo + 1);
                        } else {
                            orderId = tempStartNo + 1;
                        }
                        res.json({ success: true, message: "K" + orderId });
                    }
                    await orderIDSchema.updateOne({}, { $push: { orderID: "K" + orderId } });
                }
            } else {
                var sortedOrderIds = tempOrder.sort().reverse();
                let lastOrderId = parseInt(sortedOrderIds[0].match(/\d+$/)[0]);

                if (lastOrderId < 9) {
                    orderId = "00" + (lastOrderId + 1);
                } else if (lastOrderId >= 9 && lastOrderId < 99) {
                    orderId = "0" + (lastOrderId + 1);
                } else {
                    orderId = lastOrderId + 1;
                }

                res.json({ success: true, message: "K" + orderId });
                await orderIDSchema.updateOne({}, { $push: { orderID: "K" + orderId } });
            }
        }

    } catch (error) {
        console.log("generateOrderIDCatchError");
        return res.json({ success: false, message: error })
    }
});

router.post("/getDesigningTeamOrders", async (req, res) => {
    console.log("getDesigningTeamOrders");
    try {

        await mongoDBConnect(req.body.username)
        var results = await DesignTeamOrderDetails.find({});
        if (results.length !== 0) {

            return res.json({ success: true, message: results });
        }

        return res.json({ success: true, message: [] });
    } catch (error) {
        console.log("getDesigningTeamOrdersCatchError")
        console.log(error)
        return res.json({ success: false, message: "Server Down2" });
    }

});


router.post("/getOrderByStatus", async (req, res) => {

    console.log("getOrderByStatus");

    try {
        await mongoDBConnect(req.body.username)

        var pageNo = req.body.page;
        let size = req.body.size;
        let searchQuery = req.body.searchQuery
        let fieldName = req.body.field

        if (req.body.orderStatus === "All") {
            let getOrderstatusAll = []
            let getOrderstatusAllCount = 0;
            if (searchQuery === "") {
                getOrderstatusAllCount = await addOrderSchema.find({}).count();
                let temp = findSkips(pageNo, size, getOrderstatusAllCount)

                getOrderstatusAll = await addOrderSchema.find({}, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, }).sort({ orderID: 1 }).limit(temp[0]).skip(temp[1]);

            }
            else if (searchQuery !== "") {

                let searchOrderDataFuncResults = await searchOrderDataFunc(pageNo, size, searchQuery, fieldName, {})
                getOrderstatusAll = searchOrderDataFuncResults.results
                getOrderstatusAllCount = searchOrderDataFuncResults.totalOrderCount

            }

            res.json({ success: true, message: getOrderstatusAll, totalOrderCount: getOrderstatusAllCount });



        }
        else if (req.body.orderStatus === "Today's Deliveries" || "Today's Orders" || "Ready" || "Confirmed" || "Processing" || "Delivered" || "Next 10 Days Deliveries") {
            let d = new Date().toISOString();
            var monthNo = d.split("T")[0];

            if (req.body.orderStatus === "Today's Deliveries") {


                let TodayDeliveres = []
                let TodayDeliveresCount = 0

                let concat = "T00:00:00.000+00:00";
                let timeinzero = monthNo + concat;
                if (searchQuery === "") {
                    TodayDeliveresCount = await addOrderSchema.find({ deliveryDate: timeinzero }).count()
                    let temp = findSkips(pageNo, size, TodayDeliveresCount)
                    TodayDeliveres = await addOrderSchema.find({ deliveryDate: timeinzero }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, }).sort({ orderID: 1 }).limit(temp[0]).skip(temp[1]);
                }
                else if (searchQuery !== "") {
                    let searchOrderDataFuncResults = await searchOrderDataFunc(pageNo, size, searchQuery, fieldName, { deliveryDate: timeinzero })
                    TodayDeliveres = searchOrderDataFuncResults.results
                    TodayDeliveresCount = searchOrderDataFuncResults.totalOrderCount
                }


                res.json({ success: true, message: TodayDeliveres, totalOrderCount: TodayDeliveresCount });
            }


            else if (req.body.orderStatus === "Next 10 Days Deliveries") {

                let nextTenDaysOrdersCount = 0
                let nextTenDaysOrders = []
                if (searchQuery === "") {
                    nextTenDaysOrdersCount = await addOrderSchema.find({ deliveryDate: { $gte: todayDate, $lte: nextTenDays } }).sort({ deliveryDate: 1 }).count();
                    let temp = findSkips(pageNo, size, nextTenDaysOrdersCount)
                    nextTenDaysOrders = await addOrderSchema.find({ deliveryDate: { $gte: todayDate, $lte: nextTenDays } }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, }).sort({ deliveryDate: 1, orderID: 1 }).limit(temp[0]).skip(temp[1]);
                }
                else if (searchQuery !== "") {
                    let searchOrderDataFuncResults = await searchOrderDataFunc(pageNo, size, searchQuery, fieldName, { deliveryDate: { $gte: todayDate, $lte: nextTenDays } })
                    nextTenDaysOrders = searchOrderDataFuncResults.results
                    nextTenDaysOrdersCount = searchOrderDataFuncResults.totalOrderCount
                }

                res.json({ success: true, message: nextTenDaysOrders, totalOrderCount: nextTenDaysOrdersCount });
            }


            else if (req.body.orderStatus === "Today's Orders") {
                let TodayOrdersCount = 0;
                let TodayOrders = []

                let gte = monthNo + "T00:00:00.000+00:00";
                let lt = monthNo + "T23:59:59.999+00:00";
                if (searchQuery === "") {
                    TodayOrdersCount = await addOrderSchema.find({ orderDate: { $gte: gte, $lt: lt } }).count();
                    let temp = findSkips(pageNo, size, TodayOrdersCount)
                    TodayOrders = await addOrderSchema.find({ orderDate: { $gte: gte, $lt: lt } }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, }).sort({ orderID: 1 }).limit(temp[0]).skip(temp[1]);
                }
                else if (searchQuery !== "") {
                    let searchOrderDataFuncResults = await searchOrderDataFunc(pageNo, size, searchQuery, fieldName, { orderDate: { $gte: gte, $lt: lt } })
                    TodayOrders = searchOrderDataFuncResults.results
                    TodayOrdersCount = searchOrderDataFuncResults.totalOrderCount
                }
                res.json({ success: true, message: TodayOrders, totalOrderCount: TodayOrdersCount });
            }


            else if (req.body.orderStatus === "Assigned Orders") {

                let assignedOrdersIDList = await DesignTeamOrderDetails.find({});
                if (assignedOrdersIDList.length !== 0) {
                    let assignID = assignedOrdersIDList[0].designTeamOrderIDs;
                    let reverseAssignID = assignID.sort().reverse()

                    let assignOrders = [];
                    let temp = []
                    let out1 = pageNo * size === size ? 0 : (pageNo * size) - size
                    let out2 = pageNo * size === size ? size : (pageNo * size)
                    let totalOrderCount = 0


                    if (searchQuery === "") {
                        let sliceArr = reverseAssignID.slice(out1, out2)
                        for (let i in sliceArr) {
                            temp = await addOrderSchema.find({ orderID: sliceArr[i] }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });
                            assignOrders.push(temp[0]);
                        }
                        totalOrderCount = reverseAssignID.length
                    }
                    else if (searchQuery !== "") {

                        for (let i in assignID) {
                            temp = await addOrderSchema.find({ orderID: assignID[i] }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });
                            assignOrders.push(temp[0]);
                        }

                        const isNumeric = (value) => {
                            return /^-?\d+$/.test(value);
                        }


                        const filteredRows = assignOrders.filter((row) => {
                            if (isNumeric(searchQuery)) {
                                return row.mobNo.toLowerCase().includes(searchQuery.toLowerCase());
                            }
                            else if (searchQuery.toLowerCase()[0] === "k" && isNumeric(searchQuery[1])) {
                                return row.orderID.toLowerCase().includes(searchQuery.toLowerCase());
                            }
                            else {
                                return row.name.toLowerCase().includes(searchQuery.toLowerCase());
                            }
                        });

                        assignOrders = filteredRows

                        totalOrderCount = filteredRows.length

                    }

                    res.json({ success: true, message: assignOrders, totalOrderCount: totalOrderCount });
                } else {
                    res.json({ success: true, message: [] });
                }
            }


            else if (req.body.orderStatus === "Ready" || "Confirmed" || "Processing" || "Delivered") {
                let getOrderstatusCount = 0
                let getOrderstatus = []
                if (searchQuery === "") {
                    getOrderstatusCount = await addOrderSchema.find({ orderStatus: req.body.orderStatus }).count();
                    let temp = findSkips(pageNo, size, getOrderstatusCount)
                    getOrderstatus = await addOrderSchema.find({ orderStatus: req.body.orderStatus }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, }).sort({ orderID: 1 }).limit(temp[0]).skip(temp[1]);
                }
                else if (searchQuery !== "") {
                    let searchOrderDataFuncResults = await searchOrderDataFunc(pageNo, size, searchQuery, fieldName, { orderStatus: req.body.orderStatus })
                    getOrderstatus = searchOrderDataFuncResults.results
                    getOrderstatusCount = searchOrderDataFuncResults.totalOrderCount
                }
                res.json({ success: true, message: getOrderstatus, totalOrderCount: getOrderstatusCount });
            }


            else {
                res.json({ success: false, message: [] });
            }
        }
    } catch (error) {
        console.log("getOrderByStatusCatchError" );

        return res.json({ success: false, message: error });
    }
});

router.post("/removeOrderID", async (req, res) => {
    console.log("removeOrderID");
    try {
        await mongoDBConnect(req.body.username)

        let item = req.body.orderID;

        await orderIDSchema.updateOne({}, { $pull: { orderID: item } });
        let orderIDArray = await orderIDSchema.find({});
        let tempOrder = orderIDArray[0]["orderID"];
        res.json({ success: true, message: tempOrder });
    } catch (error) {
        console.log("removeOrderIDCatchError");
        return res.json({ success: false, message: error })
    }
});

router.post("/addDesigningTeamOrders", async (req, res) => {
    console.log("addDesigningTeamOrders");
    await mongoDBConnect(req.body.username)
    const postPerson = await new DesignTeamOrderDetails({ designTeamOrderIDs: req.body.designTeamOrderIDs, });
    try {
        var results = await DesignTeamOrderDetails.remove({}, async function (err, docs) {
            const savePersons = postPerson.save();
            return res.json({ success: true, message: "DesignTeamOrderAdded" });
        }
        );
    } catch (error) {
        console.log("addDesigningTeamOrdersCatchError");
        return res.json({ success: false, message: error });
    }
});

router.post("/getOrderData", async (req, res) => {
    console.log("getOrderData");
    try {
        await mongoDBConnect(req.body.username)
        var orderId = req.body.orderID;
        var no = req.body.cusMobNo;
        var foundObject = await addOrderSchema.findOne({ orderID: orderId, mobNo: no }).lean();
        let foundObjectFullDate = foundObject["orderDate"];
        if (myDate < foundObjectFullDate) {


            foundObject = await viewImageInS3(foundObject, "salwarData", "Neck Pattern ID image");
            foundObject = await viewImageInS3(foundObject, "salwarData", "Sleeve Pattern ID image");
            foundObject = await viewImageInS3(foundObject, "salwarData", "dressImage");
            foundObject = await viewImageInS3(foundObject, "salwarData", "stichedDressImage");
            foundObject = await viewImageInS3(foundObject, "blouseData", "Neck Pattern ID image");
            foundObject = await viewImageInS3(foundObject, "blouseData", "Sleeve Pattern ID image");
            foundObject = await viewImageInS3(foundObject, "blouseData", "Work Blouse ID image");
            foundObject = await viewImageInS3(foundObject, "blouseData", "dressImage");
            foundObject = await viewImageInS3(foundObject, "blouseData", "stichedDressImage");

            var results = await CustomerSchema.findOne({ cusMobNo: req.body.cusMobNo }, { _v: 0, _id: 0 }).lean();

            var orderlist = await addOrderSchema.find({ mobNo: results.cusMobNo });
            let temp = personNames(orderlist);
            let salwarPersonObj = temp[0];
            let blousePersonObj = temp[1];
            let shirtPersonObj = temp[2];
            let pantPersonObj = temp[3];

            var meregeObj = Object.assign(salwarPersonObj, foundObject, blousePersonObj, shirtPersonObj, pantPersonObj);

            return res.json({ success: true, message: meregeObj });
        } else {
            console.log(false);
            var results = await CustomerSchema.findOne({ cusMobNo: req.body.cusMobNo }, { _v: 0, _id: 0 }).lean();
            var orderlist = await addOrderSchema.find({ mobNo: results.cusMobNo });
            let temp = personNames(orderlist);
            let salwarPersonObj = temp[0];
            let blousePersonObj = temp[1];
            let shirtPersonObj = temp[2];
            let pantPersonObj = temp[3];
            var meregeObj = Object.assign(salwarPersonObj, foundObject, blousePersonObj, shirtPersonObj, pantPersonObj);
            return res.json({ success: true, message: meregeObj });
        }
    } catch (error) {
        console.log("getOrderDataCatchError");
        return res.json({ success: false, message: error });

    }
});



router.post("/getMultiOrderIdData", async (req, res) => {
    console.log("getMultiOrderIdData");

    try {
        await mongoDBConnect(req.body.username)

        var orderIds = (req.body.orderID)

        var pageNo = req.body.page
        var size = req.body.size

        var multiOrderIdDataCount = await addOrderSchema.find({ orderID: { $in: orderIds } }).count();
        let dataSkips = findSkips(pageNo, size, multiOrderIdDataCount)

        var multiOrderIdData = await addOrderSchema.find({ orderID: { $in: orderIds } }, { salwarData: 0, blouseData: 0, __v: 0, _id: 0, gst: 0 }).sort({ orderID: 1 }).limit(dataSkips[0]).skip(dataSkips[1]);

        return res.json({ success: true, message: multiOrderIdData, totalOrderCount: multiOrderIdDataCount });


    } catch (error) {
        console.log("getMultiOrderIdDataCatchError");
        return res.json({ success: false, message: error });

    }

});



router.post("/getOrderByStatusForExcelFile", async (req, res) => {
    console.log("getOrderByStatus");
    try {
        await mongoDBConnect(req.body.username)

        if (req.body.orderStatus === "All") {
            var getOrderstatusAll = await addOrderSchema.find({}, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });
            res.json({ success: false, message: getOrderstatusAll });
        } else if (req.body.orderStatus === "Today's Deliveries" || "Today's Orders" || "Ready" || "Confirmed" || "Processing" || "Delivered" || "Next 10 Days Deliveries") {
            let d = new Date().toISOString();
            var monthNo = d.split("T")[0];
            if (req.body.orderStatus === "Today's Deliveries") {

                let concat = "T00:00:00.000+00:00";
                let timeinzero = monthNo + concat;
                var TodayDeliveres = await addOrderSchema.find({ deliveryDate: timeinzero }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });
                res.json({ success: true, message: TodayDeliveres });
            } else if (req.body.orderStatus === "Next 10 Days Deliveries") {
                var nextTenDaysOrders = await addOrderSchema.find({ deliveryDate: { $gte: todayDate, $lte: nextTenDays } }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, }).sort({ deliveryDate: 1 });
                res.json({ success: true, message: nextTenDaysOrders });
            } else if (req.body.orderStatus === "Today's Orders") {
                let gte = monthNo + "T00:00:00.000+00:00";
                let lt = monthNo + "T23:59:59.999+00:00";
                var TodayOrders = await addOrderSchema.find({ orderDate: { $gte: gte, $lt: lt } }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });
                res.json({ success: true, message: TodayOrders });
            } else if (req.body.orderStatus === "Assigned Orders") {
                let assignedOrdersIDList = await DesignTeamOrderDetails.find({});
                if (assignedOrdersIDList.length !== 0) {
                    let assignID = assignedOrdersIDList[0].designTeamOrderIDs;
                    let assignOrders = [];

                    for (let i in assignID) {
                        let temp = await addOrderSchema.find({ orderID: assignID[i] }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });
                        assignOrders.push(temp[0]);
                    }
                    res.json({ success: true, message: assignOrders });
                } else {
                    res.json({ success: true, message: [] });
                }
            } else if (
                req.body.orderStatus === "Ready" ||
                "Confirmed" ||
                "Processing" ||
                "Delivered"
            ) {
                var getOrderstatus = await addOrderSchema.find(
                    { orderStatus: req.body.orderStatus },
                    {
                        _id: 0,
                        salwarData: 0,
                        blouseData: 0,
                        shirtData: 0,
                        pantData: 0,
                        __v: 0,
                    }
                );
                res.json({ success: true, message: getOrderstatus });
            } else {
                res.json({ success: false, message: [] });
            }
        }
    } catch (error) {
        console.log("getOrderByStatusCatchError");
        return res.json({ success: false, message: error })
    }
});

router.post("/removeOrderData", async (req, res) => {
    console.log("removeOrderData");

    try {
        await mongoDBConnect(req.body.username)


        var orderId = req.body.orderID;

        await orderIDSchema.updateOne({}, { $pull: { orderID: orderId } });
        var no = req.body.cusMobNo;
        var foundObject = await addOrderSchema.deleteOne({ orderID: orderId, mobNo: no, });

        const result = s3Methods.deleteAllFile(orderId + "/");
        res.json({ success: true, message: result });

    } catch (error) {
        console.log("removeOrderDataCatchError");

        return res.json({ success: false, message: error });

    }
});






router.post("/getMeasurementDataForPerson", async (req, res) => {
    console.log("getMeasurementDataForPerson");

    try {
        await mongoDBConnect(req.body.username)

        const specificCustomerData = await addOrderSchema.find({ mobNo: req.body.mobNo }).sort({ date: -1 });

        let haveItemsSalwar = ["Shoulder Size", "Shoulder Width", "Breast Circum", "Breast Size", "Hip", "Waist", "Arm Hole", "Arm Length", "Arm Circum", "Neck F", "Neck B", "Full Length", "Ankle", "Pant Length", "Side Slit",];
        let haveItemsBlouse = ["Shoulder Size", "Shoulder Width", "Breast Circum", "Breast Size", "Hip", "Waist", "Arm Hole", "Arm Length", "Arm Circum", "Neck F", "Neck B", "Full Length", "Back Length",];

        var haveItemsShirt = ["Shirt Length", "Shoulder", "Sleeve Length", "Sleeve Open", "Chest Width", "Collar Length", "Pocket Down",];
        var haveItemsPant = ["Pant Length", "Hip", "Inseam", "Seat", "Thigh Loose", "Knee", "Front Raise", "Back Raise", "Leg Opening",];

        let salwarData = {};
        let blouseData = {};
        let shirtData = {};
        let pantData = {};

        for (let i in specificCustomerData) {
            let sd = specificCustomerData[i]["salwarData"];

            console.log(sd);
            let filteredNameData = sd.filter(function (el) {
                return el.personName === req.body.personName;
            });

            for (let j in sd) {
                if (sd[j]["personName"] === req.body.personName) {
                    for (const key of Object.keys(sd[j])) {
                        if (!haveItemsSalwar.includes(key)) {
                            delete sd[j][key];
                        }
                    }
                    salwarData = sd[j];
                }
            }

            let bd = specificCustomerData[i]["blouseData"];
            for (let k in bd) {
                if (bd[k]["personName"] === req.body.personName) {
                    for (const key of Object.keys(bd[k])) {
                        if (!haveItemsBlouse.includes(key)) {
                            delete bd[k][key];
                        }
                    }
                    blouseData = bd[k];
                }
            }

            let shd = specificCustomerData[i]["shirtData"];
            for (let q in shd) {
                if (shd[q]["personName"] === req.body.personName) {
                    for (const key of Object.keys(shd[q])) {
                        if (!haveItemsShirt.includes(key)) {
                            delete shd[q][key];
                        }
                    }
                    shirtData = shd[k];
                }
            }

            let pd = specificCustomerData[i]["pantData"];
            for (let w in pd) {
                if (pd[w]["personName"] === req.body.personName) {
                    for (const key of Object.keys(pd[w])) {
                        if (!haveItemsPant.includes(key)) {
                            delete pd[w][key];
                        }
                    }
                    pantData = pd[w];
                }
            }
        }
        var salwarDatas = { ["salwarData"]: salwarData };
        var blouseDatas = { ["blouseData"]: blouseData };

        var shirtDatas = { ["shirtData"]: shirtData };
        var pantDatas = { ["pantData"]: pantData };

        var personName = { ["personName"]: req.body.personName };
        var mobileNo = { ["mobNo"]: req.body.mobNo };
        var meregeObj = Object.assign(salwarDatas, blouseDatas, shirtDatas, pantDatas, personName, mobileNo);
        // console.log(meregeObj)
        return res.json({ success: true, message: meregeObj });
    } catch (error) {
        console.log("getMeasurementDataForPersonCatchError");
        return res.json({ success: true, message: error });
    }

});


router.post("/getDeliveryDateData", async (req, res) => {
    console.log("getDeliveryDateData");
    var deliveryDate = req.body.deliveryDate;
    if (req.body.user === "admin") {
      var multiOrderIdDataInDate = await addOrderSchema.find({ deliveryDate: deliveryDate }, { salwarData: 0, blouseData: 0, __v: 0, _id: 0, gst: 0 });
      res.json({ success: true, message: multiOrderIdDataInDate });
    }
  });
  
  
  
  router.post("/allOrderData", async (req, res) => {
    console.log("allOrderData");
    if (req.body.user === "admin") {
      var list = await addOrderSchema.find({}, { _id: 0, __v: 0 });
      res.json({ success: true, message: list });
    } else {
      res.json({ success: false, message: "No Data" });
    }
  });
  
  router.post("/getMeasurement", async (req, res) => {
    console.log("getMeasurement");
    if (req.body.user === "admin") {
      var data = await addOrderSchema.findOne(
        {},
        {
          "salwarData.Shoulder Width": 1,
          "Breast Circum": 1,
          "salwarData.Breast Size": 1,
          "salwarData.Hip": 1,
          "salwarData.Waist": 1,
          "salwarData.Arm Hole": 1,
          "salwarData.Arm Length": 1,
          "salwarData.Arm Circum": 1,
          "salwarData.Neck F": 1,
          "salwarData.Neck B": 1,
          "salwarData.Full Length": 1,
          _id: 0,
        }
      );
      res.json({ success: true, message: data });
    }
  });
  
  
  router.post("/getSalwarORBlouseId", async (req, res) => {
    console.log("getSalwarORBlouseId");
    if (req.body.user === "admin") {
      if (req.body.dress === "salwar") {
        let salwarIdData = await salwarSchema.find({ salwarId: req.body.rateId });
        return res.json({ success: "true", message: salwarIdData });
      } else if (req.body.dress === "blouse") {
        let blouseIdData = await blouseSchema.find({ blouseId: req.body.rateId });
        return res.json({ success: "true", message: blouseIdData });
      } else if (req.body.dress === "shirt") {
        let shirtIdData = await shirtSchema.find({ shirtId: req.body.rateId });
        return res.json({ success: "true", message: shirtIdData });
      } else if (req.body.dress === "pant") {
        let pantIdData = await pantSchema.find({ pantId: req.body.rateId });
        return res.json({ success: "true", message: pantIdData });
      }
    }
  });

  router.post("/getOrderId", async (req, res) => {
    console.log("getOrderId");
    var cusId = req.body.cusId;
    var cusMobNo = req.body.cusMobNo;
    var cusOrderId = await CustomerSchema.find({
      $and: [{ cusMobNo: cusMobNo }, { cusId: cusId }],
    });
    if (cusOrderId.length === 0) {
      res.json({ success: false, message: "Customer Data Not Found" });
    } else {
      var customerDet = await addOrderSchema.find( { mobNo: cusMobNo }, { salwarData: 0, blouseData: 0, __v: 0, _id: 0, gst: 0, orderDate: 0, name: 0, mobNo: 0, deliveryDate: 0, orderStatus: 0, salwarCount: 0, finalAmount: 0, blouseCount: 0, } );
      var arr = [];
      for (let i = 0; i < customerDet.length; i++) {
        arr.push(customerDet[i]["orderID"]);
      }
      res.json({ success: true, message: arr });
    }
  });


export default router



