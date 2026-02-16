import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import BackButton from "../components/common/BackButton";
import { debounce } from "../utils/debounce";
import api from "../api/axios";

function PilesPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();

  const [piles, setPiles] = useState<any[]>([]);
  const [pileNumbers, setPileNumbers] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [searchPiles, setSearchPiles] = useState<any[]>([]);
  const [error, setError] = useState("");

  // const isAdmin = localStorage.getItem("isAdmin") === "true";

  const fetchPiles = async () => {
    const res = await api.get(`/piles/by-site/${siteId}`);
    setPiles(res.data);
    setSearchPiles(res.data);
  };

  // const createPile = async () => {
  //   if (!newPile) return;

  //   await api.post(`/piles/by-site/${siteId}`, {
  //     pileNumber: newPile,
  //   });

  //   setNewPile("");
  //   fetchPiles();
  // };

  useEffect(() => {
    fetchPiles();
  }, []);
  

  async function updatePile(pileId: number) {
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

    fetchPiles();
  }

  const debouncedSearch = useCallback(
    debounce((val: string) => searchPile(val), 500),
    [piles]
  );

  // 3. Handle the input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);           // Update input UI immediately
    debouncedSearch(value); // Trigger the delayed search logic
  };

  const searchPile = (search: string) => {
    if (!search) {
      setSearchPiles(piles);
      setError("");
      return;
    }
    const pile = piles.filter((p) => p.pileNumber?.toLowerCase().includes(search.toLowerCase()));
    if (pile.length > 0) {
      setSearchPiles(pile);
    } else {
      setSearchPiles([]);
      setError("No pile found with that number");
    }
  };

  return (
    <div className="p-8">
      <BackButton to={`/dashboard/site/${siteId}`} />

      <h1 className="text-2xl font-bold mb-6 mt-4">
        Piles
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="Search for Pile Number"
          value={search}
          onChange={handleInputChange}
          className="border p-2 rounded w-[33%] focus-visible:outline-green-300"
        />
      </div>
      {searchPiles.length !== 0 ? (
        <ul className="space-y-2">
          {searchPiles.map((pile, key) => (
            <li
            onClick={() => pile.pileNumber && navigate(`/dashboard/site/${siteId}/pile/${pile.id}/report`)}
            key={pile.id}
            className="border p-3 rounded flex justify-between cursor-pointer"
            >
              {pile.pileNumber ? (
                <div>
                  <h3 className="font-semibold text-lg text-gray-600">
                    {pile.pileNumber}
                  </h3>
                </div>
              ) : (
                <div>
                  <span className="font-semibold text-lg text-gray-500">
                    {key + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Pile Number"
                    className="mx-4 border p-1 rounded"
                    value={pileNumbers[pile.id] || ""}
                    onChange={(e) =>
                      setPileNumbers({
                        ...pileNumbers,
                        [pile.id]: e.target.value,
                      })
                    }
                    />
                  <button
                    onClick={async () => {
                      if (!pileNumbers[pile.id]) {
                        alert("Please enter a pile number");
                        return;
                      }
                      updatePile(pile.id);
                    }}
                    className="bg-green-600 text-white px-2 py-1 rounded text-sm mt-2"
                    >
                    Confirm
                  </button>
                </div>
              )}
              <span className="text-xs text-gray-500">
                {pile.isReportSubmitted
                  ? "Submitted"
                  : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      ): (
          <p className="text-red-500">
            {error || "No piles found"}
          </p>
        )}
    </div>
  );
}

export default PilesPage;
