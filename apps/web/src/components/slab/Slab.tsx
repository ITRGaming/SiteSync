import api from "../../api/axios";  

type Props = {
    slab: any;
    onRefresh: () => void;
    index?: number;
};

export default function Slab({
    slab,
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
                    key={index}
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
