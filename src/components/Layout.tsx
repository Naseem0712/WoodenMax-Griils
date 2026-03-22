import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calculator, LayoutGrid, Hammer, ShieldCheck } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Calculator', icon: Calculator },
    { path: '/comparisons', label: 'Comparisons', icon: LayoutGrid },
    { path: '/tools-guide', label: 'Tools & Materials', icon: Hammer },
    { path: '/grill-types', label: 'Grill Types', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-zinc-900 p-2 rounded-lg">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">WoodenMax Grills</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        <Outlet />
      </div>

      <footer className="bg-zinc-900 text-zinc-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">WoodenMax Grills</span>
              </div>
              <p className="text-sm max-w-sm">
                Premium aluminium and iron grills for windows, balconies, and safety. Custom designs, precise calculations, and professional installation.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Calculator</Link></li>
                <li><Link to="/comparisons" className="hover:text-white transition-colors">Comparisons</Link></li>
                <li><Link to="/tools-guide" className="hover:text-white transition-colors">Tools Guide</Link></li>
                <li><Link to="/grill-types" className="hover:text-white transition-colors">Types of Grills</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>WoodenMax Architectural Elements</li>
                <li>5-6-411/413 Aghapura, Nampally</li>
                <li>Hyderabad TS-500001</li>
                <li>info@woodenmax.in</li>
                <li>www.woodenmax.in</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} WoodenMax Architectural Elements. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://grills.woodenmax.in" className="hover:text-white transition-colors">grills.woodenmax.in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
