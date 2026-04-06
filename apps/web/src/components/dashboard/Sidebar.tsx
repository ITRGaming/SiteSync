import { NavLink, useNavigate } from "react-router-dom";
import { DashboardIcon, PersonIcon, GearIcon } from "@radix-ui/react-icons";

export default function Sidebar({ user, role }: { user: any; role: string }) {
  const navigate = useNavigate();
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  return (
    <div>
      <aside className="w-64 sticky bg-white border-r border-[#E5DFD3] flex-col justify-between hidden md:flex shrink-0 min-h-screen h-full z-40">
        <div>
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#8B6914] rounded-md flex items-center justify-center text-white font-bold font-outfit">
                S
              </div>
              <div>
                <h1 className="font-outfit font-bold text-xl leading-none">SiteSync</h1>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-1">Bhutra Industrial</p>
              </div>
            </div>
          </div>
          <nav className="mt-8 px-4 space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-[#F5F0E8] text-[#8B6914]" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <DashboardIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-[#F5F0E8] text-[#8B6914]" : "text-gray-600 hover:bg-gray-50"}`
                }
              >
                <GearIcon className="w-5 h-5" />
                <span>User Management</span>
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-[#F5F0E8] text-[#8B6914]" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <PersonIcon className="w-5 h-5" />
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
        <div className="p-4 border-t border-[#E5DFD3]">
          <div
            className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => navigate("/profile")}
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName || "User"}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[120px]">{user?.fullName || "User"}</p>
              <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="w-full fixed bottom-0 bg-white border-r border-[#E5DFD3] flex-row justify-evenly md:hidden shrink-0 z-10">
        <div>
          <nav className="mt-1 mb-1 px-4 space-y-1 flex flex-row justify-evenly">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-[#F5F0E8] text-[#8B6914]" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <DashboardIcon className="w-5 h-5" />
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-[#F5F0E8] text-[#8B6914]" : "text-gray-600 hover:bg-gray-50"}`
                }
              >
                <GearIcon className="w-5 h-5" />
              </NavLink>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) => `flex items-center gap-3 px-2 py-2 cursor-pointer rounded-lg transition-colors ${isActive ? "bg-[#F5F0E8] text-[#8B6914]" : "text-gray-600 hover:bg-gray-50"}` }
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName || "User"}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
}
