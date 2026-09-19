#!/usr/bin/env bash
# ==============================================================================
# AfyaConnect Full-Stack Local Launcher
# Runs both FastAPI backend (Port 8000) and Vite frontend (Port 5173) locally.
# Zero external API keys required (uses built-in clinical decision engine).
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}      AfyaConnect: Two-Sided Hospital Platform       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is required but not installed.${NC}"
    exit 1
fi

# Check for Node
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: node is required but not installed.${NC}"
    exit 1
fi

# Ensure local .env files exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating root .env from .env.example...${NC}"
    cp .env.example .env
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from backend/.env.example...${NC}"
    cp backend/.env.example backend/.env
fi

# Trap SIGINT/SIGTERM to cleanly kill child processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down AfyaConnect services...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}All services stopped cleanly.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo -e "${BLUE}Starting FastAPI Backend on http://127.0.0.1:8000 ...${NC}"
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to become healthy
echo -e "${YELLOW}Waiting for backend health check...${NC}"
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy and ready!${NC}"
        break
    fi
    sleep 0.5
done

# 2. Start Frontend
echo -e "${BLUE}Starting Vite Frontend on http://localhost:5173 ...${NC}"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✓ AfyaConnect is fully running locally!             ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "  🌐 Patient & Hospital App: ${BLUE}http://localhost:5173${NC}"
echo -e "  ⚙️  FastAPI Backend API:   ${BLUE}http://127.0.0.1:8000${NC}"
echo -e "  📚 Interactive API Docs:   ${BLUE}http://127.0.0.1:8000/docs${NC}"
echo -e "  🚨 Emergency Hotlines:     ${YELLOW}1199 (Red Cross), 999 (Police)${NC}"
echo -e "  🔒 Mode:                   ${GREEN}Local Engine (Zero Paid Keys Needed)${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Press Ctrl+C to terminate both servers.\n"

# Keep script running
wait
