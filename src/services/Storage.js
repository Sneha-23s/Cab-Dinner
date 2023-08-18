export const storeUserData = (data)=>{
    localStorage.setItem('idToken',data)
}

export const getUserData = ()=>{
    return localStorage.getItem('idToken');
}

export const removeUserData = ()=>{
 localStorage.removeItem('idToken')
}

export const DeleteUser = ()=>{
    localStorage.DeleteUser('idToken')
   }