import api from "../../api/axios";
import { useState, useEffect } from "react";
import UploadButton from "../common/UploadAttachmentsButton";
import { AttachmentType } from "../../utils/attachmentType";

type Props = {
    pile: any;
    siteId: string | undefined;
    phaseId: string | undefined;
    navigate: any;
    onRefresh: () => void;
    index?: number;
};

export default function PileRow({
    pile,
    siteId,
    phaseId,
    navigate,
    onRefresh,
    index,
}: Props) {
    const [pileNumbers, setPileNumbers] = useState<Record<number, string>>({});
    const [cube7DayFiles, setCube7DayFiles] = useState<any[]>([]);
    const [cube28DayFiles, setCube28DayFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function updatePileNumber(pileId: number) {
        if (!pileNumbers[pileId]) {
            alert("Please enter a pile number");
            return;
        }

        await api.patch(`/piles/number/${pileId}`, {
            pileNumber: pileNumbers[pileId],
        });

        setPileNumbers((prev) => ({
            ...prev,
            [pileId]: "",
        }));

        onRefresh();
    }

    const getLastDepth = (pile: any) => {
        const tables = pile.executionReport?.boringLogs;

        if (tables && tables.length > 0) {
            return tables[0].depth;
        }
        return "-";
    }

    const fetchCube7DayFiles = async () => {
        const res = await api.get(`/attachments/by-pile/${pile.id}/type/${AttachmentType.CUBE_7_DAY}`);
        setCube7DayFiles(res.data);
        onRefresh()
    };
    const fetchCube28DayFiles = async () => {
        const res = await api.get(`/attachments/by-pile/${pile.id}/type/${AttachmentType.CUBE_28_DAY}`);
        setCube28DayFiles(res.data);
    };

    useEffect(() => {
        fetchCube7DayFiles();
        fetchCube28DayFiles();
        onRefresh()
    }, []);

    const updateStatus = async (field: string, value: string) => {
        await api.patch(`/piles/${pile.id}/status`, {
            [field]: value,
        });
    };

    return (
        <tr className="border hover:bg-gray-50">
            {/* Pile No */}
            <td className="border p-2" onClick={() => {
                if (pile.pileNumber) {
                    navigate(`/dashboard/site/${siteId}/phase/${phaseId}/pile/${pile.id}/report`)
                    onRefresh()
                }
            }}>
                {pile.pileNumber ? (
                    <span
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        {pile.pileNumber}
                    </span>
                ) : (
                    <div className="flex gap-2">
                        {<span className="text-gray-500 flex items-end">{index !== undefined && index !== null ? index + 1 : ""}.</span>}
                        <input
                            type="text"
                            placeholder="Enter"
                            className="border p-1 rounded w-full"
                            value={pileNumbers[pile.id] || ""}
                            onChange={(e) =>
                                setPileNumbers({
                                    ...pileNumbers,
                                    [pile.id]: e.target.value,
                                })
                            }
                        />
                        <button
                            onClick={() => updatePileNumber(pile.id)}
                            className="bg-green-600 text-white px-2 rounded text-xs"
                        >
                            ✓
                        </button>
                    </div>
                )}
            </td>

            {/* Dia */}
            <td className="border p-2 text-center">
                {pile.diameter || "-"}
            </td>

            {/* Dia */}
            <td className="border p-2 text-center">
                {getLastDepth(pile)}
            </td>

            {/* Boring Date */}
            <td className="border p-2 text-center">
                {pile.executionReport?.boringDate || "-"}
            </td>

            {/* Concreting Date */}
            <td className="border p-2 text-center">
                {pile.executionReport?.pourEndTime?.split("T")[0] || "-"}
            </td>

            {/* Cube 7 */}
            <td className="border p-2 space-y-1">
                <input
                    defaultValue={pile.cube7DayStatus || ""}
                    onBlur={(e) =>
                        updateStatus("cube7DayStatus", e.target.value)
                    }
                    className="border p-1 w-full text-xs"
                    placeholder="Status"
                />
                <div className="md:block flex gap-4 flex-col">
                    <UploadButton
                        siteId={Number(siteId)}
                        pileId={pile.id}
                        type={AttachmentType.CUBE_7_DAY}
                        label="Upload Other"
                        color="gray"
                        variant="soft"
                        size="1"
                        setLoading={setLoading}
                        onUpload={fetchCube7DayFiles}
                    />
                    <div className="my-2">
                        {cube7DayFiles.length === 0 && (
                            <p className="text-sm text-gray-500">No attachments uploaded yet</p>
                        )}

                        {cube7DayFiles.map((file) => (
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
            </td>

            {/* Cube 28 */}
            <td className="border p-2 space-y-1">
                <input
                    defaultValue={pile.cube28DayStatus || ""}
                    onBlur={(e) =>
                        updateStatus("cube28DayStatus", e.target.value)
                    }
                    className="border p-1 w-full text-xs"
                    placeholder="Status"
                />
                <div className="md:block flex gap-4 flex-col">
                    <UploadButton
                        siteId={Number(siteId)}
                        pileId={pile.id}
                        type={AttachmentType.CUBE_28_DAY}
                        label="Upload Other"
                        color="gray"
                        variant="surface"
                        size="1"
                        setLoading={setLoading}
                        onUpload={fetchCube28DayFiles}
                    />
                    <div className="my-2">
                        {cube28DayFiles.length === 0 && (
                            <p className="text-sm text-gray-500">No attachments uploaded yet</p>
                        )}

                        {cube28DayFiles.map((file) => (
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
            </td>

            {/* Integrity */}
            <td className="border p-2">
                <input
                    defaultValue={pile.integrityStatus || ""}
                    onBlur={(e) =>
                        updateStatus("integrityStatus", e.target.value)
                    }
                    className="border p-1 w-full text-xs"
                    placeholder="Status"
                />
            </td>

            {/* Eccentricity */}
            <td className="border p-2">
                <input
                    defaultValue={pile.eccentricityStatus || ""}
                    onBlur={(e) =>
                        updateStatus("eccentricityStatus", e.target.value)
                    }
                    className="border p-1 w-full text-xs"
                    placeholder="Status"
                />
            </td>
        </tr>
    );
}
