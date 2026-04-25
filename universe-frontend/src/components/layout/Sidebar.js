import React, { useContext, useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  Home,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  MessageSquare,
  Calendar,
  Rocket,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'PLANETARY',
    items: [
      { to: '/', icon: Home, label: 'Campus Orbit', end: true },
      { to: 'profile', icon: UserIcon, label: 'Profile', dynamic: true },
    ],
  },
  {
    label: 'GALACTIC',
    items: [
      { to: '/events', icon: Calendar, label: 'Events' },
      { to: '/messages', icon: MessageSquare, label: 'Comms Hub' },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [mouseY, setMouseY] = useState(0);

  // Track mouse Y for parallax glow
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const handleMove = (e) => {
      const rect = sidebar.getBoundingClientRect();
      setMouseY(e.clientY - rect.top);
    };
    sidebar.addEventListener('mousemove', handleMove);
    return () => sidebar.removeEventListener('mousemove', handleMove);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div
      ref={sidebarRef}
      className="w-80 h-screen sticky top-0 hidden md:flex flex-col flex-shrink-0 z-10 overflow-hidden"
      style={{
        background: 'rgba(14,14,19,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(72,71,77,0.1)',
      }}
    >
      {/* Mouse proximity glow — follows cursor Y */}
      <div
        className="absolute right-0 w-px h-32 pointer-events-none transition-all duration-500"
        style={{
          top: mouseY - 64,
          background: 'linear-gradient(transparent, rgba(61,194,253,0.3), transparent)',
          boxShadow: '0 0 20px rgba(61,194,253,0.15)',
          opacity: mouseY > 0 ? 1 : 0,
        }}
      />

      {/* Logo Area */}
      <Link to="/" className="hover:opacity-90 transition-opacity">
        <motion.div
          className="p-8 flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Orbital Logo */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                border: '1px dashed rgba(193,128,255,0.4)',
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-1 rounded-full"
              style={{
                border: '1px dashed rgba(61,194,253,0.25)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full"
                 style={{ background: 'var(--surface-container-highest)' }}>
              <Rocket className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            {/* Orbiting dot */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
              style={{ transformOrigin: 'center' }}
            >
              <div className="absolute -top-0.5 left-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2"
                   style={{
                     background: 'var(--tertiary)',
                     boxShadow: '0 0 6px rgba(255,156,126,0.6)',
                   }} />
            </motion.div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-wider leading-none"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
              UniVerse
            </h1>
            <p className="text-[9px] font-bold tracking-[0.35em] uppercase mt-1"
               style={{ color: 'var(--on-surface-variant)' }}>
              Campus Platform
            </p>
          </div>
        </motion.div>
      </Link>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 space-y-6 mt-2 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section divider */}
            <div className="flex items-center gap-3 px-4 mb-2">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase"
                    style={{ color: 'var(--outline)' }}>
                {section.label}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--outline-variant)', opacity: 0.3 }} />
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const to = item.dynamic && user?.id ? `/user/${user.id}` : item.to;
                return (
                  <NavLink
                    key={item.label}
                    to={to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                        isActive
                          ? 'text-white'
                          : 'text-[var(--on-surface-variant)] hover:text-white'
                      }`
                    }
                    style={({ isActive }) => ({
                      background: isActive ? 'rgba(61,194,253,0.06)' : 'transparent',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator — orbital dot */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavDot"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                            style={{
                              background: 'var(--primary)',
                              boxShadow: '0 0 10px rgba(61,194,253,0.5), 2px 0 20px rgba(61,194,253,0.2)',
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[var(--primary)]' : ''}`} />
                        <span className="text-sm">{item.label}</span>

                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                             style={{
                               background: 'radial-gradient(ellipse at left center, rgba(61,194,253,0.04), transparent 70%)',
                             }} />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Moderator/Admin Section */}
        {(user?.role === 'moderator' || user?.role === 'supervisor' || user?.role === 'admin') && (
          <div>
            <div className="flex items-center gap-3 px-4 mb-2">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase"
                    style={{ color: 'var(--error)' }}>
                COSMIC
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,110,132,0.2)' }} />
            </div>
            <div className="space-y-1">
              {(user?.role === 'moderator' || user?.role === 'supervisor') && (
                <NavLink
                  to="/mod-dashboard"
                  className={({ isActive }) =>
                    `group relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                      isActive ? 'text-[var(--error)]' : 'text-[var(--on-surface-variant)] hover:text-[var(--error)]'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(255,110,132,0.06)' : 'transparent',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavDot"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                          style={{
                            background: 'var(--error)',
                            boxShadow: '0 0 10px rgba(255,110,132,0.5)',
                          }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <ShieldAlert className="w-5 h-5" />
                      <span className="text-sm">System Control</span>
                    </>
                  )}
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `group relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                      isActive ? 'text-[var(--tertiary)]' : 'text-[var(--on-surface-variant)] hover:text-[var(--tertiary)]'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(255,156,126,0.06)' : 'transparent',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavDot"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                          style={{
                            background: 'var(--tertiary)',
                            boxShadow: '0 0 10px rgba(255,156,126,0.5)',
                          }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="text-sm">Admin Bridge</span>
                    </>
                  )}
                </NavLink>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Theme Toggle + User Profile & Logout — Bottom */}
      <div className="p-5 mt-auto mx-3 mb-3 rounded-2xl space-y-3"
           style={{
             background: 'rgba(25,25,31,0.6)',
             border: '1px solid rgba(72,71,77,0.12)',
           }}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group"
          style={{
            border: '1px solid rgba(72,71,77,0.15)',
            background: 'transparent',
          }}
        >
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ color: 'var(--on-surface-variant)' }}>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className="relative w-12 h-6 rounded-full transition-all duration-300"
               style={{
                 background: theme === 'dark' ? 'rgba(61,194,253,0.15)' : 'rgba(255,180,0,0.2)',
                 border: `1px solid ${theme === 'dark' ? 'rgba(61,194,253,0.25)' : 'rgba(255,180,0,0.3)'}`,
               }}>
            <motion.div
              className="absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center"
              animate={{ left: theme === 'dark' ? '2px' : '22px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                background: theme === 'dark' ? 'var(--primary)' : '#FFB800',
                boxShadow: theme === 'dark' ? '0 0 8px rgba(61,194,253,0.5)' : '0 0 8px rgba(255,180,0,0.5)',
              }}
            >
              {theme === 'dark' ? <Moon className="w-3 h-3 text-[var(--on-primary)]" /> : <Sun className="w-3 h-3 text-white" />}
            </motion.div>
          </div>
        </button>

        <div className="w-full h-px" style={{ background: 'rgba(72,71,77,0.12)' }} />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
               style={{
                 border: '2px solid var(--secondary)',
                 boxShadow: '0 0 12px rgba(193,128,255,0.3)',
                 background: 'var(--surface-bright)',
               }}>
            {user?.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-sm leading-tight truncate" style={{ color: 'var(--on-surface)' }}>
              {user?.name || 'Astronaut'}
            </p>
            <p className="text-[10px] font-bold tracking-[0.1em] uppercase truncate"
               style={{ color: 'var(--primary)' }}>
              {user?.role || 'explorer'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.02]"
          style={{
            border: '1px solid rgba(72,71,77,0.2)',
            color: 'var(--on-surface-variant)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,110,132,0.3)';
            e.currentTarget.style.color = 'var(--error)';
            e.currentTarget.style.background = 'rgba(255,110,132,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(72,71,77,0.2)';
            e.currentTarget.style.color = 'var(--on-surface-variant)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Disengage
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
