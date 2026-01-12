import { Card, Button, Badge } from "react-bootstrap";
import { useState, useMemo } from "react";
import ReferendumModal from "./ReferendumModal";

const ReferendumCard = ({ refData, hasVoted, userRole, onSubmitVoted, onSetStatus }) => {
const DARKRED = "#4d0303ff";
const GOLD = "#C9B37E";

const isClosed = refData.status === "closed";
const isUpcoming = refData.status === "upcoming";
const isOpen = refData.status === "open";

const canVote = userRole === "voter" && isOpen && !hasVoted;

// Convert options string into array
const optionsArray = useMemo(
    () => (refData.options ? refData.options.split("/").map((opt) => opt.trim()) : []),
    [refData.options]
);

const [showModal, setShowModal] = useState(false);

let badgeText = null;
let badgeColor = "secondary";

if (hasVoted) {
    badgeText = "VOTED";
    badgeColor = "secondary";
} else if (isClosed) {
    badgeText = "CLOSED";
    badgeColor = "dark";
} else if (isUpcoming) {
    badgeText = "UPCOMING";
    badgeColor = "warning";
} else if (isOpen) {
    badgeText = "OPEN";
    badgeColor = "success";
}

// ✨ Shangri-La styling (subtle)
const cardStyle = {
    opacity: isClosed ? 0.72 : 1,
    pointerEvents: "auto",
    borderRadius: "16px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf7f0 100%)",
    border: `1px solid rgba(201,179,126,0.35)`,
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    overflow: "hidden",
};

const topBarStyle = {
    height: "5px",
    background: `linear-gradient(90deg, ${DARKRED}, ${GOLD}, ${DARKRED})`,
};

const badgeStyle = {
    position: "absolute",
    top: "12px",
    left: "12px",
    fontSize: "0.72rem",
    padding: "7px 9px",
    letterSpacing: "0.08em",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.08)",
};

const titleStyle = {
    color: DARKRED,
    paddingTop: "15px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    fontSize: "1.05rem",
    lineHeight: 1.25,
};

const descStyle = {
    fontSize: "0.95rem",
    lineHeight: 1.55,
};

const listStyle = {
    fontSize: "0.92rem",
    marginBottom: "18px",
};

const primaryBtnStyle = {
    color: "white",
    backgroundColor: DARKRED,
    border: `1px solid rgba(201,179,126,0.55)`,
    fontWeight: 600,
    borderRadius: "12px",
    padding: "10px 12px",
    boxShadow: "0 10px 18px rgba(77,3,3,0.18)",
};

const subtleDividerStyle = {
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(201,179,126,0.7), transparent)",
    margin: "10px 0 12px",
};

return (
    <Card className="border-0 position-relative h-100" style={cardStyle}>
    {/* top bar */}
    <div style={topBarStyle} />

    {badgeText && (
        <Badge bg={badgeColor} style={badgeStyle}>
        {badgeText}
        </Badge>
    )}

    <Card.Body className="d-flex flex-column" style={{ padding: "18px" }}>
        <Card.Title style={titleStyle}>{refData.title}</Card.Title>

        <div style={subtleDividerStyle} />

        <Card.Text className="text-muted" style={descStyle}>
        {refData.description}
        </Card.Text>

        <ul className="ps-3" style={listStyle}>
        {optionsArray.slice(0, 3).map((opt, index) => (
            <li key={index} style={{ marginBottom: "6px" }}>
            {opt}
            </li>
        ))}
        </ul>

        {/* Optional: if there are more than 3 options, hint it */}
        {optionsArray.length > 3 && (
        <div className="text-muted small fst-italic mb-3">
            + {optionsArray.length - 3} more option(s) inside
        </div>
        )}

        {/* Voter actions */}
        {userRole === "voter" && (
        <div className="mt-auto d-flex gap-2">
            <Button onClick={() => setShowModal(true)} style={primaryBtnStyle}>
            {canVote ? "Vote" : "View details"}
            </Button>
        </div>
        )}

        {/* Commission actions */}
        {userRole === "commission" && (
        <div className="mt-auto d-flex gap-2 flex-wrap">
            <Button onClick={() => setShowModal(true)} style={primaryBtnStyle}>
            View details
            </Button>

            {refData.status === "upcoming" && (
            <Button
                variant="outline-secondary"
                onClick={() => onSetStatus?.(refData.id, "open")}
                style={{
                borderRadius: "12px",
                border: `1px solid rgba(201,179,126,0.8)`,
                color: DARKRED,
                fontWeight: 700,
                background: "rgba(201,179,126,0.10)",
                }}
            >
                Open now
            </Button>
            )}

            {refData.status === "open" && (
            <Button
                variant="outline-secondary"
                onClick={() => onSetStatus?.(refData.id, "closed")}
                style={{
                borderRadius: "12px",
                border: `1px solid rgba(0,0,0,0.18)`,
                color: "#222",
                fontWeight: 700,
                background: "rgba(0,0,0,0.03)",
                }}
            >
                Close now
            </Button>
            )}
        </div>
        )}

        <ReferendumModal
        show={showModal}
        onHide={() => setShowModal(false)}
        refData={refData}
        userRole={userRole}
        hasVoted={hasVoted}
        onSubmitVoted={onSubmitVoted}
        />
    </Card.Body>
    </Card>
);
};

export default ReferendumCard;
