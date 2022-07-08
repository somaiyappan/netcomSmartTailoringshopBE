import express from "express"
import cors from "cors"
import cluster from 'cluster'
import os from 'os'


import router from './router.js'
import registrationRouter from './registrationRouter.js'

import adminRouter from './adminRouter.js'


import customerDetailsAPI from "./CODRR/customerDetailsAPI.js"
import orderDetailsAPI from './CODRR/orderDetailsAPI.js'
import dashboardAPI from './CODRR/dashBoardAPI.js'
import reportAPI from './CODRR/reportAPI.js'
import rateUpdaterAPI from './CODRR/rateUpdaterAPI.js'
import employeeDetailsAPI from "./CODRR/employeeDetails.js"


const app = express();

app.use(cors())

const port = 3002





//body-parser

app.use(express.json({ extended: false, limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }))


app.get("/",(req,res)=> {
    res.json("Router is working");
});

app.use('/api', router);
app.use('/registrationProcess' , registrationRouter)
app.use('/customerProcess' ,customerDetailsAPI)
app.use('/orderProcess' ,orderDetailsAPI)
app.use('/dashboardProcess' ,dashboardAPI)
app.use('/reportProcess' ,reportAPI)
app.use('/rateProcess' ,rateUpdaterAPI)
app.use('/employeeProcess' ,employeeDetailsAPI)
app.use('/adminRouter', adminRouter)




const numCpu = os.cpus().length

if (cluster.isPrimary) {
    for (let i = 0; i < numCpu; i++) {
        cluster.fork()//create separate cpu
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker died ${worker.process.pid}`)
        cluster.fork()
  
    })
 }
 else {
    app.listen(port, () => console.log(`server ${process.pid},
 Backend Running...`))
 }
 

