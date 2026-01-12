import { db } from "../firebase";
import { doc, collection, getDocs, updateDoc, addDoc, query, orderBy } from "firebase/firestore";


// Fetches all Referendums and ordered by open date
export const fetchAllReferendums = async () => {
    const referendumQuery = query(collection(db, "referendums"), orderBy("openDate", "desc"));
    const result = await getDocs(referendumQuery);
    return result.docs.map(doc => ({ id: doc.id, ...doc.data()}));
};


// Converts date string to a date at local midnight keeping dates consistent
const parseDDMMYYYY = (s) => {
    const [d, m, y] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

// Converts date to DD-MM-YYYY for commissioners manually opening and closing referendums
function toDDMMYYYY(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

// Splits referendums into upcoming, open and closed using OpenDate and CloseDate
export const splitReferendumByStatus = (referendums) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // compare at midnight

    const upcoming = [];
    const open = [];
    const closed = [];

    referendums.forEach((ref) => {
        if (ref.status === "closed") {
        closed.push(ref);
        return;
    }

    const openedDate = ref.openDate ? parseDDMMYYYY(ref.openDate) : null;
    const closedDate = ref.closeDate ? parseDDMMYYYY(ref.closeDate) : null;

    if (!openedDate || !closedDate || isNaN(openedDate) || isNaN(closedDate)) {
        if (ref.status === "open") open.push(ref);
        else upcoming.push(ref);
        return;
        }
        if (now < openedDate) upcoming.push(ref);
        else if (now >= openedDate && now <= closedDate) open.push(ref);
        else closed.push(ref);
    });

    return {
        upcoming: upcoming.slice(0, 3),
        open: open.slice(0, 3),
        closed: closed.slice(0, 6),
    };
    };


export async function createReferendum(refData){
    const colRef = collection(db, "referendums");
    const docRef = await addDoc(colRef,refData);
    return docRef.id;
}


// Commissioner manually changing the status of referendums
export async function setReferendumStatus(refId, status){
    if (!["upcoming", "open", "closed"].includes(status)) {
    throw new Error("Invalid status");
}

    const updates = { status };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (status === "open") updates.openDate = toDDMMYYYY(today);
    if (status === "closed") updates.closeDate = toDDMMYYYY(today);

    await updateDoc(doc(db, "referendums", refId), updates);
}