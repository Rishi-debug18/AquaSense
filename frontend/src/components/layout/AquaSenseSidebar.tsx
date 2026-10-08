import React from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Network, Activity, BarChart3, 
  DollarSign, AlertTriangle, Cpu, Layers, FileText, 
  Settings, Scale, Flame, ShieldCheck, Gauge, LucideIcon
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: number;
}

interface NavSection {
  title: string;
  links: NavItem[];
}

export const AquaSenseSidebar: React.FC = () => {
  const { alerts, actionItems } = useAquaSenseStore();

  const openAlertsCount = alerts.filter(a => a.status === 'OPEN' || a.status === 'IN_PROGRESS').length;
  const pendingActionsCount = actionItems.filter(a => a.status === 'OPEN' || a.status === 'IN_PROGRESS').length;

  // Streamlined Industrial IA Groups
  const navigationSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      links: [
        { to: '/industrial', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'MONITOR',
      links: [
        { to: '/monitoring', label: 'Live SCADA Monitoring', icon: Gauge },
        { to: '/network', label: 'Water Network Map', icon: Network },
        { to: '/digital-twin', label: 'Water Digital Twin', icon: Activity, highlight: true },
        { to: '/prototype-simulator', label: 'Bench Hardware Twin', icon: Cpu, highlight: true },
        { to: '/consumption', label: 'Consumption Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'MANAGE',
      links: [
        { to: '/accounting', label: 'Water Accounting & Cost', icon: DollarSign },
        { to: '/departments', label: 'Departments & Budgets', icon: Layers },
        { to: '/devices', label: 'IoT Device Fleet', icon: Cpu },
      ]
    },
    {
      title: 'DETECT & AUDIT',
      links: [
        { to: '/alerts', label: 'Alert Center', icon: AlertTriangle, badge: openAlertsCount },
        { to: '/water-balance', label: 'Water Balance Reconciliation', icon: Scale },
        { to: '/loss-heatmap', label: 'Water Loss Spatial Heatmap', icon: Flame },
        { to: '/action-center', label: 'Action Center Tasks', icon: ShieldCheck, badge: pendingActionsCount },
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { to: '/reports', label: 'Reports & Export', icon: FileText },
        { to: '/settings', label: 'Company Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-76px)]">
      
      {/* Navigation Section */}
      <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </div>

            <nav className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm font-bold'
                          : link.highlight
                          ? 'text-sky-700 hover:bg-slate-50 hover:text-sky-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </div>

                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shrink-0">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Info Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Enterprise SCADA</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[11px] font-bold text-slate-800 truncate">
            Viraj Profiles — Boisar
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Connection: AQ-CONN-001
          </div>
        </div>
      </div>
    </aside>
  );
};
