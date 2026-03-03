import { useState, useEffect } from 'react';
import { Leaf, Menu, X, LogOut, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Visão', href: '#vision' },
  { label: 'Painel', href: '#planner' },
  { label: 'Nós dois', href: '#couple' },
  { label: 'Inspirações', href: '#gallery' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = scrolled
    ? 'bg-[#fffdf5]/95 backdrop-blur-md shadow-sm border-b border-[#e8d5b0]'
    : 'bg-transparent';
  const textColor = scrolled ? 'text-[#5c3d1e]' : 'text-white';
  const logoColor = scrolled ? 'text-[#4a7c59]' : 'text-white';
  const userInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#"
            onClick={e => { e.preventDefault(); navigate('/hub'); }}
            className={`flex items-center gap-2 font-serif font-bold text-xl ${logoColor} transition-colors duration-300`}
          >
            <Leaf className="w-5 h-5" />
            Sítio Paraíso
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-sm font-medium ${textColor} hover:text-[#4a7c59] transition-colors duration-200`}
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => navigate('/app/metas')}
              className={`flex items-center gap-1.5 text-sm font-medium ${textColor} hover:text-[#4a7c59] transition-colors duration-200`}
            >
              <Target className="w-3.5 h-3.5" />
              Metas
            </button>
          </div>

          {/* Desktop User */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {userInitial}
              </div>
              <span className={`text-xs font-medium truncate max-w-[140px] ${textColor}`}>
                {user?.email}
              </span>
            </div>
            <button
              onClick={signOut}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                scrolled
                  ? 'border-[#e8d5b0] text-[#8a7a66] hover:border-red-300 hover:text-red-500'
                  : 'border-white/40 text-white/80 hover:bg-white/10 hover:border-white'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden ${textColor} p-2 rounded-lg`}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#fffdf5]/98 backdrop-blur-md border-t border-[#e8d5b0] px-4 pb-4 pt-2 shadow-lg">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[#5c3d1e] font-medium py-2.5 px-3 rounded-lg hover:bg-[#f5ead0] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => { navigate('/app/metas'); setOpen(false); }}
              className="flex items-center gap-2 text-[#5c3d1e] font-medium py-2.5 px-3 rounded-lg hover:bg-[#f5ead0] transition-colors text-left"
            >
              <Target className="w-4 h-4 text-[#4a7c59]" /> Metas Gerais
            </button>
            <div className="border-t border-[#e8d5b0] pt-3 mt-1">
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {userInitial}
                </div>
                <span className="text-xs text-[#8a7a66] truncate">{user?.email}</span>
              </div>
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="flex items-center gap-2 w-full text-sm font-medium text-red-500 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair da conta
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
