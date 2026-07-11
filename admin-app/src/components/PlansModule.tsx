import { useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeader } from './PageHeader';

interface Plan {
  id: string;
  name: string;
  price: number;
  leadLimit: number;
  emailLimit: number;
  features: string[];
}

const DEFAULT_PLANS: Plan[] = [
  { id: 'free', name: 'Free', price: 0, leadLimit: 50, emailLimit: 50, features: ['50 leads/month', '50 emails/month', 'Basic audit', 'Dashboard'] },
  { id: 'starter', name: 'Starter', price: 49, leadLimit: 600, emailLimit: 900, features: ['20 leads/day', 'Full audit', '30 emails/day', 'AI pitches', 'CRM'] },
  { id: 'pro', name: 'Pro', price: 149, leadLimit: 3000, emailLimit: 6000, features: ['100 leads/day', '200 emails/day', 'Telegram agent', 'Drip sequences', 'Smart inbox', 'Full CRM'] },
];

export function PlansModule() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [saving, setSaving] = useState(false);

  const updatePlan = (id: string, field: keyof Plan, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    setSaving(true);
    // Plans would be saved to a config table or local storage
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Plans" subtitle="Manage subscription tiers">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#e0e0e0] text-[#121212] text-[12px] font-medium hover:bg-[#fff] transition-colors disabled:opacity-50"
        >
          <Save size={12} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6 max-w-5xl">
          {plans.map(plan => (
            <div key={plan.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 space-y-5 hover:border-[#2a2a2a] transition-colors">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Name</label>
                <input
                  value={plan.name}
                  onChange={e => updatePlan(plan.id, 'name', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Price ($/month)</label>
                <input
                  type="number"
                  value={plan.price}
                  onChange={e => updatePlan(plan.id, 'price', Number(e.target.value))}
                  className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Lead Limit/mo</label>
                  <input
                    type="number"
                    value={plan.leadLimit}
                    onChange={e => updatePlan(plan.id, 'leadLimit', Number(e.target.value))}
                    className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Email Limit/mo</label>
                  <input
                    type="number"
                    value={plan.emailLimit}
                    onChange={e => updatePlan(plan.id, 'emailLimit', Number(e.target.value))}
                    className="w-full mt-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-[#e0e0e0] text-sm focus:border-[#333] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#555] font-medium">Features</label>
                <div className="mt-2 space-y-1.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={f}
                        onChange={e => {
                          const newFeatures = [...plan.features];
                          newFeatures[i] = e.target.value;
                          updatePlan(plan.id, 'features', newFeatures);
                        }}
                        className="flex-1 bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-[#e0e0e0] text-[12px] focus:border-[#333] outline-none"
                      />
                      <button
                        onClick={() => updatePlan(plan.id, 'features', plan.features.filter((_, j) => j !== i))}
                        className="text-[#444] hover:text-[#f87171] text-[12px]"
                      >
                        x
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updatePlan(plan.id, 'features', [...plan.features, 'New feature'])}
                    className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors"
                  >
                    + Add feature
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
