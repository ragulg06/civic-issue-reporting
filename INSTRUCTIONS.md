## Civic IVR Integration – What Changed and How It Works

This document explains exactly what was added to your teammates Node.js API to provide a Twilio IVR (Interactive Voice Response) for civic issue reporting, how to run it, and how to test it endtoend.

### 1) Highlevel Overview
- Added a minimal IVR flow using Twilio TwiML:
  - Caller hears a menu (report an issue or check status)
  - If reporting: call is recorded, a complaint ID is returned
  - If checking status: caller enters ID, system responds with current status
- Added admin endpoints to view/update complaints
- Added a Mongoose model for complaints

### 2) Files changed/added
- server.js
  - Mounted routes: /api/ivr (IVR) and /api/admin (admin ops)
  - Enabled odyParser.urlencoded({ extended: false }) so Twilio formencoded POST webhooks are parsed
  - Kept /health endpoint for quick liveness checks
- routes/ivr.js (new)
  - POST /api/ivr/voice: Entry point that returns a TwiML Gather menu
  - POST /api/ivr/menu: Handles DTMF selection (1=record, 2=status)
  - POST /api/ivr/process-recording: Receives RecordingUrl from Twilio; saves complaint and confirms complaint ID
  - POST /api/ivr/status: Accepts DTMF complaint ID and speaks back the status
  - Robust fallback: if MongoDB is down, generates a temporary ID so the call still succeeds (no Twilio "Application Error")
- models/Complaint.js (new)
  - Schema to store complaints created via IVR: complaintId, phoneNumber, ecordingUrl, status, etc.
  - Presave hook generates IDs like CIV-XXXXXX-XXX
- routes/admin.js (new)
  - GET /api/admin/complaints: List recent complaints
  - GET /api/admin/complaints/:id: Fetch by complaintId
  - PUT /api/admin/complaints/:id/status: Update status and optionally add notes

### 3) IVR call flow (Twilio  your API)
1. Incoming call hits Twilio number
2. Twilio webhooks to your server:
   - POST https://<ngrok-domain>.ngrok-free.app/api/ivr/voice
3. Your API returns TwiML:
   - "Press 1 to report an issue. Press 2 to check status"
4. If caller presses 1:
   - Twilio prompts and records (max 30s, finish on #)
   - Twilio then POSTs RecordingUrl to /api/ivr/process-recording
   - API tries to save a complaint; on success speaks back CIV-... ID; if DB down, speaks a TMP-... ID
5. If caller presses 2:
   - Twilio gathers complaint ID and POSTs it to /api/ivr/status
   - API looks up ID and speaks current status (or tells caller if not found)

### 4) Exact endpoints added
- IVR (Twilio)
  - POST /api/ivr/voice
  - POST /api/ivr/menu
  - POST /api/ivr/process-recording
  - POST /api/ivr/status
- Admin
  - GET  /api/admin/complaints
  - GET  /api/admin/complaints/:id
  - PUT  /api/admin/complaints/:id/status

### 5) Data model (Mongoose)
- models/Complaint.js
  - Fields: complaintId (unique), phoneNumber, ecordingUrl, description, status (pending|in-progress|resolved|closed), priority, category, ssignedTo, 
otes[]
  - AutoID: generated in a presave hook as CIV-<6digits>-<3digits>

### 6) Running locally
- Start the Node server
  - 
pm start  (or 
ode server.js)
  - Check: http://localhost:5000/health  { status: 'OK', ... }
- Expose with ngrok
  - 
grok http 5000
  - Copy the shown HTTPS URL (e.g., https://8ac627a0be36.ngrok-free.app)
- Configure Twilio webhook
  - Twilio Console  Phone Numbers  your number  Voice  A Call Comes In:
    - Webhook URL: https://<ngrok-domain>.ngrok-free.app/api/ivr/voice
    - Method: POST
  - Save

### 7) Quick local tests (PowerShell)
- IVR entry (expect TwiML XML)
  - Invoke-WebRequest -Uri http://localhost:5000/api/ivr/voice -Method POST -ContentType "application/x-www-form-urlencoded" -Body "From=%2B123"
- IVR via ngrok
  - Invoke-WebRequest -Uri https://<ngrok-domain>.ngrok-free.app/api/ivr/voice -Method POST -ContentType "application/x-www-form-urlencoded" -Body "From=%2B123"
- Admin list (MongoDB must be running)
  - Invoke-WebRequest -Uri http://localhost:5000/api/admin/complaints -Method GET

### 8) Behavior if MongoDB is not running
- /api/ivr/process-recording now catches DB errors
- It generates a temporary complaint ID like TMP-XXXXXX-XXX and still responds with valid TwiML, so callers never hear Twilio "Application Error"
- Admin endpoints will return DB errors until MongoDB is running

### 9) Troubleshooting
- Caller hears "Application Error"
  - Most common cause: wrong webhook path. Ensure Twilio points to /api/ivr/voice (not /)
  - Watch server logs while calling: 
ode server.js
  - Twilio Console  Monitor  Debugger shows exact request URL and response/errors
- You see ECONNREFUSED 127.0.0.1:27017
  - MongoDB isnt running locally. Either start MongoDB service, or switch to MongoDB Atlas and update connection string
- Ngrok 404s or different hostname
  - Ngrok URL changes each time. Update the Twilio webhook after restarting ngrok
- Trial account message
  - Twilio trial numbers play a trial notice before your IVR. This is expected

### 10) Suggested next steps
- Protect admin endpoints with auth (JWT/session)
- Add SMS confirmation with the complaint ID
- Build a small web dashboard to search/update complaints
- Store transcriptions (Twilio transcription or external service) to capture text description
- Persist temp complaints for later reconciliation when DB is back up

---
This IVR layer is intentionally minimal and costefficient (MVP). It returns TwiML directly and uses few dependencies, so you can extend it easily inside your existing Node.js API.
