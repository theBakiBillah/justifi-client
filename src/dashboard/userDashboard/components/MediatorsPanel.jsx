import { useState, useEffect } from "react";
import {
  FaUserFriends,
  FaUserTie,
  FaGraduationCap,
  FaEnvelope,
  FaBriefcase,
  FaLanguage,
  FaStar,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const MediatorsPanel = ({ mediation }) => {
  const [mediatorData, setMediatorData] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  const shouldShowMediator = () => {
    const status = mediation?.mediation_status?.toLowerCase();
    return status === "ongoing" || status === "completed";
  };

  useEffect(() => {
    // Reset image error state when mediator changes
    setImgError(false);

    const fetchMediatorData = async () => {
      if (!mediation || !shouldShowMediator()) {
        setLoading(false);
        return;
      }

      const email = mediation?.mediator?.email;
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Calls the dedicated mediator lookup endpoint which returns
        //    the FULL mediator document including image, profession,
        //    languages, specialization — not just the 3 fields stored
        //    in the mediation's embedded mediator object.
        const response = await axiosSecure.get(
          `/mediator/email/${encodeURIComponent(email)}`,
        );

        if (response.data.success && response.data.mediator) {
          setMediatorData(response.data.mediator);
        } else {
          // Fallback: use whatever is embedded in the mediation doc
          setMediatorData(mediation.mediator);
        }
      } catch (error) {
        console.error("Error fetching full mediator profile:", error);
        // Fallback: use the embedded mediator snapshot
        setMediatorData(mediation.mediator);
      } finally {
        setLoading(false);
      }
    };

    fetchMediatorData();
  }, [mediation]);

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Pending Review";
      case "ongoing":
        return "Proceedings Ongoing";
      case "completed":
        return "Case Concluded";
      case "cancelled":
        return "Case Cancelled";
      default:
        return status || "Unknown";
    }
  };

  const showMediator = shouldShowMediator();

  // ─── Case not active yet ────────────────────────────────────────────────────
  if (!showMediator) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-gray-400 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            <FaUserFriends className="inline mr-3 text-gray-400" />
            Mediators Panel
          </h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <FaUserFriends className="mx-auto text-6xl text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Mediator Not Assigned Yet
          </h3>
          <p className="text-gray-500 mb-6">
            A mediator will be assigned when the case status changes to
            &ldquo;Ongoing&rdquo;.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-700 text-sm">
              <strong>Current Status:</strong>{" "}
              {getStatusText(mediation?.mediation_status)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <div className="w-1 h-8 bg-amber-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            <FaUserFriends className="inline mr-3 text-amber-600" />
            Mediators Panel
          </h2>
        </div>
        <div className="max-w-sm mx-auto">
          <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center animate-pulse">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded mb-2 mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // ─── No mediator data ───────────────────────────────────────────────────────
  if (!mediatorData && !mediation?.mediator) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <div className="w-1 h-8 bg-amber-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            <FaUserFriends className="inline mr-3 text-amber-600" />
            Mediators Panel
          </h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <FaUserFriends className="mx-auto text-6xl text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Mediator Not Assigned
          </h3>
          <p className="text-gray-500 mb-6">
            Mediator details will appear here once the agreement is processed.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> The mediator is assigned during the
              agreement signing process.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Prefer the full mediatorData fetched from DB; fall back to the
  //    snapshot embedded in the mediation document.
  const mediator = mediatorData || mediation.mediator;

  // ─── Mediator card ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-8">
        <div className="w-1 h-8 bg-amber-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaUserFriends className="inline mr-3 text-amber-600" />
          Mediators Panel
        </h2>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-6 text-center relative transform hover:scale-105 transition-transform duration-300">
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
              Mediator
            </div>
          </div>

          {/* ✅ Avatar — shows real photo when available, icon fallback otherwise */}
          <div className="w-24 h-24 rounded-full mx-auto mt-4 mb-4 shadow-lg overflow-hidden border-4 border-amber-300 bg-amber-500 flex items-center justify-center">
            {mediator.image && !imgError ? (
              <img
                src={mediator.image}
                alt={mediator.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <FaUserTie className="text-4xl text-white" />
            )}
          </div>

          {/* Name & profession */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {mediator.name || "N/A"}
          </h3>
          <p className="text-amber-600 font-semibold mb-4 text-sm">
            {mediator.profession || "Assigned Mediator"}
          </p>

          {/* Details grid */}
          <div className="text-left space-y-3 bg-white rounded-lg p-4 border border-amber-200">
            {mediator.qualification && (
              <p className="text-gray-700 text-sm flex items-start gap-2">
                <FaGraduationCap className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Qualification:</strong> {mediator.qualification}
                </span>
              </p>
            )}
            {mediator.email && (
              <p className="text-gray-700 text-sm flex items-start gap-2">
                <FaEnvelope className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Email:</strong> {mediator.email}
                </span>
              </p>
            )}
            {mediator.profession && (
              <p className="text-gray-700 text-sm flex items-start gap-2">
                <FaBriefcase className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Profession:</strong> {mediator.profession}
                </span>
              </p>
            )}
            {mediator.languages?.length > 0 && (
              <p className="text-gray-700 text-sm flex items-start gap-2">
                <FaLanguage className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Languages:</strong> {mediator.languages.join(", ")}
                </span>
              </p>
            )}
            {mediator.specialization?.length > 0 && (
              <p className="text-gray-700 text-sm flex items-start gap-2">
                <FaStar className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Specialization:</strong>{" "}
                  {mediator.specialization.join(", ")}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediatorsPanel;
