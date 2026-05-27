import React from "react";
import { Sparkles, GraduationCap, BrainCircuit, Users, Briefcase, Calculator, BookOpen, Settings, LogIn, LogOut, Sun, Moon } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  openAuthModal: () => void;
  user: any;
  handleLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  openAuthModal,
  user,
  handleLogout
}: HeaderProps) {
  const navItems = [
    { id: "academy", label: "Academy (LMS)", icon: GraduationCap },
    { id: "mentor", label: "AI Yamini (Mentor)", icon: BrainCircuit },
    { id: "tools", label: "AI Tools Hub", icon: Sparkles },
    { id: "community", label: "Community Hub", icon: Users },
    { id: "jobs", label: "Career & Jobs", icon: Briefcase },
    { id: "calculators", label: "Marketing Calcs", icon: Calculator },
    { id: "blogs", label: "Insights Blog", icon: BookOpen },
    { id: "admin", label: "CRM Admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo Brand Segment */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("academy")}>
            <div className="p-2 bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                DIGITAL YAMINI
              </h1>
              <p className="text-[10px] font-medium text-blue-600 dark:text-teal-400 tracking-wider mt-0.5 uppercase">
                Learn. Implement. Grow.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            {/* Dark & Light Switcher */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                    Score: {user.leadScore || 85} XP
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/10 transition-all hover:scale-[1.02]"
              >
                <LogIn className="h-4 w-4" />
                <span>Join Academy</span>
              </button>
            )}
          </div>
        </div>

        {/* Small screen mobile tab bar helper */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none border-t border-gray-100 dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
