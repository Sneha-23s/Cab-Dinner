//import { firebaseConfig } from "./config";
import firebase from "firebase/compat/app";
//import "firebase/compat/database";
import "firebase/compat/auth";
import 'firebase/compat/firestore';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBZG49ZLVo5MIv4qOB_WD7QM3D-BS_hzxg",
    authDomain: "sample-firebase-project-eb5eb.firebaseapp.com",
    databaseURL: "https://sample-firebase-project-eb5eb-default-rtdb.firebaseio.com",
    projectId: "sample-firebase-project-eb5eb",
    storageBucket: "sample-firebase-project-eb5eb.appspot.com",
    messagingSenderId: "915814852772",
    appId: "1:915814852772:web:40557079c27c2adc331e31",
    measurementId: "G-4EWENK66VM"
  };
if(firebase.apps.length===0)
{
firebase.initializeApp(firebaseConfig);
}
//export const fireDb = firebase.database().ref();
const fireDb = getDatabase();

export { fireDb };
