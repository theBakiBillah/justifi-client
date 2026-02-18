import { FaBalanceScale, FaEnvelope, FaGavel, FaMapMarkerAlt, FaPhone, FaUserCircle, FaUserShield, FaUserTie } from "react-icons/fa";

const Arb_PartiesInformation = ({ arbitration, currentUser }) => {
    const getPartiesData = (parties) => {
        if (!parties) return [];
        
        if (Array.isArray(parties)) {
            return parties.filter(party => party && typeof party === 'object');
        } else if (typeof parties === 'object') {
            return Object.values(parties).filter(party => party && typeof party === 'object');
        }
        
        return [];
    };

    const plaintiffs = getPartiesData(arbitration.plaintiffs);
    const defendants = getPartiesData(arbitration.defendants);

    const PartyCard = ({ party, type, index }) => (
        <div key={index} className="party-card bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-600">
            <div className="flex items-start mb-4">
                <div className="relative">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${
                        type === 'plaintiff' ? 'bg-blue-100 border-blue-200' : 'bg-red-100 border-red-200'
                    }`}>
                        {type === 'plaintiff' ? 
                            <FaUserTie className="text-2xl text-blue-600" /> : 
                            <FaUserShield className="text-2xl text-red-600" />
                        }
                    </div>
                    <div className={`absolute -top-1 -right-1 rounded-full w-6 h-6 flex items-center justify-center text-xs ${
                        type === 'plaintiff' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                        {type === 'plaintiff' ? <FaUserTie /> : <FaUserShield />}
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{party.name || 'Unknown'}</h3>
                    <p className="text-gray-600 text-sm mb-1">
                        <FaUserCircle className={`inline mr-2 ${type === 'plaintiff' ? 'text-blue-500' : 'text-red-500'}`} />
                        {party.parentsName || 'Not specified'}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                        <FaEnvelope className={`inline mr-2 ${type === 'plaintiff' ? 'text-blue-500' : 'text-red-500'}`} />
                        {party.email || 'No email'}
                    </p>
                    <p className="text-gray-600 text-sm">
                        <FaPhone className={`inline mr-2 ${type === 'plaintiff' ? 'text-blue-500' : 'text-red-500'}`} />
                        {party.phone || 'No phone'}
                    </p>
                </div>
            </div>
            <div className="mb-3">
                <p className="text-gray-700 text-sm">
                    <FaMapMarkerAlt className={`inline mr-2 ${type === 'plaintiff' ? 'text-blue-500' : 'text-red-500'}`} />
                    {party.address || 'Address not specified'}
                </p>
            </div>
            <div>
                <p className="text-gray-700 text-sm mb-2">
                    <span className="font-medium">Occupation:</span> {party.occupation || 'Not specified'}
                </p>
            </div>
        </div>
    );

    const EmptyState = ({ type }) => (
        <div className="text-center py-8 text-gray-500">
            {type === 'plaintiff' ? 
                <FaUserTie className="text-4xl text-gray-300 mx-auto mb-3" /> : 
                <FaUserShield className="text-4xl text-gray-300 mx-auto mb-3" />
            }
            <p>No {type === 'plaintiff' ? 'plaintiffs' : 'defendants'} information available</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Plaintiffs */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaBalanceScale className="inline mr-3 text-blue-600" />
                        Plaintiffs/Claimants ({plaintiffs.length})
                    </h2>
                </div>
                <div className="space-y-6">
                    {plaintiffs.length > 0 ? plaintiffs.map((party, index) => (
                        <PartyCard key={index} party={party} type="plaintiff" index={index} />
                    )) : <EmptyState type="plaintiff" />}
                </div>
            </div>

            {/* Defendants */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="w-1 h-8 bg-red-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaGavel className="inline mr-3 text-red-600" />
                        Defendants/Respondents ({defendants.length})
                    </h2>
                </div>
                <div className="space-y-6">
                    {defendants.length > 0 ? defendants.map((party, index) => (
                        <PartyCard key={index} party={party} type="defendant" index={index} />
                    )) : <EmptyState type="defendant" />}
                </div>
            </div>
        </div>
    );
};

export default Arb_PartiesInformation;