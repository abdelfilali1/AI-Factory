'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, X, Plus, Check, Key, Cpu, Sliders, Target } from 'lucide-react';

const REGIONS = ['United States', 'Europe', 'Asia-Pacific', 'Latin America', 'Global'];
const LANGUAGES = ['English', 'French', 'Spanish', 'German', 'Portuguese'];
const MODELS = ['gpt-4o-mini', 'gpt-4o'];

export default function SettingsPage() {
  const { rubricWeights, updateRubricWeights } = useStore();
  const [weights, setWeights] = useState({ ...rubricWeights });
  const [segments, setSegments] = useState({ B2B: true, B2C: true });
  const [selectedRegions, setSelectedRegions] = useState(['United States', 'Europe']);
  const [selectedLanguages, setSelectedLanguages] = useState(['English']);
  const [keywords, setKeywords] = useState(['agency automation', 'solopreneur tools', 'content creation', 'AI productivity']);
  const [newKeyword, setNewKeyword] = useState('');
  const [noGoRules, setNoGoRules] = useState([
    'No gambling or betting products',
    'No adult content or services',
    'No products requiring physical inventory',
    'Avoid highly regulated industries (healthcare, finance advice)',
  ]);
  const [newRule, setNewRule] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [saved, setSaved] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isWeightValid = totalWeight === 100;

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights((w) => ({ ...w, [key]: val }));
  };

  const handleSave = () => {
    updateRubricWeights(weights);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setNoGoRules([...noGoRules, newRule.trim()]);
      setNewRule('');
    }
  };

  const toggleRegion = (r: string) => {
    setSelectedRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const toggleLanguage = (l: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Target Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-violet-400" />
            Target Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Segments */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Market Segments</label>
            <div className="flex gap-3">
              {(['B2B', 'B2C'] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setSegments((s) => ({ ...s, [seg]: !s[seg] }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    segments[seg]
                      ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-500'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${segments[seg] ? 'bg-violet-400' : 'bg-slate-600'}`} />
                  {seg}
                </button>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Target Regions</label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRegion(r)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedRegions.includes(r)
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLanguage(l)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedLanguages.includes(l)
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Target Keywords</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map((kw) => (
                <div key={kw} className="flex items-center gap-1 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
                  {kw}
                  <button onClick={() => setKeywords(keywords.filter((k) => k !== kw))}>
                    <X className="h-3 w-3 hover:text-violet-100" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add keyword..."
                className="flex-1 bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
              />
              <Button variant="secondary" size="sm" icon={<Plus className="h-3 w-3" />} onClick={addKeyword}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Rubric */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-violet-400" />
            Scoring Rubric Weights
          </CardTitle>
          <Badge variant={isWeightValid ? 'success' : 'error'}>
            Total: {totalWeight}/100
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.entries(weights) as [keyof typeof weights, number][]).map(([key, val]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 w-8 text-right">{val}%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={5}
                value={val}
                onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          ))}
          <Button variant="primary" size="sm" loading={false} onClick={handleSave} className="mt-2">
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                Saved!
              </>
            ) : 'Save Rubric'}
          </Button>
        </CardContent>
      </Card>

      {/* No-Go Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-400" />
            No-Go Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {noGoRules.map((rule, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
              <span className="text-sm text-slate-400">{rule}</span>
              <button onClick={() => setNoGoRules(noGoRules.filter((_, j) => j !== i))}>
                <X className="h-3.5 w-3.5 text-slate-600 hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRule()}
              placeholder="Add a no-go rule..."
              className="flex-1 bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-red-500/50"
            />
            <Button variant="danger" size="sm" onClick={addRule}>Add Rule</Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">Model</label>
            <div className="flex gap-2">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    model === m
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">Temperature</label>
              <span className="text-xs font-bold text-slate-200">{temperature}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">Max Tokens</label>
              <span className="text-xs font-bold text-slate-200">{maxTokens}</span>
            </div>
            <input
              type="range"
              min={500}
              max={8000}
              step={500}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-400" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-[#0f0f17] rounded-lg border border-white/[0.06]">
            <div>
              <div className="text-xs font-semibold text-slate-300">OPENAI_API_KEY</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">sk-...••••••••••••••••••</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-400">Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="primary" size="lg" onClick={handleSave} className="w-full">
        {saved ? 'Settings Saved!' : 'Save All Settings'}
      </Button>
    </div>
  );
}
