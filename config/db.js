const mongoose = require('mongoose');
//function mongodb database connection
const connectDB = async () =>{
try{
await mongoose.connect(process.env.MONGO_URL);
console.log(`connected to database ${mongoose.connection.host}`);
}
catch(error){
console.log('DB Error', error);
}

}
module.exports = connectDB;
