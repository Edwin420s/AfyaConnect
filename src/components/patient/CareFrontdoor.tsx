import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackCard } from './FeedbackCard';

export const CareFrontdoor: React.FC = () => {
  const {
    chatMessages,
    sendMessage,
    languagePreference,
    toggleLanguagePreference,
    userLocationText,
    isGpsActive,
    toggleGps,
    setActivePatientTab,
    selectSlotForBooking,
    setIsEmergencyModalOpen,
    showToast,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    sendMessage(inputVal.trim());
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Push-to-talk speech recognition or realistic simulation
  const startRecording = () => {
    setIsListening(true);
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = languagePreference === 'swa' ? 'sw-KE' : 'en-KE';
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          sendMessage(transcript, true);
          setIsListening(false);
        };
        recognition.onerror = () => {
          fallbackAudioIntake();
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognition.start();
        return;
      } catch (err) {
        fallbackAudioIntake();
      }
    } else {
      fallbackAudioIntake();
    }
  };

  const fallbackAudioIntake = () => {
    setTimeout(() => {
      const sampleSheng = '“Nimekuwa na maumivu ya tumbo for two days, na pia nahisi homa kidogo.”';
      sendMessage(sampleSheng, true);
      setIsListening(false);
      showToast('🎙 Audio Note imeandikwa na kuchakatwa na Claude AI');
    }, 2000);
  };

  const stopRecording = () => {
    setIsListening(false);
  };

  // Text-to-speech audio reader
  const playAssistantSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languagePreference === 'swa' ? 'sw' : 'en';
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('🔊 Audio playback simulated');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-3">
      {/* Top Context Bar: Auto-Location & Bilingual Indicator */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          {/* Location Chip */}
          <button
            onClick={toggleGps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low shadow-xs hover:bg-surface-container active:scale-95 transition-all text-left"
            title="Bonyeza kubadili GPS / Toggle Location"
          >
            <span className={`w-2 h-2 rounded-full ${isGpsActive ? 'bg-primary-container animate-ping' : 'bg-outline'}`}></span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px] text-primary">near_me</span>
              {userLocationText}
            </span>
          </button>

          {/* Encrypted & Verified Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant shadow-xs">
            <span className="material-symbols-outlined text-[13px] text-primary">lock</span>
            <span className="text-[11px] font-semibold">Private & Encrypted</span>
          </div>
        </div>

        {/* Bilingual Engine Status Banner */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-fixed/30 text-on-primary-fixed border border-primary/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">voice_chat</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-primary-fixed">Bilingual Care AI • Kiswahili + English</span>
              <span className="text-[10px] text-on-surface-variant">Code-switching engine tuned for Kenyan conversational triage</span>
            </div>
          </div>
          <button
            onClick={toggleLanguagePreference}
            className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span>
              {languagePreference === 'swa_eng'
                ? 'SWA / ENG'
                : languagePreference === 'swa'
                ? 'KISWAHILI'
                : 'ENGLISH'}
            </span>
          </button>
        </div>
      </div>

      {/* Active Conversational Thread */}
      <div className="flex flex-col gap-3 py-1">
        {chatMessages.map((msg) => {
          if (msg.sender === 'patient') {
            return (
              <div key={msg.id} className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 pr-1 text-[11px] text-on-surface-variant font-medium">
                  <span>Wewe (You) • {msg.timestamp}</span>
                  <span className="material-symbols-outlined text-[13px] text-primary">check_circle</span>
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary-container p-3.5 shadow-sm text-on-primary flex flex-col gap-2">
                  {msg.isAudioSnippet && (
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/20">
                      <span className="text-[10px] uppercase tracking-wider text-on-primary-container flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-[13px]">mic</span> Audio Triage Snippet
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-on-primary font-bold">
                        {msg.dialectTag || 'SHG / SWA'}
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                </div>
              </div>
            );
          }

          // Assistant Response
          return (
            <div key={msg.id} className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2 pl-1">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[12px] text-on-primary">smart_toy</span>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant">Afya Clinical AI • {msg.timestamp}</span>
                {msg.triageLevel && (
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[10px] text-primary font-bold">
                    {msg.triageLevel}
                  </span>
                )}
              </div>

              <div className="max-w-[94%] rounded-2xl rounded-tl-xs bg-surface-container-lowest p-4 shadow-sm text-on-surface flex flex-col gap-3 border border-surface-container-high/60">
                {/* Dialect indicator & Audio Listen */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    {msg.dialectTag || 'Swahili + English Response'}
                  </span>
                  <button
                    onClick={() => playAssistantSpeech(msg.text)}
                    className="text-primary hover:text-primary-container flex items-center gap-0.5 text-xs font-semibold active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isPlayingAudio ? 'volume_up' : 'play_circle'}
                    </span>
                    <span>Sikiliza (Listen)</span>
                  </button>
                </div>

                <p className="text-sm text-on-surface leading-relaxed">{msg.text}</p>

                {/* Structured Patient Feedback Card (Appointment Request Received / Doctor Availability / Confirmed) */}
                {msg.feedbackCard && (
                  <FeedbackCard
                    data={msg.feedbackCard}
                    onConfirm={(doc, slot, hosp) => selectSlotForBooking(hosp, doc, slot)}
                    onViewTimeline={() => setActivePatientTab('miadi')}
                  />
                )}

                {/* Embedded Hospital Consultation Card if available */}
                {msg.recommendedHospital && (
                  <div className="rounded-xl bg-surface-container-low p-3.5 flex flex-col gap-3 shadow-xs border border-surface-container-high/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2.5 items-center">
                        <img
                          className="w-12 h-12 rounded-lg object-cover shadow-xs"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAT-8u3aZAdJ9ji_CEIfm_lwS6RJodz6SWzmUhPPbzCIjVGvotbJufcZrqwHM2P7Qkex6yGVmRehHU5Cf4Oc4NyVvzYf3a_k5-r4hfdAXpq9KkoGo5nTFPKGu6QUfYz9pX3af-u2-hFwHyDnKbCFH-txHWklop3xQMILktGKpefMLdBoALG-tqreN6SueSnQeyAaCWtme2oLNW0fyHH4ganZlzhcT_vMQQUymlVDjR6NhM1g1QNgxY"
                          alt="Hospital desk"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-on-surface leading-tight">
                              {msg.recommendedHospital.name}
                            </span>
                            <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                              verified
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant">
                            {msg.recommendedHospital.subCounty} • {msg.recommendedHospital.distance}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                        {msg.recommendedHospital.coverage}
                      </span>
                    </div>

                    {/* Doctor & Slot Detail */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                          <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-on-surface">
                            {msg.recommendedHospital.doctorName}
                          </span>
                          <span className="text-[10px] text-tertiary font-medium">
                            {msg.recommendedHospital.doctorSpecialty}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-primary block">
                          {msg.recommendedHospital.todaySlot}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">Available Slot</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        onClick={() => setActivePatientTab('vituo')}
                        className="h-10 px-3 rounded-lg bg-surface-container-highest text-on-surface text-xs font-semibold flex items-center justify-center gap-1 active:bg-surface-dim transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">list_alt</span>
                        Ona Vituo / Options
                      </button>
                      <button
                        onClick={() =>
                          selectSlotForBooking(
                            msg.recommendedHospital!.name,
                            msg.recommendedHospital!.doctorName,
                            msg.recommendedHospital!.todaySlot,
                            msg.recommendedHospital!.facilityId
                          )
                        }
                        className="h-10 px-3 rounded-lg bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:bg-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-[15px]">event_available</span>
                        Book Slot Hii
                      </button>
                    </div>
                  </div>
                )}

                {/* Option Action Chips */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (opt.includes('Ona Vituo') || opt.includes('nearby')) {
                            setActivePatientTab('vituo');
                          } else if (opt.includes('Book Kamau') || opt.includes('10:30 AM')) {
                            selectSlotForBooking('Aga Khan Univ. Hospital', 'Dr. Wanjiku Kamau', 'Kesho 10:30 AM', 'f-agakhan');
                          } else {
                            sendMessage(opt);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold border border-primary/20 shadow-xs active:scale-95 transition-all"
                      >
                        {opt} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Pulse Triage Suggestion Chips */}
      <div className="flex flex-col gap-1 pt-1">
        <span className="text-[11px] text-on-surface-variant flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[14px] text-tertiary-container">tips_and_updates</span>
          Majibu ya haraka (Quick Prompts):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => sendMessage('Nahitaji daktari leo')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs whitespace-nowrap active:bg-surface-container transition-colors border border-surface-container-high"
          >
            🩺 Nahitaji daktari leo
          </button>
          <button
            onClick={() => setActivePatientTab('vituo')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs whitespace-nowrap active:bg-surface-container transition-colors border border-surface-container-high"
          >
            📍 Check nearby hospitals
          </button>
          <button
            onClick={() => sendMessage('Nimekuwa na maumivu makali ya tumbo')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs whitespace-nowrap active:bg-surface-container transition-colors border border-surface-container-high"
          >
            💊 Maumivu ya tumbo
          </button>
          <button
            onClick={() => sendMessage('Mtoto ana homa kali')}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface text-xs font-medium shadow-xs whitespace-nowrap active:bg-surface-container transition-colors border border-surface-container-high"
          >
            👶 Mtoto ana homa kali
          </button>
        </div>
      </div>

      {/* Active Input Deck: Voice Frontdoor & Keyboard Input */}
      <div className="rounded-2xl bg-surface-container-lowest p-3 shadow-md border border-surface-container-high/70 flex flex-col gap-2.5">
        {/* Input Text Bar */}
        <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-1.5 border border-surface-container-high/40">
          <span className="material-symbols-outlined text-primary text-[20px]">chat_bubble_outline</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Eleza unavyohisi / Describe how you feel..."
            className="w-full bg-transparent text-on-surface text-sm placeholder-on-surface-variant/70 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputVal.trim()}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 ${
              inputVal.trim()
                ? 'bg-primary-container text-on-primary shadow-xs'
                : 'bg-surface-container text-outline opacity-60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>

        {/* Audio / Push-to-Talk Command Center */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all ${
                isListening
                  ? 'bg-error text-on-error animate-pulse'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isListening ? 'mic_active' : 'mic'}
              </span>
              <span>{isListening ? 'Inasikiliza... (Listening)' : 'Shikilia Kuongea (Hold to Talk)'}</span>
            </button>
            <span className="text-[10px] text-on-surface-variant max-w-[90px] leading-tight font-medium">
              Sheng, Swahili au English
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => showToast('📎 Ambatanisha picha au ripoti ya maabara (Lab photo upload)')}
              className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center active:bg-surface-container-high transition-colors shadow-xs"
              title="Attach Lab results or photo"
            >
              <span className="material-symbols-outlined text-[19px]">attach_file</span>
            </button>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center active:scale-95 transition-transform shadow-xs"
              title="Emergency SOS"
            >
              <span className="material-symbols-outlined text-[20px] animate-pulse">emergency</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Resilience Notice */}
      <div className="flex items-center justify-center gap-1.5 text-center text-on-surface-variant pt-1">
        <span className="material-symbols-outlined text-[14px] text-primary">cell_tower</span>
        <span className="text-[11px] font-medium">
          AfyaConnect SMS / USSD Fallback active via <strong>*384#</strong>
        </span>
      </div>
    </div>
  );
};
