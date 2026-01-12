import { Modal, Button, Badge, Form, Alert } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/authService";
import { getUserVote } from "../services/voterService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const DARKRED = "#4d0303ff";
const GOLD = "#C9B37E";

function daysUntil(dateString) {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("-").map(Number);
    const closesAt = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    closesAt.setHours(0, 0, 0, 0);
    const diffMs = closesAt - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
}

export default function ReferendumModal({show, onHide, refData, userRole, hasVoted, onSubmitVoted,}) {
// Status helpers
const isOpen = refData?.status === "open";
const isUpcoming = refData?.status === "upcoming";
const isClosed = refData?.status === "closed";

const optionsArray = useMemo(() => {
    if (!refData?.options) return [];
    return refData.options.split("/").map((opt) => opt.trim());
}, [refData]);

// Voting state (voters)
const [selectedIndex, setSelectedIndex] = useState(null);
const [existingVote, setExistingVote] = useState(null);
const [submitError, setSubmitError] = useState("");
const [submitSuccess, setSubmitSuccess] = useState(false);

// Vote totals (commission)
const [voteCounts, setVoteCounts] = useState([]);
const [totalVotes, setTotalVotes] = useState(0);
const [loadingCounts, setLoadingCounts] = useState(false);
const [invalidVotes, setInvalidVotes] = useState(0);

// Load the user's existing vote (locks UI if already voted)
useEffect(() => {
    const loadVote = async () => {
    if (!show || !refData?.id) return;

    setSubmitError("");

    const user = getCurrentUser();
    if (!user) return;

    const vote = await getUserVote(refData.id, user.uid);
    setExistingVote(vote);

    if (vote?.optionIndex !== undefined && vote?.optionIndex !== null) {
        setSelectedIndex(vote.optionIndex);
    } else {
        setSelectedIndex(null);
    }
    };

    loadVote();
}, [show, refData?.id]);

// Commission: load vote totals for this referendum
useEffect(() => {
    const loadCounts = async () => {
    if (!show || !refData?.id) return;
    if (userRole !== "commission") return;

    setLoadingCounts(true);

    try {
        const snap = await getDocs(
        query(collection(db, "votes"), where("refID", "==", refData.id))
        );

        const counts = Array(optionsArray.length).fill(0);
        let invalid = 0;

        snap.forEach((docSnap) => {
        const raw = docSnap.data()?.optionIndex;

        const idx = Number(raw);

        if (Number.isFinite(idx) && Number.isInteger(idx) && idx >= 0 && idx < counts.length) {
            counts[idx] += 1;
        } else {
            invalid += 1;
        }
        });

        setVoteCounts(counts);
        setTotalVotes(snap.size);
        setInvalidVotes(invalid);

    } catch (e) {
        console.error("Failed to load vote totals:", e);
        setVoteCounts(Array(optionsArray.length).fill(0));
        setTotalVotes(0);
    } finally {
        setLoadingCounts(false);
    }
    };

    loadCounts();
}, [show, refData?.id, userRole, optionsArray.length]);

const daysLeft = daysUntil(refData?.closeDate);
const isClosingSoon = isOpen && daysLeft !== null && daysLeft <= 7;

const userHasVoted = !!existingVote || hasVoted;
const canVote = userRole === "voter" && isOpen && !userHasVoted;

const handleSubmitVote = async () => {
    if (selectedIndex === null) return;

    try {
    await onSubmitVoted?.(refData.id, selectedIndex);

    setExistingVote({ optionIndex: selectedIndex });
    setSubmitError("");
    setSubmitSuccess(true);

    setTimeout(() => {
        setSubmitSuccess(false);
        onHide();
    }, 2000);
    } catch (e) {
    if (e?.message === "ALREADY_VOTED") {
        setSubmitError("You have already voted in this referendum.");
    } else {
        setSubmitError("Something went wrong submitting your vote. Please try again.");
    }
    }
};

if (!refData) return null;

const statusLabel = isOpen ? "OPEN" : isUpcoming ? "UPCOMING" : "CLOSED";
const statusVariant = isOpen ? "success" : isUpcoming ? "warning" : "dark";

// Styling
const TITLE_STYLE = {
    color: DARKRED,
    fontWeight: 650,
    fontSize: "1.35rem",
    letterSpacing: "0.02em",
};

const BODY_TEXT_STYLE = {
    fontSize: "1.02rem",
    lineHeight: 1.7,
    color: "#2b2b2b",
};

const PANEL_STYLE = {
    background: "linear-gradient(180deg, #ffffff 0%, #fbf7f0 100%)",
    border: `1px solid rgba(0,0,0,0.06)`,
    borderRadius: "14px",
    padding: "16px 18px",
    marginBottom: "18px",
};

const OPTION_ROW_STYLE = (active, disabled) => ({
    borderRadius: "12px",
    padding: "12px 12px",
    border: active ? `1px solid ${GOLD}` : "1px solid rgba(0,0,0,0.08)",
    background: active ? "rgba(201,179,126,0.12)" : "white",
    opacity: disabled ? 0.65 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "0.15s ease",
});

return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="border-0">
    {/* Header */}
    <Modal.Header
        closeButton
        style={{
        padding: "18px 22px",
        borderBottom: `3px solid ${GOLD}`,
        background: "white",
        }}
    >
        <Modal.Title style={TITLE_STYLE}>{refData.title}</Modal.Title>
    </Modal.Header>

    <Modal.Body style={{ padding: "22px" }}>
        {/* Status + tags */}
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <Badge bg={statusVariant} style={{ letterSpacing: "0.04em" }}>
            {statusLabel}
        </Badge>

        {isClosingSoon && (
            <Badge bg="danger" style={{ letterSpacing: "0.04em" }}>
            {daysLeft === 0 ? "Closes today" : `${daysLeft} days remaining`}
            </Badge>
        )}

        {userHasVoted && (
            <Badge bg="secondary" style={{ letterSpacing: "0.04em" }}>
            VOTED
            </Badge>
        )}

        {userRole === "commission" && (
            <Badge bg="light" text="dark">
                {loadingCounts ? "Counting votes..." : `Total votes: ${totalVotes}${invalidVotes ? ` (invalid: ${invalidVotes})` : ""}`}
            </Badge>
            )}
        </div>

        {/* Feedback */}
        {submitSuccess && (
        <Alert variant="success" className="mt-2">
            Your vote has been successfully recorded.
        </Alert>
        )}
        {submitError && (
        <Alert variant="danger" className="mt-2">
            {submitError}
        </Alert>
        )}

        {/* Description panel */}
        <div style={PANEL_STYLE}>
        <p className="mb-2" style={BODY_TEXT_STYLE}>
            {refData.description}
        </p>

        {refData?.closeDate && (
            <p className="small text-muted fst-italic mb-0">
            Closes: {refData.closeDate}
            <br />
            Referendums close at midnight on the stated closing date.
            </p>
        )}
        </div>

        {/* Options */}
        <h6 style={{ color: DARKRED, fontWeight: 700, marginBottom: "10px" }}>Options</h6>

        <div
        style={{
            border: `1px solid rgba(0,0,0,0.06)`,
            borderRadius: "12px",
            padding: "14px 16px",
            backgroundColor: "white",
        }}
        >
        {optionsArray.length === 0 ? (
            <p className="text-muted fst-italic mb-0">No options available.</p>
        ) : (
            <Form style={{ marginTop: "6px" }}>
            {optionsArray.map((opt, idx) => {
                const active = selectedIndex === idx;
                const disabled = !canVote;

                return (
                <label
                    key={idx}
                    htmlFor={`opt-${refData.id}-${idx}`}
                    className="d-flex align-items-start gap-3 mb-2"
                    style={OPTION_ROW_STYLE(active, disabled)}
                >
                    <input
                    type="radio"
                    name="voteOption"
                    id={`opt-${refData.id}-${idx}`}
                    disabled={disabled}
                    checked={active}
                    onChange={() => setSelectedIndex(idx)}
                    style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                    />

                    <span
                    aria-hidden="true"
                    style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        marginTop: "3px",
                        border: `2px solid ${active ? GOLD : "rgba(0,0,0,0.25)"}`,
                        background: active ? GOLD : "transparent",
                        boxShadow: active ? "0 0 0 4px rgba(201,179,126,0.20)" : "none",
                        flex: "0 0 auto",
                    }}
                    />

                    <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 600, color: DARKRED }}>
                        {opt}
                    </div>

                    {userRole === "commission" && (
                        <div className="small text-muted mt-1">
                        Votes: {voteCounts?.[idx] ?? 0}
                        </div>
                    )}
                    </div>
                </label>
                );
            })}
            </Form>
        )}

        {!canVote && (
            <p className="small text-muted fst-italic mt-3 mb-0">
            {isUpcoming && "Voting is not open yet."}
            {isClosed && "Voting has closed."}
            {hasVoted && "Your vote is final and has already been recorded."}
            {userRole === "commission" && "Commission accounts cannot vote."}
            </p>
        )}
        </div>
    </Modal.Body>

    {/* Footer */}
    <Modal.Footer
        style={{
        padding: "16px 22px",
        borderTop: `1px solid rgba(0,0,0,0.08)`,
        background: "white",
        }}
    >
        <Button variant="outline-secondary" onClick={onHide}>
        Close
        </Button>

        {canVote && (
        <Button
            onClick={handleSubmitVote}
            disabled={selectedIndex === null}
            style={{
            backgroundColor: DARKRED,
            border: "none",
            fontWeight: 600,
            }}
        >
            Submit Vote
        </Button>
        )}
    </Modal.Footer>
    </Modal>
);
}
