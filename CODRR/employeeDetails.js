
import express from "express";
import mongoose from "mongoose"
import generateUniqueId from "generate-unique-id";
import randomColor from "randomcolor";

import EmployeeSchema from "../schema/employeeAddSchema.js";
import RegisterSchema from "../schema/registerSchema.js";



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

        var regeisterDetails = await RegisterSchema.find({ emailId: req.body.username })
        var dbName = regeisterDetails[0].dbName

        let db = dbName.slice(0, -2) 
       



        var ShopName = req.body.username
        var firstThreeLetterShopName = ShopName.slice(0, 3).toUpperCase()
        let reqData = req.body
        console.log(reqData)
        const id = generateUniqueId({ length: 4, useLetters: false, });
        var employeeId = firstThreeLetterShopName + "-" + "EMP-" + id;
        const color = randomColor({ luminosity: "bright", format: "rgb", });
        let currentdate = new Date().toISOString();

        var empName= req.body.empName
        var firstFourCharEmpName = empName.slice(0,4)
        


        var companyMail = firstFourCharEmpName + id + "@" + db + ".com"
        var companyMailLowerCase= companyMail.toLowerCase()


        const employeeAdd = await new EmployeeSchema({ empId: employeeId, empDate: currentdate, empName: req.body.empName, empMobNo: req.body.empMobNo, empEmail: req.body.empEmail, empSalary: req.body.empSalary, empAddress: req.body.empAddress, empColor: color, empCompanyMail: companyMailLowerCase, empSuspend: false });
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

router.post("/getEmployeeData", async (req, res) => {
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
        var results = await EmployeeSchema.findOne({ empMobNo: req.body.empMobNo }, { _v: 0, _id: 0 }).lean();

        return res.json({ success: true, message: results });
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






router.post("/deleteEmployeeData", async (req, res) => {
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
        var mobileNo = req.body.empMobNo;
        await EmployeeSchema.deleteOne({ empMobNo: mobileNo });
        res.json({ sucess: true, message: "Deleted" });

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



// dataToSend = {user:"admin", searchQuery: searchQuery, field:"CustomerName"}
router.post("/searchEmployeeData", async (req, res) => {

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


router.post("/updateEmployeeData", async (req, res) => {
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

        var foundUser = await EmployeeSchema.findOne({ empId: data.empId });

        if (foundUser.empMobNo === data.empMobNo) {
          var updateSameMobNo = await EmployeeSchema.findOneAndUpdate({ empId: data.empId }, data);
          return res.json({ sucess: true, message: "updated" });
        }

        else if (foundUser.empMobNo !== data.empMobNo) {
          var id = await EmployeeSchema.findOne({ empId: data.empId });
          var MobNo = await EmployeeSchema.find({ empMobNo: data.empMobNo });
          var mobLength = MobNo.length;

          if (mobLength === 1) {
            return res.json({ sucess: true, message: "MobileNumberExists" });
          } else if (id !== null) {

            var updateMobNo = await EmployeeSchema.findOneAndUpdate({ empId: data.empId }, data);
            return res.json({ sucess: true, message: "updated" });
          } else if (id === null) {

            var updateMobNo = await EmployeeSchema.findOneAndUpdate({ empId: data.empId }, data);

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