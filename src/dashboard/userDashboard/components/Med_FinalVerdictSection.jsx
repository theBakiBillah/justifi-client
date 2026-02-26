import {
  FaAward,
  FaFilePdf,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaFileAlt,
} from "react-icons/fa";

const Med_FinalVerdictSection = ({ mediation }) => {
  if (!mediation) return null;

  // ✅ FIX: Read directly from the passed prop — no axios call needed
  const isCaseCompleted =
    mediation?.mediation_status?.toLowerCase() === "completed";

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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-8">
        <div className="w-1 h-8 bg-yellow-500 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaAward className="inline mr-3 text-yellow-600" />
          Final Verdict / Final Award
        </h2>
      </div>

      {isCaseCompleted ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Final Award Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {mediation?.final_verdict_summary ||
                "Final verdict summary not available."}
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Award Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Award Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Award Date:</span>
                  <span className="font-semibold text-gray-900">
                    {mediation?.final_verdict_date
                      ? new Date(mediation.final_verdict_date).toLocaleString(
                          "en-US",
                          { dateStyle: "medium", timeStyle: "short" },
                        )
                      : "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Case Status:</span>
                  <span className="font-semibold text-green-600">
                    Completed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Award Type:</span>
                  <span className="font-semibold text-gray-900">
                    Final Binding Award
                  </span>
                </div>
              </div>
            </div>

            {/* PDF Document */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Final Award Document
              </h4>

              {mediation?.final_verdict_pdf ? (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <FaFilePdf className="text-red-500 text-2xl mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Final_Award_Document.pdf
                      </p>
                      <p className="text-xs text-gray-600">
                        Official mediation award
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={mediation.final_verdict_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                    >
                      <FaEye className="mr-1" />
                      View
                    </a>
                    <a
                      href={mediation.final_verdict_pdf}
                      download
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                    >
                      <FaDownload className="mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                  <FaFilePdf className="text-gray-300 text-2xl mr-3" />
                  <p className="text-gray-500 text-sm">
                    PDF document not uploaded yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Success message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 mr-3 text-xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">
                  Case Successfully Concluded
                </p>
                <p className="text-green-700 text-sm mt-1">
                  This mediation case has been successfully completed. The final
                  award is binding and enforceable.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Not completed yet
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Final Award Pending
            </h3>
            <p className="text-gray-500 mb-6">
              The final verdict will appear here once the mediation process is
              completed.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>Current Status:</strong>{" "}
                {getStatusText(mediation?.mediation_status)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Med_FinalVerdictSection;
