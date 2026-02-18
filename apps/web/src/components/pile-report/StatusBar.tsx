import { useState, useEffect } from "react";
import api from "../../api/axios";
import { AttachmentType } from "../../utils/attachmentType";
import UploadButton from "../common/UploadAttachmentsButton";

type Props = {
  isLocked: boolean;
  pileId: number;
  siteId: number;
};

export default function StatusBar({ isLocked, pileId, siteId }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    const res = await api.get(`/attachments/by-pile/${pileId}`);
    setFiles(res.data);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
    <div className="bg-white p-4 md:p-6 rounded shadow flex flex-col gap-6">
      {/* Attachments Section */}
      <div className="border rounded p-4 space-y-4">
        <h2 className="font-semibold text-lg">Attachments</h2>

        {/* Upload Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <UploadButton
            siteId={siteId}
            pileId={pileId}
            type={AttachmentType.PILE_READING}
            label="Upload Reading"
            color="blue"
            variant="soft"
            disabled={isLocked}
            onUpload={fetchFiles}
            setLoading={setLoading}
          />

          <UploadButton
            siteId={siteId}
            pileId={pileId}
            type={AttachmentType.OTHER}
            label="Upload Other"
            color="gray"
            variant="soft"
            disabled={isLocked}
            onUpload={fetchFiles}
            setLoading={setLoading}
          />
        </div>

        {/* File List */}
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {files.length === 0 && (
            <p className="text-sm text-gray-500">No attachments uploaded yet</p>
          )}

          {files.map((file) => (
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
        </div>

        {loading && (
          <p className="text-sm text-gray-500 animate-pulse">
            Uploading...
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={isLocked || submitting}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded disabled:bg-gray-400 text-sm"
        >
          {isLocked
            ? "Locked"
            : submitting
            ? "Submitting..."
            : "Submit"}
        </button>
      </div>
    </div>
  );
}
