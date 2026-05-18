import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Users,
  Calendar,
  ShieldCheck,
  BarChart3,
  FileText,
  LogOut,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/", roles: ["employee", "manager", "admin"] },
  { label: "My Goals", icon: <Target className="w-5 h-5" />, path: "/goals", roles: ["employee"] },
  { label: "Check-in", icon: <CheckSquare className="w-5 h-5" />, path: "/checkin", roles: ["employee"] },
  { label: "Approvals", icon: <ShieldCheck className="w-5 h-5" />, path: "/approvals", roles: ["manager"] },
  { label: "Team Check-ins", icon: <Users className="w-5 h-5" />, path: "/team-checkins", roles: ["manager"] },
  { label: "Cycles", icon: <Calendar className="w-5 h-5" />, path: "/admin/cycles", roles: ["admin"] },
  { label: "Users", icon: <Users className="w-5 h-5" />, path: "/admin/users", roles: ["admin"] },
  { label: "Thrust Areas", icon: <Target className="w-5 h-5" />, path: "/admin/thrust-areas", roles: ["admin"] },
  { label: "Audit Log", icon: <FileText className="w-5 h-5" />, path: "/admin/audit", roles: ["admin"] },
  { label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, path: "/analytics", roles: ["manager", "admin"] },
  { label: "Reports", icon: <FileText className="w-5 h-5" />, path: "/admin/reports", roles: ["admin"] },
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-6">
        <div className="text-2xl font-bold text-orange-600">AtomQuest</div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === item.path
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center mb-4 px-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold text-orange-600">AtomQuest</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
