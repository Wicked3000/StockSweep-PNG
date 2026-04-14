import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingCart, BarChart3, Boxes } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/count', icon: Boxes, label: 'Count' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
