import express from "express";
import generateUniqueId from "generate-unique-id";
import salwarSchema from "../schema/salwarSchema.js";
import blouseSchema from "../schema/blouseSchema.js";
import shirtSchema from "../schema/shirtSchema.js";
import pantSchema from "../schema/pantSchema.js";


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


router.post("/insertSalwarCost", async (req, res) => {


    try {
        let tokenData = jwtTokenVerifyFile(req.headers.authorization);

        if (tokenData === "") {
            return res.json({ success: false, message: "Invalid Token" });
        }
        else {

            console.log("TOken verifed Success")
            try {
                await mongoDBConnect(req.body.username)
                const randomNumber = "sal" + generateUniqueId({ length: 4, useLetters: false });
                const date = new Date();
                var insertSalwar = await salwarSchema.insertMany({ dateTime: date, salwarId: randomNumber, salwarCost: req.body.salwarCost, });
                return res.json({ success: true, message: insertSalwar });

            } catch (error) {
                console.log("insertSalwarCostCatchError");
                return res.json({ success: false, message: error });
            }


        }

    } catch (error) {
        console.log(error + "catchToken")
        return res.json({ success: false, message: "Catch Error" });
    }



});

router.post("/insertBlouseCost", async (req, res) => {
    console.log("insertBlouseCost");

    try {
        let tokenData = jwtTokenVerifyFile(req.headers.authorization);

        if (tokenData === "") {
            return res.json({ success: false, message: "Invalid Token" });
        }
        else {

            console.log("TOken verifed Success")
            try {
                await mongoDBConnect(req.body.username)
                const randomNumber = "blo" + generateUniqueId({ length: 4, useLetters: false });
                const date = new Date();
                var insertBlouse = await blouseSchema.insertMany({ dateTime: date, blouseId: randomNumber, blouseCost: req.body.blouseCost, });
                return res.json({ success: "true", message: insertBlouse });
            } catch (error) {
                console.log("insertBlouseCostCatchError");
                return res.json({ success: false, message: error });
            }


        }

    } catch (error) {
        console.log(error + "catchToken")
        return res.json({ success: false, message: "Catch Error" });
    }

});

router.post("/insertShirtCost", async (req, res) => {
    console.log("insertShirtCost");

    try {
        let tokenData = jwtTokenVerifyFile(req.headers.authorization);

        if (tokenData === "") {
            return res.json({ success: false, message: "Invalid Token" });
        }
        else {

            console.log("TOken verifed Success")
            try {
                await mongoDBConnect(req.body.username)
                const randomNumber = "shi" + generateUniqueId({ length: 4, useLetters: false });
                const date = new Date();
                console.log(date);
                var insertShirt = await shirtSchema.insertMany({ dateTime: date, shirtId: randomNumber, shirtCost: req.body.shirtCost, });
                return res.json({ success: "true", message: insertShirt });
            } catch (error) {
                console.log("insertShirtCostCatchError");
                return res.json({ success: false, message: error });
            }


        }

    } catch (error) {
        console.log(error + "catchToken")
        return res.json({ success: false, message: "Catch Error" });
    }

});

router.post("/insertPantCost", async (req, res) => {
    console.log("insertPantCost");

    try {
        let tokenData = jwtTokenVerifyFile(req.headers.authorization);

        if (tokenData === "") {
            return res.json({ success: false, message: "Invalid Token" });
        }
        else {

            console.log("TOken verifed Success")
            try {
                await mongoDBConnect(req.body.username)
                const randomNumber = "pan" + generateUniqueId({ length: 4, useLetters: false });
                const date = new Date();
                var insertPant = await pantSchema.insertMany({ dateTime: date, pantId: randomNumber, pantCost: req.body.pantCost, });
                return res.json({ success: "true", message: insertPant });
            } catch (error) {
                console.log("insertPantCostCatchError");
                return res.json({ success: false, message: error });
            }


        }

    } catch (error) {
        console.log(error + "catchToken")
        return res.json({ success: false, message: "Catch Error" });
    }



});


router.post("/viewBlouseSalwarLastInsert", async (req, res) => {
    console.log("viewBlouseSalwarLastInsert");

    try {
        let tokenData = jwtTokenVerifyFile(req.headers.authorization);

        if (tokenData === "") {
            return res.json({ success: false, message: "Invalid Token" });
        }
        else {

            console.log("TOken verifed Success")
            try {
                await mongoDBConnect(req.body.username)
                let lastUpdateSalwar = await salwarSchema.find({}, { _id: 0, __v: 0 }).sort({ _id: -1 }).limit(1);
                let lastUpdateBlouse = await blouseSchema.find({}, { _id: 0, __v: 0 }).sort({ _id: -1 }).limit(1);
                let lastUpdateShirt = await shirtSchema.find({}, { _id: 0, __v: 0 }).sort({ _id: -1 }).limit(1);
                let lastUpdatePant = await pantSchema.find({}, { _id: 0, __v: 0 }).sort({ _id: -1 }).limit(1);
                let salwarBlouseShirtPantRateArray = [...lastUpdateSalwar, ...lastUpdateBlouse, ...lastUpdateShirt, ...lastUpdatePant,]
                return res.json({ success: "true", message: salwarBlouseShirtPantRateArray })
            } catch (error) {
                console.log("viewBlouseSalwarLastInsertCatchError");
                return res.json({ success: false, message: error });
            }


        }

    } catch (error) {
        console.log(error + "catchToken")
        return res.json({ success: false, message: "Catch Error" });
    }

});

export default router