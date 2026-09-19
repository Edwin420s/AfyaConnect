# AfyaConnect Quickstart Guide 🚀

Run the entire **AfyaConnect** two-sided healthcare platform locally in under 60 seconds with **zero external paid keys required**.

---

## 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- (Optional) **Docker & Docker Compose**

---

## 2. One-Command Local Spinup

```bash
# Clone the repository
git clone https://github.com/Edwin420s/AfyaConnect.git
cd AfyaConnect

# Install dependencies
npm install
pip install -r backend/requirements.txt

# Run the complete full-stack platform
./scripts/run_local.sh
```

The launcher will:
1. Automatically copy `.env.example` to `.env` and `backend/.env.example` to `backend/.env` if not present.
2. Initialize and seed the SQLite database (`afyaconnect.db`) with Kenyan healthcare facilities, doctors, and cases.
3. Start the **FastAPI Backend** on `http://127.0.0.1:8000`.
4. Start the **Vite Frontend** on `http://localhost:5173`.
5. Perform an automatic health check.

---

## 3. Local URLs & Endpoints

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [`http://localhost:5173`](http://localhost:5173) | Patient Frontdoor & Hospital Reception Dashboard |
| **Backend API** | [`http://127.0.0.1:8000`](http://127.0.0.1:8000) | FastAPI REST service |
| **Interactive Docs (Swagger)**| [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs) | Interactive API exploration |
| **Alternative Docs (ReDoc)** | [`http://127.0.0.1:8000/redoc`](http://127.0.0.1:8000/redoc) | Clean API documentation |
| **Health Check** | [`http://127.0.0.1:8000/health`](http://127.0.0.1:8000/health) | System health & status |

---

## 4. Zero-Key Local Mode
AfyaConnect is designed with an **anti-fragile dual execution architecture**:
- **With Anthropic API Key**: Uses Claude 3.7 Sonnet for live LLM multi-turn reasoning and tool calling.
- **Without Key (Default Local Mode)**: Automatically activates the built-in clinical decision engine, providing full bilingual Sheng/Kiswahili/English triage, facility distance discovery, doctor availability lookups, and token pass generation with zero external dependencies.

---

## 5. Docker Option

```bash
# Spin up both containers
docker-compose up --build

# Open frontend in your browser
# http://localhost:5173
```
