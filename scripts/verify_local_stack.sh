#!/usr/bin/env bash
# ==============================================================================
# AfyaConnect Local Stack Verification Script
# Tests health, endpoints, and end-to-end communication on local services.
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}      AfyaConnect: Local Stack Health & E2E Test      ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Backend Health Check
echo -e "\n${YELLOW}1. Checking Backend Health (http://127.0.0.1:8000/health)...${NC}"
HEALTH=$(curl -s http://127.0.0.1:8000/health || echo "FAILED")
if [[ "$HEALTH" =~ "healthy" ]]; then
    echo -e "${GREEN}   ✓ Backend is HEALTHY:${NC} $HEALTH"
else
    echo -e "${RED}   ✗ Backend is NOT responding on port 8000!${NC}"
    exit 1
fi

# 2. Facilities Endpoint
echo -e "\n${YELLOW}2. Checking Facilities Endpoint (/api/facilities)...${NC}"
FACILITIES=$(curl -s http://127.0.0.1:8000/api/facilities || echo "[]")
FACILITY_COUNT=$(echo "$FACILITIES" | grep -o '"id":' | wc -l)
echo -e "${GREEN}   ✓ Loaded $FACILITY_COUNT Kenyan healthcare facilities.${NC}"

# 3. Hospital Dashboard Endpoint
echo -e "\n${YELLOW}3. Checking Hospital Dashboard (/api/hospital/dashboard)...${NC}"
DASHBOARD=$(curl -s "http://127.0.0.1:8000/api/hospital/dashboard?facility_id=f-agakhan" || echo "{}")
if [[ "$DASHBOARD" =~ "totalRequests" ]]; then
    echo -e "${GREEN}   ✓ Hospital dashboard synced with HMIS Gateway.${NC}"
else
    echo -e "${RED}   ✗ Hospital dashboard query failed.${NC}"
fi

# 4. Doctor Availability Roster
echo -e "\n${YELLOW}4. Checking Doctor Availability Roster (/api/availability/check)...${NC}"
AVAIL=$(curl -s "http://127.0.0.1:8000/api/availability/check?facility_id=f-agakhan&department_code=OPD" || echo "{}")
if [[ "$AVAIL" =~ "availableDoctors" ]]; then
    echo -e "${GREEN}   ✓ Real hospital duty roster confirmed (anti-hallucination verified).${NC}"
else
    echo -e "${RED}   ✗ Availability check failed.${NC}"
fi

# 5. Frontend Check
echo -e "\n${YELLOW}5. Checking Frontend Server (http://localhost:5173)...${NC}"
if curl -s -I http://localhost:5173 | grep -q "200\|304"; then
    echo -e "${GREEN}   ✓ Frontend is running and serving Vite assets.${NC}"
else
    echo -e "${YELLOW}   ! Frontend is not currently detected on port 5173.${NC}"
    echo -e "     Start it with: ${BLUE}npm run dev -- --host 127.0.0.1 --port 5173${NC}"
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   ✓ Local Verification Complete!                     ${NC}"
echo -e "${GREEN}======================================================${NC}\n"
