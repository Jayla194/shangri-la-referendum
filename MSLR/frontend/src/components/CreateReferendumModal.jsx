import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useMemo, useState } from "react";

const DARKRED = "#4d0303ff";
const GOLD = "#c9b37e";

function formatDDMMYY(value) {
if (!value) return "";
const [yyyy, mm, dd] = value.split("-");
return `${dd}-${mm}-${yyyy}`;
}

function isValidDDMMYYYY(ddmmyyyy) {
if (!/^\d{2}-\d{2}-\d{4}$/.test(ddmmyyyy)) return false;
const [d, m, y] = ddmmyyyy.split("-").map(Number);
const dt = new Date(y, m - 1, d);
return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export default function CreateReferendumModal({ show, onHide, onCreate }) {
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [optionsText, setOptionsText] = useState("");
const [status, setStatus] = useState("upcoming"); // default upcoming
const [closeDateISO, setCloseDateISO] = useState("");
const [openDateISO, setOpenDateISO] = useState("");
const [error, setError] = useState("");
const [saving, setSaving] = useState(false);

const closeDateDDMMYYYY = useMemo(() => formatDDMMYY(closeDateISO), [closeDateISO]);
const openDateDDMMYYYY = useMemo(() => formatDDMMYY(openDateISO), [openDateISO]);

const optionsJoined = useMemo(() => {
    const arr = optionsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
    return arr.join("/");
}, [optionsText]);

// ✨ Gold glow focus styling (same vibe as your login/register)
const inputStyle = {
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "none",
    paddingTop: "10px",
    paddingBottom: "10px",
};

const handleFocus = (e) => {
    e.target.style.border = `1px solid ${GOLD}`;
    e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
};

const handleBlur = (e) => {
    e.target.style.border = "1px solid rgba(0,0,0,0.12)";
    e.target.style.boxShadow = "none";
};

const validate = () => {
    if (!title.trim()) return "Please enter a referendum title.";
    if (!description.trim()) return "Please enter a description.";

    const opts = optionsText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (opts.length < 2) return "Please enter at least 2 options (one per line).";
    if (opts.length > 5) return "Please keep options to 5 or fewer.";

    if (!openDateISO) return "Please choose an opening date.";
    if (!closeDateISO) return "Please choose a closing date.";

    if (!openDateDDMMYYYY || !isValidDDMMYYYY(openDateDDMMYYYY)) return "Opening date format is invalid.";
    if (!closeDateDDMMYYYY || !isValidDDMMYYYY(closeDateDDMMYYYY)) return "Closing date format is invalid.";

    // Ensure open <= close
    const open = new Date(openDateISO);
    const close = new Date(closeDateISO);
    open.setHours(0, 0, 0, 0);
    close.setHours(0, 0, 0, 0);

    if (open > close) return "Opening date must be before (or the same as) the closing date.";

    if (!["upcoming", "open"].includes(status)) return "Invalid status.";
    return "";
};

const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
    setError(msg);
    return;
    }

    setSaving(true);
    setError("");

    try {
    // Optional safety: if opening date is in the future, force upcoming
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const open = new Date(openDateISO);
    open.setHours(0, 0, 0, 0);

    const finalStatus = open > today ? "upcoming" : status;

    await onCreate({
        title: title.trim(),
        description: description.trim(),
        options: optionsJoined,
        status: finalStatus,
        openDate: openDateDDMMYYYY,
        closeDate: closeDateDDMMYYYY,
    });

    // reset and close
    setTitle("");
    setDescription("");
    setOptionsText("");
    setStatus("upcoming");
    setCloseDateISO("");
    setOpenDateISO("");
    onHide();
    } catch (e) {
    console.error(e);
    setError("Failed to create referendum. Please try again.");
    } finally {
    setSaving(false);
    }
};

return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="border-0">
    <Modal.Header
        closeButton
        style={{
        padding: "18px 22px",
        borderBottom: `3px solid ${GOLD}`,
        background: "white",
        }}
    >
        <Modal.Title style={{ color: DARKRED, fontWeight: 700 }}>Create Referendum</Modal.Title>
    </Modal.Header>

    <Modal.Body style={{ padding: "22px" }}>
        {error && (
        <Alert variant="danger" className="mb-3">
            {error}
        </Alert>
        )}

        <Form>
        {/* Title */}
        <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Title</Form.Label>
            <Form.Control
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Should Shangri-La introduce a night market?"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            />
        </Form.Group>

        {/* Description */}
        <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Description</Form.Label>
            <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the proposal clearly."
            style={{ ...inputStyle, paddingTop: "12px", paddingBottom: "12px" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            />
        </Form.Group>

        {/* Options */}
        <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Options (one per line)</Form.Label>
            <Form.Control
            as="textarea"
            rows={5}
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder={"Option A\nOption B\nOption C"}
            style={{ ...inputStyle, paddingTop: "12px", paddingBottom: "12px" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            />
            <div className="text-muted small mt-1">
            Tip: keep options short and clear (max 5).
            </div>
        </Form.Group>

        {/* Status */}
        <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Initial Status</Form.Label>
            <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            >
            <option value="upcoming">upcoming</option>
            <option value="open">open</option>
            </Form.Select>
            <div className="text-muted small mt-1">
            If the opening date is in the future, the referendum will be saved as <strong>upcoming</strong>.
            </div>
        </Form.Group>

        {/* Opening Date */}
        <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Opening Date</Form.Label>
            <Form.Control
            type="date"
            value={openDateISO}
            onChange={(e) => setOpenDateISO(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            />
        </Form.Group>

        {/* Closing Date */}
        <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Closing Date</Form.Label>
            <Form.Control
            type="date"
            value={closeDateISO}
            onChange={(e) => setCloseDateISO(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            />
        </Form.Group>
        </Form>
    </Modal.Body>

    <Modal.Footer
        style={{
        padding: "16px 22px",
        borderTop: `1px solid rgba(0,0,0,0.08)`,
        background: "white",
        }}
    >
        <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
        Cancel
        </Button>
        <Button
        onClick={handleSubmit}
        disabled={saving}
        style={{ backgroundColor: DARKRED, border: `1px solid rgba(201,179,126,0.55)`, fontWeight: 600 }}
        >
        {saving ? "Creating..." : "Create Referendum"}
        </Button>
    </Modal.Footer>
    </Modal>
);
}
