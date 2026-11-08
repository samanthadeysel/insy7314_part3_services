# HustleHub+ Backend API

HustleHub+ is a secure marketplace platform that was designed to connect freelance service providers with prospective clients. Freelancers can advertise their service offerings (known as 'gigs' on the platform) and clients can browse and book those services.

Please check this link for the video demonstration -> https://youtu.be/YuNe2kkBRXg

Team members -> Nia Thandolwethu Cele (ST10439898), Samantha Abigail Deysel (ST10444488), Sizwe Thandaza Majola (ST10114043)

---

## Intended Users and their Roles
- Client: These are users seeking services. They browse published gig listings and schedule bookings.
- Freelancer: These are independent providers who are offering services. They create gig listings, confirm booking requests, and complete their work as ordered.
- Administrator: These users have privileged accounts which allow them to do tasks such as audit platform activity, moderate gig listings, and manage bookings.

---

## MERN System Architecture
Below is the Part 1 architecture diagram illustrating the expanded API system, with works in progress and upcoming milestones labeled accordingly.

<img width="901" height="2213" alt="INSY7314 - MERN Architecture drawio" src="https://github.com/user-attachments/assets/60fac854-ff37-485d-b573-2ef7667e6082" />


The request lifecycle is as follows:
- A request arrives over HTTPS/TLS
- Express applies security headers to the request via Helmet, restricts origins via CORS, and restricts the request body size to 10kb
- Any protected routes pass through the middleware to verify Bearer JWT signatures and any role-based routes evaluate the user's role
- Input data is sanitized and validated before it reaches business logic (controllers)
- Controllers handle the business logic and query the database when needed
- Controllers construct a JSON payload and return an appropriate status code to send back to the client
- If an exception occurs, the errorHandler intercepts and sends a JSON error response to the effect of (500 Something went wrong)

---

## Security
- Passwords are salted and hashed during registration, ensuring credentials are never stored in plain text.
- Authenticated users receive a signed JSON Web Token containing their user ID and role, configured with a 1-hour expiration window to limit token replay windows.
- All communications are secured over TLS/HTTPS with local certificates, safeguarding tokens and request bodies from interception or man-in-the-middle attacks.
- Dedicated rate limiting (express-rate-limit) protects authentication endpoints by capping requests per IP window, preventing credential-stuffing and brute-force guessing.
- Input validation is enforced at both frontend and API layers. Examples include requiring minimum password lengths, ensuring positive numeric values and approved categories for gigs, verifying valid MongoDB ObjectIds, and validating booking status transitions.
- Strict role-based authorization boundaries prevent privilege escalation: only clients can instantiate gig bookings, only freelancers can access income aggregations, and platform-wide transaction audits remain restricted to admins.
- Financial records are treated as append-only historical artifacts: transactions cannot be manually edited or deleted by users, and canceled bookings transition status rather than deleting financial history.
- A centralized error-handling middleware catches operational and syntax failures across asynchronous operations, masking internal stack traces from client-facing responses.

---

## 5. Security Implementations & Threat Model Review

This project applies security as a primary architectural requirement rather than an afterthought. Below is the threat matrix mapping vulnerabilities to our implemented defenses:

| Threat Vector | Severity | Implemented Defense Mechanism |
| --- | --- | --- |
| **NoSQL Injection** | High | `express-mongo-sanitize` strips MongoDB operators (`$gt`, `$ne`, `$where`) from `req.body`, `req.query`, and `req.params`. |
| **Cross-Site Scripting (XSS)** | High | Request body sanitization via `xss` library and Helmet Content Security Policy (`CSP`) restricting inline execution. |
| **HTTP Parameter Pollution (HPP)** | Medium | `hpp` middleware prevents array pollution on key query strings like `category` and `status`. |
| **Broken Access Control (RBAC)** | Critical | `authMiddleware` verifies JWT role payloads (`client`, `freelancer`, `admin`) and enforces resource ownership checks. |
| **Brute Force & DoS Attacks** | Medium | `express-rate-limit` caps login attempts to 20 per 15 min and booking requests to 30 per 15 min. |
| **Eavesdropping / MITM** | Critical | Enforced SSL/TLS HTTPS encryption using local certificates. |
| **Information Disclosure** | Low | Custom `errorHandler` masks internal stack traces and database errors in production responses. |

## Custom Extra Security Features

Beyond standard requirements, the following custom security controls were implemented:

