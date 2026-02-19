import { useRef } from "react";
import api from "../../api/axios";
import {
  AttachmentType,
} from "../../utils/attachmentType";
import { Button } from "@radix-ui/themes";

type Props = {
  siteId: number;
  phaseId?: number;
  pileId?: number;
  type: AttachmentType;
  isPublic?: boolean;
  multiple?: boolean;
  label?: string;
  color?: string;
  variant?: string;
  size?: string;
  disabled?: boolean;
  onUpload?: () => void;
  setLoading?: (value: boolean) => void;
};

export default function UploadButton({
  siteId,
  phaseId,
  pileId,
  type,
  isPublic = false,
  multiple = false,
  label = "Upload",
  color = "blue",
  variant = "soft",
  size = "2",
  disabled = false,
  onUpload,
  setLoading,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setLoading?.(true);
      const filesToUpload = multiple ? Array.from(files) : [files[0]];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("siteId", String(siteId));
        if (phaseId) formData.append("phaseId", String(phaseId));
        if (pileId) formData.append("pileId", String(pileId));
        formData.append("type", type);
        formData.append("isPublic", String(isPublic));

        await api.post("/attachments/upload", formData);
      }

      onUpload?.();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        variant={variant as any}
        color={color as any}
        size={size as any}
      >
        {label}
      </Button>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        onChange={(e) => handleUpload(e.target.files)}
      />
    </>
  );
}
