import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CLAUDE_MODELS,
  ClaudeModelId,
  getAnthropicApiKey,
  setAnthropicApiKey,
  getSelectedClaudeModel,
  setSelectedClaudeModel,
  isLiveApiEnabled,
  setLiveApiEnabled,
  testClaudeConnection,
} from '../lib/claude/api';
import { AFYACONNECT_TOOLS } from '../lib/claude/tools';

export const ClaudeConfigModal: React.FC = () => {
  const { isClaudeConfigOpen, setIsClaudeConfigOpen, showToast } = useApp();

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ClaudeModelId>('claude-3-7-sonnet-20250219');
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isClaudeConfigOpen) {
      setApiKey(getAnthropicApiKey());
      setSelectedModel(getSelectedClaudeModel());
      setIsLiveEnabled(isLiveApiEnabled());
      setTestResult(null);
    }
  }, [isClaudeConfigOpen]);

  if (!isClaudeConfigOpen) return null;

  const handleSave = () => {
    setAnthropicApiKey(apiKey.trim());
    setSelectedClaudeModel(selectedModel);
    setLiveApiEnabled(isLiveEnabled);
    showToast('Mipangilio ya Claude AI imehifadhiwa (Claude AI settings saved)');
    setIsClaudeConfigOpen(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testClaudeConnection(apiKey.trim());
      setTestResult(res);
      if (res.success) {
        showToast('✓ Claude API imeunganishwa vizuri!');
      } else {
        showToast('Muunganisho umeshindwa. Angalia API key.');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Hitilafu ya muunganisho (Connection error)',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-surface-container-high animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">Claude AI Clinical Settings</h3>
              <p className="text-xs text-on-surface-variant">Anthropic Agentic Tool-Use & Model Config</p>
            </div>
          </div>
          <button
            onClick={() => setIsClaudeConfigOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Live vs Local Agent Mode Toggle */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-on-surface">Live Claude API Mode</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  isLiveEnabled ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {isLiveEnabled ? 'LIVE' : 'OFFLINE SIMULATION'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {isLiveEnabled
                  ? 'Calls Anthropic API directly with real multi-turn tool calling cycles.'
                  : 'Uses intelligent local clinical agent with zero API key required.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={isLiveEnabled}
                onChange={(e) => setIsLiveEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center justify-between">
              <span>Chagua Model ya Claude (Select Model)</span>
              <span className="text-[10px] text-primary font-semibold">Recommended: Claude 3.7 Sonnet</span>
            </label>
            <div className="space-y-2">
              {CLAUDE_MODELS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModel === m.id
                      ? 'border-primary bg-primary-fixed/20 shadow-xs'
                      : 'border-surface-container-high bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="claudeModel"
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id as ClaudeModelId)}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-on-surface">{m.name}</span>
                      {m.isDefault && (
                        <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed-variant text-[9px] font-extrabold uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-outline font-mono block mt-0.5">{m.id}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface">
                Anthropic API Key
              </label>
              <span className="text-[10px] text-outline">Stored securely in your browser</span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full h-11 px-3.5 pr-20 rounded-xl bg-surface-container text-xs font-mono text-on-surface border border-surface-container-high focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 px-2 py-1 text-[11px] text-on-surface-variant hover:text-on-surface font-semibold rounded bg-surface-container-high"
              >
                {showKey ? 'Ficha' : 'Onyesha'}
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Don't have a key? The app automatically runs the full simulated clinical agent pipeline with zero setup.
            </p>
          </div>

          {/* Test Connection Button & Result */}
          <div className="space-y-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className={`w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                !apiKey.trim()
                  ? 'bg-surface-container text-outline cursor-not-allowed'
                  : 'bg-surface-container text-primary hover:bg-surface-container-high active:scale-98 shadow-xs'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
                {isTesting ? 'sync' : 'network_check'}
              </span>
              <span>{isTesting ? 'Inajaribu muunganisho...' : 'Jaribu Muunganisho (Test Connection)'}</span>
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs border flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">
                  {testResult.success ? 'check_circle' : 'error'}
                </span>
                <p className="font-medium leading-relaxed">{testResult.message}</p>
              </div>
            )}
          </div>

          {/* Agent Tools Catalog */}
          <div className="space-y-2 pt-2 border-t border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Registered Claude Agent Tools</span>
              <span className="text-[10px] text-primary font-bold">{AFYACONNECT_TOOLS.length} Tools Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {AFYACONNECT_TOOLS.map((t) => (
                <div
                  key={t.name}
                  className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/50 flex flex-col gap-0.5"
                >
                  <div className="flex items-center gap-1 font-mono font-bold text-[11px] text-primary">
                    <span className="material-symbols-outlined text-[14px]">build</span>
                    <span>{t.name}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant line-clamp-2">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container-high bg-surface-container-lowest flex items-center justify-end gap-2 sticky bottom-0 z-10">
          <button
            onClick={() => setIsClaudeConfigOpen(false)}
            className="px-4 h-10 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors"
          >
            Funga (Cancel)
          </button>
          <button
            onClick={handleSave}
            className="px-5 h-10 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary-container active:scale-98 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Hifadhi Mipangilio (Save)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
