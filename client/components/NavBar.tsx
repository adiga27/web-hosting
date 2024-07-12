"use client"

import { GoogleAuthProvider } from "firebase/auth/web-extension";
// import { app } from "@/config/firebase-config";
import firebase from "firebase/compat/app";
// import app from "firebase/auth";

// require("firebase/auth")

function NavBar() {
    const loginWithGoogle = async () =>{
        // console.log(firebase.auth);
        // firebase.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider).then((userCred:any) => {
        //   console.log(userCred);
        // }).catch((err:any) => console.error(err))
        const provider = new GoogleAuthProvider();
        try{

        }catch(err){
            
        }
    }
      
    return (
        <div>
            <nav className="flex justify-end">
                <div className="py-1 px-3 cursor-pointer" onClick={loginWithGoogle}>
                    Login
                </div>
            </nav>
        </div>
    );
}

export default NavBar;