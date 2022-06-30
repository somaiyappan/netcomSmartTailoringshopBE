import mongoose from "mongoose"

const employeeDetailsSchema = new mongoose.Schema({
    empDate: Date,
    empName: String,
    empMobNo: String,
    empEmail: String,
    empSalary: String,
    empAddress: String,
    empId: String,
    empColor: String,
    empCompanyMail:String,
    empSuspend:Boolean
});
const employeeDetails = mongoose.model("employeeDetails", employeeDetailsSchema);


export default employeeDetails