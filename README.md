## 📡 Backend API Documentation

### Base URL
`http://localhost:5000/api` (or live Render backend URL)

Check details of Live App below.

Task B is in docs folder.

---

### 🔑 Authentication Routes

#### `POST /api/auth/register`
* **Description:** Registers a new user (Admin or Member).
* **Access:** Public
* **Request Body:**
    ```json
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "role": "MEMBER" // Optional: "ADMIN" or "MEMBER" (Default: "MEMBER")
    }

* **Response (201 Created):**
    ```json
    {
        "message": "User registered successfully",
        "user": { "id": "60d5ecb...", "name": "John Doe", "email": "john@example.com", "role": "MEMBER" }
    }

#### `POST /api/auth/login`
* **Description:** Authenticates a user and returns a JWT token.
* **Access:** Public
* **Request Body:**
    ```json
    {
        "email": "john@example.com",
        "password": "password123"
    }

* **Response (200 OK):**
    ```json
    {
        "message": "Login successful",
        "token": "eyJhbGciOiJIUzI1Ni...",
        "user": { "id": "60d5ecb...", "name": "John Doe", "email": "john@example.com", "role": "MEMBER" }
    }

#### `GET /api/auth/users`
* **Description:** Retrieves all registered team members for lead assignment.
* **Access:** Private (ADMIN only)
* **Headers:** Authorization: Bearer <JWT_TOKEN>


### 📋 Lead Management Routes

#### `POST /api/leads/public`
* **Description:** Public-facing form submission to capture new leads.
* **Access:** Public
* **Request Body:**
    ```json
    {
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.com",
        "company": "Cyberdyne Systems"
    }

* **Response (201 Created):**
    ```json
    {
        "message": "Lead submitted successfully",
        "lead": { "_id": "60d5ecc...", "name": "Sarah Connor", "status": "NEW" }
    }

#### `GET /api/leads`
* **Description:** Fetches paginated leads. Members see only assigned leads; Admins see all leads.
* **Access:** Private (ADMIN & MEMBER)
* **Headers:** Authorization: Bearer <JWT_TOKEN>
* **Query Params:** ?page=1&limit=5&status=NEW
* **Response (200 OK):**
    ```json
    {
        "leads": [...],
        "pagination": { "page": 1, "limit": 5, "totalPages": 3, "totalItems": 15 }
    }

#### `PATCH /api/leads/:id/status`
* **Description:** Updates the pipeline status of a lead (NEW, CONTACTED, QUALIFIED, LOST).
* **Access:** Private (ADMIN, or MEMBER assigned to the lead)
* **Headers:** Authorization: Bearer <JWT_TOKEN>
* **Request Body:**
    ```json
    {
        "status": "QUALIFIED"
    }

#### `PATCH /api/leads/:id/assign`
* **Description:** Assigns a lead to a team member.
* **Access:** Private (ADMIN only)
* **Headers:** Authorization: Bearer <JWT_TOKEN>
* **Request Body:**
    ```json
    {
        "assignedTo": "60d5ecb..." // User ID
    }


### 📝 Notes & Activity Log Routes

#### `POST /api/leads/:id/notes`
* **Description:** Adds a timestamped note to a lead and logs the action.
* **Access:** Private (ADMIN & MEMBER)
* **Headers:** Authorization: Bearer <JWT_TOKEN>
* **Request Body:**
    ```json
    {
        "text": "Called customer today. Very interested in enterprise plan."
    }

#### `GET /api/leads/:id/activity`
* **Description:** Fetches all notes and historical activity trail for a lead.
* **Access:** Private (ADMIN & MEMBER)
* **Headers:** Authorization: Bearer <JWT_TOKEN>

---

### 🚦 Standard HTTP Status Codes Returned

| Status Code | Description | Occurrence |
| :---: | :---: | :---: |
| 200 OK | Success | Request succeeded (GET, PATCH status/assign) |
| 201 Created | Created | Resource successfully created (Public submission, Register, Notes) |
| 400 Bad Request | Client Error | Missing required fields or invalid data formats |
| 401 Unauthorized | Auth Error | Missing or invalid JWT authorization token |
| 403 Forbidden | Permission Error | User lacks role privileges (e.g., MEMBER accessing ADMIN endpoints) |
| 404 Not Found | Resource Error | Lead or User ID does not exist in database |
| 500 Internal Server Error | Server Error | Unhandled server or database error |

---

## 🚀 Live Demo & Deployment Links

* **Live Application:** https://digital-heroes-assignment-tau.vercel.app/
* **Backend API Base URL:** https://digital-heroes-assignment-server.onrender.com
* **GitHub Repository:** https://github.com/KtsSoftwares/Digital-Heroes-Assignment

---

## 🔑 Test Credentials

You can log in with the following pre-configured test accounts, or create new ones via the `/register` page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `shakti@dd1.com` | `123456` | Full access: View all leads, reassign team members, update status, add notes |
| **Member** | `bodmas@bad.com` | `123456` | Assigned access: View assigned leads, update status, add notes |
| **Member** | `mog@boss.com` | `123456` | Assigned access: View assigned leads, update status, add notes |

---

## AI Usage Disclosure
* I used Gemini AI to pressure-test my initial ideas and help outline the overall structure for Task A. Afterwards, I heavily edited the generated text to reflect my own voice, removed overly generic phrasing, and added specific real-world details based on my project requirements.

* I used ChatGPT to help debug a logic error in Task A and suggest optimal code structures for the API routes. After reviewing the suggestions, I refactored the code to align with my project’s overall architecture, renamed variables for consistency, and manually tested the edge cases to ensure stability.

* For Task B I took help from Gemini AI to help me structure the Task in well manner and help me plan my strategy, refactored my code and debugging.