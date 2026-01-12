import { auth } from "../firebase";
import { setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export async function loginUser(email,password,rememberMe){
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;

    await setPersistence(auth, persistence);

    const userCred = await signInWithEmailAndPassword(auth, email,password);
    return userCred.user;
}

export const getCurrentUser = () => auth.currentUser;

export const logoutUser = async () => {
    await signOut(auth);
};

export const registerAuthUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email,password);
};