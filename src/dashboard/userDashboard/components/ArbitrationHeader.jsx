import React from 'react';
const ArbitrationHeader = ({ arbitration, currentUser }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-500 text-white';
            case 'ongoing': return 'bg-blue-500 text-white';
            case 'completed': return 'bg-green-500 text-white';
            case 'cancelled': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending Review';
            case 'ongoing': return 'Proceedings Ongoing';
            case 'completed': return 'Case Concluded';
            case 'cancelled': return 'Case Cancelled';
            default: return status || 'Unknown';
        }
    };

    const getUserRole = (arbitration, userEmail) => {
        if (!arbitration || !userEmail) return 'Unknown';

        if (arbitration.plaintiffs) {
            const plaintiffs = Array.isArray(arbitration.plaintiffs) ? 
                arbitration.plaintiffs : Object.values(arbitration.plaintiffs);
            const isPlaintiff = plaintiffs.some(plaintiff => 
                plaintiff && plaintiff.email === userEmail
            );
            if (isPlaintiff) return 'Plaintiff';
        }

        if (arbitration.defendants) {
            const defendants = Array.isArray(arbitration.defendants) ? 
                arbitration.defendants : Object.values(arbitration.defendants);
            const isDefendant = defendants.some(defendant => 
                defendant && defendant.email === userEmail
            );
            if (isDefendant) return 'Defendant';
        }

        return 'Unknown';
    };

    const userRole = getUserRole(arbitration, currentUser?.email);

    return (
        <div 
            className="legal-header text-white rounded-xl shadow-lg p-6 mb-8"
            style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)'
            }}
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <div className="flex items-center mb-3 flex-wrap gap-2">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray bg-opacity-20 backdrop-blur-sm ${getStatusColor(arbitration.arbitration_status)}`}>
                            {getStatusText(arbitration.arbitration_status)}
                        </span>
                        <span className="font-mono bg-black bg-opacity-20 px-3 py-1 rounded-lg text-sm">
                            Case ID: {arbitration._id?.slice(-8).toUpperCase() || 'N/A'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            userRole === 'Plaintiff' ? 'bg-purple-500 text-white' : 
                            userRole === 'Defendant' ? 'bg-emerald-500 text-white' : 
                            'bg-gray-500 text-white'
                        }`}>
                            Your Role: {userRole}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{arbitration.caseTitle || 'Untitled Case'}</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                            <p className="text-gray-600 text-xl font-bold mb-1">Suit Value</p>
                            <p className="text-xl font-bold text-blue-600">
                                BDT {arbitration.suitValue ? parseInt(arbitration.suitValue).toLocaleString() : '0'}
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                            <p className="text-gray-600 text-xl font-bold mb-1">Case Category</p>
                            <p className="text-xl font-bold text-blue-600">
                                {arbitration.caseCategory || 'General'}
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                            <p className="text-gray-600 text-xl font-bold mb-1">Processing Fee</p>
                            <p className="text-xl font-bold text-blue-600">
                                BDT {arbitration.processingFee || '0'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-blue-200 text-sm font-medium">Payment Status</p>
                            <p className="text-2xl font-bold text-green-300">
                                {arbitration.payment_status ? 'Paid' : 'Pending'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-orange-300 text-sm font-medium">Filed Date</p>
                            <p className="text-2xl font-bold text-orange-300">
                                {arbitration.submissionDate ? new Date(arbitration.submissionDate).toLocaleDateString() : 'Not specified'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-purple-300 text-sm font-medium">Last Updated</p>
                            <p className="text-2xl font-bold text-purple-300">
                                {arbitration.updatedAt ? new Date(arbitration.updatedAt).toLocaleDateString() : 'Not specified'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArbitrationHeader;