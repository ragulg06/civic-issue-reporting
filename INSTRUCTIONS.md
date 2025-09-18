### IVR Backend Integration Guide

#### What was added/changed
- server.js
  - Mounted routes: /api/ivr and /api/admin
  - Enabled odyParser.urlencoded({ extended: false }) for Twilio webhooks
  - Health check: /health
- routes/ivr.js
  - POST /api/ivr/voice: Entry point, returns TwiML menu (Gather)
  - POST /api/ivr/menu: Handles key press (1 = record, 2 = status)
  - POST /api/ivr/process-recording: Receives RecordingUrl, saves complaint; falls back to temp ID if DB is down
  - POST /api/ivr/status: Looks up complaint by complaintId and speaks status
- models/Complaint.js
  - Schema for IVR complaints with auto complaintId (CIV-XXXXXX-XXX)
- routes/admin.js
  - GET /api/admin/complaints
  - GET /api/admin/complaints/:id
  - PUT /api/admin/complaints/:id/status

#### IVR call flow
1) Twilio calls webhook: POST https://<ngrok>/api/ivr/voice
2) Server replies TwiML menu: Press 1 to report, Press 2 to check status
3) If 1  Twilio records message  POST /api/ivr/process-recording
   - Saves complaint (or generates TMP-... if DB unavailable) and speaks back the ID
4) If 2  Twilio gathers complaint ID  POST /api/ivr/status  speaks current status

#### Running locally
- Start app: 
pm start (or 
ode server.js)
- Health: http://localhost:5000/health
- Start ngrok: 
grok http 5000  copy HTTPS URL
- Twilio Voice webhook (A Call Comes In): https://<ngrok>/api/ivr/voice (POST)

#### Testing quickly (PowerShell)
- IVR entry (local):
  Invoke-WebRequest -Uri http://localhost:5000/api/ivr/voice -Method POST -ContentType "application/x-www-form-urlencoded" -Body "From=%2B123"
- Through ngrok:
  Invoke-WebRequest -Uri https://<ngrok>/api/ivr/voice -Method POST -ContentType "application/x-www-form-urlencoded" -Body "From=%2B123"
- Admin list (requires MongoDB running):
  Invoke-WebRequest -Uri http://localhost:5000/api/admin/complaints -Method GET

#### Notes
- Trial accounts play a Twilio message before your IVR.
- Ngrok URL changes on restart; update Twilio each time.
- If MongoDB is down, recording still succeeds with a temporary ID so callers dont get an application error.
