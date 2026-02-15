import { useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router-dom";

type Props = {
  status: "idle" | "saving" | "saved" | "error";
  isLocked: boolean;
};

export default function StatusBar({ status, isLocked }: Props) {
  const { pileId } = useParams();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await api.post(`/piles/${pileId}/report/submit`);
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded shadow">
      <div>
        {status === "saving" && <span>Saving...</span>}
        {status === "saved" && (
          <span className="text-green-600">Saved ✓</span>
        )}
        {status === "error" && (
          <span className="text-red-600">Error saving</span>
        )}
      </div>

      <button
        type="button"
        disabled={isLocked || submitting}
        onClick={handleSubmit}
        className="px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
      >
        {isLocked ? "Locked" : submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
