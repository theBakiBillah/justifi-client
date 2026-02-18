import React from "react";
import { FaVideo, FaCheckCircle, FaCalendarTimes } from "react-icons/fa";

const LawyerArbHearing = ({ hearings }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          Arbitration Proceedings
        </h2>
      </div>

      {hearings.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Hearing Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Arbitrator 1 Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Arbitrator 2 Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Arbitrator 3 Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Result
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Documents Required
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Meeting Link
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hearings.map((hearing) => (
                <tr key={hearing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(hearing.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(hearing.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="line-clamp-3 bg-blue-50 p-2 rounded-lg border border-blue-100">
                      {hearing.arbitrator1Notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="line-clamp-3 bg-green-50 p-2 rounded-lg border border-green-100">
                      {hearing.arbitrator2Notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="line-clamp-3 bg-purple-50 p-2 rounded-lg border border-purple-100">
                      {hearing.arbitrator3Notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {hearing.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="line-clamp-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {hearing.documentsRequired}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={hearing.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <FaVideo className="mr-2" />
                      Join
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" />
                      {hearing.attendance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FaCalendarTimes className="text-6xl text-gray-300 mb-6 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Hearings Scheduled
            </h3>
            <p className="text-gray-500 mb-6">
              No hearings have been scheduled yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerArbHearing;
