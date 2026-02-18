import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import BackButton from "../components/common/BackButton";
import { debounce } from "../utils/debounce";
import api from "../api/axios";
import PileRow from "../components/piles/PileRow";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Flex, Text, Button } from "@radix-ui/themes";
import { AttachmentType } from "../utils/attachmentType";
import UploadButton from "../components/common/UploadAttachmentsButton";

function PilesPage() {
  const { siteId, phaseId } = useParams();
  const navigate = useNavigate();

  const [piles, setPiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchPiles, setSearchPiles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [integrity, setIntegrity] = useState<any[]>([]);
  const [eccentricity, setEccentricity] = useState<any[]>([]);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(searchPiles.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const paginatedPiles = searchPiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchPiles = async () => {
    const res = await api.get(`/piles/by-site/${siteId}`);
    setPiles(res.data);
    setSearchPiles(res.data);
  };
  
  const fetchDrawings = async () => {
    const res = await api.get(`/attachments/by-phase/${phaseId}/type/${AttachmentType.DRAWING}`);
    setDrawings(res.data);
  };

  const fetchIntegrity = async () => {
    const res = await api.get(`/attachments/by-phase/${phaseId}/type/${AttachmentType.INTEGRITY_TEST}`);
    setIntegrity(res.data);
  };

  const fetchEccentricity = async () => {
    const res = await api.get(`/attachments/by-phase/${phaseId}/type/${AttachmentType.ECCENTRICITY_CHECK}`);
    setEccentricity(res.data);
  };

  useEffect(() => {
    if (siteId) fetchPiles();
    if (phaseId) {
      fetchDrawings();
      fetchIntegrity();
      fetchEccentricity();
    }
  }, [siteId, phaseId]);

  const debouncedSearch = useCallback(
    debounce((val: string) => searchPile(val), 500),
    [piles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const searchPile = (search: string) => {
    if (!search) {
      setSearchPiles(piles);
      setError("");
      return;
    }

    const filtered = piles.filter((p) =>
      p.pileNumber?.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length > 0) {
      setSearchPiles(filtered);
    } else {
      setSearchPiles([]);
      setError("No pile found with that number");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <BackButton to={`/dashboard/site/${siteId}/phase`} />

      <h1 className="text-2xl font-bold mb-6 mt-4">Pile</h1>

      <div className="mb-6">
        <input
          placeholder="Search Pile Number"
          value={search}
          onChange={handleInputChange}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {searchPiles.length === 0 ? (
        <p className="text-red-500">{error || "No piles found"}</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Pile No</th>
                <th className="border p-2">Dia</th>
                <th className="border p-2">Boring Date</th>
                <th className="border p-2">Concreting Date</th>
                <th className="border p-2">Cube 7</th>
                <th className="border p-2">Cube 28</th>
                <th className="border p-2">Integrity</th>
                <th className="border p-2">Eccentricity</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPiles.map((pile, index) => (
                <PileRow
                  key={pile.id}
                  pile={pile}
                  siteId={siteId}
                  phaseId={phaseId}
                  navigate={navigate}
                  onRefresh={() => fetchPiles()}
                  index={(currentPage - 1) * itemsPerPage + index}
                />
              ))}
            </tbody>
          </table>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 py-4 border-t border-gray-100">
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
                    className={`min-w-[32px] h-8 text-sm font-medium rounded-md transition-all ${
                      currentPage === pageNum
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
      <div className="mt-6 p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 mt-4">Attachments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-4 md:flex-row flex-col">
            <UploadButton
              siteId={Number(siteId)}
              phaseId={Number(phaseId)}
              type={AttachmentType.DRAWING}
              isPublic={true}
              multiple={true}
              label="Upload Drawings"
              color="amber"
              variant="surface"
              setLoading={setLoading}
            />
            <div className="my-2">
              {drawings.length === 0 && (
                <p className="text-sm text-gray-500">No attachments uploaded yet</p>
              )}

              {drawings.map((file) => (
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
            </div>
          </div>
          <div className="flex gap-4 md:flex-row flex-col">
            <UploadButton
              siteId={Number(siteId)}
              phaseId={Number(phaseId)}
              type={AttachmentType.INTEGRITY_TEST}
              isPublic={true}
              multiple={true}
              label="Upload Integrity Test"
              color="iris"
              variant="surface"
              setLoading={setLoading}
            />
            <div className="my-2">
              {integrity.length === 0 && (
                <p className="text-sm text-gray-500">No attachments uploaded yet</p>
              )}

              {integrity.map((file) => (
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
            </div>
          </div>
          <div className="flex gap-4 md:flex-row flex-col">
            <UploadButton
              siteId={Number(siteId)}
              phaseId={Number(phaseId)}
              type={AttachmentType.ECCENTRICITY_CHECK}
              isPublic={true}
              multiple={true}
              label="Upload Eccentricity"
              color="plum"
              variant="surface"
              setLoading={setLoading}
            />
            <div className="my-2">
              {eccentricity.length === 0 && (
                <p className="text-sm text-gray-500">No attachments uploaded yet</p>
              )}

              {eccentricity.map((file) => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PilesPage;