1. **NoSQL Query Injection Prevention:** Custom middleware integration (`express-mongo-sanitize`) to block operator-based authentication bypasses.


2. **HTTP Parameter Pollution Guard:** `hpp` protection preventing payload parameter pollution attacks on search and status filters.


3. **XSS Input Sanitization Pipeline:** Automatic recursive string sanitization on incoming JSON requests.

---

## Directory Structure
Below is a diagram illustrating how the API's backend is structured
```text
insy7314-insy-7314-assignment-1-poe-niacele/
├── api/
│   ├── certs/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── index.js
│   ├── newman-report.html
│   ├── package.json
│   └── package-lock.json
├── client/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── postman/
│   └── INSY7314_PartTwo.postman_collection.json
├── .gitignore
└── README.md
```[cite: 10, 11, 12, 13]                 
```
---

## Financial & Tax Estimation Logic

Freelancers can monitor total income generated from confirmed bookings through their dashboard. Estimated tax is computed in `taxController.js` using South African SARS progressive tax brackets:

* **Tax Bracket 1 (R0 - R237,100):** $18\%$
* **Tax Bracket 2 (R237,101 - R370,500):** $\text{R}42,678 + 26\%$ of amount above $\text{R}237,100$
* **Tax Bracket 3 (R370,501+):** $\text{R}77,362 + 31\%$ of amount above $\text{R}370,500$

```javascript
// Tax Estimation Math
const totalIncome = transactions.reduce((sum, item) => sum + item.amount, 0);
const estimatedTax = calculateEstimatedTax(totalIncome);
const netIncome = totalIncome - estimatedTax;

