import { useState } from "react";
import { FaUserTie, FaUserPlus, FaUserMinus, FaEnvelope, FaBriefcase, FaPhone, FaTimes } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const Arb_RepresentativeSection = ({ arbitrationData, currentUserEmail, caseId, onUpdateArbitration }) => {
    const [showAddRepresentative, setShowAddRepresentative] = useState(false);
    const [loading, setLoading] = useState(false);
    const axiosSecure = useAxiosSecure();
    
    // Find if current user has representatives (check both plaintiffs and defendants)
    const getUserRoleAndRepresentatives = () => {
        if (!arbitrationData) return null;

        const plaintiffs = arbitrationData.plaintiffs || [];
        const defendants = arbitrationData.defendants || [];

        const plaintiff = plaintiffs.find(p => p && p.email === currentUserEmail);
        if (plaintiff) {
            return { 
                role: 'plaintiff', 
                data: plaintiff, 
                index: plaintiffs.indexOf(plaintiff) 
            };
        }
        
        const defendant = defendants.find(d => d && d.email === currentUserEmail);
        if (defendant) {
            return { 
                role: 'defendant', 
                data: defendant, 
                index: defendants.indexOf(defendant) 
            };
        }
        
        return null;
    };

    const userInfo = getUserRoleAndRepresentatives();
    const representatives = userInfo?.data?.representatives || [];
    const activeRepresentatives = representatives.filter(rep => rep.case_status === 'running');
    const cancelledRepresentatives = representatives.filter(rep => rep.case_status === 'cancelled');

    const handleAddRepresentative = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const formData = new FormData(e.target);
            
            const newRepresentative = {
                name: formData.get('name'),
                email: formData.get('email'),
                designation: formData.get('designation'),
                phone: formData.get('phone')
            };

            const response = await axiosSecure.patch(`/add-representative/${caseId}`, {
                email: currentUserEmail,
                representative: newRepresentative
            });

            if (response.data.success) {
                alert('Representative added successfully!');
                setShowAddRepresentative(false);
                e.target.reset();
                if (onUpdateArbitration) {
                    onUpdateArbitration(response.data.arbitration);
                }
            } else {
                alert(`Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Error adding representative:', error);
            if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                alert('Error adding representative. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRepresentative = async (representativeId) => {
        if (!userInfo || !confirm('Are you sure you want to remove this representative?')) return;
        
        setLoading(true);
        
        try {
            const response = await axiosSecure.patch(`/remove-representative/${caseId}`, {
                email: currentUserEmail,
                representativeId: representativeId
            });

            if (response.data.success) {
                alert('Representative removed successfully!');
                if (onUpdateArbitration) {
                    onUpdateArbitration(response.data.arbitration);
                }
            } else {
                alert(`Error: ${response.data.error}`);
            }
        } catch (error) {
            console.error('Error removing representative:', error);
            alert('Error removing representative. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state if arbitrationData is not available
    if (!arbitrationData) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="text-center py-12">
                    <div className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-8 w-64 mx-auto mb-4"></div>
                        <div className="bg-gray-200 rounded-lg h-4 w-48 mx-auto mb-2"></div>
                        <div className="bg-gray-200 rounded-lg h-4 w-32 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user is part of this arbitration case
    if (!userInfo) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="text-center py-12">
                    <div className="bg-yellow-50 rounded-2xl p-8 max-w-md mx-auto">
                        <FaUserTie className="mx-auto text-6xl text-yellow-300 mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h3>
                        <p className="text-gray-500 mb-6">
                            You are not associated with this arbitration case as a plaintiff or defendant.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        <FaUserTie className="inline mr-3 text-purple-600" />
                        My Representatives
                    </h2>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setShowAddRepresentative(true)}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaUserPlus className="inline mr-2" />
                        {loading ? 'Adding...' : 'Add Representative'}
                    </button>
                </div>
            </div>

            {/* Add Representative Form */}
            {showAddRepresentative && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <FaUserPlus className="text-purple-600 text-xl mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900">Add New Representative</h3>
                        </div>
                        <button 
                            onClick={() => setShowAddRepresentative(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>
                    <form onSubmit={handleAddRepresentative} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                    placeholder="Enter representative's full name" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                    placeholder="Enter representative's email" 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
                                <input 
                                    type="text" 
                                    name="designation"
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                    placeholder="Enter designation" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
                                    placeholder="Enter phone number" 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-700 text-sm">
                                <strong>Note:</strong> A representative with the same email or phone number cannot be assigned to multiple parties in this case.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t border-purple-200">
                            <button 
                                type="button" 
                                onClick={() => setShowAddRepresentative(false)}
                                disabled={loading}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg disabled:opacity-50"
                            >
                                <FaUserPlus className="inline mr-2" />
                                {loading ? 'Adding...' : 'Add Representative'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Active Representatives */}
            {activeRepresentatives.length > 0 ? (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Representatives ({activeRepresentatives.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeRepresentatives.map((representative) => (
                            <div key={representative._id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 relative">
                                <button
                                    onClick={() => handleRemoveRepresentative(representative._id)}
                                    disabled={loading}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 disabled:opacity-50"
                                    title="Remove Representative"
                                >
                                    <FaUserMinus className="text-lg" />
                                </button>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <FaUserTie className="text-green-600 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Name</p>
                                            <p className="text-gray-600">{representative.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaEnvelope className="text-green-600 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Email</p>
                                            <p className="text-gray-600">{representative.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaBriefcase className="text-green-600 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Designation</p>
                                            <p className="text-gray-600">{representative.designation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaPhone className="text-green-600 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Phone</p>
                                            <p className="text-gray-600">{representative.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Active
                                    </span>
                                    {representative.addedAt && (
                                        <p className="text-gray-500 text-sm mt-2">
                                            Added: {new Date(representative.addedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 mb-8">
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                        <FaUserTie className="mx-auto text-6xl text-gray-300 mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Representatives</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't assigned any representatives for this arbitration case yet.
                        </p>
                    </div>
                </div>
            )}

            {/* Cancelled Representatives */}
            {cancelledRepresentatives.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Representatives ({cancelledRepresentatives.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cancelledRepresentatives.map((representative) => (
                            <div key={representative._id} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <FaUserTie className="text-gray-500 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Name</p>
                                            <p className="text-gray-600">{representative.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaEnvelope className="text-gray-500 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Email</p>
                                            <p className="text-gray-600">{representative.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaBriefcase className="text-gray-500 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Designation</p>
                                            <p className="text-gray-600">{representative.designation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaPhone className="text-gray-500 mr-3 text-xl" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Phone</p>
                                            <p className="text-gray-600">{representative.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Cancelled
                                    </span>
                                    {representative.removedAt && (
                                        <p className="text-gray-500 text-sm mt-2">
                                            Removed: {new Date(representative.removedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arb_RepresentativeSection;