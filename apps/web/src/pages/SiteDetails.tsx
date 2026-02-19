import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BackButton from "../components/common/BackButton";
import api from "../api/axios";
import UploadButton from "../components/common/UploadAttachmentsButton";
import { AttachmentType } from "../utils/attachmentType";
import { Button } from "@radix-ui/themes";

function SiteDetail() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [pilePhaseId, setPilePhaseId] = useState<number | null>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [site, setSite] = useState<any | null>(null);
  const [totalPileCount, setTotalPileCount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [drawings, setDrawings] = useState<any[]>([]);

  const fetchSites = async () => {
    try {
      const res = await api.get(
        `/sites/${siteId}`
      );
      setSite(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPhases = async () => {
    try {
      const res = await api.get(`/phases/site/${siteId}`);
      setPhases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDrawings = async () => {
    const res = await api.get(`/attachments/by-phase/${pilePhaseId}/type/${AttachmentType.DRAWING}`);
    setDrawings(res.data);
  };

  useEffect(() => {
    fetchPhases();
    fetchSites();
  }, []);

  const updatePhase = async (phaseId: number, action: string) => {
    try {
      await api.patch(`/phases/${phaseId}`, { action });
      if (siteId) {
        fetchPhases();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating phase");
    }
  }

  const startPilePhase = async () => {
    if (!totalPileCount || totalPileCount <= 0) {
      alert("Please enter a valid pile count");
      return;
    }
    try {
      await api.post(`/phases/${pilePhaseId}/start-piles`, { totalPileCount });
      setPilePhaseId(null);
      fetchPhases();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error starting pile phase");
    }
  };

  return (
    <div className="p-8">
      <BackButton/>

      <h1 className="text-2xl font-bold mb-6 mt-4">
        Site Phases - {site?.name || "Site Details"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className="border p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => {
              if (phase.type === "PILES" && phase.totalPileCount !== null) {
                navigate(
                  `/dashboard/site/${siteId}/phase/${phase.id}/piles`
                );
              }
            }}
          >
            <h3 className="font-semibold mb-2">
              {phase.type}
            </h3>

            <p className="text-sm">
              {phase.isCompleted
                ? "Completed"
                : phase.isActive
                ? "Active"
                : "Inactive"}
            </p>

            {phase.startDate && (
              <p className="text-xs text-gray-500">
                Started: {new Date(phase.startDate).toLocaleDateString()}
              </p>
            )}

            {phase.endDate && (
              <p className="text-xs text-gray-500">
                Ended: {new Date(phase.endDate).toLocaleDateString()}
              </p>
            )}

            {isAdmin && (
              <div className="mt-3 flex gap-2">
                {!phase.startDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (phase.type === "PILES" ) {
                        if (phase.totalPileCount === null) {
                          setPilePhaseId(phase.id);
                        } else {
                          alert("Piles already generated for this phase");
                        }
                      } else {
                        updatePhase(phase.id, "start");
                      }
                    }}
                    className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                  >
                    Start
                  </button>
                )}

                {phase.startDate && !phase.isCompleted && (
                  <button
                    onClick={() =>
                      updatePhase(phase.id, "complete")
                    }
                    className="bg-blue-600 text-white px-2 py-1 text-xs rounded"
                  >
                    Complete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {pilePhaseId && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md transition-all duration-300"
            onClick={() => {
              setPilePhaseId(null);
            }}
          />

          {/* Modal */}
          <div className="relative bg-white p-6 rounded shadow-lg max-w-[40rem] w-full max-h-[80vh] overflow-auto z-50 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Enter Total Pile Count
              </h2>
              <button
                className="text-sm text-gray-500"
                onClick={() => {
                  setPilePhaseId(null);
                }}
                >
                Close
              </button>
            </div>
            <div className="grid grid-rows-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="number"
                    placeholder="Pile Count"
                    className="border p-2 flex-1 rounded"
                    value={totalPileCount}
                    onChange={(e) => setTotalPileCount(Number(e.target.value))}
                  />
                </div>
                <div >
                  <UploadButton
                    siteId={Number(siteId)}
                    phaseId={Number(pilePhaseId)}
                    type={AttachmentType.DRAWING}
                    isPublic={true}
                    multiple={true}
                    label="Upload Drawings"
                    color="amber"
                    variant="surface"
                    setLoading={setLoading}
                    onUpload={() => fetchDrawings()}
                  />
                  <div className="my-2">
                    {drawings.length === 0 && (
                      <p className="text-sm text-gray-500">No attachments uploaded yet</p>
                    )}
                    {drawings.map((file) => (
                      <div
                        key={file.id}
                        className="border rounded px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <span className="text-sm break-words">
                          {file.originalFileName}
                        </span>
                        <button
                          onClick={async () => {
                            const res = await api.get(`/attachments/${file.id}`);
                            window.open(res.data.url || res.data, "_blank");
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </button>
                      </div>
                    ))}
                    {loading && (
                      <p className="text-sm text-gray-500 animate-pulse">
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Button
                  variant="soft"
                  color="jade"
                  onClick={async () => startPilePhase()}
                >
                  Start Pile Phase
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteDetail;
