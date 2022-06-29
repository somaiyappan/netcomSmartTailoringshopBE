import jwt from 'jsonwebtoken'

function TokenVerify(token) {
    try {
      var data = jwt.verify(token,"STONER");
      return data;
    } catch (error) {
      return "";
    }
  }
  export default TokenVerify