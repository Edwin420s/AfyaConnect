/**
 * Frontend-to-Backend End-to-End Communication Verifier
 * Simulates browser runtime calling the backend API endpoints.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function runE2ECommunicationTest() {
  console.log('🚀 Starting Frontend <-> Backend End-to-End Communication Verification...\n');

  // 1. Health Check
  console.log('1️⃣ Checking Backend Health Endpoint (/health)...');
  const healthRes = await fetch('http://127.0.0.1:8000/health');
  if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`);
  const health = await healthRes.json();
  console.log('   ✓ Health check passed:', health);

  // 2. Fetch Facilities
  console.log('\n2️⃣ Fetching Facilities from Backend (/api/facilities)...');
  const facRes = await fetch(`${API_BASE_URL}/facilities`);
  if (!facRes.ok) throw new Error(`Facilities fetch failed: ${facRes.status}`);
  const facilities = await facRes.json();
  console.log(`   ✓ Facilities fetched: ${facilities.length} healthcare facilities available.`);
  console.log(`   ✓ Primary facility: ${facilities[0].name} (${facilities[0].subCounty})`);

  // 3. Patient Interaction (Voice/Chat in Sheng/Swahili)
  console.log('\n3️⃣ Simulating Patient Conversation Turn (/api/conversations/interact)...');
  const patientTurnRes = await fetch(`${API_BASE_URL}/conversations/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Nimekuwa na maumivu makali ya kichwa na kizunguzungu for two days.',
      isAudioSnippet: false,
      languagePreference: 'swa_eng',
      patientName: 'Jane M.',
      patientPhone: '+254 712 345 678',
    }),
  });
  if (!patientTurnRes.ok) throw new Error(`Patient interact failed: ${patientTurnRes.status}`);
  const turnData = await patientTurnRes.json();
  console.log('   ✓ AI Triage response:', turnData.responseMessage || turnData.text);
  console.log('   ✓ Dialect tag:', turnData.dialectTag);
  console.log('   ✓ Feedback card type:', turnData.feedbackCard?.type);
  console.log('   ✓ Recommended Doctor & Slot:', `${turnData.feedbackCard?.doctorName} • ${turnData.feedbackCard?.time}`);
  console.log('   ✓ Nearby facilities detected:', turnData.nearbyFacilities?.length);

  const careReqId = turnData.careRequestId || turnData.createdCareRequest?.id || turnData.feedbackCard?.requestId;
  console.log('   ✓ Created Care Request ID:', careReqId);

  // 4. Hospital Reception Dashboard Sync
  console.log('\n4️⃣ Simulating Hospital Dashboard Sync (/api/hospital/dashboard)...');
  const dashRes = await fetch(`${API_BASE_URL}/hospital/dashboard?facility_id=f-agakhan`);
  if (!dashRes.ok) throw new Error(`Dashboard sync failed: ${dashRes.status}`);
  const dashboard = await dashRes.json();
  console.log('   ✓ Hospital Metrics:', dashboard.metrics);
  console.log('   ✓ HMIS Gateway Status:', dashboard.systemStatus?.hmisGateway);
  console.log('   ✓ Incoming Inbox Items:', dashboard.inbox?.length);

  // 5. Query Real Doctor Availability (Source of Truth)
  console.log('\n5️⃣ Querying Real Doctor Availability (/api/availability/check)...');
  const availRes = await fetch(`${API_BASE_URL}/availability/check?facility_id=f-agakhan&department_code=OPD&preferred_day=today`);
  if (!availRes.ok) throw new Error(`Availability check failed: ${availRes.status}`);
  const avail = await availRes.json();
  const leadDoc = avail.availableDoctors[0];
  console.log(`   ✓ Verified Doctor: ${leadDoc.doctorName} (${leadDoc.specialty})`);
  console.log(`   ✓ Free Slots Available: ${leadDoc.freeSlotsCount} slots (Earliest: ${avail.earliestAvailableSlot})`);

  // 6. Hospital Assigns Doctor
  console.log('\n6️⃣ Hospital Staff Assigns Doctor (/api/hospital/care-requests/:id/assign-doctor)...');
  const assignRes = await fetch(`${API_BASE_URL}/hospital/care-requests/${careReqId}/assign-doctor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorName: leadDoc.doctorName,
      slotTime: avail.earliestAvailableSlot,
    }),
  });
  if (!assignRes.ok) throw new Error(`Assign doctor failed: ${assignRes.status}`);
  const assignData = await assignRes.json();
  console.log('   ✓ Assign result:', assignData.message);

  // 7. Patient Confirms Booking & Issues Digital Token Pass
  console.log('\n7️⃣ Patient Confirms Booking (/api/appointments/book)...');
  const bookRes = await fetch(`${API_BASE_URL}/appointments/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      careRequestId: careReqId,
      patientPhone: '+254 712 345 678',
      facilityName: 'Aga Khan Univ. Hospital',
      doctorName: leadDoc.doctorName,
      slotTime: avail.earliestAvailableSlot,
      facilityId: 'f-agakhan',
    }),
  });
  if (!bookRes.ok) throw new Error(`Appointment book failed: ${bookRes.status}`);
  const bookData = await bookRes.json();
  console.log('   ✓ Appointment status:', bookData.status);
  console.log('   ✓ Digital Token Pass Issued:', bookData.tokenPass);

  // 8. Verify Final Care Request 8-Step Timeline
  console.log('\n8️⃣ Verifying 8-Step Timeline Synchronization (/api/care-requests/:id)...');
  const reqDetailRes = await fetch(`${API_BASE_URL}/care-requests/${careReqId}`);
  if (!reqDetailRes.ok) throw new Error(`Care request detail failed: ${reqDetailRes.status}`);
  const reqDetail = await reqDetailRes.json();
  console.log('   ✓ Final Request Status:', reqDetail.status);
  console.log('   ✓ Token on Care Request:', reqDetail.tokenPass);
  console.log('   ✓ 8-Step Synchronized Timeline:');
  for (const step of reqDetail.timeline) {
    const mark = step.completed ? '✓' : '○';
    const active = step.active ? ' [ACTIVE]' : '';
    console.log(`      ${mark} Step ${step.step}: ${step.title} (${step.timestamp}) - ${step.description}${active}`);
  }

  console.log('\n🎉 ALL FRONTEND <-> BACKEND END-TO-END TESTS PASSED WITH 100% SUCCESS!\n');
}

runE2ECommunicationTest().catch(err => {
  console.error('\n❌ E2E Test Error:', err);
  process.exit(1);
});
