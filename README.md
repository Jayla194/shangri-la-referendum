# Shangri-La Referendum 🗳️

**My Shangri-La Referendum (MSLR)** is a full-stack web-based voting platform developed as part of a final-year university assignment for *Mobile and Web Applications*.  

---

## Project Overview

The system allows eligible citizens to register, authenticate, and participate in public referendums, while providing the Electoral Commission with tools to create, manage, and monitor voting activity.

The application was designed to meet a formal coursework brief, with an emphasis on:
- correctness and reliability
- clear separation of concerns
- secure data handling
- usability and accessibility

---

## Core Features

### Voter
- Secure registration using a Shangri-La Citizen Code (SCC)
- Age verification (18+)
- Authentication via Firebase Authentication
- View open, upcoming, and closed referendums
- Cast **exactly one vote per referendum**
- Clear visual indicators for voting status (open, closed, voted)

### Electoral Commission
- Create referendums with titles, descriptions, and multiple options
- Schedule referendums using opening and closing dates
- Manually open and close referendums if required
- Automatic referendum closure when voting conditions are met (e.g. ≥50% participation)
- View total votes and votes per option for each referendum

---

## QR Code Registration

- Voters may manually enter their SCC or scan a QR code
- QR codes link directly to the registration page with the SCC pre-filled

**Example:**  
`/register?scc=N5J53QK9FO`

---

## Voting System

- Votes are stored anonymously in Firestore
- Each authenticated voter may vote only once per referendum
- Votes cannot be changed or withdrawn after submission
- Voting is disabled for upcoming and closed referendums

---

## REST API

A REST API is implemented using **Node.js and Express** to expose referendum data.

- Retrieve referendums by status (`upcoming`, `open`, `closed`)
- Retrieve a single referendum using a numeric identifier
- The API supports automated testing and can run independently of Firebase using local mock data
- This ensures consistent behaviour while the live application continues to use Firebase Firestore

---

## Technology Stack

- React (Vite)
- React Bootstrap
- Firebase Authentication
- Firebase Firestore
- Node.js
- Express (REST API)

---

## Security and Data Handling

- Authentication is handled entirely by Firebase Authentication
- Passwords and authentication credentials are never stored in Firestore
- Firestore stores only non-sensitive user data
- Access control is enforced using Firestore security rules
- SCCs are stored as unique identifiers to prevent reuse

---

## Test Accounts

These accounts are provided for assessment and demonstration purposes.

**Voter**  
- Email: `voter@email.com`  
- Password: `voter1234`

**Commissioner**  
- Email: `ec@referendum.gov.sr`  
- Password: `Shangrilavote&2025@`

---

## Setup Instructions

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
---

### Running the Backend (REST API)
```bash
- cd backend
- npm install
- node src/index.js
- The REST API runs on http://localhost:4000
```
--- 

## REST API Endpoints

- GET /mslr/referendum?status=upcoming

- GET /mslr/referendum?status=open

- GET /mslr/referendum?status=closed

- GET /mslr/referendum/:id

---

## Backend Notes

The REST API runs using local mock data to support consistent automated testing without requiring Firebase credentials.
The deployed frontend continues to use Firebase Firestore for live data.

### Firestore collections used:

users
- firstName (string)
- lastName (string)
- dob (string)
- scc (string)
- role (string)

referendums
- ref_id (number)
- title (string)
- description (string)
- options (string)
- status (string)
- openDate (string)
- closeDate (string)

votes
- refID (string)
- optionIndex (number)

scc
- code (string)
- used (boolean)

