import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { debounce } from "../utils/debounce";
import api from "../api/axios";
import Sidebar from "../components/dashboard/Sidebar";

type TabType = "slabs" | "columns" | "footing";

function RccPage() {
  const { siteId, phaseId } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "UNKNOWN";

  const [me, setMe] = useState<any>(null);
  const [site, setSite] = useState<any>(null);
  const [slabs, setSlabs] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [filteredSlabs, setFilteredSlabs] = useState<any[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("slabs");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get("/users/me").then((res) => setMe(res.data));
    api.get(`/sites/${siteId}`).then((res) => setSite(res.data));
  }, [siteId]);

  const fetchSlabs = async () => {
    const res = await api.get(`/slab/by-site/${siteId}`);
    const sorted = res.data.sort((a: any, b: any) => {
      const aIsSlab = a.name?.toLowerCase().includes("slab");
      const bIsSlab = b.name?.toLowerCase().includes("slab");
      if (aIsSlab && !bIsSlab) return 1;
      if (!aIsSlab && bIsSlab) return -1;
      return (a.level || 0) - (b.level || 0);
    });
    setSlabs(sorted);
    setFilteredSlabs(sorted);
  };

  const fetchColumns = async () => {
    const res = await api.get(`/columns/by-site/${siteId}`);
    setColumns(res.data);
    setFilteredColumns(res.data);
  };

  useEffect(() => {
    if (siteId) {
      fetchSlabs();
      fetchColumns();
    }
  }, [siteId]);

  const debouncedSearch = useCallback(
    debounce((val: string) => {
      if (activeTab === "slabs") {
        if (!val) { setFilteredSlabs(slabs); return; }
        setFilteredSlabs(slabs.filter((s) => s.name?.toLowerCase().includes(val.toLowerCase())));
      } else {
        if (!val) { setFilteredColumns(columns); return; }
        setFilteredColumns(columns.filter((c) => c.name?.toLowerCase().includes(val.toLowerCase())));
      }
      setCurrentPage(1);
    }, 300),
    [slabs, columns, activeTab]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Pagination
  const currentData = activeTab === "slabs" ? filteredSlabs : filteredColumns;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearch("");
    setCurrentPage(1);
    if (tab === "slabs") setFilteredSlabs(slabs);
    if (tab === "columns") setFilteredColumns(columns);
  };

  const tabCls = (tab: TabType) =>
    `px-5 py-2.5 text-xs uppercase tracking-widest font-bold transition-all border-b-2 ${
      activeTab === tab
        ? "border-[#8B6914] text-[#8B6914]"
        : tab === "footing"
          ? "border-transparent text-gray-300 cursor-not-allowed"
          : "border-transparent text-gray-500 hover:text-[#8B6914] hover:border-gray-300 cursor-pointer"
    }`;

  return (
    <div className="flex bg-[#F5F0E8] min-h-screen">
      <Sidebar user={me} role={role} />

      <div className="flex-1 p-6 md:p-10 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
          <button onClick={() => navigate(`/dashboard/site/${siteId}/phase`)} className="text-gray-500 hover:text-[#8B6914]">
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.842 3.135a.5.5 0 0 0-.684.024l-4.5 4.5a.5.5 0 0 0 0 .682l4.5 4.5a.5.5 0 0 0 .708-.706L4.707 8H13.5a.5.5 0 0 0 0-1H4.707l4.159-4.159a.5.5 0 0 0-.024-.706Z" fill="currentColor"/></svg>
          </button>
          <h1 className="font-outfit font-bold text-lg">RCC Phase</h1>
        </div>

        {/* Header */}
        <div className="mb-8 hidden md:block">
          <p className="text-[#8B6914] text-[10px] uppercase font-bold tracking-[0.2em] mb-3">Structural Integrity</p>
          <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
            RCC Phase <span className="text-[#8B6914]">Ledger</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-xl">
            Managing reinforced cement concrete elements through direct pour card access and structural monitoring.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link
            to="/dashboard"
            className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5.5l6.5 5v9h-4v-5h-5v5h-4v-9l6.5-5z" fill="currentColor"/></svg>
            {site?.name || "Project"}
          </Link>
          <span className="bg-white text-gray-600 px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold border border-gray-200">
            RCC Phase
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          <button className={tabCls("slabs")} onClick={() => handleTabChange("slabs")}>Slabs</button>
          <button className={tabCls("columns")} onClick={() => handleTabChange("columns")}>Columns</button>
          <button className={tabCls("footing")} disabled>Footing / Pile Cap</button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            placeholder={`Search ${activeTab === "slabs" ? "slab" : "column"} name...`}
            value={search}
            onChange={handleSearch}
            className="w-full md:w-80 px-4 py-3 rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {activeTab === "slabs" && (
            <table className="min-w-full text-left">
              <thead className="bg-[#F5F0E8] border-b border-[#E5DFD3]">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slab Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No slabs found.</td></tr>
                ) : (
                  paginatedData.map((slab: any, idx: number) => (
                    <tr key={slab.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm text-[#1A1A1A]">{slab.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#8B6914]">{slab.level ?? "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          slab.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          slab.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {slab.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/site/${siteId}/phase/${phaseId}/slab/${slab.id}/pour`)}
                          className="text-[#8B6914] hover:text-[#72540f] text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        >
                          Open Pour Card
                          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12.5L12.5 3M12.5 3H6M12.5 3V9.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "columns" && (
            <table className="min-w-full text-left">
              <thead className="bg-[#F5F0E8] border-b border-[#E5DFD3]">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Column Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-400">No columns found.</td></tr>
                ) : (
                  paginatedData.map((col: any, idx: number) => (
                    <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm text-[#1A1A1A]">{col.name || `Column ${col.id}`}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} elements
              </p>
              <div className="flex items-center gap-1 mt-2 sm:mt-0">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 transition-colors"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((pageNum, idx, arr) => (
                    <span key={pageNum} className="contents">
                      {idx > 0 && arr[idx - 1] !== pageNum - 1 && <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">…</span>}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          currentPage === pageNum ? "bg-[#8B6914] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </span>
                  ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RccPage;
