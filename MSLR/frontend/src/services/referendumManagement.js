import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, query, where, } from "firebase/firestore";

const todayAtMidnight = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
    };

const parseDDMMYYYY = (s) => {
    if (!s) return null;
        const [d, m, y] = s.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        dt.setHours(0, 0, 0, 0);
    return dt;
    };

const toDDMMYYYY = (dateObj) => {
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};


export async function runReferendumManagement() {
    const today = todayAtMidnight();

    // Count total voters
    const votersSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "voter"))
    );
    const totalVoters = votersSnap.size;

    if (totalVoters === 0) return;
    const refsSnap = await getDocs(collection(db, "referendums"));

    // Ppen/close logic
    for (const refDoc of refsSnap.docs) {
        const refData = refDoc.data();
        const refId = refDoc.id;

        const openDate = parseDDMMYYYY(refData.openDate);
        const closeDate = parseDDMMYYYY(refData.closeDate);

        // If dates missing, skip (or keep current status)
        if (!openDate || !closeDate || isNaN(openDate) || isNaN(closeDate)) {
        continue;
        }

        let newStatus = refData.status;

        // Automatically open by date
        if (refData.status === "upcoming" && today >= openDate) {
        newStatus = "open";
        }

        // Only evaluate closing conditions if it is open
        if (newStatus === "open") {

        // Count votes for this referendum
        const votesSnap = await getDocs(
            query(collection(db, "votes"), where("refID", "==", refId))
        );

        const voteCount = votesSnap.size;
        const voteRatio = voteCount / totalVoters;

        // Automatically close by date or votes >= 50%
        if (today > closeDate || voteRatio >= 0.5) {
            newStatus = "closed";

            
        }
        }

        // Apply update if the status has changed
        if (newStatus !== refData.status) {
            const updatePayload = { status: newStatus };

            // If closing early, change closeDate = today
            if (newStatus === "closed" && today <= closeDate) {
                updatePayload.closeDate = toDDMMYYYY(today);
            }

            await updateDoc(doc(db, "referendums", refId), updatePayload);
}

    }
}
