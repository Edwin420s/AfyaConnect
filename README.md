# AfyaConnect 🏥🇰🇪
### AI-Powered Healthcare Triage & Care Navigation Platform

AfyaConnect is an intelligent, multilingual healthcare triage and care navigation platform designed for Kenya's healthcare ecosystem. It connects patients with accredited facilities, matches them with on-duty doctors in real-time, and navigates public and private healthcare options under the Social Health Authority (SHA), Linda Mama, and NHIF frameworks.

---

## 🌟 Key Features

### 1. Multilingual AI Care Frontdoor
- **Conversational Triage in Swahili, English, and Sheng**: Seamlessly understands patient symptoms in local dialects (e.g., *"Niko na homa na kichwa kinaniuma sana"* or *"Msee naskia chest pain"*).
- **Audio & Text Support**: Voice recording simulation with real-time waveform visualization and clinical transcript extraction.
- **Urgency Scoring (Levels 1–5)**: Categorizes requests into Routine, Standard, Urgent, or Emergency with clinical summaries and chief concern identification.

### 2. Clinical Safety Guardrails & Emergency Hotline Routing
- **Red-Flag Symptom Interception**: Automatically detects life-threatening indicators (severe chest pain, breathing difficulty, acute trauma, sudden numbness, uncontrolled bleeding).
- **Emergency Modal & Dispatch**: Instant one-tap access to Kenyan emergency dispatch numbers (999, 112, 911), ambulance coordination, and nearest Level 6 trauma centers.

### 3. Real-Time Doctor Availability & Slot Matching Engine
- **Live Scheduling & Conflict Detection**: Dynamically tracks doctor duty status, consultation room numbers, and available 30-minute booking slots.
- **Smart Departmental Routing**: Maps symptoms directly to specialties (e.g., Pediatrics, Internal Medicine, ENT, Cardiology, Obstetrics).

### 4. Kenyan Healthcare Ecosystem Integration
- **Insurance & Payment Verification**: Badges and filters for **SHA (Social Health Authority)**, **Linda Mama (Maternal Care)**, **NHIF**, private insurers (Britam, Jubilee), and **M-PESA** payment rails.
- **Facility Classification**: Support for Level 4 Sub-County Hospitals, Level 5 County Referral Facilities, and Level 6 National Referral Centers (e.g., Kenyatta National Hospital, MP Shah, Nairobi West).

### 5. Unified Multi-Role Portals
- **Patient Portal**: Conversational triage, nearby facility search with Haversine distance, active booking pass with token (#AC-NBO-XXXX), and care feedback.
- **Hospital Intake Portal**: Triage queue management, department capacity monitoring, patient intake review, and slot confirmations.
- **Doctor Schedule Portal**: Daily clinical roster, consultation notes, patient histories, and mark-as-completed workflows.
- **System Administrator Portal**: Real-time SLA monitoring, emergency dispatch audits, language usage metrics, and AI triage quality telemetry.

### 6. Multi-Channel Notification Architecture
- Simulated dispatches across **SMS**, **WhatsApp Business API**, **USSD**, and **In-App push notifications** for appointment reminders and digital passes.

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |            AfyaConnect UI             |
                                  |     (React 19 + TypeScript + Vite)    |
                                  +---------------------------------------+
                                                     |
             +----------------------+----------------+----------------------+
             |                      |                                       |
+--------------------------+  +--------------------------+  +-------------------------------+
|     Patient Portal       |  |    Hospital & Doctor     |  |       Admin Analytics         |
|  - Conversational AI     |  |  - Intake Queue Review   |  |  - System SLA & Dispatch      |
|  - Facility Locator      |  |  - Doctor Slot Roster    |  |  - Triage Quality Audits      |
|  - Digital Token Pass    |  |  - Room Assignment       |  |  - Multi-Channel Telemetry    |
+--------------------------+  +--------------------------+  +-------------------------------+
             |                                                              |
             +------------------------------+-------------------------------+
                                            |
                                            v
+-------------------------------------------------------------------------------------------+
|                                    Core Application Context                                |
|                   (Role State, Language Preferences, Care Request Pipeline)               |
+-------------------------------------------------------------------------------------------+
         |                                  |                                   |
         v                                  v                                   v
+------------------+              +-------------------+               +--------------------+
|  Location Engine |              | Availability Roster|               | Notification Hub   |
| (Haversine/Areas)|              | (Real-time Slots) |               | (SMS/WhatsApp/USSD)|
+------------------+              +-------------------+               +--------------------+
         \                                  |                                  /
          \                                 |                                 /
           v                                v                                v
+-------------------------------------------------------------------------------------------+
|                                Claude AI Orchestration Layer                              |
|   - Multilingual Clinical Prompts (SWA / ENG / SHG)                                       |
|   - Red-Flag Safety Engine & Emergency Interception                                       |
|   - Function Calling Tools (triageCareRequest, findSlots, bookAppointment)                |
+-------------------------------------------------------------------------------------------+
                                            |
                                            v
+-------------------------------------------------------------------------------------------+
|                               Prisma Relational Data Model                                |
|        (PostgreSQL: Patients, Facilities, Doctors, Slots, CareRequests, AuditLogs)        |
+-------------------------------------------------------------------------------------------+
```

---

## 🗄️ Database Schema (Prisma)

The project includes an enterprise-grade Prisma schema (`prisma/schema.prisma`) modeling:
- `User` & `Patient`: Demographic profiles, language preference, national ID, SHA insurance numbers.
- `Facility` & `Department`: Healthcare facilities (Level 4–6), GPS coordinates, accreditation badges, and departmental units.
- `Doctor` & `DoctorAvailability`: Medical qualifications, consultation rooms, recurring shift availability, and exception overrides.
- `CareRequest` & `CareRequestEvent`: Audit trail of triage requests, verbatim transcripts, urgency classifications, and lifecycle events.
- `Appointment`: Confirmed time slots, check-in tokens, and consultation tracking.
- `AuditLog` & `Notification`: System-wide auditability and multi-channel notification logs.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation
```bash
# Clone the repository
git clone https://github.com/Edwin420s/AfyaConnect.git
cd AfyaConnect

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Build
```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

### Database Integration
```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to your PostgreSQL instance
npx prisma db push
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/afyaconnect?schema=public"

# Anthropic Claude API (Optional - client includes mock fallback)
VITE_ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

---

## 👥 Roles & Workflows

1. **Patient**:
   - Describe symptoms via conversational AI in English or Swahili.
   - Review triage classification and urgency.
   - Select nearby accredited facilities.
   - Choose an available doctor slot and receive a verified Token Pass.
2. **Hospital Staff**:
   - Monitor real-time triage requests from incoming patients.
   - Verify insurance coverage (SHA/Linda Mama).
   - Assign patients to available departments and doctors.
3. **Doctor**:
   - Inspect upcoming consultations and clinical AI summaries.
   - Mark patients as seen and update consultation status.
4. **Admin**:
   - Review emergency escalation rates.
   - Monitor system throughput and triage safety logs.

---

## 📄 License

This project is licensed under the ISC License.
