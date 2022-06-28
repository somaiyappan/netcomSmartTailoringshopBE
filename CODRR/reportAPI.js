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


router.post("/fromtodate", async (req, res) => {
    console.log("fromtodate");
    try {
        await mongoDBConnect(req.body.username)

        var fromDate = req.body.fromDate;
        var toDate = req.body.toDate;
        var fromToDate = await addOrderSchema.find({ orderDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { salwarData: 0, blouseData: 0, _id: 0, orderID: 0, name: 0, mobNo: 0, deliveryDate: 0, orderStatus: 0, gst: 0, __v: 0, });

        let TodayCustomer = await CustomerSchema.find({ cusDate: { $gte: new Date(fromDate), $lt: new Date(toDate) } }, { cusName: 0, _id: 0, cusEmail: 0, cusMobNo: 0, cusAddress: 0, cusId: 0, cusColor: 0, __v: 0, });
        // customer joined date

        var arrCus = [];

        TodayCustomer.map((text) => {
            var textValue = (textValue = text.cusDate.toISOString()); //get value and convert into string
            var spiltValue = (spiltValue = textValue.split("T")[0]); //split value

            var datePart = spiltValue.match(/\d+/g),
                year = datePart[0],
                month = datePart[1],
                day = datePart[2];
            var ddmmyyyy = day + "/" + month + "/" + year;
            arrCus.push(ddmmyyyy);
        });

        const occurrences = arrCus.reduce(function (acc, curr) {
            //using func calcu same date of count 15/02/2022 : 02
            return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {});

        var arrOfCustomer = [];
        var customerObj = {};
        var objKeys = Object.keys(occurrences);
        var objValues = Object.values(occurrences);

        objKeys.some((data, index) => {
            //creating array of objects
            customerObj.dailyDate = objKeys[index];
            customerObj.customerCount = objValues[index];

            arrOfCustomer.push(customerObj);
            customerObj = {};
        });

        var sumarr = objValues.reduce((a, b) => a + b, 0); //sum of array

        var TotalObj = { dailyDate: "Total", customerCount: sumarr };

        arrOfCustomer.push(TotalObj);

        var op = {};
        var arr = [];
        for (let i = 0; i < fromToDate.length; i++) {
            var date = new Date(fromToDate[i].orderDate).toISOString();

            var monthNo = date.split("T")[0];
            var datePart = monthNo.match(/\d+/g),
                year = datePart[0],
                month = datePart[1],
                day = datePart[2];
            var ddmmyyyy = day + "/" + month + "/" + year;
            var salwarCountNo = fromToDate[i].salwarCount;
            var blouseCountNo = fromToDate[i].blouseCount;
            var grandTotal = fromToDate[i].grandTotal;

            op["dailyDate"] = ddmmyyyy;
            op["salwarCount"] = salwarCountNo;
            op["blouseCount"] = blouseCountNo;
            op["grandTotal"] = grandTotal;

            arr.push(op);
            op = {};
        }
        let obj = {};

        arr.forEach((item) => {
            if (obj[item.dailyDate]) {
                obj[item.dailyDate].salwarCount =
                    obj[item.dailyDate].salwarCount + item.salwarCount;
                obj[item.dailyDate].blouseCount =
                    obj[item.dailyDate].blouseCount + item.blouseCount;
                obj[item.dailyDate].grandTotal =
                    obj[item.dailyDate].grandTotal + item.grandTotal;
            } else {
                obj[item.dailyDate] = item;
            }
        });
        let valuesArr = Object.values(obj);

        if (valuesArr.length === 1) {
            var val = {
                dailyDate: "Total",
                salwarCount: valuesArr[0]["salwarCount"],
                blouseCount: valuesArr[0]["blouseCount"],
                grandTotal: valuesArr[0]["grandTotal"],
            };

            valuesArr.push(val);
        } else if (valuesArr.length === 0) {
            valuesArr = [];
        } else {
            var val = valuesArr.reduce(function (previousValue, currentValue) {
                return {
                    dailyDate: "Total",
                    salwarCount: previousValue.salwarCount + currentValue.salwarCount,
                    blouseCount: previousValue.blouseCount + currentValue.blouseCount,
                    grandTotal: previousValue.grandTotal + currentValue.grandTotal,
                };
            });
            valuesArr.push(val);
        }

        return res.json({ success: true, message: valuesArr, customerReportData: arrOfCustomer });

    } catch (error) {
        console.log("fromtodateCatchError")
        return res.json({ success: false, message: error })
    }


});

export default router