import { NavLink } from 'react-router-dom';

/**
 * Main navigation component for the SOC dashboard.
 * Uses NavLink for active state styling on current route.
 */
function Navbar() {
  // Navigation items configuration
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/attacks', label: 'Attacks' },
    { path: '/sessions', label: 'Sessions' },
    { path: '/commands', label: 'Commands' },
  ];

  return (
    <nav className="bg-soc-surface border-b border-soc-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-soc-accent font-bold text-lg tracking-tight">
                HONEYPOT
              </span>
              <span className="text-soc-muted text-sm ml-2">
                Security Monitor
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-soc-accent/10 text-soc-accent'
                      : 'text-soc-muted hover:text-soc-text hover:bg-soc-border/50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center">
            <span className="flex items-center text-sm text-soc-muted">
              <span className="w-2 h-2 bg-soc-success rounded-full mr-2 animate-pulse" />
              Monitoring Active
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
