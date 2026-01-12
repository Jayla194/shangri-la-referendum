// backend/src/mockData.js
// Mock dataset for automated REST API tests (no Firebase required)

export const referendums = [
{
    ref_id: 1,
    title: "Should Shangri-La set up a weekly night market?",
    description:
    "The Shangri-La Council is considering the introduction of a weekly night market in the central district. The proposal aims to support local businesses, attract tourism, and provide a new social space for residents. Please indicate your preference below.",
    status: "open",
    openDate: "10-01-2026",
    closeDate: "25-01-2026",
    options:
    "Yes, introduce a weekly night market/No, do not introduce a night market/Unsure or need more information",
},
{
    ref_id: 2,
    title: "Free Public Transport on Weekends",
    description:
    "This proposal would make all public buses and trams free to use on Saturdays and Sundays, with the aim of reducing traffic congestion, supporting low-income citizens, and encouraging environmentally friendly travel.",
    status: "upcoming",
    openDate: "01-02-2026",
    closeDate: "15-02-2026",
    options:
    "Yes, introduce free weekend transport/No, keep the current fare system",
},
{
    ref_id: 3,
    title: "Western Crossing Name",
    description:
    "What should the new western river crossing be officially named?",
    status: "closed",
    openDate: "01-12-2025",
    closeDate: "10-12-2025",
    options:
    "Crimson Crossing/Unity Bridge/Western Gate Bridge",
},
{
    ref_id: 4,
    title: "Ceremonial Illumination Policy",
    description:
    "Should public buildings be illuminated during national ceremonies?",
    status: "closed",
    openDate: "05-12-2025",
    closeDate: "15-12-2025",
    options: "Yes/No",
},
{
    ref_id: 5,
    title: "National Emblem Selection",
    description:
    "Which symbol should serve as the national emblem of Shangri-La?",
    status: "closed",
    openDate: "10-12-2025",
    closeDate: "20-12-2025",
    options:
    "Crimson Phoenix/Mountain Stag/Moonlight Dragon",
},
{
    ref_id: 6,
    title: "National Border Expansion",
    description:
    "Should Shangri-La pursue an expansion of its administrative boundaries to incorporate adjacent counties?",
    status: "closed",
    openDate: "12-12-2025",
    closeDate: "22-12-2025",
    options:
    "Expand its boundaries to include all adjacent counties/Remain status quo",
},
];
