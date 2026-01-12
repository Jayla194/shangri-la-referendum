import {db } from "../firebase";
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";

const voteDocId = (referendumId, uid) => `${referendumId}_${uid}`;

export async function getUserVote(referendumId, uid){
    if(!referendumId || !uid) return null;
    const snap = await getDoc(doc(db, "votes", voteDocId(referendumId, uid)));
    return snap.exists() ? snap.data() : null;
}

export async function hasUserVoted(referendumId, uid){
    const vote = await getUserVote(referendumId, uid);
    return !!vote;
}

export async function castVote({ referendumId, uid, optionIndex}){
    const voteRef = doc(db, "votes", voteDocId(referendumId, uid));
        
        await runTransaction(db, async (tx) => {
        const existing = await tx.get(voteRef);
        if (existing.exists()){
            throw new Error("ALREADY_VOTED");
        }
        tx.set(voteRef,{
            refID: referendumId,
            uId: uid,
            optionIndex: Number(optionIndex),
            createdAt: serverTimestamp(),
        });
    });
    return true;
}