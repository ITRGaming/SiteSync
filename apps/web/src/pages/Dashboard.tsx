import { useEffect, useState } from "react";
import api from "../api/axios";
import  { IconButton } from "@radix-ui/themes";
import { TrashIcon, ResetIcon, ExitIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<number, string[]>>({});
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "UNKNOWN";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const fetchUserDetails = async () => {
    try {
      const res = await api.get("/users/me");
      setMe(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await api.get(
        `/sites?isActive=${activeTab === "active"}`
      );
      setSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const res = await api.get("/users/assignable");
      setAssignableUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const assignUsers = async (siteId: number) => {
    const selected = selectedUsers[siteId] || [];

    if (selected.length === 0) {
      alert("Select at least one user");
      return;
    }

    const errors: string[] = [];

    for (const userId of selected) {
      try {
        await api.post(`/sites/${siteId}/assign/${userId}`);
      } catch (err: any) {
        errors.push(
          err.response?.data?.message || "Error assigning"
        );
      }
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
    } else {
      alert("Users assigned successfully");
    }

    setSelectedUsers((prev) => ({
      ...prev,
      [siteId]: [],
    }));

    fetchSites();
  };


  useEffect(() => {
    fetchUserDetails();
    fetchSites();
    fetchAssignableUsers();
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeTab]);

  const createSite = async () => {
    try {
      await api.post("/sites", {
        name,
        location,
        description,
      });
      setName("");
      setLocation("");
      setDescription("");
      fetchSites();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error creating site");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    window.location.href = "/";
  };

  const softDeleteSite = async (id: number) => {
    await api.patch(`/sites/${id}/delete`);
    fetchSites();
  };

  const restoreSite = async (id: number) => {
    await api.patch(`/sites/${id}/restore`);
    fetchSites();
  };

  const hardDeleteSite = async (id: number) => {
    if (!window.confirm("Permanent delete?")) return;
    await api.delete(`/sites/${id}`);
    fetchSites();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <IconButton variant="solid" color="red" size="2" onClick={logout}>
          <ExitIcon width="18" height="18"/>
        </IconButton>
      </div>

      <div className="text-gray-600 flex flex-col justify-center items-center mb-8">
        <h2 className="text-3xl"><strong>Welcome {me?.fullName} !</strong></h2>
        <p>Role: {role}</p>
      </div>

      {/* Create Site */}
      {isAdmin && (<div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Create New Site
        </h2>

        <div className="flex gap-4 lg:flex-row  flex-col">
          <input
            placeholder="Site Name"
            className="border p-2 flex-1 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Location"
            className="border p-2 flex-1 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            placeholder="Description"
            className="border p-2 flex-1 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            onClick={createSite}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Create
          </button>
        </div>
      </div>)}

      {/* Site List */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded ${
            activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => {
            setActiveTab("deleted");
          }}
          className={`px-4 py-2 rounded ${
            activeTab === "deleted" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Deleted
        </button>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          My Sites
        </h2>

        {sites.length === 0 && (
          <p className="text-gray-500">No sites found.</p>
        )}
        <ul className="space-y-3">
          {sites.map((site) => (
            <li
              key={site.id}
              className="border p-4 rounded grid grid-cols-3"
            >
              <div>
                <h3 className="font-bold cursor-pointer text-blue-500"
                  onClick={() =>
                    navigate(`/dashboard/site/${site.id}/phase`)
                  }
                >{site.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  ({site.location})
                </p>
                { site.description && (
                  <div>
                    <h4 className="text-base text-gray-600">Description:</h4>
                    <p className="text-sm text-gray-500">
                      {site.description}
                    </p>
                  </div>
                )}
              </div>
              {isAdmin && (
                <div className="relative">
                  <button
                    className="border px-3 py-1 rounded bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === site.id ? null : site.id);
                    }}
                  >
                    Assign Users
                  </button>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {(selectedUsers[site.id] || []).map((uid) => {
                      const user = assignableUsers.find(
                        (u) => u.id.toString() === uid
                      );

                      return (
                        <span
                          key={uid}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {user?.fullName}
                        </span>
                      );
                    })}
                  </div>

                  { openDropdown === site.id && (
                    <div className="absolute z-10 bg-white border mt-2 p-3 rounded shadow w-56 max-h-48 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {assignableUsers.map((user) => {
                        const selected = selectedUsers[site.id] || [];
                        const isChecked = selected.includes(user.id.toString());

                        return (
                          <>
                            <label
                              key={user.id}
                              className="flex items-center gap-2 mb-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedUsers((prev) => {
                                    const current = prev[site.id] || [];

                                    if (isChecked) {
                                      return {
                                        ...prev,
                                        [site.id]: current.filter(
                                          (id) => id !== user.id.toString()
                                        ),
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        [site.id]: [
                                          ...current,
                                          user.id.toString(),
                                        ],
                                      };
                                    }
                                  });
                                }}
                              />
                              {user.fullName}
                            </label>
                          </>
                        );
                      })}
                      <button
                        onClick={() => {
                          assignUsers(site.id);
                          setOpenDropdown(null);
                        }}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm mt-2 w-full"
                      >
                        Confirm Assign
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div>
                <span className="text-xs text-gray-400 flex justify-end mb-4">
                  ID: {site.id}
                </span>
                  <div className="flex gap-2 justify-end">
                    {activeTab === "active" && isAdmin && (
                      <IconButton variant="soft" color="red" size="2" onClick={() => softDeleteSite(site.id)}>
                        <TrashIcon width="18" height="18"/>
                      </IconButton>
                    )}
                    {activeTab === "deleted" && isAdmin && (
                      <>
                        <IconButton variant="solid" color="green" size="2" onClick={() => restoreSite(site.id)}>
                          <ResetIcon width="18" height="18"/>
                        </IconButton>
                    
                        { role === "SUPER_ADMIN" && (
                          <IconButton variant="solid" color="red" size="2" onClick={() => hardDeleteSite(site.id)}>
                            <TrashIcon width="18" height="18"/>
                          </IconButton>
                        )}
                      </>
                    )}
                  </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;