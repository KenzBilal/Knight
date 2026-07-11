import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { StatCard } from './StatCard';
import { DataTable } from './DataTable';
import { Badge, planBadgeColor } from './Badge';
import { dbSelect } from '../lib/supabase';

export function BillingModule() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [orgsRes, plansRes] = await Promise.all([
        dbSelect('orgs', {
          order: { column: 'created_at', ascending: false },
          limit: 500,
        }),
        dbSelect('plans', {
          order: { column: 'created_at', ascending: true },
        }),
      ]);
      setOrgs(orgsRes.data || []);
      setPlans(plansRes.data || []);
    } catch {
      setOrgs([]);
      setPlans([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const planCounts = orgs.reduce((acc: Record<string, number>, o: any) => {
    acc[o.plan] = (acc[o.plan] || 0) + 1;
    return acc;
  }, {});

  const planPriceMap = Object.fromEntries(plans.map((p: any) => [p.name, p.price]));
  const planNames = plans.map((p: any) => p.name);

  const paidOrgs = orgs.filter(o => o.plan !== 'free');
  const totalMRR = paidOrgs.reduce((sum: number, o: any) => sum + (planPriceMap[o.plan] || 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Billing" subtitle="Revenue & subscriptions">
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors">
          Refresh
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total MRR" value={`$${totalMRR}`} icon={<CreditCard size={16} />} color="#4ade80" />
          <StatCard label="Paid Orgs" value={paidOrgs.length} icon={<CreditCard size={16} />} />
          <StatCard label="Free Orgs" value={planCounts['free'] || 0} icon={<CreditCard size={16} />} />
          <StatCard label="Total Orgs" value={orgs.length} icon={<CreditCard size={16} />} />
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-[#555] font-medium mb-3">Plan Distribution</h3>
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${planNames.length || 1}, 1fr)` }}>
            {planNames.map(plan => (
              <div key={plan} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 text-center">
                <Badge variant={planBadgeColor(plan)}>{plan}</Badge>
                <div className="text-xl font-display text-[#e0e0e0] mt-2">{planCounts[plan] || 0}</div>
                <div className="text-[10px] text-[#555]">organizations</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-[#555] font-medium mb-3">All Subscriptions</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Org', render: (r: any) => <span className="text-[#e0e0e0]">{r.name}</span> },
              { key: 'plan', label: 'Plan', render: (r: any) => <Badge variant={planBadgeColor(r.plan)}>{r.plan}</Badge> },
              { key: 'stripe_subscription_id', label: 'Subscription', render: (r: any) => r.stripe_subscription_id ? <Badge variant="success">Active</Badge> : <Badge>None</Badge> },
              { key: 'created_at', label: 'Since', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
            ]}
            data={orgs}
            loading={loading}
            emptyMessage="No organizations"
          />
        </div>
      </div>
    </div>
  );
}
