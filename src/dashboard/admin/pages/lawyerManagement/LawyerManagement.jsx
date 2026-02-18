import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import LawyerCard from "./LawyerCard";
import LawyerModal from "./LawyerModal";
import PageHeader from "../../components/PageHeader";

const LawyerManagement = () => {
    const img_hosting_key = import.meta.env.VITE_IMG_HOSTING_KEY;
    const img_hosting_api = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const { data: lawyers = [], refetch } = useQuery({
        queryKey: ["lawyers"],
        queryFn: async () => {
            const res = await axiosSecure.get("/all-lawyers");
            return res.data;
        },
    });

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        image: "",
        gender: "Male",
        languages: [],
        specialization: [],
        bar_id: "",
        fee: "",
        description: "",
        court: "",
        experience: "",
        successRate: "",
        casesHandled: "",
        rating: "",
        qualification: "",
    });

    // Filter lawyers based on search term
    const filteredLawyers = useMemo(() => {
        if (!searchTerm) return lawyers;

        const lowercasedSearch = searchTerm.toLowerCase();
        return lawyers.filter(
            (lawyer) =>
                lawyer.name.toLowerCase().includes(lowercasedSearch) ||
                lawyer.email.toLowerCase().includes(lowercasedSearch) ||
                lawyer.bar_id.toLowerCase().includes(lowercasedSearch) ||
                lawyer.court.toLowerCase().includes(lowercasedSearch) ||
                lawyer.qualification.toLowerCase().includes(lowercasedSearch) ||
                lawyer.specialization.some((spec) =>
                    spec.toLowerCase().includes(lowercasedSearch)
                ) ||
                lawyer.languages.some((lang) =>
                    lang.toLowerCase().includes(lowercasedSearch)
                )
        );
    }, [lawyers, searchTerm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleArrayInput = (e, field) => {
        const value = e.target.value;
        const array = value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        setFormData((prev) => ({
            ...prev,
            [field]: array,
        }));
    };

    const uploadImageToImgBB = async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append("image", imageFile);

            const response = await fetch(img_hosting_api, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                return data.data.url;
            } else {
                throw new Error(data.error?.message || "Image upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error("Failed to upload image. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalFormData = { ...formData };

            // If there's an image file to upload (from file input)
            if (formData.imageFile) {
                try {
                    const imageUrl = await uploadImageToImgBB(
                        formData.imageFile
                    );
                    finalFormData.image = imageUrl;
                } catch (error) {
                    alert(error.message);
                    setIsSubmitting(false);
                    return;
                }
            }

            // Clean up the data before sending
            delete finalFormData.imageFile;

            // Convert string numbers to actual numbers
            const numericFields = [
                "fee",
                "experience",
                "successRate",
                "casesHandled",
                "rating",
            ];
            numericFields.forEach((field) => {
                if (finalFormData[field]) {
                    finalFormData[field] = Number(finalFormData[field]);
                }
            });

            // Ensure arrays are properly formatted
            if (!Array.isArray(finalFormData.languages)) {
                finalFormData.languages = finalFormData.languages
                    ? finalFormData.languages
                          .split(",")
                          .map((item) => item.trim())
                          .filter((item) => item)
                    : [];
            }

            if (!Array.isArray(finalFormData.specialization)) {
                finalFormData.specialization = finalFormData.specialization
                    ? finalFormData.specialization
                          .split(",")
                          .map((item) => item.trim())
                          .filter((item) => item)
                    : [];
            }

            const response = await axiosSecure.post(
                "/add-lawyer",
                finalFormData
            );

            if (response.data.insertedId) {
                toast.success("Lawyer added successfully!");
                refetch();
                closeModal();
            } else {
                toast.error(
                    response.data.message ||
                        "Failed to add lawyer. Please try again."
                );
            }
        } catch (error) {
            console.error("Error adding lawyer:", error);
            toast.error("An error occurred while adding the lawyer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (lawyer) => {
        // Redirect to LawyerProfile page with lawyer email as parameter
        navigate(`/dashboard/lawyer-profile/${lawyer.email}`);
    };

    const handleDelete = async (email) => {
        if (window.confirm("Are you sure you want to delete this lawyer?")) {
            try {
                await axiosSecure.delete(`/remove-lawyer/${email}`);
                toast.success("Lawyer deleted successfully!");
                refetch();
            } catch (error) {
                console.error("Error deleting lawyer:", error);
                toast.error("Failed to delete lawyer. Please try again.");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            image: "",
            gender: "Male",
            languages: [],
            specialization: [],
            bar_id: "",
            fee: "",
            description: "",
            court: "",
            experience: "",
            successRate: "",
            casesHandled: "",
            rating: "",
            qualification: "",
        });
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <PageHeader
                    onAddLawyer={openAddModal}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                />

                {/* Statistics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">
                            {filteredLawyers.length}
                        </div>
                        <div className="text-gray-600 text-sm">
                            {searchTerm ? "Filtered Lawyers" : "Total Lawyers"}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-600">
                            {
                                filteredLawyers.filter((l) => l.experience >= 5)
                                    .length
                            }
                        </div>
                        <div className="text-gray-600 text-sm">
                            Experienced (5+ years)
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600">
                            {filteredLawyers.length > 0
                                ? Math.round(
                                      (filteredLawyers.reduce(
                                          (acc, lawyer) => acc + lawyer.rating,
                                          0
                                      ) /
                                          filteredLawyers.length) *
                                          10
                                  ) / 10
                                : 0}
                        </div>
                        <div className="text-gray-600 text-sm">
                            Average Rating
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-100">
                        <div className="text-2xl font-bold text-orange-600">
                            {filteredLawyers.reduce(
                                (acc, lawyer) => acc + lawyer.casesHandled,
                                0
                            )}
                        </div>
                        <div className="text-gray-600 text-sm">Total Cases</div>
                    </div>
                </div>

                {/* Search Results Info */}
                {searchTerm && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-blue-700">
                            Showing {filteredLawyers.length} lawyer
                            {filteredLawyers.length !== 1 ? "s" : ""}
                            matching "
                            <span className="font-semibold">{searchTerm}</span>"
                            {filteredLawyers.length === 0 &&
                                " - No lawyers found"}
                        </p>
                    </div>
                )}

                {/* Lawyers Grid */}
                {filteredLawyers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">⚖️</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm
                                ? "No Lawyers Found"
                                : "No Lawyers Found"}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm
                                ? "Try adjusting your search terms or browse all lawyers."
                                : "Get started by adding your first lawyer to the system."}
                        </p>
                        {searchTerm ? (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Clear Search
                            </button>
                        ) : (
                            <button
                                onClick={openAddModal}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Add Your First Lawyer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredLawyers.map((lawyer) => (
                            <LawyerCard
                                key={lawyer._id}
                                lawyer={lawyer}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                searchTerm={searchTerm}
                            />
                        ))}
                    </div>
                )}

                {/* Add Modal Only - No Edit Modal */}
                <LawyerModal
                    show={showModal}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onArrayInput={handleArrayInput}
                    isEditing={false}
                    resetForm={resetForm}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default LawyerManagement;
