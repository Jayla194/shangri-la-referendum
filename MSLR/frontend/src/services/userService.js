import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const getUserProfile = async (uid) => {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if(!snapshot.exists()) return null;
    return snapshot.data();
};

export const validateSCC = async (scc) => {
    const sccRef = doc(db, "scc", scc);
    const snap = await getDoc(sccRef);

    if (!snap.exists() || snap.data().used){
        return false;
    }
    return true;
};

export const createUserProfile = async (uid, userData) => {
    await setDoc(doc(db, "users", uid),{...userData, role:"voter"
    });
};

export const markSccUsed = async (scc) => {
    await updateDoc(doc(db, "scc",scc), {used: true});
};