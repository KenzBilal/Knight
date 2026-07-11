import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';
import type { Plan } from '../lib/types';

function formatPrice(cents: number | null | undefined) {
  const c = Number(cents) || 0;
  if (c === 0) return '$0';
  return `$${(c / 100).toFixed(0)}`;
}

function formatPeriod(period: string | null | undefined) {
  if (!period || period === 'forever' || period === 'once') return '';
  if (period === 'month') return '/mo';
  if (period === 'year') return '/yr';
  return '';
}

function sanitizePlan(raw: any): Plan {
  return {
    id: raw.id || '',
    name: raw.name || '',
    price: Number(raw.price) || 0,
    period: raw.period || 'month',
    description: raw.description || '',
    features: Array.isArray(raw.features) ? raw.features : [],
    lead_limit: Number(raw.lead_limit) ?? -1,
    email_limit: Number(raw.email_limit) ?? -1,
    telegram_limit: Number(raw.telegram_limit) ?? 0,
    lemon_product_id: raw.lemon_product_id || null,
    lemon_variant_id: raw.lemon_variant_id || null,
    sort_order: Number(raw.sort_order) || 0,
    highlighted: Boolean(raw.highlighted),
    active: raw.active !== false,
    created_at: raw.created_at || '',
    updated_at: raw.updated_at || '',
  };
}

