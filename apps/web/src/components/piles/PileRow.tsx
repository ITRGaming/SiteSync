import api from "../../api/axios";
import { useState } from "react";

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

    const updateStatus = async (field: string, value: string) => {
        await api.patch(`/piles/${pile.id}/status`, {
            [field]: value,
        });
    };

    const uploadFile = async (file: File, type: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("siteId", String(siteId));
        formData.append("pileId", String(pile.id));
        formData.append("type", type);
        formData.append("isPublic", "false");

        await api.post("/attachments/upload", formData);
        onRefresh();
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
                        {index && <span className="text-gray-500 flex items-end">{index + 1}.</span>}
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
                <input
                    type="file"
                    className="text-xs"
                    onChange={(e) =>
                        e.target.files &&
                        uploadFile(e.target.files[0], "CUBE_7_DAY")
                    }
                />
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
                <input
                    type="file"
                    className="text-xs"
                    onChange={(e) =>
                        e.target.files &&
                        uploadFile(e.target.files[0], "CUBE_28_DAY")
                    }
                />
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
