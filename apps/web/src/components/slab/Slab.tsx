import api from "../../api/axios";
import { useState, useEffect } from "react";

type Props = {
    slab: any;
    siteId: string | undefined;
    phaseId: string | undefined;
    onRefresh: () => void;
    index?: number;
};

export default function Slab({
    slab,
    siteId,
    phaseId,
    onRefresh,
    index,
}: Props) {

    const updateLevel = async (value: string) => {
        await api.patch(`/rcc/${slab.id}/updateLevel`, {
            level: value,
        });
        onRefresh()
    };

    return (
        <tr className="border hover:bg-gray-50">
            {/* Slab No */}
            <td className="border p-2">
                <span
                    className="text-base"
                >
                    {slab.name}
                </span>
            </td>

            {/* Level */}
            <td className="border p-2 text-center">
                <input
                    defaultValue={slab.level || ""}
                    onBlur={(e) =>
                        updateLevel(e.target.value)
                    }
                    className="border p-1 w-full text-base"
                    placeholder="Level"
                />
            </td>
        </tr>
    );
}
