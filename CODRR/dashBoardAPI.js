import express from "express";

import CustomerSchema from "../schema/CustomerSchema.js";
import addOrderSchema from "../schema/addOrderSchema.js";
import DesignTeamOrderDetails from "../schema/DesignTeamOrderSchema.js";


import mongoDBConnect from "../commonJSFile/mongoDBConnect.js"
import jwtTokenVerifyFile from "../commonJSFile/jwtTokenVerify.js"





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

router.post("/dashBoard", async (req, res) => {
  console.log("dashBoard");



  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        let customerCount = await CustomerSchema.find({});
        let orderCount = await addOrderSchema.find({});
        let confirmOrderCount = await addOrderSchema.find({ orderStatus: "Confirmed", });
        let processingOrderCount = await addOrderSchema.find({ orderStatus: "Processing", });
        let readyOrderCount = await addOrderSchema.find({ orderStatus: "Ready" });
        let deliveredOrderCount = await addOrderSchema.find({ orderStatus: "Delivered", });
        let assignedOrder = await DesignTeamOrderDetails.find({});
        let salwarBlouseValues = await addOrderSchema.find({}, { salwarCount: 1, blouseCount: 1 });

        //adding in array of objects. objects value
        let salwarCounts = salwarBlouseValues.reduce((acc, curr) => acc + curr.salwarCount, 0);
        let blouseCounts = salwarBlouseValues.reduce((acc, curr) => acc + curr.blouseCount, 0);

        let d = new Date().toISOString();
        var monthNo = d.split("T")[0];

        let gte = "T00:00:00.000+00:00";
        let timeinzero = monthNo + gte;

        var TodayDeliveries = await addOrderSchema.find({ deliveryDate: timeinzero, });

        let gteq = monthNo + "T00:00:00.000+00:00";
        let lt = monthNo + "T23:59:59.999+00:00";
        var TodayOrders = await addOrderSchema.find({ orderDate: { $gte: gteq, $lt: lt } }, { _id: 0, salwarData: 0, blouseData: 0, shirtData: 0, pantData: 0, __v: 0, });

        let TodayCustomer = await CustomerSchema.find({ cusDate: { $gte: gteq, $lt: lt }, });


        let BlouseToday = await addOrderSchema.find({ orderDate: { $gte: gteq, $lt: lt } }, { blouseCount: 1 });
        let BlouseTodayCounts = BlouseToday.reduce((acc, curr) => acc + curr.blouseCount, 0);

        let salwarToday = await addOrderSchema.find({ orderDate: { $gte: gteq, $lt: lt } }, { salwarCount: 1 });
        let salwarTodayCounts = salwarToday.reduce((acc, curr) => acc + curr.salwarCount, 0);
        try {
          if (assignedOrder.length !== 0) {
            var assignID = assignedOrder[0].designTeamOrderIDs;
          } else {
            var assignID = [];
          }
        } catch (err) {
          console.log(err);
        }


        var count = {
          "All Customers": customerCount.length,
          "All Orders": orderCount.length,
          "Confirmed Orders": confirmOrderCount.length,
          "Processing Orders": processingOrderCount.length,
          "Ready Orders": readyOrderCount.length,
          "Delivered Orders": deliveredOrderCount.length,
          "Assigned Orders": assignID.length,
          Salwar: salwarCounts,
          Blouse: blouseCounts,
          "Today's Orders": TodayOrders.length,
          "Today's Deliveries": TodayDeliveries.length,
          "New Customers Today": TodayCustomer.length,
          "Salwar Ordered Today": salwarTodayCounts,
          "Blouse Ordered Today": BlouseTodayCounts,
        };


        return res.json({ success: "true", message: count });
      } catch (error) {
        console.log("dashBoardCatchError" + error)
        return res.json({ success: false, message: error });
      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }

});

router.post("/getYearBasedChartData", async (req, res) => {
  console.log("getYearBasedChartData");

  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)

        let monthyearOrder = [];
        let year = req.body.year;
        let monthCustomer = [];
        for (let i = 0; i <= 11; i++) {
          let getOrdersMonth = await addOrderSchema.find({ orderDate: { $gte: new Date(year, i, 1), $lt: new Date(year, i + 1, 1), }, });
          let getCustomerMonth = await CustomerSchema.find({ cusDate: { $gte: new Date(year, i, 1), $lt: new Date(year, i + 1, 1) }, });
          monthyearOrder.push(getOrdersMonth.length);
          monthCustomer.push(getCustomerMonth.length);
        }
        let msg = {
          countOrder: monthyearOrder,
          countCustomer: monthCustomer,
          year: year,
        };
        return res.json({ success: "true", message: msg });
      } catch (error) {
        console.log("getYearBasedChartDataCatchError")
        return res.json({ success: false, message: error });
      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }


});

export default router