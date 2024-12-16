
import jwt from "jsonwebtoken"


const generateTokens = (id: string,email:string,role:string) => {
    const accessToken = jwt.sign({ id ,email,role}, process.env.JWT_SECRET||'arjunsrog12345', { expiresIn: '5m' });
    const refreshToken = jwt.sign({ id,email,role }, process.env.JWT_SECRET||'arjunsrog12345', { expiresIn: '7d' });
  
    return { accessToken, refreshToken };
  };

  export {generateTokens}