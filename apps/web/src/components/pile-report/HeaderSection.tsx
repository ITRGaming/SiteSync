import { useFormContext } from "react-hook-form";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Text, Flex } from "@radix-ui/themes";

export default function HeaderSection() {
    const { register, watch } = useFormContext();
    const isLocked = watch("isLocked");

    return (
        <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 ${isLocked ? 'opacity-95' : ''}`}>
            <Flex align="center" gap="2" className="border-b pb-2">
                <Text size="4" weight="bold" className="text-gray-800">Pile Specifications</Text>
                {isLocked && <LockClosedIcon className="text-gray-500" />}
            </Flex>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Pile Number
                    </label>
                    <Text size="3" weight="medium" className="text-gray-400">
                        {watch("pile.pileNumber")}
                    </Text>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Report Date *
                    </label>
                    <input
                        type="date"
                        disabled={isLocked}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
                            ${isLocked
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            }`}
                        {...register("reportDate")}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Pile Dia (mm)
                    </label>
                    <input
                        type="number"
                        disabled={isLocked}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
                            ${isLocked
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            }`}
                        {...register("pile.diameter")}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Pile Location
                    </label>
                    <input
                        type="text"
                        disabled={isLocked}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
                            ${isLocked
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            }`}
                        {...register("pile.location")}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Ground Level
                    </label>
                    <input
                        type="text"
                        disabled={isLocked}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
                            ${isLocked
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            }`}
                        {...register("pile.groundLevel")}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Cut Off Level
                    </label>
                    <input
                        type="text"
                        disabled={isLocked}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
                            ${isLocked
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            }`}
                        {...register("pile.cutOffLevel")}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Liner Top Level
                    </label>
                    <input
                        type="text"
                        disabled={isLocked}
                        className={`w-full bg-white border rounded-md px-3 py-2 text-sm transition-all outline-none
                            ${isLocked
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            }`}
                        {...register("pile.linerTopLevel")}
                    />
                </div>
            </div>
        </div>
    );
}