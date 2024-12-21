import React from "react";
import GoogleOAuth from "../CommonComponents/GoogleOAuth";
import {GoogleOAuthProvider} from "@react-oauth/google";

const GoogleAuthWrapper: React.FC = () => {
     return (
          <GoogleOAuthProvider clientId="924054108435-q2cujuipug5jvjci14i5odtdp79tvti9.apps.googleusercontent.com">
               <GoogleOAuth />
          </GoogleOAuthProvider>
     );
};
export default GoogleAuthWrapper;
