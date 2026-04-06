import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/dashboard/Sidebar";
import { AttachmentType } from "../utils/attachmentType";

const CHECKLIST_ITEMS = [
  "Covering",
  "Slab Level Checking",
  "Props & Shuttering",
  "Adequate Binding wire",
  "Reinforcement as per drawing & Filter",
  "Electrical Conduiting",
];

const CONCRETE_GRADES = ["M15", "M20", "M25", "M30", "M35", "M40", "M45", "M50"];

const RCC_ATTACHMENT_TYPES = [
  { value: AttachmentType.RCC_DRAWING, label: "Drawing RCC" },
  { value: AttachmentType.ARCHITECT, label: "Architect" },
  { value: AttachmentType.MEP_DRAWING, label: "MEP Drawing" },
  { value: AttachmentType.RCC_CONSULTANT_REPORT, label: "RCC Consultant Report" },
  { value: AttachmentType.ARCHITECT_CONSULTANT_REPORT, label: "Architect Consultant Report" },
  { value: AttachmentType.SITE_IMG, label: "Site Image" },
  { value: AttachmentType.OTHER, label: "Others" },
];

export default function SlabPourCard() {
  const { siteId, phaseId, slabId } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "UNKNOWN";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [me, setMe] = useState<any>(null);
  const [slab, setSlab] = useState<any>(null);

  // Form state
  const [checklist, setChecklist] = useState<boolean[]>(new Array(CHECKLIST_ITEMS.length).fill(false));
  const [dateOfPour, setDateOfPour] = useState("");
  const [concreteGrade, setConcreteGrade] = useState("");
  const [mixType, setMixType] = useState<"RMC" | "SITE_MIX">("RMC");

  // Site mix fields
  const [mixDesign, setMixDesign] = useState("");
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [sand, setSand] = useState("");
  const [water, setWater] = useState("");
  const [cementBrand, setCementBrand] = useState("");
  const [cementKg, setCementKg] = useState("");
  const [admixSpec, setAdmixSpec] = useState("");
  const [admixMl, setAdmixMl] = useState("");

  // Remarks
  const [remarks, setRemarks] = useState("");

  // Attachments
  const [selectedAttachType, setSelectedAttachType] = useState<string>(RCC_ATTACHMENT_TYPES[0].value);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    api.get("/users/me").then((r) => setMe(r.data));
    // Fetch slab details
    api.get(`/slab/by-site/${siteId}`).then((r) => {
      const found = r.data.find((s: any) => s.id === Number(slabId));
      if (found) setSlab(found);
    });
    fetchAttachments();
    fetchReport();
  }, [siteId, slabId]);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/slabs/${slabId}/report`);
      const data = res.data;

      setIsLocked(data.isLocked || false);
      setDateOfPour(data.dateOfPour || "");
      setConcreteGrade(data.concreteGrade || "");
      setMixType(data.mixType || "RMC");
      setRemarks(data.remarks || "");

      // Checklist mapping
      setChecklist([
        data.checklistCovering || false,
        data.checklistSlabLevel || false,
        data.checklistPropsShuttering || false,
        data.checklistBindingWire || false,
        data.checklistReinforcement || false,
        data.checklistElectrical || false,
      ]);

      // Site mix fields
      setMixDesign(data.siteMixDesign || "");
      setM1(data.siteMixM1?.toString() || "");
      setM2(data.siteMixM2?.toString() || "");
      setSand(data.siteMixSand?.toString() || "");
      setWater(data.siteMixWater?.toString() || "");
      setCementBrand(data.siteMixCementBrand || "");
      setCementKg(data.siteMixCementKg?.toString() || "");
      setAdmixSpec(data.siteMixAdmixSpec || "");
      setAdmixMl(data.siteMixAdmixMl?.toString() || "");
    } catch (err) {
      console.error("Failed to fetch report:", err);
    }
  };

  const fetchAttachments = async () => {
    try {
      // Fetch attachments for this slab (using site-level for now)
      const res = await api.get(`/attachments/by-phase/${phaseId}`);
      setFiles(res.data || []);
    } catch {
      setFiles([]);
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("siteId", String(siteId));
        if (phaseId) formData.append("phaseId", String(phaseId));
        if (slabId) formData.append("slabId", String(slabId));
        formData.append("type", selectedAttachType);
        formData.append("isPublic", "false");
        await api.post("/attachments/upload", formData);
      }
      fetchAttachments();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveDraft = async (showSuccessAlert = true) => {
    setSaving(true);
    try {
      const data = {
        dateOfPour,
        concreteGrade,
        mixType,
        remarks,
        checklistCovering: checklist[0],
        checklistSlabLevel: checklist[1],
        checklistPropsShuttering: checklist[2],
        checklistBindingWire: checklist[3],
        checklistReinforcement: checklist[4],
        checklistElectrical: checklist[5],
        siteMixDesign: mixDesign,
        siteMixM1: m1 ? parseFloat(m1) : null,
        siteMixM2: m2 ? parseFloat(m2) : null,
        siteMixSand: sand ? parseFloat(sand) : null,
        siteMixWater: water ? parseFloat(water) : null,
        siteMixCementBrand: cementBrand,
        siteMixCementKg: cementKg ? parseFloat(cementKg) : null,
        siteMixAdmixSpec: admixSpec,
        siteMixAdmixMl: admixMl ? parseFloat(admixMl) : null,
      };

      await api.patch(`/slabs/${slabId}/report`, data);
      if (showSuccessAlert) {
        alert("Draft saved successfully.");
      }
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save draft.");
      return false;
    } finally {
      if (showSuccessAlert) setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to finalize and submit this report? It will be locked for further edits.")) return;
    
    setSaving(true);
    try {
      // Save draft first without alert to ensure all data is synced
      const saved = await handleSaveDraft(false);
      if (!saved) return;
      
      await api.post(`/slabs/${slabId}/report/submit`);
      setIsLocked(true);
      alert("Report submitted and locked successfully.");
    } catch (err: any) {
      console.error("Submission error:", err);
      alert(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2";

  const getAttachLabel = (type: string) => {
    const found = RCC_ATTACHMENT_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="flex bg-[#F5F0E8] min-h-screen">
      <Sidebar user={me} role={role} />

      <div className="flex-1 p-6 md:p-10 w-full overflow-x-hidden pb-28">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
          <button title="Go Back" onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#8B6914]">
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.842 3.135a.5.5 0 0 0-.684.024l-4.5 4.5a.5.5 0 0 0 0 .682l4.5 4.5a.5.5 0 0 0 .708-.706L4.707 8H13.5a.5.5 0 0 0 0-1H4.707l4.159-4.159a.5.5 0 0 0-.024-.706Z" fill="currentColor"/></svg>
          </button>
          <h1 className="font-outfit font-bold text-lg">Slab Pour Card</h1>
        </div>

        {/* Desktop Header */}
        <div className="mb-6 hidden md:block">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Active Phase</span>
            <span className="text-gray-400 text-xs">• RCC LOG</span>
          </div>
          <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
            Slab Pour <span className="text-[#8B6914]">Execution Card</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl">
            Structural verification and concrete mix documentation for the current elevation cycle. Ensure all checks are verified before final submission.
          </p>
        </div>

        {/* Slab Name Badge */}
        {slab && (
          <div className="bg-[#8B6914] text-white px-5 py-3 rounded-xl mb-8 inline-flex items-center gap-3">
            <div>
              <p className="font-outfit font-bold text-lg leading-none">{slab.name}</p>
              <p className="text-[10px] opacity-75 mt-0.5">Level: {slab.level ?? "—"}</p>
            </div>
          </div>
        )}

        {/* Main Content: 2-column on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Structural Checklist */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">📋</span>
              <h2 className="font-outfit text-xl font-bold">Structural Checklist</h2>
            </div>
            <div className="space-y-4">
              {CHECKLIST_ITEMS.map((item, i) => (
                <label key={i} className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checklist[i]}
                    onChange={() => {
                      const copy = [...checklist];
                      copy[i] = !copy[i];
                      setChecklist(copy);
                    }}
                    disabled={isLocked}
                    className="w-5 h-5 accent-[#8B6914] rounded cursor-pointer shrink-0 disabled:opacity-50"
                  />
                  <span className={`text-sm font-medium transition-colors ${checklist[i] ? "text-[#8B6914]" : "text-gray-700 group-hover:text-gray-900"}`}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* RIGHT: Concrete Specification */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-[#8B6914] rounded-full"></div>
              <h2 className="font-outfit text-xl font-bold">Concrete Specification</h2>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-6 ml-3">Verified Pour Protocol</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>📅 Date of Pour</label>
                <input type="date" disabled={isLocked} className={inputCls} value={dateOfPour} onChange={(e) => setDateOfPour(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>⭐ Concrete Grade</label>
                <select className={inputCls} disabled={isLocked} value={concreteGrade} onChange={(e) => setConcreteGrade(e.target.value)}>
                  <option value="">Select Grade</option>
                  {CONCRETE_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Mix Type Toggle */}
            <div className="mt-6 bg-[#F5F0E8] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Production Method</p>
                  <p className="font-semibold text-sm mt-0.5">Mix Type Selection</p>
                </div>
                <div className="flex bg-white rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => !isLocked && setMixType("RMC")}
                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      mixType === "RMC" ? "bg-[#8B6914] text-white" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    RMC
                  </button>
                  <button
                    onClick={() => !isLocked && setMixType("SITE_MIX")}
                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      mixType === "SITE_MIX" ? "bg-[#8B6914] text-white" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Site Mix
                  </button>
                </div>
              </div>
            </div>

            {/* Site Mix Section */}
            {mixType === "SITE_MIX" && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B6914] mb-4 flex items-center gap-2">
                  Site Mix Section <span className="w-8 h-0.5 bg-[#8B6914] rounded"></span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Mix Design</label>
                    <input type="text" disabled={isLocked} className={inputCls} placeholder="As per approved spec..." value={mixDesign} onChange={(e) => setMixDesign(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>M1</label>
                      <input type="number" step="0.01" disabled={isLocked} className={inputCls} placeholder="0.00" value={m1} onChange={(e) => setM1(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>M2</label>
                      <input type="number" step="0.01" disabled={isLocked} className={inputCls} placeholder="0.00" value={m2} onChange={(e) => setM2(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Sand</label>
                      <input type="number" step="0.01" disabled={isLocked} className={inputCls} placeholder="0.00" value={sand} onChange={(e) => setSand(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Water</label>
                      <input type="number" step="0.01" disabled={isLocked} className={inputCls} placeholder="0" value={water} onChange={(e) => setWater(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Cement</label>
                      <div className="flex gap-2">
                        <input type="text" disabled={isLocked} className={`${inputCls} flex-1`} placeholder="Brand/Type" value={cementBrand} onChange={(e) => setCementBrand(e.target.value)} />
                        <input type="number" disabled={isLocked} className="w-20 px-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm" placeholder="KG" value={cementKg} onChange={(e) => setCementKg(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Admixture</label>
                      <div className="flex gap-2">
                        <input type="text" disabled={isLocked} className={`${inputCls} flex-1`} placeholder="Admix Spec" value={admixSpec} onChange={(e) => setAdmixSpec(e.target.value)} />
                        <input type="number" disabled={isLocked} className="w-20 px-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm" placeholder="ML" value={admixMl} onChange={(e) => setAdmixMl(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-lg">📎</span>
            <h2 className="font-outfit text-xl font-bold">Attachments</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#8B6914]"
              disabled={isLocked}
              value={selectedAttachType}
              onChange={(e) => setSelectedAttachType(e.target.value)}
            >
              {RCC_ATTACHMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              title="Upload Files"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isLocked}
              className="px-6 py-2.5 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1v10M3 5.5l4.5-4.5L12 5.5" stroke="currentColor" strokeWidth="1.5"/></svg>
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input ref={fileInputRef} type="file" hidden multiple onChange={(e) => handleUpload(e.target.files)} />
          </div>

          {/* File List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.length === 0 && (
              <p className="text-sm text-gray-400 py-2">No attachments uploaded yet.</p>
            )}
            {files.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F5F0E8] rounded flex items-center justify-center text-[#8B6914]">
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 1.5h6l3 3v9H3v-12z" stroke="currentColor"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.originalFileName}</p>
                    <p className="text-[10px] text-gray-400">{(file.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <span className="bg-[#F5F0E8] text-[#8B6914] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {getAttachLabel(file.type)}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const res = await api.get(`/attachments/${file.id}`);
                    window.open(res.data.url || res.data, "_blank");
                  }}
                  className="text-[#8B6914] hover:text-[#72540f] text-xs font-bold"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Remarks Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="font-outfit text-xl font-bold mb-4">Remarks / Site Notes</h2>
          <textarea
            disabled={isLocked}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm min-h-[120px] disabled:bg-gray-50"
            placeholder="Observation during casting, environmental conditions, or delay reasons..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 md:right-0 md:left-64 right-0 left-0 bg-white border-y border-gray-200 shadow-lg pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 bg-[#8B6914] rounded-md flex items-center justify-center text-white font-bold font-outfit text-xs">B</div>
              <div>
                <p className="text-xs font-bold">Bhutra Industrial</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Project Ledger Compliance</p>
              </div>
            </div>
            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => handleSaveDraft()}
                disabled={saving || isLocked}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {isLocked ? "Submission Locked" : "Save as Draft"}
              </button>
              {!isLocked && (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Finalize & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
