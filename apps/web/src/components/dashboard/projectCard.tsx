import { Cross2Icon, PlusIcon, TrashIcon, ResetIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

type Props = {
  site: any;
  isAdmin: boolean;
  activeTab: string;
  onAssign: (siteId: number) => void;
  onUnassign: (siteId: number, userId: number) => void;
  onSoftDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  onHardDelete?: (id: number) => void;
  role: string;
};

export default function ProjectCard({
  site,
  isAdmin,
  activeTab,
  onAssign,
  onUnassign,
  onSoftDelete,
  onRestore,
  onHardDelete,
  role,
}: Props) {
  const navigate = useNavigate();

  const avatars = site.assignments?.map((a: any) => a.user?.fullName) || [];

  // Build short names like "A. Singh, M. Rao, K. Verma +3"
  const shortNames = site.assignments
    ?.map((a: any) => {
      const name = a.user?.fullName || "";
      const parts = name.split(" ");
      if (parts.length >= 2) return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
      return name;
    })
    .slice(0, 3) || [];
  const nameText = shortNames.join(", ") + (avatars.length > 3 ? ` +${avatars.length - 3}` : "");

  return (
    <div className="bg-white border-l-[6px] border-[#8B6914] rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between min-h-[240px]"
      onClick={() => navigate(`/dashboard/site/${site.id}/phase`)}
    >
      {/* Top row */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
              site.isActive ? "bg-[#FFEBAF] text-[#8B6914]" : "bg-gray-100 text-gray-500"
            }`}
          >
            ● {site.isActive ? "ON-SITE ACTIVE" : "INACTIVE"}
          </span>
          <div className="text-right">
            <span className="text-3xl font-outfit font-bold leading-none text-gray-200">
              {String(site.totalSlabCount || 0).padStart(2, "0")}
            </span>
            <p className="text-[10px] font-bold tracking-wider uppercase mt-1">Slabs</p>
          </div>
        </div>

        {/* Title + Location */}
        <h3
          className="font-outfit text-xl font-bold tracking-tight text-[#1A1A1A] leading-tight mb-1 hover:text-[#8B6914] transition-colors cursor-pointer"
          onClick={() => navigate(`/dashboard/site/${site.id}/phase`)}
        >
          {site.name}
        </h3>
        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 14.5C7.5 14.5 12.5 10 12.5 6C12.5 3.23858 10.2614 1 7.5 1C4.73858 1 2.5 3.23858 2.5 6C2.5 10 7.5 14.5 7.5 14.5Z" stroke="currentColor" strokeLinecap="square" />
            <circle cx="7.5" cy="6" r="2.5" stroke="currentColor" />
          </svg>
          {site.location || "Location Not Set"}
        </p>

        {/* Details */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between items-end text-xs">
            <span className="text-gray-500 font-medium tracking-wide">Developer</span>
            <span className="font-bold">{site.developer || "N/A"}</span>
          </div>
          <div className="flex justify-between items-end text-xs">
            <span className="text-gray-500 font-medium tracking-wide">Contractor</span>
            <span className="font-bold">{site.contractor || "N/A"}</span>
          </div>
          <div className="flex justify-between items-end text-xs">
            <span className="text-gray-500 font-medium tracking-wide">Columns Remaining</span>
            <span className="font-bold text-[#8B6914]">{site.totalColumnCount || 0}</span>
          </div>
        </div>

        {/* Assigned Engineers */}
        {avatars.length > 0 ? (
          <div className="mt-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Assigned Engineers</p>
            <div className="flex flex-wrap gap-1.5">
              {site.assignments?.map((a: any) => (
                <span key={a.id} className="flex items-center gap-1 bg-[#F5F0E8] text-[#8B6914] px-2 py-0.5 rounded text-[11px] font-semibold">
                  {a.user?.fullName}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnassign(site.id, a.user?.id);
                      }}
                      className="hover:bg-[#8B6914]/20 rounded p-0.5 transition-colors"
                    >
                      <Cross2Icon width="10" height="10" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[11px] italic text-[#8B6914] font-medium">Pending Assignment</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-50">
        <p className="text-[11px] text-gray-400 font-medium truncate max-w-[60%]">{nameText || "No engineers"}</p>

        <div className="flex gap-1.5 items-center">
          {activeTab === "active" && isAdmin && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign(site.id);
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#F5F0E8] flex items-center justify-center transition-colors text-gray-500 hover:text-[#8B6914]"
                title="Assign User"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSoftDelete?.(site.id);
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors text-gray-500 hover:text-red-500"
                title="Delete Site"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {activeTab === "deleted" && isAdmin && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(site.id);
                }}
                className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors text-green-600"
                title="Restore Site"
              >
                <ResetIcon className="w-3.5 h-3.5" />
              </button>
              {role === "SUPER_ADMIN" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHardDelete?.(site.id);
                  }}
                  className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors text-red-600"
                  title="Permanently Delete"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}