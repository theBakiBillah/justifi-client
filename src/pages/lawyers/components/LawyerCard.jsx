import { FaBriefcase, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LawyerCard = ({ lawyer }) => {
    const rating = lawyer.rating || 4.5;
    const experience = lawyer.experience || "5+ Years";

    // Safe way to display specialization
    const displaySpecialization = () => {
        if (!lawyer?.specialization) return "Not specified";
        if (Array.isArray(lawyer.specialization)) {
            return lawyer.specialization.join(", ");
        }
        if (typeof lawyer.specialization === "string") {
            return lawyer.specialization;
        }
        return "Not specified";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className="group bg-white rounded-2xl border border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all duration-500 overflow-hidden relative"
        >
            {/* Lawyer Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={lawyer.image}
                    alt={lawyer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

                {/* Floating Badge */}
                <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Top Rated
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Name and Specialization */}
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors duration-300">
                        {lawyer.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1 italic">
                        {displaySpecialization()}
                    </p>
                </div>

                {/* Key Details */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                        <FaBriefcase className="mr-2 text-amber-500" />
                        <span>{experience} experience</span>
                    </div>
                    {lawyer.court && (
                        <div className="flex items-center text-sm text-gray-700">
                            <FaMapMarkerAlt className="mr-2 text-amber-500" />
                            <span className="line-clamp-1">{lawyer.court}</span>
                        </div>
                    )}
                </div>

                {/* Rating and Fee */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-1">
                        <FaStar className="text-amber-500 text-lg" />
                        <span className="font-semibold text-gray-900">
                            {rating}
                        </span>
                        <span className="text-gray-500">/5</span>
                    </div>
                    <div className="bg-gray-100 text-gray-900 font-bold px-3 py-1 rounded-md shadow-sm">
                        {lawyer.fee}
                    </div>
                </div>

                {/* View Profile Button */}
                <Link
                    to={`/lawyers/${lawyer._id}`}
                    state={{ lawyer }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-md transition-colors duration-300"
                    >
                        View Profile
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
};

export default LawyerCard;