
import express from "express";
import mongoose from "mongoose"
import generateUniqueId from "generate-unique-id";
import randomColor from "randomcolor";

import CustomerSchema from "../schema/CustomerSchema.js";
import EmployeeSchema from "../schema/employeeAddSchema.js";

import addOrderSchema from "../schema/addOrderSchema.js";
import mongoDBConnect from "../commonJSFile/mongoDBConnect.js"
import personNames from "../commonJSFile/personNames.js";
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



router.post("/addEmployeeData", async (req, res) => {

  console.log("addEmployeeData");

 
      try {
        let tokenData = jwtTokenVerifyFile(req.headers.authorization);

        if (tokenData === "") {
          return res.json({ success: false, message: "Invalid Token" });
        }
        else {
          console.log("TOken verifed Success")
          try {
            await mongoDBConnect(req.body.username)

            var ShopName = req.body.username
            var firstThreeLetterShopName= ShopName.slice(0, 3).toUpperCase()
            let reqData = req.body
            console.log(reqData)
            const id = generateUniqueId({ length: 4, useLetters: false, });
            var employeeId = firstThreeLetterShopName+"-"+"EMP-" + id;
            const color = randomColor({ luminosity: "bright", format: "rgb", });
            let currentdate = new Date().toISOString();
            const employeeAdd = await new EmployeeSchema({ empId: employeeId, empDate: currentdate, empName: req.body.empName,  empMobNo: req.body.empMobNo,empEmail: req.body.empEmail, empSalary:req.body.empSalary, empAddress: req.body.empAddress, cusColor: color, });
            try {
              var results = await EmployeeSchema.find({ empMobNo: req.body.empMobNo })
              if (results.length != 0) {
                return res.json({ success: "false", message: "UserExists" });
              } else {
                employeeAdd.save();
                return res.json({ success: "true", message: "RegistrationSuccess" });
              }
            } catch (e) {
              console.log("cat" + e)
              return res.json({ 'success': false, message: 'Server Down' })
            }
          } catch (error) {
            console.log("addEmployeeDataCatcherror")
            return res.json({ 'success': false, message: error })
          }
        }



      } catch (error) {
        console.log(error + "catchToken")
        return res.json({ success: false, message: "Catch Error" });
      }

    
  

});

router.post("/getAllEmployeeData", async (req, res) => {
    console.log("getAllEmployeeData");
  
    try {
      let tokenData = jwtTokenVerifyFile(req.headers.authorization);
  
      if (tokenData === "") {
        return res.json({ success: false, message: "Invalid Token" });
      }
      else {
  
        console.log("TOken verifed Success")
        try {
  
          await mongoDBConnect(req.body.username)
  
          var pageNo = req.body.page;
          let size = req.body.size;
  
          var result2 = 0;
          for (let i = 1; i <= pageNo; i++) {
            result2 = i * size;
          }
          var totalEmployeeCount = await EmployeeSchema.count();
  
          var skips = totalEmployeeCount - result2;
  
          if (skips <= 0) {
            size = size + skips;
            skips = 0;
          }
  
          var results = []
  
          if (req.body.searchQuery === "") {
            results = await EmployeeSchema.find({}, { _id: 0, __v: 0 }).limit(size).skip(skips).lean();
          }
          else if (req.body.searchQuery !== "") {
  
            var fieldName = req.body.field
            var searchValue = '\\b' + req.body.searchQuery + '[a-zA-Z0-9]*'
  
  
            if (pageNo > 1) {
              var newSkips = 0;
              newSkips = ((pageNo) - 1) * size
              results = await EmployeeSchema.find({ [fieldName]: { $regex: searchValue, $options: "i" } }).limit(size).skip(newSkips).lean()
            }
            else {
              results = await EmployeeSchema.find({ [fieldName]: { $regex: searchValue, $options: "i" } }).limit(size).lean()
            }
  
  
            totalEmployeeCount = (await EmployeeSchema.find({ [fieldName]: { $regex: searchValue, $options: "i" } }).lean()).length
  
          }
          return res.json({ success: true, message: results, totalEmployeeCount });
  
  
         
        } catch (e) {
          console.log("getAllEmployeeDataCatchError" + e);
          return res.json({ success: "catchfalse", message: e });
        }
  
  
      }
  
    } catch (error) {
      console.log(error + "catchToken")
      return res.json({ success: false, message: "Catch Error" });
    }
  
  
  
  });

  router.post("/allEmployeeData", async (req, res) => {
    console.log("allEmployeeData");
  
    try {
      let tokenData = jwtTokenVerifyFile(req.headers.authorization);
  
      if (tokenData === "") {
        return res.json({ success: false, message: "Invalid Token" });
      }
      else {
  
        console.log("TOken verifed Success")
        try {
          await mongoDBConnect(req.body.username)
  
          var results = await EmployeeSchema.find({}, { _id: 0, __v: 0 }).lean();
          return res.json({ success: true, message: results });
  
  
        
        } catch (e) {
          console.log("allEmployeeDataCatchError")
          return res.json({ success: false, message: e });
        }
  
  
      }
  
    } catch (error) {
      console.log(error + "catchToken")
      return res.json({ success: false, message: "Catch Error" });
    }
  
  
  });

router.post("/getCustomerData", async (req, res) => {
  console.log("getCustomerData");

  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")

      try {

        await mongoDBConnect(req.body.username)
        var user = req.body.user;
        var results = await CustomerSchema.findOne({ cusMobNo: req.body.cusMobNo }, { _v: 0, _id: 0 }).lean();
        var orderlist = await addOrderSchema.find({ mobNo: results.cusMobNo });
        let temp = personNames(orderlist);
        console.log(temp);
        let salwarPersonObj = temp[0];
        let blousePersonObj = temp[1];
        let shirtPersonObj = temp[2];
        let pantPersonObj = temp[3];
        var meregeObj = Object.assign(salwarPersonObj, results, blousePersonObj, shirtPersonObj, pantPersonObj);
        return res.json({ success: true, message: meregeObj });
      } catch (err) {
        console.log("getCustomerDataCatchError" + err)
        return res.json({ success: false, message: err });
      }

    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
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

  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")

      try {
        await mongoDBConnect(req.body.username)
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


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }


});

router.post("/getAllCusMobNos", async (req, res) => {
  console.log("getAllCusMobNos");

  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        var multiOrderIdData = await CustomerSchema.find({}, { cusDate: 0, cusEmail: 0, cusAddress: 0, cusId: 0, cusColor: 0, __v: 0, _id: 0, });
        return res.json({ success: true, message: multiOrderIdData });
      } catch (error) {
        console.log("getAllCusMobNosCatchError")
        return res.json({ success: false, message: error });

      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }


});

// dataToSend = {user:"admin", searchQuery: searchQuery, field:"CustomerName"}
router.post("/searchCustomerData", async (req, res) => {

  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        await mongoDBConnect(req.body.username)
        var search = req.body.searchQuery;
        console.log(req.body)
        return res.json({ success: true, searchedData: searchedData });
      } catch (error) {
        console.log("searchCustomerDataCatchError")
        return res.json({ success: false, message: error });

      }


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }

});


router.post("/updateCustomerData", async (req, res) => {
  console.log("updateCustomerData");


  try {
    let tokenData = jwtTokenVerifyFile(req.headers.authorization);

    if (tokenData === "") {
      return res.json({ success: false, message: "Invalid Token" });
    }
    else {

      console.log("TOken verifed Success")
      try {
        const data = req.body;
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


    }

  } catch (error) {
    console.log(error + "catchToken")
    return res.json({ success: false, message: "Catch Error" });
  }




});

export default router