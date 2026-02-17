import { useFieldArray, useFormContext } from "react-hook-form";
import { PlusIcon, TrashIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { IconButton, Button, Text, Flex } from "@radix-ui/themes";

export default function BoringTable() {
    const { control, register, watch } = useFormContext<{
        boringLogs: any[];
        isLocked: boolean;
    }>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "boringLogs",
    });

    // Watch the lock status from the form provider
    const isLocked = watch("isLocked");

    const columns = ["From Time", "To Time", "Depth (m)", "Tool Type", "Activity", "Strata", "Remark"];

    // Reusable tailwind classes for the input fields
    const inputClass = `w-full bg-transparent border border-transparent rounded px-2 py-1.5 outline-none transition-all text-sm
    ${isLocked
            ? "cursor-not-allowed text-gray-400"
            : "hover:border-gray-300 focus:border-blue-500 focus:bg-white"
        }`;

    return (
        <div className={`bg-white rounded-lg border shadow-sm overflow-hidden mt-6 ${isLocked ? 'opacity-95' : ''}`}>
            {/* Header Section */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <Flex align="center" gap="2">
                    <Text size="3" weight="bold" className="text-gray-800">Boring Log Details</Text>
                    {isLocked && <LockClosedIcon className="text-gray-500" />}
                </Flex>

                <Button
                    type="button"
                    variant="solid"
                    disabled={isLocked}
                    onClick={() => {
                        const currentLogs = watch("boringLogs") || [];
                        const lastLog = currentLogs.length > 0 ? currentLogs[currentLogs.length - 1] : null;
                        let nextFromTime = "";
                        let nextToTime = "";

                        if (lastLog?.toTime) {
                            nextFromTime = lastLog.toTime; // Start where the last one ended

                            // logic to add 10 minutes
                            const [hours, minutes] = lastLog.toTime.split(':').map(Number);
                            const date = new Date();
                            date.setHours(hours);
                            date.setMinutes(minutes + 10); // Add 10 minutes

                            // Format back to HH:mm (ensuring leading zeros)
                            nextToTime = date.toTimeString().slice(0, 5); 
                        }
                        append({
                        fromTime: nextFromTime, toTime: nextToTime, depth: 0,
                        toolType: lastLog?.toolType || "", activity: "", strata: "", remark: ""
                    })}}
                >
                    <PlusIcon /> Add Row
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            {columns.map((col) => (
                                <th key={col} className="p-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {fields.map((field, index) => (
                            <tr key={field.id} className={`${isLocked ? 'bg-gray-50/30' : 'hover:bg-blue-50/30'} transition-colors`}>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        type="time"
                                        {...register(`boringLogs.${index}.fromTime`)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        type="time"
                                        {...register(`boringLogs.${index}.toTime`)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                        {...register(`boringLogs.${index}.depth`, { valueAsNumber: true })}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        placeholder="Tool..."
                                        {...register(`boringLogs.${index}.toolType`)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        placeholder="Activity..."
                                        {...register(`boringLogs.${index}.activity`)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        placeholder="Strata..."
                                        {...register(`boringLogs.${index}.strata`)}
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        disabled={isLocked}
                                        className={inputClass}
                                        placeholder="Note..."
                                        {...register(`boringLogs.${index}.remark`)}
                                    />
                                </td>
                                <td className="p-2">
                                    <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="red"
                                        type="button"
                                        disabled={isLocked}
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

            {fields.length === 0 && (
                <div className="p-8 text-center text-gray-400 italic">
                    No logs added yet. {isLocked ? "Report is locked." : 'Click "+ Add Row" to begin.'}
                </div>
            )}
        </div>
    );
}