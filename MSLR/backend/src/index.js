import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { referendums as mockReferendums } from "./mockData.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Default = mock data mode
const USE_FIREBASE = String(process.env.USE_FIREBASE || "false").toLowerCase() === "true";

// Only import firebase if needed (prevents crashes)
let db = null;
if (USE_FIREBASE) {
const firebase = await import("./firebaseAdmin.js");
db = firebase.db;
}

app.get("/", (req, res) => res.json({ ok: true, mode: USE_FIREBASE ? "firebase" : "mock" }));

// 2.1 Return all referendums by status (upcoming/open/closed)
app.get("/mslr/referendum", async (req, res) => {
try {
    const status = String(req.query.status || "").toLowerCase();

    if (!["upcoming", "open", "closed"].includes(status)) {
    return res.status(400).json({ error: "status must be 'upcoming', 'open' or 'closed'" });
    }

    // Mock mode (default)
    if (!USE_FIREBASE) {
    const referendums = mockReferendums
        .filter((r) => r.status === status)
        .map((r) => ({
        ref_id: Number(r.ref_id),
        title: r.title || "",
        description: r.description || "",
        status: r.status || status,
        openDate: r.openDate || null,
        closeDate: r.closeDate || null,
        options: r.options || "",
        }));

    return res.json({ referendums });
    }

    // Firebase mode (optional)
    const snap = await db.collection("referendums").where("status", "==", status).get();

    const referendums = snap.docs.map((doc) => {
    const data = doc.data();
    return {
        ref_id: Number(data.ref_id),
        title: data.title || "",
        description: data.description || "",
        status: data.status || status,
        openDate: data.openDate || null,
        closeDate: data.closeDate || null,
        options: data.options || "",
    };
    });

    return res.json({ referendums });
} catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
}
});

// 2.2 Return the info of a given referendum by its ID
app.get("/mslr/referendum/:id", async (req, res) => {
try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "id must be numeric" });
    }

    // Mock mode (default)
    if (!USE_FIREBASE) {
    const found = mockReferendums.find((r) => Number(r.ref_id) === id);

    if (!found) {
        return res.status(404).json({ error: "Referendum not found" });
    }

    return res.json({
        ref_id: Number(found.ref_id),
        title: found.title || "",
        description: found.description || "",
        status: found.status || "",
        openDate: found.openDate || null,
        closeDate: found.closeDate || null,
        options: found.options || "",
    });
    }

    // Firebase mode (optional)
    const snap = await db.collection("referendums").where("ref_id", "==", id).limit(1).get();

    if (snap.empty) {
    return res.status(404).json({ error: "Referendum not found" });
    }

    const data = snap.docs[0].data();

    return res.json({
    ref_id: Number(data.ref_id),
    title: data.title || "",
    description: data.description || "",
    status: data.status || "",
    openDate: data.openDate || null,
    closeDate: data.closeDate || null,
    options: data.options || "",
    });
} catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
}
});


app.listen(PORT, () => console.log(`server running on port ${PORT} (${USE_FIREBASE ? "firebase" : "mock"} mode)`));
