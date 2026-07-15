"use client";

import { useState, useEffect, useCallback } from "react";


// ─── Types ────────────────────────────────────────────────────────────────────
interface OverviewData {
  totalProspects: number;
  activeAudits: number;
  emailsSent: number;
  replies: number;
  chartData?: { month: string; value: number }[];
  recentJobs: Array<{
    id: string;
    type: string;
    status: string;
    created_at: string;
    payload: Record<string, string>;
  }>;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Share: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  MoreVertical: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  ),
  MoreHorizontal: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
    </svg>
  ),
  Target: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  DashedCircle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  Spiral: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12c0-4.4 2.8-8.2 6.8-9.5"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  TrendingUp: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  BarChart: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Download: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Pen: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Gift: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  ),
  Cross: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2v20M2 12h20"/>
    </svg>
  ),
  BellSolid: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  BellOutline: (p: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
};

// ─── Component Helpers ────────────────────────────────────────────────────────



// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);


  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }

  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived dummy data for visuals
  const prospects = data?.totalProspects ?? 0;
  const audits = data?.activeAudits ?? 0;
  const emails = data?.emailsSent ?? 0;
  const replies = data?.replies ?? 0;
  
  // Calculate fake progress for the ring
  const conversionRate = Math.min(100, Math.max(5, (replies / Math.max(emails, 1)) * 100));

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      
      {/* ─── Top Row ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Overall Information */}
        <div className="bg-[#111] rounded-[32px] p-8 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h2 className="text-[17px] font-semibold tracking-tight">Overall Information</h2>
            <div className="flex items-center gap-4 text-white/70">
              <button className="hover:text-white transition-colors"><Icons.Share /></button>
              <button className="hover:text-white transition-colors"><Icons.MoreVertical /></button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-[44px] font-bold leading-none tracking-tight">{prospects.toLocaleString()}</p>
              <p className="text-[13px] text-white/50 mt-1 max-w-[80px] leading-tight">Prospects for all time</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[44px] font-bold leading-none tracking-tight">2</span>
              <p className="text-[13px] text-white/50 mt-1 max-w-[60px] leading-tight">projects are stopped</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 relative z-10">
            <div className="bg-white text-[#111] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
              <Icons.Target className="text-[#333] mb-3" />
              <p className="text-[22px] font-bold tracking-tight mb-1">{audits.toLocaleString()}</p>
              <p className="text-[10px] font-medium text-[#777] uppercase tracking-wider">Audits</p>
            </div>
            <div className="bg-white text-[#111] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
              <Icons.DashedCircle className="text-[#333] mb-3" />
              <p className="text-[22px] font-bold tracking-tight mb-1">{emails.toLocaleString()}</p>
              <p className="text-[10px] font-medium text-[#777] uppercase tracking-wider">Pitches</p>
            </div>
            <div className="bg-white text-[#111] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
              <Icons.Spiral className="text-[#333] mb-3" />
              <p className="text-[22px] font-bold tracking-tight mb-1">{replies.toLocaleString()}</p>
              <p className="text-[10px] font-medium text-[#777] uppercase tracking-wider">Replies</p>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-white/5 blur-[80px] rounded-full" />
        </div>

        {/* Weekly progress */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between border border-[#f0f0f0]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight text-[#111] mb-2">Weekly progress</h2>
              <div className="flex gap-4 text-[13px] font-medium text-[#777]">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#111]" /> Discoveries</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ccc]" /> Emails</div>
              </div>
            </div>
            <button className="text-[#999] hover:text-[#111] transition-colors"><Icons.TrendingUp /></button>
          </div>

          {/* Fake Line Chart mimicking the design */}
          <div className="relative h-[120px] w-full mt-auto">
            {/* Tooltip */}
            <div className="absolute top-0 right-[25%] bg-[#111] text-white text-[10px] font-bold px-2 py-1 rounded-[6px] z-10 -translate-y-4">
              +24%
            </div>
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <path d="M0,80 Q30,40 60,70 T120,60 T180,80 T240,20 T300,50" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0,50 Q30,90 60,50 T120,90 T180,70 T240,40 T300,10" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          
          {/* X Axis */}
          <div className="flex justify-between text-[11px] font-bold text-[#aaa] uppercase tracking-wider mt-4">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span>
            <span className="bg-[#111] text-white w-5 h-5 rounded-full flex items-center justify-center">S</span>
            <span>S</span>
          </div>
        </div>

        {/* Month progress */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between border border-[#f0f0f0]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight text-[#111] mb-1">Month progress</h2>
              <p className="text-[11px] font-medium text-[#777]">+20% compared to last month*</p>
            </div>
            <button className="text-[#999] hover:text-[#111] transition-colors"><Icons.BarChart /></button>
          </div>

          <div className="flex items-center justify-between mt-auto mb-6">
            <div className="space-y-3 text-[13px] font-medium text-[#777]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#111]" /> Audits</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#777]" /> Emails</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ccc]" /> Replies</div>
            </div>
            {/* Ring Chart */}
            <div className="relative w-[110px] h-[110px]">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#111" strokeWidth="6" strokeDasharray="251" strokeDashoffset={251 - (251 * conversionRate) / 100} strokeLinecap="round" />
                
                <circle cx="50" cy="50" r="28" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                <circle cx="50" cy="50" r="28" fill="none" stroke="#777" strokeWidth="6" strokeDasharray="175" strokeDashoffset="60" strokeLinecap="round" />
                
                <circle cx="50" cy="50" r="16" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                <circle cx="50" cy="50" r="16" fill="none" stroke="#ccc" strokeWidth="6" strokeDasharray="100" strokeDashoffset="30" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[18px] font-bold tracking-tight text-[#111]">{Math.round(conversionRate)}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-[42px] h-[42px] bg-[#111] text-white rounded-full flex items-center justify-center hover:bg-[#222] transition-colors shrink-0">
              <Icons.Share />
            </button>
            <button className="flex-1 h-[42px] border border-[#111] rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold text-[#111] hover:bg-[#fafafa] transition-colors">
              Download Report <Icons.Download />
            </button>
          </div>
        </div>

      </div>

      {/* ─── Middle Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month goals */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[17px] font-semibold tracking-tight text-[#111]">Month goals:</h2>
            <div className="flex items-center gap-3">
              {/* Mini progress circle */}
              <div className="relative w-7 h-7">
                <svg viewBox="0 0 24 24" className="transform -rotate-90">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#f0f0f0" strokeWidth="2" />
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#111" strokeWidth="2" strokeDasharray="62" strokeDashoffset="45" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold">1/4</span>
              </div>
              <button className="text-[#999] hover:text-[#111] transition-colors"><Icons.Pen /></button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="w-5 h-5 bg-[#111] rounded-[6px] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-[14px] font-medium text-[#111]">Read 2 books</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="w-5 h-5 border-[1.5px] border-[#ccc] rounded-full shrink-0 group-hover:border-[#999] transition-colors" />
              <span className="text-[14px] font-medium text-[#aaa]">Sports every day</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="w-5 h-5 border-[1.5px] border-[#ccc] rounded-full shrink-0 group-hover:border-[#999] transition-colors" />
              <span className="text-[14px] font-medium text-[#aaa]">Complete the course</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="w-5 h-5 border-[1.5px] border-[#ccc] rounded-full shrink-0 group-hover:border-[#999] transition-colors" />
              <span className="text-[14px] font-medium text-[#aaa]">Bend down with a parachute</span>
            </label>
          </div>
        </div>

        {/* Task in process */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-[17px] font-semibold tracking-tight text-[#111]">Task in process (2)</h2>
            <button className="text-[12px] font-semibold text-[#777] hover:text-[#111] transition-colors">Open archive &gt;</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[calc(100%-40px)]">
            {/* Card 1 */}
            <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-[#f0f0f0] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <Icons.Gift className="text-[#111]" />
                <button className="text-[#999] hover:text-[#111] transition-colors"><Icons.MoreHorizontal /></button>
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#111] leading-snug mb-4">Buy Susan a gift for Birthday</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#999]">Today</span>
                  <button className="w-10 h-10 bg-[#111] text-white rounded-[12px] flex items-center justify-center hover:bg-[#222] transition-colors">
                    <Icons.BellSolid />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[28px] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-[#f0f0f0] flex flex-col justify-between relative">
              <div className="flex justify-between items-start mb-6">
                <Icons.Cross className="text-[#111]" />
                <button className="text-[#111] transition-colors relative">
                  <Icons.MoreHorizontal />
                  
                  {/* Mock Popover */}
                  <div className="absolute right-0 top-6 w-[120px] bg-[#222] rounded-[16px] p-2 text-white shadow-xl z-20 hidden md:block">
                    <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium hover:bg-white/10 rounded-[8px] cursor-pointer">
                      Pin Note <Icons.Pen className="w-3 h-3" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium hover:bg-white/10 rounded-[8px] cursor-pointer">
                      Edit <Icons.Pen className="w-3 h-3" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium hover:bg-white/10 rounded-[8px] cursor-pointer text-white/50">
                      Delete <Icons.Pen className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              </div>
              <div>
                <p className="text-[15px] font-medium text-[#111] leading-snug mb-4">Doctor&apos;s appointment on Tuesday</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#999]">02.09.2023</span>
                  <button className="w-10 h-10 border-[1.5px] border-[#111] text-[#111] rounded-[12px] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors">
                    <Icons.BellOutline />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty Card */}
            <button className="rounded-[28px] border-[2px] border-dashed border-[#ccc] flex flex-col items-center justify-center text-[#999] hover:text-[#111] hover:border-[#aaa] transition-all bg-transparent group min-h-[160px]">
              <div className="flex items-center gap-2 text-[14px] font-semibold">
                <Icons.Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add task
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* ─── Bottom Row ─── */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-[17px] font-semibold tracking-tight text-[#111]">Last Projects</h2>
          <div className="flex items-center gap-4 text-[#777]">
            <span className="text-[12px] font-semibold flex items-center gap-1 cursor-pointer hover:text-[#111]">Sort by <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg></span>
            <div className="flex items-center gap-2 border-l border-[#d4d4d4] pl-4">
              <button className="text-[#111]"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></button>
              <button className="hover:text-[#111]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Project Card 1 */}
          <div className="bg-[#111] rounded-[24px] p-6 flex flex-col justify-between text-white border border-[#222]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight mb-1">New Schedule</h3>
                <div className="flex items-center gap-2 text-[11px] text-white/50"><div className="w-1.5 h-1.5 bg-white rounded-full"/> In progress</div>
              </div>
              <div className="w-8 h-8 rounded-full border-[2px] border-white/20 flex items-center justify-center">
                <span className="text-[7px] font-bold">1/6</span>
              </div>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed font-medium">Done: Develop a new plan for Alina&apos;s education; Print a new timetable; Buy ...</p>
          </div>

          {/* Project Card 2 */}
          <div className="bg-[#111] rounded-[24px] p-6 flex flex-col justify-between text-white border border-[#222]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight mb-1">Prototype animation</h3>
                <div className="flex items-center gap-2 text-[11px] text-white/50"><div className="w-1.5 h-1.5 bg-white rounded-full"/> Completed</div>
              </div>
              <div className="w-8 h-8 rounded-full border-[2px] border-white flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>

          {/* Project Card 3 */}
          <div className="bg-[#111] rounded-[24px] p-6 flex flex-col justify-between text-white border border-[#222]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight mb-1">Ai Project 2 part</h3>
                <div className="flex items-center gap-2 text-[11px] text-white/50"><div className="w-1.5 h-1.5 bg-white rounded-full"/> In progress</div>
              </div>
              <div className="w-8 h-8 rounded-full border-[2px] border-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full transform -rotate-90">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" strokeDasharray="62" strokeDashoffset="40" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[7px] font-bold">2/8</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
