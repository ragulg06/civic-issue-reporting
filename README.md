# Civic Issue Reporting IVR System

A Node.js backend system for handling civic issue reports via Interactive Voice Response (IVR) using Twilio.

## Features

- **IVR Menu System**: Callers can report issues or check status
- **Voice Recording**: Records complaint descriptions (up to 30 seconds)
- **Complaint Tracking**: Generates unique complaint IDs and tracks status
- **Database Storage**: Stores complaints in MongoDB with full metadata
- **Admin Interface**: REST API endpoints for managing complaints

## Setup

### 1. Install Dependencies
`ash
npm install
`

### 2. Start MongoDB
Make sure MongoDB is running on mongodb://127.0.0.1:27017/civic

### 3. Start the Server
`ash
npm start
`

The server will run on http://localhost:5000

## IVR Endpoints

### Main IVR Entry Point
- **URL**: POST /api/ivr/voice
- **Description**: Entry point for Twilio webhook
- **Twilio Webhook**: Set this as your Twilio phone number's voice webhook

### Menu Handler
- **URL**: POST /api/ivr/menu
- **Description**: Handles menu selections (1 for report, 2 for status)

### Recording Processor
- **URL**: POST /api/ivr/process-recording
- **Description**: Processes voice recordings and saves to database

### Status Checker
- **URL**: POST /api/ivr/status
- **Description**: Checks complaint status by ID

## Admin Endpoints

### Get All Complaints
- **URL**: GET /api/admin/complaints
- **Description**: Retrieve all complaints (last 50)

### Get Complaint by ID
- **URL**: GET /api/admin/complaints/:id
- **Description**: Get specific complaint details

### Update Complaint Status
- **URL**: PUT /api/admin/complaints/:id/status
- **Body**: { "status": "resolved", "notes": "Issue fixed" }

## Twilio Configuration

1. **Phone Number Setup**: 
   - Buy a Twilio phone number
   - Set voice webhook to: https://your-ngrok-url.ngrok.io/api/ivr/voice
   - HTTP method: POST

2. **ngrok Setup** (for local development):
   `ash
   ngrok http 5000
   `
   Use the HTTPS URL provided by ngrok as your webhook URL.

## IVR Flow

1. **Caller dials** your Twilio number
2. **System greets** and presents menu:
   - Press 1: Report an issue
   - Press 2: Check status
3. **If 1**: Records voice message (30s max, finish with #)
4. **If 2**: Asks for complaint ID, then provides status
5. **System saves** complaint with unique ID and confirms to caller

## Database Schema

### Complaint Model
- complaintId: Unique identifier (CIV-XXXXXX-XXX)
- phoneNumber: Caller's phone number
- ecordingUrl: Twilio recording URL
- status: pending, in-progress, resolved, closed
- priority: low, medium, high, urgent
- category: infrastructure, safety, environment, other
- createdAt: Timestamp
- 
otes: Array of admin notes

## Testing

1. **Start the server**: 
pm start
2. **Test IVR endpoint**: Use Postman to POST to /api/ivr/voice
3. **Check complaints**: GET /api/admin/complaints
4. **Test with real phone**: Set up Twilio webhook and call your number

## Environment Variables

Create a .env file for production:
`
MONGODB_URI=mongodb://localhost:27017/civic
PORT=5000
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
`

## Next Steps

- Add authentication for admin endpoints
- Implement complaint categorization
- Add email notifications
- Create web dashboard for complaint management
- Add SMS notifications for status updates
