'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  listAgentConfigs,
  updateAgentConfig,
  listApiKeys,
  saveApiKey,
  deleteApiKey,
  testApiKey,
  checkHealth,
  type AgentConfigItem,
  type ApiKeyItem,
} from '@/lib/api-client';
import {
  Bot,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  Key,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────

const OPENAI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const ANTHROPIC_MODELS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
];

const DOMAIN_COLORS: Record<string, string> = {
  veille: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  analysis: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ideation: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  scoring: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  prd: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  gtm: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  feedback: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const DOMAIN_LABELS: Record<string, string> = {
  veille: 'Market Veille',
  analysis: 'Analysis',
  ideation: 'Ideation',
  scoring: 'Scoring',
  prd: 'PRD',
  gtm: 'GTM',
  feedback: 'Feedback',
};

// ─── Sub-components ───────────────────────────────────────────────────────

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={cn(
      'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider',
      provider === 'openai'
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    )}>
      {provider === 'openai' ? 'OpenAI' : 'Anthropic'}
    </span>
  );
}

function ModelSelect({
  value, provider, onChange,
}: {
  value: string;
  provider: string;
  onChange: (model: string, provider: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const allModels = [...OPENAI_MODELS, ...ANTHROPIC_MODELS];
  const current = allModels.find(m => m.value === value);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 9999,
      });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/8 hover:border-white/20 transition-colors min-w-[160px]"
      >
        <span className="flex-1 text-left truncate">{current?.label || value}</span>
        <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            style={dropdownStyle}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl min-w-[220px] max-h-72 overflow-y-auto"
          >
            {/* OpenAI section */}
            <div className="px-2 py-1.5 border-b border-white/5 sticky top-0 bg-[#1a1a2e]">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">OpenAI</span>
            </div>
            {OPENAI_MODELS.map(m => (
              <button
                key={m.value}
                onClick={() => { onChange(m.value, 'openai'); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2',
                  m.value === value
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                {m.value === value && <Check className="h-3 w-3 text-violet-400 shrink-0" />}
                <span className={m.value !== value ? 'ml-5' : ''}>{m.label}</span>
              </button>
            ))}
            {/* Anthropic section */}
            <div className="px-2 py-1.5 border-y border-white/5 mt-1 sticky top-8 bg-[#1a1a2e]">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Anthropic</span>
            </div>
            {ANTHROPIC_MODELS.map(m => (
              <button
                key={m.value}
                onClick={() => { onChange(m.value, 'anthropic'); setOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2',
                  m.value === value
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                {m.value === value && <Check className="h-3 w-3 text-violet-400 shrink-0" />}
                <span className={m.value !== value ? 'ml-5' : ''}>{m.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AgentRow({
  agent,
  onUpdate,
}: {
  agent: AgentConfigItem;
  onUpdate: (id: string, updates: Partial<AgentConfigItem>) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localModel, setLocalModel] = useState(agent.model);
  const [localProvider, setLocalProvider] = useState(agent.provider);
  const [localTemp, setLocalTemp] = useState(agent.temperature);
  const isDirty = localModel !== agent.model || localTemp !== agent.temperature;

  const handleModelChange = (model: string, provider: string) => {
    setLocalModel(model);
    setLocalProvider(provider);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgentConfig(agent.id, {
        provider: localProvider,
        model: localModel,
        temperature: localTemp,
        max_tokens: agent.maxTokens,
      });
      onUpdate(agent.id, { model: localModel, provider: localProvider, temperature: localTemp });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className={cn(
      'border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',
      agent.role === 'supervisor' && 'bg-white/[0.015]'
    )}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
            agent.role === 'supervisor'
              ? 'bg-violet-600/20 border border-violet-500/30'
              : 'bg-white/5 border border-white/10'
          )}>
            <Bot className={cn(
              'h-3 w-3',
              agent.role === 'supervisor' ? 'text-violet-400' : 'text-slate-500'
            )} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-200">{agent.agentName}</div>
            {agent.role === 'supervisor' && (
              <div className="text-[10px] text-violet-500 mt-0.5">supervisor</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <ProviderBadge provider={localProvider} />
      </td>
      <td className="px-4 py-3">
        <ModelSelect
          value={localModel}
          provider={localProvider}
          onChange={handleModelChange}
        />
      </td>
      <td className="px-4 py-3 w-36">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={localTemp}
            onChange={e => setLocalTemp(parseFloat(e.target.value))}
            className="w-20 accent-violet-500"
          />
          <span className="text-[10px] text-slate-500 w-6">{localTemp.toFixed(1)}</span>
        </div>
      </td>
      <td className="px-4 py-3 w-16 text-right">
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 transition-colors"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> :
             saved ? <Check className="h-3 w-3" /> :
             <Save className="h-3 w-3" />}
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── API Key Panel ────────────────────────────────────────────────────────

function ApiKeyPanel() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState({ provider: 'anthropic', value: '' });
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, boolean | null>>({});

  const load = useCallback(async () => {
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch {
      // backend not running
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!newKey.value.trim()) return;
    setSaving(true);
    try {
      await saveApiKey({ provider: newKey.provider, key_value: newKey.value });
      setNewKey(prev => ({ ...prev, value: '' }));
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const result = await testApiKey(id);
      setTestResult(prev => ({ ...prev, [id]: result.valid }));
    } catch {
      setTestResult(prev => ({ ...prev, [id]: false }));
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiKey(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#13131f] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-200">API Keys</h3>
      </div>

      {/* Existing keys */}
      <div className="space-y-2 mb-5">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading...
          </div>
        ) : keys.length === 0 ? (
          <p className="text-xs text-slate-600">No API keys configured.</p>
        ) : (
          keys.map(k => (
            <div key={k.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
              <ProviderBadge provider={k.provider} />
              <span className="text-xs text-slate-400 flex-1">
                {k.provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                <span className="text-slate-300 ml-1">...{k.keyHint}</span>
              </span>
              {testResult[k.id] !== undefined && (
                <span className={cn(
                  'text-[10px] font-medium',
                  testResult[k.id] ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {testResult[k.id] ? '✓ Valid' : '✗ Invalid'}
                </span>
              )}
              <button
                onClick={() => handleTest(k.id)}
                disabled={testing === k.id}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                {testing === k.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Test'}
              </button>
              <button onClick={() => handleDelete(k.id)}
                className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add new key */}
      <div className="border-t border-white/[0.06] pt-4">
        <div className="text-[11px] text-slate-500 mb-3 font-medium uppercase tracking-wider">Add Key</div>
        <div className="flex items-center gap-2">
          <select
            value={newKey.provider}
            onChange={e => setNewKey(prev => ({ ...prev, provider: e.target.value }))}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
          </select>
          <div className="flex-1 relative">
            <input
              type={showValue ? 'text' : 'password'}
              placeholder={newKey.provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              value={newKey.value}
              onChange={e => setNewKey(prev => ({ ...prev, value: e.target.value }))}
              className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 pr-8"
            />
            <button
              onClick={() => setShowValue(!showValue)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
            >
              {showValue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !newKey.value.trim()}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function AgentConfigPage() {
  const [agents, setAgents] = useState<AgentConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(['veille', 'analysis', 'ideation', 'scoring', 'prd', 'gtm', 'feedback'])
  );

  const load = useCallback(async () => {
    try {
      await checkHealth();
      setBackendOnline(true);
      const data = await listAgentConfigs();
      setAgents(data);
    } catch {
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = useCallback((id: string, updates: Partial<AgentConfigItem>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  // Group by domain
  const domains = ['veille', 'analysis', 'ideation', 'scoring', 'prd', 'gtm', 'feedback'];
  const byDomain: Record<string, AgentConfigItem[]> = {};
  for (const domain of domains) {
    byDomain[domain] = agents.filter(a => a.domain === domain)
      .sort((a, b) => (a.role === 'supervisor' ? -1 : 1));
  }

  const totalAgents = agents.length;
  const openaiCount = agents.filter(a => a.provider === 'openai').length;
  const anthropicCount = agents.filter(a => a.provider === 'anthropic').length;

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Agent LLM Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure the LLM provider and model for each of the {totalAgents} agents in the pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Backend status */}
          <div className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border',
            backendOnline === null && 'bg-white/5 border-white/10 text-slate-500',
            backendOnline === true && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            backendOnline === false && 'bg-red-500/10 border-red-500/20 text-red-400',
          )}>
            {backendOnline === null && <Loader2 className="h-3 w-3 animate-spin" />}
            {backendOnline === true && <Wifi className="h-3 w-3" />}
            {backendOnline === false && <WifiOff className="h-3 w-3" />}
            {backendOnline === null ? 'Checking...' : backendOnline ? 'Backend online' : 'Backend offline'}
          </div>

          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Backend offline notice */}
      {backendOnline === false && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Python backend not running</p>
            <p className="text-xs text-amber-500/80 mt-1">
              Start the backend: <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">cd backend && uvicorn main:app --reload</code>
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agents', value: totalAgents, color: 'text-violet-400' },
          { label: 'OpenAI', value: openaiCount, color: 'text-emerald-400' },
          { label: 'Anthropic', value: anthropicCount, color: 'text-orange-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#13131f] border border-white/[0.06] rounded-xl p-4">
            <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* API Keys */}
      <ApiKeyPanel />

      {/* Agent tables by domain */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading agent configurations...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map(domain => {
            const domainAgents = byDomain[domain] || [];
            const isExpanded = expandedDomains.has(domain);
            if (domainAgents.length === 0) return null;

            return (
              <div key={domain} className="bg-[#13131f] border border-white/[0.06] rounded-xl overflow-hidden">
                {/* Domain header */}
                <button
                  onClick={() => toggleDomain(domain)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider',
                      DOMAIN_COLORS[domain]
                    )}>
                      {domain}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {DOMAIN_LABELS[domain]}
                    </span>
                    <span className="text-xs text-slate-600">
                      {domainAgents.length} agents
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    'h-4 w-4 text-slate-600 transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )} />
                </button>

                {/* Agent table */}
                {isExpanded && (
                  <div className="border-t border-white/[0.04]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.04]">
                          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">Agent</th>
                          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">Provider</th>
                          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">Model</th>
                          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">Temperature</th>
                          <th className="px-4 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {domainAgents.map(agent => (
                          <AgentRow
                            key={agent.id}
                            agent={agent}
                            onUpdate={handleUpdate}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
