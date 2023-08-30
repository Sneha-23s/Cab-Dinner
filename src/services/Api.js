import axios from "axios";
import { getUserData} from './Storage';

axios.defaults.baseURL = "https://identitytoolkit.googleapis.com/v1";
const API_KEY = "AIzaSyBZG49ZLVo5MIv4qOB_WD7QM3D-BS_hzxg";
const REGISTER_URL = `/accounts:signUp?key=${API_KEY}`;
const LOGIN_URL = `/accounts:signInWithPassword?key=${API_KEY}`;
const USER_DETAILS_URL = `/accounts:lookup?key=${API_KEY}`;
const DELETE_URL=`accounts:delete?key=${API_KEY}`;
const MAILURL = `https://emailvalidation.abstractapi.com/v1/?api_key=AIzaSyBZG49ZLVo5MIv4qOB_WD7QM3D-BS_hzxg`;

export const RegisterApi = (inputs) => {
    const data = {
        displayName: inputs.userId,
        email: inputs.email,
        password: inputs.password
        
    }
    return axios.post(REGISTER_URL, data)
}

export const LoginApi = (inputs) => {
    let data = { email: inputs.email, password: inputs.password }
    return axios.post(LOGIN_URL, data)
}

export const UserDetailsApi = () => {
    let data = { idToken: getUserData() }
    return axios.post(USER_DETAILS_URL, data)
}

export const DeleteApi = (id) => {
    const idToken = getUserData();
    // Check if the idToken is available, otherwise return a rejected promise
  if (!idToken) {
    console.log("User is not authenticated.");
  }
    const requestData = {
      idToken: idToken,
      localId: id
    };
    return axios.post(DELETE_URL, requestData);
  };


  
  
  
  