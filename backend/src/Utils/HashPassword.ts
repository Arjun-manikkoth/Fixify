import bcrypt from 'bcrypt'

//hash plain password 
 const hashPassword = async (password: string): Promise<string> => {
    try {
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      return hashedPassword;

    } catch (error: any) {

      console.log('Error hashing password:', error.message);
      throw new Error('Hashing failed');

    }
  };
  

 //compare passwords and returns status 
  const comparePasswords = async (password: string,hashPassword:string): Promise<boolean> => {
    try {
      
      
      const passwordStatus = await bcrypt.compare(password, hashPassword);

      return passwordStatus;

    } catch (error: any) {

      console.log('Error validating password:', error.message);
      throw new Error('validation failed');

    }
  };

  export {hashPassword,comparePasswords}