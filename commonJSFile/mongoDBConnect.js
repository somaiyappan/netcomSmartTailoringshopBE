import mongoose from "mongoose"

const mongoDBConnect = async (username) => {

  mongoose.disconnect()

  let dbName = username.split('@')[0] + 'SmartTailorShopDB'
  console.log(dbName)

  let mongoURL = 'mongodb://localhost/' + dbName

  const db = await mongoose.connect(mongoURL)


}

export default mongoDBConnect
