import bcrypt from 'bcrypt'

const generateOtp =() :string=> {
    const length = 6;
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
         otp += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return otp;
};
async function hashOtp(otp:string):Promise<string>{
    try{
      return await bcrypt.hash(otp,10)
    }
    catch(error:any){
        console.log(error.message)
        throw new Error('Hashing failed');
    }
}
async function compareOtps(otp:string,otpDb:string):Promise<boolean>{
    try{
      return await bcrypt.compare(otp,otpDb)
    }
    catch(error:any){
        console.log(error.message)
        throw new Error('Hashing failed');
    }
}
export {generateOtp,hashOtp,compareOtps}