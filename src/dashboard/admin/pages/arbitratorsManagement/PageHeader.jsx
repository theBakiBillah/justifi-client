import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";

const PageHeader = ({ onAddArbitrator, onSearch, searchTerm }) => {
    const handleSearchChange = (e) => {
        onSearch(e.target.value);
    };

    const clearSearch = () => {
        onSearch("");
    };

    return (
        <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Manage Arbitrators
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Oversee and manage all legal professionals in your
                        system
                    </p>
                </div>
                <button
                    onClick={onAddArbitrator}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                >
                    <FaPlus className="text-lg" />
                    Add New Arbitrator
                </button>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search arbitrators by name, specialization, court..."
                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Search by name, email, specialization, court, languages, or
                    qualification
                </p>
            </div>
        </div>
    );
};

export default PageHeader;
