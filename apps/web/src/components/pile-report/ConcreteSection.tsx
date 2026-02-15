import { useFormContext } from "react-hook-form";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Text, Flex } from "@radix-ui/themes";

export default function ConcreteSection() {
    const { register, watch } = useFormContext();
    const isLocked = watch("isLocked");

    const inputClass = `w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
    ${isLocked
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`;

    const fields = [
        { name: "concreteGrade", type: "text", placeholder: "Concrete Grade" },
        { name: "theoreticalQuantity", type: "number", placeholder: "Theoretical Qty", step: "0.001" },
        { name: "actualQuantity", type: "number", placeholder: "Actual Qty", step: "0.001" },
        { name: "tremieLength", type: "number", placeholder: "Tremie Length", step: "0.001" },
        { name: "pourStartTime", type: "datetime-local", label: "Pour Start Time" },
        { name: "pourEndTime", type: "datetime-local", label: "Pour End Time" },
        { name: "rmcSupplierName", type: "text", placeholder: "RMC Supplier Name" },
    ];

    return (
        <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 ${isLocked ? 'opacity-95' : ''}`}>
            <Flex align="center" gap="2" className="border-b pb-2">
                <Text size="4" weight="bold" className="text-gray-800">Concrete Details</Text>
                {isLocked && <LockClosedIcon className="text-gray-500" />}
            </Flex>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fields.map((field) => (
                    <div key={field.name}>
                        {field.label && <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{field.label}</label>}
                        <input
                            type={field.type}
                            step={field.step}
                            placeholder={field.placeholder}
                            disabled={isLocked}
                            className={inputClass}
                            {...register(field.name, field.type === 'number' ? { valueAsNumber: true } : {})}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}