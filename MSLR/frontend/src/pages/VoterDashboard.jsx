import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ReferendumCard from '../components/ReferendumCard';
import { useEffect, useState } from "react";
import { fetchAllReferendums } from "../services/referendumService";
import { getCurrentUser, logoutUser } from "../services/authService"
import { getUserProfile } from "../services/userService";
import { getUserVote, castVote } from '../services/voterService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';


function VoterDashboard(){
    // Styling
    const DARKRED = "#4d0303ff";
    const GOLD = "#C9B37E";
    const BACKGROUND = "#f4f1ee";
    const CARD_BG = "#ffffff";
    const PANEL = {
        background: "linear-gradient(180deg, #ffffff 0%, #fbf7f0 100%)",
        border: `1px solid rgba(201,179,126,0.35)`,
        borderRadius: "14px",
        padding: "16px 18px",
    };

        const GOLD_DIVIDER = {
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,179,126,0.85), transparent)",
    };

        const SECTION_TITLE = {
        color: DARKRED,
        fontWeight: 650,
        letterSpacing: "0.01em",
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
    };

    const [referendums, setReferendums] = useState([]);
    const [username, setUsername] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [votedMap, setVotedMap ] = useState({});

    const upcoming = referendums.filter(ref => ref.status === "upcoming");
    const open = referendums.filter(ref => ref.status === "open");
    const closed = referendums.filter(ref => ref.status === "closed");

    useEffect(() =>{
        const unsub = onAuthStateChanged(auth, async (user) => {

            if(!user) {
                // redirects users to login if they try to access this page and haven't already logged in
                window.location.href="/";
                return;
            }

            const profile = await getUserProfile(user.uid);

            const role = profile?.role || null;
            setUserRole(role);

            if (profile?.firstName) setUsername(profile.firstName);
            // Protects voter dashboard
            if (role !== "voter") {
                window.location.href = "/commission";
                return;
            }

            setAuthChecked(true);
        
        });
        return() => unsub();
        
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        window.location.href = "/";
    }
    // Load Referendums
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const data = await fetchAllReferendums();
            setReferendums(data);

            const map = {};
            for (const ref of data) {
            const vote = await getUserVote(ref.id, user.uid);
            if (vote?.optionIndex !== undefined) {
                map[ref.id] = vote.optionIndex;
            }
            }
            setVotedMap(map);

        });
        return () => unsub();
        }, []);

        const parseDDMMYYYY = (s) => {
            if (!s) return null;
            const [d, m, y] = s.split("-").map(Number);
            const dt = new Date(y, m - 1, d);
            dt.setHours(0, 0, 0, 0);
            return dt;
            };

            const computeStatusFromDates = (ref) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const openAt = parseDDMMYYYY(ref.openDate);
            const closeAt = parseDDMMYYYY(ref.closeDate);

            if (!openAt || isNaN(openAt) || !closeAt || isNaN(closeAt)) {
                return ref.status;
            }

            if (today < openAt) return "upcoming";
            if (today > closeAt) return "closed";
            return "open";
            };


    const handleSubmitVote = async (referendumId, optionIndex) => {
    const user = getCurrentUser();
        if (!user) {
            window.location.href = "/";
            return;
        }

        await castVote({
            referendumId,
            uid: user.uid,
            optionIndex,
        });

        setVotedMap(prev => ({ ...prev, [referendumId]: optionIndex }));
    };

    const handleVoted = (referendumId, optionIndex) => { setVotedMap(prev => ({ ...prev, [referendumId]: optionIndex })); };


    if (!authChecked) {
        return (
            <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
            <p className="text-muted">Loading your dashboard...</p>
            </Container>
        );
}



    return(
        <Container fluid className="min-vh-100 p-0" style={{ backgroundColor: BACKGROUND }}>
    <header style={{
            backgroundColor: "#2f0606",
            color: "white",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `3px solid ${GOLD}`,
        }}>
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img src="/MSLR-Icon.png" style={{ height: "52px" }} />
        <div>
        <h1 className="m-0 fs-4">Shangri-La Referendum</h1>
        <small style={{ color: GOLD }}>
            Voting Portal
        </small>
        </div>
    </div>

    <div style={{ textAlign: "right" }}>
        <div className="small">
        Welcome, <strong>{username || "Voter"}</strong>
        </div>
        <Button
        size="sm"
        variant="outline-light"
        onClick={handleLogout}
        className="mt-1"
        >
        Log out
        </Button>
    </div>
    </header>


    <Container className="py-4">
    <Row className="justify-content-center">
        <Col xl={11} lg={11} md={11}>
        
        <Card
            className="shadow-sm border-0"
            style={{
            backgroundColor: CARD_BG,
            borderRadius: "14px",
            padding: "28px",
            }}
        >
            <div
            style={{
                borderLeft: `5px solid ${DARKRED}`,
                paddingLeft: "16px",
                marginBottom: "28px",
            }}
            >
            <h2 className="m-0">Voter Dashboard</h2>
            <small className="text-muted">
                Review active referendums and participate when voting is open
            </small>
            </div>
            <div style={{ ...PANEL, marginBottom: "26px" }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                <h5 className="mb-1" style={{ color: DARKRED, fontWeight: 650 }}>
                    Civic Notice
                </h5>
                <div className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Welcome, citizens of Shangri-La. Review open referendums and cast your vote when voting is in session.
                    Your decision helps shape the future of the realm.
                </div>
                </div>

                <div style={{
                border: `1px solid rgba(201,179,126,0.55)`,
                borderRadius: "999px",
                padding: "10px 12px",
                background: "rgba(201,179,126,0.10)",
                fontWeight: 700,
                color: DARKRED,
                whiteSpace: "nowrap",
                }}>
                Votes are final
                </div>
            </div>

            <div style={{ ...GOLD_DIVIDER, marginTop: "14px" }} />

            <div className="mt-3 d-flex gap-3 flex-wrap text-muted" style={{ fontSize: "0.92rem" }}>
                <span><strong style={{ color: DARKRED }}>{open.length}</strong> open</span>
                <span><strong style={{ color: DARKRED }}>{upcoming.length}</strong> upcoming</span>
                <span><strong style={{ color: DARKRED }}>{closed.length}</strong> closed</span>
            </div>
            </div>

            {/* Open */}
            <section className="mb-5"><div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h4 style={SECTION_TITLE} className="mb-0">
                Open Referendums
                <span style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: DARKRED,
                border: `1px solid rgba(201,179,126,0.7)`,
                borderRadius: "999px",
                padding: "4px 10px",
                background: "rgba(201,179,126,0.10)",
                }}>
                {open.length}
                </span>
            </h4>

            <div style={{ ...GOLD_DIVIDER, flex: 1, minWidth: "140px" }} />
            </div>

            {open.length === 0 ? (
                <p className="text-muted fst-italic">
                No referendums are currently open.
                </p>
            ) : (
                <Row className="g-4 mt-1">
                {open.map(ref => (
                    <Col key={ref.id} xs={12} md={6} xl={4}>
                    <ReferendumCard
                    refData={ref}
                    hasVoted={votedMap[ref.id] !== undefined}
                    userRole={userRole}
                    onSubmitVoted={handleSubmitVote}  />
                    </Col>
                ))}
                </Row>
            )}
            </section>

            {/*  Upcoming  */}
            <section className="mb-5">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h4 style={SECTION_TITLE} className="mb-0">
                    Upcoming Referendums
                    <span style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: DARKRED,
                    border: `1px solid rgba(201,179,126,0.7)`,
                    borderRadius: "999px",
                    padding: "4px 10px",
                    background: "rgba(201,179,126,0.10)",
                    }}>
                    {open.length}
                    </span>
                </h4>

                <div style={{ ...GOLD_DIVIDER, flex: 1, minWidth: "140px" }} />
                </div>


            {upcoming.length === 0 ? (
                <p className="text-muted fst-italic">
                No upcoming referendums scheduled.
                </p>
            ) : (
                <Row className="g-4 mt-1">
                {upcoming.map(ref => (
                    <Col key={ref.id} xs={12} md={6} xl={4}>
                    <ReferendumCard
                    refData={ref}
                    hasVoted={votedMap[ref.id] !== undefined}
                    userRole={userRole}
                    onSubmitVoted={handleSubmitVote}  />
                    </Col>
                ))}
                </Row>
            )}
            </section>


            {/* Closed */}
            <section>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h4 style={SECTION_TITLE} className="mb-0">
                    Closed Referendums
                    <span style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: DARKRED,
                    border: `1px solid rgba(201,179,126,0.7)`,
                    borderRadius: "999px",
                    padding: "4px 10px",
                    background: "rgba(201,179,126,0.10)",
                    }}>
                    {open.length}
                    </span>
                </h4>

                <div style={{ ...GOLD_DIVIDER, flex: 1, minWidth: "140px" }} />
                </div>

            {closed.length === 0 ? (
                <p className="text-muted fst-italic">
                No referendums have closed yet.
                </p>
            ) : (
                <Row className="g-4 mt-1">
                {closed.map(ref => (
                    <Col key={ref.id} xs={12} md={6} xl={4}>
                    <ReferendumCard
                    refData={ref}
                    hasVoted={votedMap[ref.id] !== undefined}
                    userRole={userRole}
                    onSubmitVoted={handleSubmitVote}  />
                    </Col>
                ))}
                </Row>
            )}
            </section>

        </Card>
        </Col>
    </Row>
    </Container>
</Container>
);
}

export default VoterDashboard;