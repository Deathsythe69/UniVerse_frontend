import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Home, 
  ShieldAlert, 
  LogOut, 
  Rocket, 
  User as UserIcon,
  MessageSquare,
  Calendar
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-white/10 text-[var(--neon-cyan)] shadow-[inset_4px_0_0_var(--neon-cyan)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="w-80 h-screen sticky top-0 border-r border-white/10 hidden md:flex flex-col flex-shrink-0 bg-[var(--space-dark)]/50 backdrop-blur-md">
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border border-[var(--neon-cyan)] flex items-center justify-center bg-[var(--neon-cyan)]/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Rocket className="w-6 h-6 text-[var(--neon-cyan)]" />
        </div>
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] tracking-wider">
          UniVerse
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink to="/" end className={navLinkClass}>
          <Home className="w-6 h-6" />
          <span className="text-lg">Main Feed</span>
        </NavLink>
        
        <NavLink to="/profile" className={navLinkClass}>
          <UserIcon className="w-6 h-6" />
          <span className="text-lg">Profile</span>
        </NavLink>
        
        <NavLink to="/events" className={navLinkClass}>
          <Calendar className="w-6 h-6" />
          <span className="text-lg">Events</span>
        </NavLink>

        <NavLink to="/messages" className={navLinkClass}>
          <MessageSquare className="w-6 h-6" />
          <span className="text-lg">Messages</span>
        </NavLink>

        {(user?.role === 'moderator' || user?.role === 'supervisor') && (
          <NavLink to="/mod-dashboard" className={navLinkClass}>
            <ShieldAlert className="w-6 h-6 text-yellow-500" />
            <span className="text-lg text-yellow-500">Mod Dashboard</span>
          </NavLink>
        )}
      </nav>

      {/* User Profile & Logout Bottom */}
      <div className="p-6 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
            <UserIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="font-bold text-white leading-tight">{user?.name}</p>
            <p className="text-sm text-[var(--neon-cyan)]">{user?.role}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
