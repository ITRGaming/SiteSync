import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import  { IconButton } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import api from "../api/axios";

function SiteDetail() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [pilePhaseId, setPilePhaseId] = useState<number | null>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [site, setSite] = useState<any | null>(null);
  const [totalPileCount, setTotalPileCount] = useState<number | "">("");

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
      <IconButton
        onClick={() => navigate("/dashboard")}
        color="gray"
        variant="ghost"
        size="3"
      >
        <ArrowLeftIcon width="22" height="22" />
      </IconButton>

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
                  `/dashboard/site/${siteId}/piles`
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
            <div className="flex gap-2 mb-4 flex-col md:flex-row">
              <input
                type="number"
                placeholder="Pile Count"
                className="border p-2 flex-1 rounded"
                value={totalPileCount}
                onChange={(e) => setTotalPileCount(Number(e.target.value))}
              />
              <button
                className="bg-blue-600 text-white px-4 rounded"
                onClick={async () => startPilePhase()}
              >
                Start Pile Phase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteDetail;