export function PlansModule() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    setError(null);
    try {
      const result = await dbSelect('plans', {
        order: { column: 'sort_order', ascending: true },
      });
      if (result.error) throw new Error(result.error);
      const raw: any[] = result.data || [];
      setPlans(raw.map(sanitizePlan));
    } catch (err: any) {
      setError(err.message || 'Failed to load plans');
    }
    setLoading(false);
  }

  const updatePlan = (id: string, field: keyof Plan, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    setDirty(true);
  };

  const addPlan = async () => {
    const newId = `plan_${Date.now()}`;
    setError(null);
    try {
      const result = await dbInsert('plans', {
        id: newId,
        name: 'New Plan',
        price: 0,
        period: 'month',
        description: '',
        features: [],
        lead_limit: 50,
        email_limit: 50,
        telegram_limit: 0,
        lemon_product_id: null,
        lemon_variant_id: null,
        sort_order: plans.length,
        highlighted: false,
        active: true,
      });
      if (result.error) throw new Error(result.error);
      if (result.data?.[0]) {
        setPlans(prev => [...prev, sanitizePlan(result.data[0])]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add plan');
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan? Orgs on this plan will lose it.')) return;
    setError(null);
    try {
      const result = await dbDelete('plans', { id });
      if (result.error) throw new Error(result.error);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const plan of plans) {
        const result = await dbUpdate('plans', {
          name: plan.name,
          price: plan.price,
          period: plan.period,
          description: plan.description || null,
          features: plan.features || [],
          lead_limit: plan.lead_limit,
          email_limit: plan.email_limit,
          telegram_limit: plan.telegram_limit,
          lemon_product_id: plan.lemon_product_id || null,
          lemon_variant_id: plan.lemon_variant_id || null,
          sort_order: plan.sort_order,
          highlighted: plan.highlighted,
          active: plan.active,
        }, { id: plan.id });
        if (result.error) throw new Error(`Failed to save ${plan.name}: ${result.error}`);
      }
      setDirty(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-[#555]">
        <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[12px]">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Plans" subtitle="Manage subscription tiers and pricing">
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-[11px] text-yellow-500">Unsaved changes</span>
          )}
          <button
            onClick={addPlan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] text-[#aaa] text-[12px] font-medium hover:bg-[#222] hover:text-[#fff] transition-colors"
          >
            <Plus size={12} />
            Add Plan
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#e0e0e0] text-[#121212] text-[12px] font-medium hover:bg-[#fff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={12} />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </PageHeader>

      {error && (
        <div className="mx-6 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-[12px] text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {plans.length === 0 ? (
          <div className="text-center text-[#555] text-[13px] py-12">No plans found. Click &quot;Add Plan&quot; to create one.</div>
        ) : (
          <div className="grid grid-cols-3 gap-6 max-w-5xl">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`bg-[#0d0d0d] border rounded-xl p-6 space-y-4 transition-colors ${
                  plan.highlighted
                    ? 'border-[#e0e0e0] shadow-[0_0_12px_rgba(224,224,224,0.05)]'
                    : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-[#333]" />
                    <span className="text-[10px] uppercase tracking-wider text-[#555] font-mono">{plan.id}</span>
                  </div>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-[#333] hover:text-red-400 transition-colors p-1"
                    title="Delete plan"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Name</label>
                  <input
                    value={plan.name}
                    onChange={e => updatePlan(plan.id, 'name', e.target.value)}
                    className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Tagline</label>
                  <input
                    value={plan.description || ''}
                    onChange={e => updatePlan(plan.id, 'description', e.target.value)}
                    className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                    placeholder="Short description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Price (cents)</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={e => updatePlan(plan.id, 'price', Number(e.target.value))}
                      className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                    />
                    <span className="text-[10px] text-[#444] mt-1">{formatPrice(plan.price)}{formatPeriod(plan.period)}</span>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Period</label>
                    <select
                      value={plan.period}
                      onChange={e => updatePlan(plan.id, 'period', e.target.value)}
                      className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                    >
                      <option value="month">month</option>
                      <option value="year">year</option>
                      <option value="once">once</option>
                      <option value="forever">forever</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Leads/mo</label>
                    <input
                      type="number"
                      value={plan.lead_limit}
                      onChange={e => updatePlan(plan.id, 'lead_limit', Number(e.target.value))}
                      className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                    />
                    <span className="text-[10px] text-[#444]">{plan.lead_limit === -1 ? 'unlimited' : plan.lead_limit}</span>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Emails/mo</label>
                    <input
                      type="number"
                      value={plan.email_limit}
                      onChange={e => updatePlan(plan.id, 'email_limit', Number(e.target.value))}
                      className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                    />
                    <span className="text-[10px] text-[#444]">{plan.email_limit === -1 ? 'unlimited' : plan.email_limit}</span>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Telegram</label>
                    <input
                      type="number"
                      value={plan.telegram_limit}
                      onChange={e => updatePlan(plan.id, 'telegram_limit', Number(e.target.value))}
                      className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                    />
                    <span className="text-[10px] text-[#444]">{plan.telegram_limit === -1 ? 'unlimited' : plan.telegram_limit}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">LemonSqueezy</label>
                  <input
                    value={plan.lemon_product_id || ''}
                    onChange={e => updatePlan(plan.id, 'lemon_product_id', e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-[#e0e0e0] text-[11px] font-mono focus:border-[#333] outline-none"
                    placeholder="Product ID"
                  />
                  <input
                    value={plan.lemon_variant_id || ''}
                    onChange={e => updatePlan(plan.id, 'lemon_variant_id', e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-[#e0e0e0] text-[11px] font-mono focus:border-[#333] outline-none"
                    placeholder="Variant ID (for checkout)"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Features</label>
                  <div className="mt-2 space-y-1.5">
                    {(plan.features || []).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={f || ''}
                          onChange={e => {
                            const newFeatures = [...(plan.features || [])];
                            newFeatures[i] = e.target.value;
                            updatePlan(plan.id, 'features', newFeatures);
                          }}
                          className="flex-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-[#e0e0e0] text-[12px] focus:border-[#333] outline-none"
                        />
                        <button
                          onClick={() => updatePlan(plan.id, 'features', (plan.features || []).filter((_, j) => j !== i))}
                          className="text-[#444] hover:text-[#f87171] text-[12px]"
                        >
                          x
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updatePlan(plan.id, 'features', [...(plan.features || []), 'New feature'])}
                      className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors"
                    >
                      + Add feature
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-[#1a1a1a]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.highlighted}
                      onChange={e => updatePlan(plan.id, 'highlighted', e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#333] bg-[#080808] text-[#e0e0e0] focus:ring-0"
                    />
                    <span className="text-[11px] text-[#888]">Highlighted</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={e => updatePlan(plan.id, 'active', e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#333] bg-[#080808] text-[#e0e0e0] focus:ring-0"
                    />
                    <span className="text-[11px] text-[#888]">Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
