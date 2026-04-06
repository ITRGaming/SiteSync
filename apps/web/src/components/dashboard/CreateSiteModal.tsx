import { useState } from "react";
import api from "../../api/axios";

type SlabEntry = {
  name: string;
  level: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignableUsers: any[];
};

export default function CreateSiteModal({ isOpen, onClose, onSuccess, assignableUsers }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 Form State
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    developer: "",
    contractor: "",
    assignedUserIds: [] as string[],
    totalColumns: "",
    totalSlabs: "",
    description: "",
  });

  // Step 2: Slabs with levels
  const [slabEntries, setSlabEntries] = useState<SlabEntry[]>([]);
  const [slabError, setSlabError] = useState("");

  // Step 3: Column names
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [colError, setColError] = useState("");

  if (!isOpen) return null;

  const ordinal = (n: number) => {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + "st";
    if (j === 2 && k !== 12) return n + "nd";
    if (j === 3 && k !== 13) return n + "rd";
    return n + "th";
  };

  const handleNextToStep2 = () => {
    if (!formData.name || !formData.totalSlabs || !formData.totalColumns) {
      alert("Please fill required fields (Name, Slabs, Columns).");
      return;
    }

    const slabCount = parseInt(formData.totalSlabs);
    if (isNaN(slabCount) || slabCount < 1) {
      alert("Slabs must be at least 1.");
      return;
    }

    // Generate slab entries: 5 defaults + numbered
    const defaults = ["Road level", "Pile Cap level", "Pile Beam level", "Made Up Ground level", "Plinth level"];
    const entries: SlabEntry[] = [];
    defaults.forEach((name) => entries.push({ name, level: "" }));
    for (let i = 1; i <= slabCount; i++) {
      entries.push({ name: `${ordinal(i)} slab`, level: "" });
    }
    setSlabEntries(entries);
    setSlabError("");
    setStep(2);
  };

  const handleSlabLevelChange = (index: number, value: string) => {
    setSlabEntries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], level: value };
      return copy;
    });
    setSlabError("");
  };

  const validateSlabs = (): boolean => {
    // All levels must be filled
    for (let i = 0; i < slabEntries.length; i++) {
      if (slabEntries[i].level === "" || isNaN(Number(slabEntries[i].level))) {
        setSlabError(`Please enter a valid level for "${slabEntries[i].name}".`);
        return false;
      }
    }

    // Numbered slabs (index 5+) must have ascending levels
    for (let i = 6; i < slabEntries.length; i++) {
      if (Number(slabEntries[i].level) < Number(slabEntries[i - 1].level)) {
        setSlabError(`"${slabEntries[i].name}" level must be ≥ "${slabEntries[i - 1].name}" level (${slabEntries[i - 1].level}).`);
        return false;
      }
    }
    return true;
  };

  const handleNextToStep3 = () => {
    if (!validateSlabs()) return;

    // Generate empty column name slots
    const count = parseInt(formData.totalColumns);
    setColumnNames(new Array(count).fill(""));
    setColError("");
    setStep(3);
  };

  const handleColumnNameChange = (index: number, value: string) => {
    setColumnNames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
    setColError("");
  };

  const validateColumns = (): boolean => {
    for (let i = 0; i < columnNames.length; i++) {
      if (!columnNames[i].trim()) {
        setColError(`Please name Column ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateColumns()) return;

    setLoading(true);
    try {
      // Build sorted slab data:
      // First 5 (defaults) sorted by level ascending
      const defaultSlabs = slabEntries.slice(0, 5).sort((a, b) => Number(a.level) - Number(b.level));
      const numberedSlabs = slabEntries.slice(5); // already validated ascending

      const slabs = [...defaultSlabs, ...numberedSlabs].map((s) => ({
        name: s.name,
        level: Number(s.level),
      }));

      await api.post("/sites", {
        name: formData.name,
        location: formData.location,
        developer: formData.developer,
        contractor: formData.contractor,
        description: formData.description,
        totalSlabCount: parseInt(formData.totalSlabs),
        totalColumnCount: parseInt(formData.totalColumns),
        slabs,
        columnNames: columnNames.map((n) => n.trim()),
        assignedUserIds: formData.assignedUserIds.map((id) => parseInt(id)),
      });
      onSuccess();
      handleReset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating site");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({ name: "", location: "", developer: "", contractor: "", assignedUserIds: [], totalColumns: "", totalSlabs: "", description: "" });
    setSlabEntries([]);
    setColumnNames([]);
    setSlabError("");
    setColError("");
    onClose();
  };

  const toggleUser = (id: string) => {
    setFormData((prev) => {
      const isSelected = prev.assignedUserIds.includes(id);
      return {
        ...prev,
        assignedUserIds: isSelected ? prev.assignedUserIds.filter((uid) => uid !== id) : [...prev.assignedUserIds, id],
      };
    });
  };

  // Styled input class
  const inputCls = "w-full px-4 py-3 rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-[#8B6914] bg-white outline-none";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleReset}></div>
      <div className="bg-[#F8F9FA] rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="px-8 py-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-outfit text-3xl font-bold tracking-tight text-[#1A1A1A]">
                {step === 1 ? "Initialize Site Brief" : step === 2 ? "Configure Slab Levels" : "Name Your Columns"}
              </h2>
              <p className="text-gray-500 mt-1">
                {step === 1
                  ? "Establish technical parameters for a new construction entity."
                  : step === 2
                    ? "Enter the level for each slab. Default slabs will be re-ordered by level."
                    : "Manually name each column for this site."}
              </p>
            </div>
            <div className="bg-[#F5F0E8] rounded-lg px-4 py-2 text-center text-[#8B6914] min-w-[80px]">
              <span className="text-[10px] font-bold block mb-[-2px]">STEP</span>
              <span className="font-outfit text-xl font-bold">0{step}/03</span>
            </div>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Project Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Skyline Residency" className={inputCls} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input type="text" placeholder="GPS Coordinates or Address" className={inputCls} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Developer Name</label>
                  <input type="text" placeholder="e.g. Bhutra Group" className={inputCls} value={formData.developer} onChange={(e) => setFormData({ ...formData, developer: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Contractor Name</label>
                  <input type="text" placeholder="e.g. BuildForce Ltd." className={inputCls} value={formData.contractor} onChange={(e) => setFormData({ ...formData, contractor: e.target.value })} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea placeholder="Brief description of the site project..." className={`${inputCls} min-h-[80px]`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
              </div>

              <div>
                <label className={labelCls}>Assigned Engineers</label>
                <div className="w-full px-4 py-3 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[#8B6914] bg-white max-h-40 overflow-y-auto">
                  {assignableUsers.length === 0 ? (
                    <span className="text-gray-400 text-sm">No engineers available</span>
                  ) : (
                    <div className="space-y-2">
                      {assignableUsers.map((user) => (
                        <label key={user.id} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-gray-50 rounded">
                          <input type="checkbox" className="w-4 h-4 accent-[#8B6914] rounded cursor-pointer" checked={formData.assignedUserIds.includes(user.id.toString())} onChange={() => toggleUser(user.id.toString())} />
                          <span className="font-medium text-gray-700 text-sm">{user.fullName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Number of Slabs <span className="text-red-500">*</span></label>
                  <input type="number" min="1" placeholder="e.g. 12" className={inputCls} value={formData.totalSlabs} onChange={(e) => setFormData({ ...formData, totalSlabs: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Number of Columns <span className="text-red-500">*</span></label>
                  <input type="number" min="1" placeholder="e.g. 48" className={inputCls} value={formData.totalColumns} onChange={(e) => setFormData({ ...formData, totalColumns: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Slab level configuration */}
          {step === 2 && (
            <div className="space-y-4">
              {slabError && <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">{slabError}</p>}

              {/* Default slabs section */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Default Structural Levels (sorted by level)</h3>
                <div className="space-y-3">
                  {slabEntries.slice(0, 5).map((entry, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-[#8B6914] font-bold w-6 text-sm shrink-0">{i + 1}.</span>
                      <span className="font-medium text-sm w-44 shrink-0">{entry.name}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Level (e.g. -2.5)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] outline-none text-sm"
                        value={entry.level}
                        onChange={(e) => handleSlabLevelChange(i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Numbered slabs section */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 max-h-[35vh] overflow-y-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Floor Slabs (must be ascending)</h3>
                <div className="space-y-3">
                  {slabEntries.slice(5).map((entry, idx) => {
                    const i = idx + 5;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-[#8B6914] font-bold w-6 text-sm shrink-0">{i + 1}.</span>
                        <span className="font-medium text-sm w-44 shrink-0">{entry.name}</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Level (e.g. 3.0)"
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] outline-none text-sm"
                          value={entry.level}
                          onChange={(e) => handleSlabLevelChange(i, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Column naming */}
          {step === 3 && (
            <div className="space-y-4">
              {colError && <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">{colError}</p>}

              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 max-h-[50vh] overflow-y-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Name Each Column</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {columnNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#8B6914] font-bold w-6 text-sm shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        placeholder={`e.g. C${i + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] outline-none text-sm"
                        value={name}
                        onChange={(e) => handleColumnNameChange(i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex justify-end gap-3 items-center">
            <button onClick={handleReset} className="px-6 py-3 font-semibold text-gray-400 hover:text-gray-700 uppercase tracking-widest text-xs transition-colors">
              Cancel
            </button>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 font-semibold text-[#8B6914] uppercase tracking-widest text-xs hover:bg-[#F5F0E8] rounded-lg transition-colors">
                Back
              </button>
            )}
            {step === 1 && (
              <button onClick={handleNextToStep2} className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#8B6914] text-white rounded-lg font-bold tracking-wide transition-colors uppercase text-sm">
                Continue Phase 02
              </button>
            )}
            {step === 2 && (
              <button onClick={handleNextToStep3} className="px-8 py-3 bg-[#1A1A1A] hover:bg-[#8B6914] text-white rounded-lg font-bold tracking-wide transition-colors uppercase text-sm">
                Continue Phase 03
              </button>
            )}
            {step === 3 && (
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold tracking-wide transition-colors uppercase text-sm disabled:opacity-50 flex gap-2 items-center">
                {loading ? "Creating..." : "Finalize & Create Site"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
