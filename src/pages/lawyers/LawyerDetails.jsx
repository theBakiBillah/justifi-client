import { FaGraduationCap } from "react-icons/fa";
import { FaLocationDot, FaStar } from "react-icons/fa6";
import { GrLanguage, GrUserExpert } from "react-icons/gr";
import { TbCoinTaka } from "react-icons/tb";
import { Link, useLocation } from "react-router";
import useUserData from "../../hooks/useUserData";

export default function LawyerDetails() {
    const { currentUser } = useUserData(); // Fetch current user
    const location = useLocation();
    const lawyer = location.state?.lawyer;

    if (!lawyer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-600">No lawyer data found.</p>
            </div>
        );
    }

    // Helper function to safely display array fields
    const displayArrayField = (field) => {
        if (!field) return "Not specified";
        if (Array.isArray(field)) {
            return field.join(", ");
        }
        if (typeof field === "string") {
            return field;
        }
        return "Not specified";
    };

    return (
        <div className="bg-white text-gray-900">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-2 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Left Content */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {`I'm ${lawyer.name}`}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 mb-6">
                        {lawyer.court || "Court not specified"}
                    </p>
                    <p className="text-gray-600 mb-6">{lawyer.description || "No description available."}</p>

                    {/* Show Book Appointment only if currentUser is not a lawyer */}
                    {currentUser?.role !== "lawyer" && (
                        <Link
                            to={`/book-lawyer/${lawyer._id}`}
                            state={{ lawyer }}
                            className="border-2 border-[#a58a51] px-6 py-3 font-semibold hover:bg-[#a58a51] hover:text-white transition"
                        >
                            Book Appointment
                        </Link>
                    )}
                </div>

                {/* Right Image + Info */}
                <div className="text-center">
                    <img
                        src={lawyer.image}
                        alt={lawyer.name}
                        className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    />
                    <div className="mt-3 space-y-2 flex justify-center gap-40">
                        <p className="text-lg font-medium flex justify-center items-center gap-1.5">
                            <TbCoinTaka />
                            <span className="font-semibold">{lawyer.fee || "Not specified"}</span>
                        </p>
                        <p className="text-lg font-medium flex justify-center items-center gap-1.5">
                            <FaStar className="font-semibold text-yellow-300" />
                            <span className="font-semibold text-yellow-600">
                                {lawyer.rating || "4.5"}
                            </span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Qualification */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                    <h3 className="text-lg font-semibold mb-2 flex justify-center items-center gap-1.5">
                        <FaGraduationCap /> Qualification
                    </h3>
                    <p className="text-gray-600">{lawyer.qualification || "Not specified"}</p>
                </div>

                {/* Specialization */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                    <h3 className="text-lg font-semibold mb-2 flex justify-center items-center gap-1.5">
                        <GrUserExpert /> Specialization
                    </h3>
                    <p className="text-gray-600">{displayArrayField(lawyer.specialization)}</p>
                </div>

                {/* Address */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                    <h3 className="text-lg font-semibold mb-2 flex justify-center items-center gap-1.5">
                        <FaLocationDot /> Address
                    </h3>
                    <p className="text-gray-600">{lawyer.address || "Not specified"}</p>
                </div>

                {/* Preferred Language */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                    <h3 className="text-lg font-semibold mb-2 flex justify-center items-center gap-1.5">
                        <GrLanguage /> Preferred Language
                    </h3>
                    <p className="text-gray-600">{displayArrayField(lawyer.languages)}</p>
                </div>
            </section>
        </div>
    );
}