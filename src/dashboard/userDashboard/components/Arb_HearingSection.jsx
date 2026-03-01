import { FaMoneyBillWave, FaVideo } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const Arb_HearingSection = ({ arbitrationId }) => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const [hearingData, setHearingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHearings = async () => {
      if (!arbitrationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await axiosPublic.get(
          `/hearings/arbitration/${arbitrationId}`
        );

        // backend structure: { success: true, data: [...] }
        if (res.data.success) {
          setHearingData(res.data.data || []);
        } else {
          setHearingData([]);
        }
      } catch (error) {
        console.error("Error fetching hearings:", error);
        setHearingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHearings();
  }, [arbitrationId, axiosPublic]);

  if (loading) {
    return (
      <div className="text-center py-6 text-purple-600 font-medium">
        Loading hearings...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-10">
       <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center mt-2 ml-2"
                   style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)" }}>
                   <FaVideo className="text-white " />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">Hearing Management</h2>
                   <p className="text-sm text-gray-500">
                   </p>
                 </div>
                 
              
               </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-purple-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase">
              Hearing 
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase">
              Date & Time
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase">
              Duration
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase">
              Agenda
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase">
              Meeting
            </th>
            
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {hearingData.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="text-center py-6 text-gray-500"
              >
                No hearings found.
              </td>
            </tr>
          ) : (
            hearingData.map((hearing, index) => (
              <tr
                key={hearing._id || index}
                onClick={() =>
                  navigate(
                    `/dashboard/arbitrator/arbitration/${arbitrationId}/hearing/${hearing._id}`
                  )
                }
                className="hover:bg-purple-50 cursor-pointer transition"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">
                    {hearing.hearingNumber || index + 1}
                  </div>
                  <div className="text-xs text-gray-500">
                    {hearing.hearingId || "N/A"}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {hearing.date
                      ? new Date(hearing.date).toLocaleDateString()
                      : "Not set"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {hearing.date
                      ? new Date(hearing.date).toLocaleTimeString()
                      : ""}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      hearing.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : hearing.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : hearing.status === "postponed"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {hearing.status
                      ? hearing.status.charAt(0).toUpperCase() +
                        hearing.status.slice(1)
                      : "Scheduled"}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {hearing.duration || 0} minutes
                </td>

                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="line-clamp-2">
                    {hearing.hearingAgenda || "No agenda provided"}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {hearing.meetLink ? (
                    <a
                      href={hearing.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <FaVideo className="mr-1" />
                      Join
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No link
                    </span>
                  )}
                </td>

                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Arb_HearingSection;
