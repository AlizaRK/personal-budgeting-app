import React, { useState } from 'react';
import {
  Menu,
  X,
  Wallet,
  Tag,
  LogOut,
  LayoutDashboard,
  LucideIcon,
} from 'lucide-react';
import logo from '../../assets/logo2-crop.png';
import { HeaderProps } from '../../types/HeaderProps';

const Header: React.FC<HeaderProps> = ({ view, setView, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: Array<{ label: string; icon: LucideIcon; view: string }> = [
    { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { label: 'Accounts', icon: Wallet, view: 'accounts' },
    { label: 'Categories', icon: Tag, view: 'categories' },
  ];

  const handleNav = (targetView: string) => {
    setView(targetView);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative bg-[#FFFBF4]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => handleNav('dashboard')}
        >
          <img
            src={logo}
            alt="Logo"
            className="h-12 w-auto mix-blend-multiply"
          />
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter leading-none">
              Cashplet
            </h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Smart Tracking
            </span>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`p-3 rounded-2xl transition-all flex items-center gap-2 px-5 font-black text-sm ${
                view === item.view
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white border border-amber-50 text-gray-600 hover:bg-amber-50'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={onLogout}
            className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 transition-all"
          >
            <LogOut size={20} />
          </button>
        </nav>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-3 bg-white rounded-2xl shadow-sm border border-amber-50 text-amber-600"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-amber-50 shadow-2xl md:hidden animate-in slide-in-from-top duration-300">
          <div className="p-6 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black ${
                  view === item.view
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </button>
            ))}
            <button
              onClick={onLogout}
              className="w-full p-4 bg-red-50 rounded-2xl flex items-center gap-4 text-red-600 font-black"
            >
              <LogOut size={22} /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
