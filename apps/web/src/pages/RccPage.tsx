import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import BackButton from "../components/common/BackButton";
import { debounce } from "../utils/debounce";
import api from "../api/axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Flex, Text, Button } from "@radix-ui/themes";
import Slab from "../components/slab/Slab";

function RccPage() {
    const { siteId } = useParams();

    const [rcc, setRcc] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [searchSlab, setSearchSlab] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    const totalPages = Math.ceil(searchSlab.length / itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    const paginatedSlab = searchSlab.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchRcc = async () => {
        const res = await api.get(`/rcc/by-site/${siteId}`);
        res.data.sort((a: any, b: any) => {
            const aIsSlab = a.name?.toLowerCase().includes("slab");
            const bIsSlab = b.name?.toLowerCase().includes("slab");
            if (aIsSlab && !bIsSlab) return 1;
            if (!aIsSlab && bIsSlab) return -1;
            if (aIsSlab && bIsSlab) return 1;
            return (a.level || 0) - (b.level || 0)
        });
        setRcc(res.data);
        setSearchSlab(res.data);
    };

    useEffect(() => {
        if (siteId) fetchRcc();
    }, [siteId]);

    const debouncedSearch = useCallback(
        debounce((val: string) => searchRcc(val), 500),
        [rcc]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    const searchRcc = (search: string) => {
        if (!search) {
            setSearchSlab(rcc);
            setError("");
            return;
        }

        const filtered = rcc.filter((p) =>
            p.name?.toLowerCase().includes(search.toLowerCase())
        );

        if (filtered.length > 0) {
            setSearchSlab(filtered);
        } else {
            setSearchSlab([]);
            setError("No pile found with that number");
        }
    };

    return (
        <div className="p-6 md:p-8">
            <BackButton to={`/dashboard/site/${siteId}/phase`} />

            <h1 className="text-2xl font-bold mb-6 mt-4">Rcc</h1>

            <div className="mb-6">
                <input
                    placeholder="Search RCC Name"
                    value={search}
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full md:w-1/3"
                />
            </div>

            {searchSlab.length === 0 ? (
                <p className="text-red-500">{error || "No Rcc found"}</p>
            ) : (
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-lg border-collapse table-fixed">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 w-1/2">Slab</th>
                                <th className="border p-2 w-1/4">Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSlab.map((slab, index) => (
                                <Slab
                                    key={slab.id}
                                    slab={slab}
                                    onRefresh={() => fetchRcc()}
                                    index={(currentPage - 1) * itemsPerPage + index}
                                />
                            ))}
                        </tbody>
                    </table>
                    <div className="flex flex-col sm:flex-row lg:justify-center justify-between items-center gap-4 mt-6 py-4 border-t border-gray-100">
                        {/* Left Side: Text Info */}
                        <Text size="2" color="gray" className="font-medium order-2 ml-2 sm:order-1">
                            Showing <span className="text-gray-900">{currentPage}</span> of{" "}
                            <span className="text-gray-900">{totalPages}</span> pages
                        </Text>

                        {/* Right Side: Controls */}
                        <div className="flex items-center gap-1.5 order-1 sm:order-2">
                            {/* Previous Button */}
                            <Button
                                variant="soft"
                                color="gray"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="p-2 border rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronLeftIcon />
                            </Button>

                            {/* Page Number Buttons - Hidden on very small screens, or scrollable */}
                            <Flex gap="1" className="overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                                {getPageNumbers().map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`min-w-[32px] h-8 text-sm font-medium rounded-md transition-all ${currentPage === pageNum
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </Flex>

                            {/* Next Button */}
                            <Button
                                variant="soft"
                                color="gray"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="p-2 border rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronRightIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default RccPage;