```
---

## Event Logging & Audit System

Log events are captured using `winston` and streamed to Cloud Logging ( Better Stack ):

1. **Authentication Events:** Successful logins, registrations, and failed password attempts (capturing IP and user ID).

2. **Booking Events:** New booking requests, cancellations, and status updates.

3. **Transaction Operations:** Automatic transaction generation linked to bookings.

4. **Unhandled Application Errors:** Centralized error reporting including method, endpoint URL, and stack traces.

---

## Setup and Installation
Before this API can run on your device, there are a few prerequisites that need to be attended to.
- Node.js would need to be installed on your device
- There needs to be an instance of MongoDB

After cloning the repo, you would need to generate local SSL certificated. This can be done via running the following in your console:

```bash
mkdir certs
openssl req -nodes -new -x509 -keyout certs/localhost-key.pem -out certs/localhost-cert.pem -days 365 -subj "/CN=localhost"
```

You would also need to create a .env file to configure environment variables. Include the following in your .env file:

```env
PORT=5000
USE_HTTPS=true
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/hustlehub
JWT_SECRET=super_secure_jwt_secret_key_12345
JWT_EXPIRES_IN=1h
```

You can now safely run the server and interact with the API !

To run the Api:
```bash
node index.js
```

To be able to run Client on your device:
Before you can run Client, you will need to ensure that installations are complete, and prerequisites are attended to
- General install

```bash
npm install
```

Now, it is ensured that all necessary Client files are installed.

To run the Client Frontend:
```bash
npm run dev
```

---

## API Endpoints
The API currently has several endpoint's but there are 4 mains ones.


| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Returns a message with the system status and active protocol |
| **POST** | `/api/auth/register` | Registers a new user with a hashed password |
| **POST** | `/api/auth/login` | Authenticates user credentials and issues a signed JWT |
| **GET** | `/api/auth/me` | Returns the current user's profile via a Bearer token |

## Postman Tests
Several Postman tests were run to ensure that the endpoints function as intended.

<img width="1069" height="760" alt="WhatsApp Image 2026-09-06 at 20 37 41 (1)" src="https://github.com/user-attachments/assets/ec7a70d6-38c8-4306-a3dd-2e7c1d715ab5" />

The above screenshot shows what successful user registration looks like.

---

<img width="1063" height="639" alt="image" src="https://github.com/user-attachments/assets/992712a5-45ae-4c95-9d00-786227e026d4" />

The above screenshot shows what an unsuccessful registration looks like which was caused by a data type mismatch.

---

<img width="1076" height="635" alt="WhatsApp Image 2026-09-06 at 20 37 42 (1)" src="https://github.com/user-attachments/assets/194006ff-2da8-40ac-9f4f-8ede4ef12ec0" />

The above screenshot shows what an unsuccessful registration looks like which was caused by the password not meeting the minimum requirements.

---

<img width="1074" height="625" alt="WhatsApp Image 2026-09-06 at 20 37 42 (2)" src="https://github.com/user-attachments/assets/6b3923c0-95d0-46eb-b3cc-c7efaea59661" />

The above screenshot shows what an unsuccessful registration looks like which was due to the fact that a user with these credentials already exists.

---

<img width="1069" height="870" alt="WhatsApp Image 2026-09-06 at 20 37 43" src="https://github.com/user-attachments/assets/f93fae97-1f89-4d2d-9639-7d0d06d11d66" />

The above screenshot shows what a successful login looks like.

---

<img width="1070" height="647" alt="WhatsApp Image 2026-09-06 at 20 37 43 (1)" src="https://github.com/user-attachments/assets/a7edaa01-eccf-4662-874f-487293f54603" />

The above screenshot shows what an unsuccessful login looks like which was caused by the empty password field.

---

<img width="1072" height="670" alt="WhatsApp Image 2026-09-06 at 20 37 43 (2)" src="https://github.com/user-attachments/assets/9822c965-6303-4cc8-b386-33161cd5e304" />
<img width="1073" height="640" alt="WhatsApp Image 2026-09-06 at 20 37 44" src="https://github.com/user-attachments/assets/cb52f9d8-e8c1-4cb0-b465-2c6b391bf81f" />

The above screenshots shows what an unsuccessful login looks like due to the usage of incorrect user credentials (like wrong email or wrong password).

---

<img width="1101" height="933" alt="WhatsApp Image 2026-09-06 at 20 37 40" src="https://github.com/user-attachments/assets/66845a0c-5484-4db1-a880-f4abf6187045" />
<img width="1049" height="885" alt="WhatsApp Image 2026-09-06 at 20 37 41" src="https://github.com/user-attachments/assets/e95419cd-2cca-4918-8697-17346a189d35" />

The above screenshots shows a successful gig creation through the use of a JWT token being added to the Authorization portion of the test. The Body portion of the test contained all the required fields.

---

<img width="1403" height="871" alt="image" src="https://github.com/user-attachments/assets/bfcfde11-4acc-4446-9ebe-95d8d60d5c6b" />

The above screenshot shows a client logging in.

---

<img width="1440" height="883" alt="image" src="https://github.com/user-attachments/assets/33cd228f-e5cc-423d-97e7-291467401ca3" />

The above screenshot shows a successful booking of a gig

---

<img width="957" height="1075" alt="WhatsApp Image 2026-10-11 at 9 49 53 PM" src="https://github.com/user-attachments/assets/7111156e-fb22-47a9-a0c0-fb8d692ab501" />

The above screenshot shows the successful running of the Newman executions. This is done through the use of Postman.

---

<img width="949" height="135" alt="WhatsApp Image 2026-10-11 at 9 49 53 PM 1" src="https://github.com/user-attachments/assets/c6f9bba2-8d0b-4631-a5a5-dd334421f4fd" />

The above screenshot shows the successful running of HustleHub's API, as well as its connection to MongoDb, and which port the API is running on.

---

<img width="1911" height="1065" alt="image" src="https://github.com/user-attachments/assets/ac7bb95b-1677-4a69-a087-c53c34963158" />

The above screenshot shows the login page of the frontend.

---

<img width="1914" height="1064" alt="image" src="https://github.com/user-attachments/assets/fff19fc5-2e91-4383-bf0e-f1ce934aa9f1" />
<img width="1916" height="1064" alt="image" src="https://github.com/user-attachments/assets/e30e50d4-a772-44a5-83bd-87eae56763fe" />

The above screenshots show the Dashboard of a freelancer, including the Income, Creating a gig, as well as a list of the available bookings.

---

<img width="1915" height="1063" alt="image" src="https://github.com/user-attachments/assets/09d1c8b1-0d43-4753-b66e-be0f3c4ec6a0" />

The above screenshot shows the dashboard of a client that can book a gig, and shows all available gigs for the client to choose from.

---

--image--

The above screenshot shows the cloud logging dashboard demonstrating real-time ingestion of system audit events, including user authentication attempts (successful/failed), booking status changes, transaction creation, and centralized error logs.

---

--image--

The above screenshot shows the SonarCloud Quality Gate report passing across backend and frontend codebases, demonstrating zero open security hotspots, resolved code smells, and verified vulnerability checks.

---
