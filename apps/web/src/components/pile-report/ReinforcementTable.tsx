import { useFieldArray, useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { PlusIcon, TrashIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { IconButton, Button, Text, Flex } from "@radix-ui/themes";

interface ReinforcementEntry {
    barShape: string;
    barDiameter: number;
    numberOfBars: number;
    length: number;
    totalLengthRmt: number;
    weightPerRmt: number;
    totalWeight: number;
}

export default function ReinforcementTable() {
    const { control, register, watch, setValue } = useFormContext<{
        reinforcementEntries: ReinforcementEntry[];
        isLocked: boolean;
    }>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "reinforcementEntries",
    });

    const entries = watch("reinforcementEntries");
    const isLocked = watch("isLocked");

    useEffect(() => {
        if (isLocked) return;

        entries?.forEach((entry, index) => {
            const numBars = Number(entry.numberOfBars) || 0;
            const len = Number(entry.length) || 0;
            const weightRmt = Number(entry.weightPerRmt) || 0;

            const totalLength = numBars * len;
            const totalWeight = totalLength * weightRmt;

            if (entry.totalLengthRmt !== totalLength) {
                setValue(`reinforcementEntries.${index}.totalLengthRmt`, totalLength, { shouldValidate: true });
            }
            if (entry.totalWeight !== totalWeight) {
                setValue(`reinforcementEntries.${index}.totalWeight`, totalWeight, { shouldValidate: true });
            }
        });
    }, [entries, setValue, isLocked]);

    // Helper to handle the "lock cursor" and visual state
    const getInputClass = (isReadonlyField = false) => `
        w-full bg-transparent border border-transparent rounded px-2 py-1.5 outline-none transition-all text-sm
        ${isLocked 
            ? "cursor-not-allowed text-gray-400" 
            : "hover:border-gray-200 focus:border-blue-500 focus:bg-white"
        }
        ${isReadonlyField ? "bg-gray-50/50" : ""}
    `;

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${isLocked ? 'opacity-95' : ''}`}>
            {/* Header Section */}
            <div className="p-4 bg-gray-50/50 border-b flex justify-between items-center">
                <Flex align="center" gap="2">
                    <Text size="3" weight="bold">Reinforcement Details</Text>
                    {isLocked && <LockClosedIcon className="text-gray-500" />}
                </Flex>
                <Button
                    type="button"
                    disabled={isLocked}
                    variant="soft"
                    onClick={() => append({
                        barShape: "", barDiameter: 0, numberOfBars: 0,
                        length: 0, totalLengthRmt: 0, weightPerRmt: 0, totalWeight: 0
                    })}
                >
                    <PlusIcon /> Add Entry
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            {["Shape", "Dia", "No. Bars", "Length (m)", "Total L", "Wt/RMT", "Total Wt"].map((h) => (
                                <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {fields.map((field, index) => (
                            <tr key={field.id} className={`${isLocked ? 'bg-gray-50/20' : 'hover:bg-blue-50/30'} transition-colors`}>
                                <td className="p-2">
                                    <input 
                                        disabled={isLocked} 
                                        className={getInputClass()} 
                                        placeholder="Shape" 
                                        {...register(`reinforcementEntries.${index}.barShape`)} 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        disabled={isLocked} 
                                        type="number" 
                                        className={getInputClass()} 
                                        {...register(`reinforcementEntries.${index}.barDiameter`, { valueAsNumber: true })} 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        disabled={isLocked} 
                                        type="number" 
                                        className={getInputClass()} 
                                        {...register(`reinforcementEntries.${index}.numberOfBars`, { valueAsNumber: true })} 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        disabled={isLocked} 
                                        type="number" 
                                        step="0.01" 
                                        className={getInputClass()} 
                                        {...register(`reinforcementEntries.${index}.length`, { valueAsNumber: true })} 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        readOnly 
                                        disabled={isLocked} 
                                        className={getInputClass(true) + " font-medium text-gray-600"} 
                                        {...register(`reinforcementEntries.${index}.totalLengthRmt`, { valueAsNumber: true })} 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        disabled={isLocked} 
                                        type="number" 
                                        step="0.001" 
                                        className={getInputClass()} 
                                        {...register(`reinforcementEntries.${index}.weightPerRmt`, { valueAsNumber: true })} 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        readOnly 
                                        disabled={isLocked} 
                                        className={getInputClass(true) + " font-bold text-blue-700"} 
                                        {...register(`reinforcementEntries.${index}.totalWeight`, { valueAsNumber: true })} 
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <IconButton 
                                        disabled={isLocked} 
                                        size="1" 
                                        variant="ghost" 
                                        color="red" 
                                        type="button" 
                                        onClick={() => remove(index)}
                                    >
                                        <TrashIcon />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}