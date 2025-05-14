import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Settings, 
  History, 
  User, 
  HelpCircle 
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

const NavItem = ({ href, icon, children, isActive }: NavItemProps) => {
  return (
    <Link href={href} 
      className={cn(
        "flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
        {
          "bg-gray-800 text-white": isActive,
        }
      )}
    >
      <span className="mr-3 text-lg">{icon}</span>
      {children}
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <span className="text-xl font-bold">Flex Bot</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem 
            href="/" 
            icon={<Home size={20} />}
            isActive={location === "/"}
          >
            Dashboard
          </NavItem>
          <NavItem 
            href="/settings" 
            icon={<Settings size={20} />}
            isActive={location === "/settings"}
          >
            Settings
          </NavItem>
          <NavItem 
            href="/history" 
            icon={<History size={20} />}
            isActive={location === "/history"}
          >
            History
          </NavItem>
          <NavItem 
            href="/account" 
            icon={<User size={20} />}
            isActive={location === "/account"}
          >
            Account
          </NavItem>
          <NavItem 
            href="/help" 
            icon={<HelpCircle size={20} />}
            isActive={location === "/help"}
          >
            Help
          </NavItem>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <User className="text-gray-300" size={20} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-300">{user?.amazonEmail || 'Set up your Amazon account'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
