# My Shangri-La Referendum (MSLR)

My Shangri-La Referendum (MSLR) is a web-based voting platform developed for the Shangri-La Electoral Commission. The system enables eligible citizens to register, authenticate, and participate in public referendums, while providing the Commission with tools to create, manage, and monitor voting activity.

## Live Application

🔗 https://shangrilareferendum.web.app/

---

## Core Features

### Voter

- Secure registration using Shangri-La Citizen Code (SCC)
- Age verification (18+)
- Authentication using Firebase Authentication
- View open, upcoming, and closed referendums
- Cast exactly one vote per referendum
- Clear visual indicators for voting status (open, closed, voted)

### Election Commission
- Create referendums with titles, descriptions, and multiple options
- Open and close referendums manually
- Support for upcoming referendums to allow scheduling before opening
- Automatic referendum closure when voting conditions are met
- View total votes and votes per option for each referendum

---

## QR code Registration

- Voters may manually enter their SCC or scan a QR code
- QR codes link to the registration page with the SCC pre-filled

Example: `/register?scc=N5J53QK9FO`

---

## Voting System

- Votes are stored anonymously in Firestore
- Each authenticated voter may cast only one vote per referendum
- Votes cannot be changed or withdrawn after submission
- Voting is disabled for upcoming and closed referendums

---

## REST API

A REST API is implemented using Node.js and Express to view referendum data
- Referendums can be retrieved by status (upcoming/ open/ closed)
- Individual referendums can be retrieved using a numeric identifier
- The REST API supports automated testing and can run independently of Firebase using local mock data
- This ensures consistent behaviour while the live application continues to use Firebase Firestore

---

## Technology Used

- React
- React Bootstrap
- Fireabse Authenticate
- Firebase Firestore
- Node.js
- Express (REST API)

---

## Security and Data Handling

- Authentication is handled entirely by Firebase Authentication
- Passwords and authentication credentials are never stored in Firestore
- Firestore stores only non-sensitive user data
- Access to data is controlled using Firestore security rules
- SCCs are stores as unique identifiers to prevent reuse
- Access control us enforced usign Firestore security rules

---

### Test Accounts

Voter:
Email: voter@email.com
Password: voter1234

Commissioner:
Email: ec@referendum.gov.sr
Password: Shangrilavote&2025@

---

## Setup Instructions

### Running the Frontend
- cd frontend
- npm install
- npm run dev
- Note: The frontend is already deployed via Firebase Hosting

### Running the Backend

- cd backend
- npm install
- node src/index.js
- The REST API runs on http://localhost:4000

---

## Firebase Notes

- Firebase Authentication manages all login and registration logic

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

