import { useEffect, useRef, useState } from "react";
import {
    FaAward,
    FaCheckCircle,
    FaExclamationTriangle,
    FaGraduationCap,
    FaTimes,
    FaTrash,
    FaUpload,
    FaUser
} from "react-icons/fa";

const ArbitratorModal = ({
    show,
    onClose,
    onSubmit,
    formData,
    onInputChange,
    onArrayInput,
    resetForm,
    isEditing = false,
}) => {
    const [imagePreview, setImagePreview] = useState(formData.image || "");
    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    const totalSteps = 4;

    // Update local form data when formData prop changes
    useEffect(() => {
        setImagePreview(formData.image || "");
    }, [formData]);

    // Reset form when modal closes
    useEffect(() => {
        if (!show) {
            setCurrentStep(1);
            setFormErrors({});
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [show]);

    if (!show) return null;

    // Validation functions
    const validateStep = (step) => {
        const errors = {};

        switch (step) {
            case 1: // Profile Image - No required validation for image
                // Image is optional, so no validation needed
                break;

            case 2: // Personal Information
                if (!formData.name?.trim())
                    errors.name = "Full name is required";
                if (!formData.email?.trim()) {
                    errors.email = "Email is required";
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    errors.email = "Email is invalid";
                }
                if (!formData.phone?.trim())
                    errors.phone = "Phone number is required";
                if (!formData.address?.trim())
                    errors.address = "Address is required";
                break;

            case 3: // Professional Information
                if (!formData.qualification?.trim())
                    errors.qualification = "Qualification is required";
                if (formData.fee && formData.fee < 0)
                    errors.fee = "Fee cannot be negative";
                if (formData.experience && formData.experience < 0)
                    errors.experience = "Experience cannot be negative";
                if (
                    formData.successRate &&
                    (formData.successRate < 0 || formData.successRate > 100)
                ) {
                    errors.successRate = "Success rate must be between 0-100%";
                }
                if (
                    formData.rating &&
                    (formData.rating < 0 || formData.rating > 5)
                ) {
                    errors.rating = "Rating must be between 0-5";
                }
                break;

            case 4: // Professional Details
                if (!formData.description?.trim())
                    errors.description = "Professional biography is required";
                if (!formData.specialization?.length)
                    errors.specialization =
                        "At least one specialization is required";
                break;

            default:
                break;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
            ];
            if (!validTypes.includes(file.type)) {
                setFormErrors((prev) => ({
                    ...prev,
                    image: "Please select a valid image file (JPEG, PNG, WEBP)",
                }));
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setFormErrors((prev) => ({
                    ...prev,
                    image: "Image size must be less than 5MB",
                }));
                return;
            }

            // Clear any previous image errors
            setFormErrors((prev) => ({ ...prev, image: "" }));

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Store the file for upload
            onInputChange({
                target: {
                    name: "imageFile",
                    value: file,
                },
            });

            // Also set the preview URL for display
            onInputChange({
                target: {
                    name: "image",
                    value: previewUrl,
                },
            });
        }
    };

    const handleRemoveImage = () => {
        setImagePreview("");
        onInputChange({
            target: {
                name: "image",
                value: "",
            },
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageUrlChange = (e) => {
        setImagePreview(e.target.value);
        onInputChange(e);
        // Clear image error when URL is provided
        if (e.target.value.trim()) {
            setFormErrors((prev) => ({ ...prev, image: "" }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageChange({ target: { files } });
        }
    };

    const handleCancel = () => {
        setImagePreview("");
        setCurrentStep(1);
        setFormErrors({});

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (resetForm) {
            resetForm();
        }

        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate all steps before final submission
        let allValid = true;
        for (let step = 1; step <= totalSteps; step++) {
            if (!validateStep(step)) {
                allValid = false;
            }
        }

        if (allValid) {
            onSubmit(e);
        } else {
            // If there are errors, stay on current step and show errors
            validateStep(currentStep);
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            // Clear errors when moving to next step
            setFormErrors({});
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
        // Clear errors when going back
        setFormErrors({});
    };

    const getStepStatus = (step) => {
        if (step < currentStep) return "completed";
        if (step === currentStep) return "current";
        return "upcoming";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {isEditing
                                    ? "Edit Arbitrator"
                                    : "Add New Arbitrator"}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {isEditing
                                    ? "Update arbitrator profile"
                                    : "Create new arbitrator profile"}{" "}
                                - Step {currentStep} of {totalSteps}
                            </p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className="flex items-center flex-1"
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                                            getStepStatus(step) === "completed"
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : getStepStatus(step) ===
                                                  "current"
                                                ? "border-blue-600 text-blue-600 bg-white"
                                                : "border-gray-300 text-gray-500 bg-white"
                                        }`}
                                    >
                                        {getStepStatus(step) === "completed" ? (
                                            <FaCheckCircle className="text-xs" />
                                        ) : (
                                            step
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium ${
                                            getStepStatus(step) === "current"
                                                ? "text-blue-600"
                                                : getStepStatus(step) ===
                                                  "completed"
                                                ? "text-gray-900"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {step === 1 && "Profile Image"}
                                        {step === 2 && "Personal Info"}
                                        {step === 3 && "Professional Info"}
                                        {step === 4 && "Final Details"}
                                    </span>
                                </div>
                                {step < totalSteps && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${
                                            currentStep > step
                                                ? "bg-blue-600"
                                                : "bg-gray-200"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-8">
                        {/* Step 1: Profile Image */}
                        {currentStep === 1 && (
                            <Section
                                title="Profile Image"
                                stepNumber={1}
                                description="Upload a professional headshot or provide image URL (Optional)"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Image Upload Area */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Upload Image
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                                imagePreview
                                                    ? "border-green-500 bg-green-50"
                                                    : formErrors.image
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                            }`}
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/jpeg, image/jpg, image/png, image/webp"
                                                className="hidden"
                                            />

                                            {imagePreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-32 h-32 rounded-lg object-cover shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage();
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md"
                                                    >
                                                        <FaTrash className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                        <FaUpload className="text-gray-400 text-lg" />
                                                    </div>
                                                    <p className="text-gray-600 font-medium mb-1">
                                                        Click to upload image
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        JPEG, PNG, WEBP (Max
                                                        5MB)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.image && (
                                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                                <FaExclamationTriangle className="text-xs" />
                                                {formErrors.image}
                                            </p>
                                        )}
                                    </div>

                                    {/* Image URL Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Or provide image URL
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="url"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleImageUrlChange}
                                                placeholder="https://example.com/profile-image.jpg"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <p className="text-gray-500 text-xs">
                                                Enter direct link to profile
                                                image
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        )}

                        {/* Step 2: Personal Information */}
                        {currentStep === 2 && (
                            <Section
                                title="Personal Information"
                                stepNumber={2}
                                icon={<FaUser className="text-blue-600" />}
                                description="Basic personal and contact information"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Full Name *"
                                        name="name"
                                        value={formData.name}
                                        onChange={onInputChange}
                                        error={formErrors.name}
                                        required
                                        placeholder="John Doe"
                                    />
                                    <InputField
                                        label="Email Address *"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={onInputChange}
                                        error={formErrors.email}
                                        required
                                        placeholder="john.doe@arbitration.com"
                                    />
                                    <InputField
                                        label="Phone Number *"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={onInputChange}
                                        error={formErrors.phone}
                                        required
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    <SelectField
                                        label="Gender *"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={onInputChange}
                                        error={formErrors.gender}
                                        required
                                        options={["Male", "Female", "Other"]}
                                    />
                                    <InputField
                                        label="Office Address *"
                                        name="address"
                                        value={formData.address}
                                        onChange={onInputChange}
                                        error={formErrors.address}
                                        required
                                        className="md:col-span-2"
                                        placeholder="123 Arbitration Center, Suite 100, New York, NY"
                                    />
                                </div>
                            </Section>
                        )}

                        {/* Step 3: Professional Information */}
                        {currentStep === 3 && (
                            <Section
                                title="Professional Information"
                                stepNumber={3}
                                icon={<FaAward className="text-blue-600" />}
                                description="Professional credentials and experience"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Qualification *"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={onInputChange}
                                        error={formErrors.qualification}
                                        required
                                        placeholder="LLB, LLM from University of London"
                                    />
                                    <InputField
                                        label="Consultation Fee ($)"
                                        type="number"
                                        name="fee"
                                        value={formData.fee}
                                        onChange={onInputChange}
                                        error={formErrors.fee}
                                        placeholder="300"
                                        min="0"
                                    />
                                    <InputField
                                        label="Experience (Years)"
                                        type="number"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={onInputChange}
                                        error={formErrors.experience}
                                        placeholder="10"
                                        min="0"
                                    />
                                    <InputField
                                        label="Success Rate (%)"
                                        type="number"
                                        name="successRate"
                                        value={formData.successRate}
                                        onChange={onInputChange}
                                        error={formErrors.successRate}
                                        placeholder="90"
                                        min="0"
                                        max="100"
                                    />
                                    <InputField
                                        label="Cases Handled"
                                        type="number"
                                        name="casesHandled"
                                        value={formData.casesHandled}
                                        onChange={onInputChange}
                                        placeholder="200"
                                        min="0"
                                    />
                                    <InputField
                                        label="Rating"
                                        type="number"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={onInputChange}
                                        error={formErrors.rating}
                                        placeholder="4.8"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                    />
                                </div>
                            </Section>
                        )}

                        {/* Step 4: Professional Details */}
                        {currentStep === 4 && (
                            <Section
                                title="Professional Details"
                                stepNumber={4}
                                icon={
                                    <FaGraduationCap className="text-blue-600" />
                                }
                                description="Finalize professional biography and specialties"
                            >
                                <div className="space-y-6">
                                    <ArrayInputField
                                        label="Languages"
                                        placeholder="English, Spanish, French, Arabic"
                                        defaultValue={
                                            formData.languages?.join(", ") || ""
                                        }
                                        onChange={(e) =>
                                            onArrayInput(e, "languages")
                                        }
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Areas of Specialization *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Commercial Arbitration, International Disputes, Construction Law"
                                            value={
                                                formData.specialization?.join(
                                                    ", "
                                                ) || ""
                                            }
                                            onChange={(e) =>
                                                onArrayInput(
                                                    e,
                                                    "specialization"
                                                )
                                            }
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                                formErrors.specialization
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-gray-300 focus:border-blue-500"
                                            }`}
                                        />
                                        {formErrors.specialization && (
                                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                                <FaExclamationTriangle className="text-xs" />
                                                {formErrors.specialization}
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-2">
                                            Separate specializations with commas
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Professional Biography *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={onInputChange}
                                            rows="4"
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                                                formErrors.description
                                                    ? "border-red-300 focus:border-red-500"
                                                    : "border-gray-300 focus:border-blue-500"
                                            }`}
                                            placeholder="Describe professional background, arbitration expertise, notable cases, and achievements..."
                                        />
                                        {formErrors.description && (
                                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                                <FaExclamationTriangle className="text-xs" />
                                                {formErrors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Back
                                </button>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                                >
                                    {isEditing
                                        ? "Update Arbitrator Profile"
                                        : "Create Arbitrator Profile"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Professional Reusable Form Components
const Section = ({ title, children, icon, stepNumber, description }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    {stepNumber && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            Step {stepNumber}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-gray-600 text-sm">{description}</p>
                )}
            </div>
        </div>
        {children}
    </div>
);

const InputField = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    error,
    required,
    className = "",
    placeholder,
    ...props
}) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
            }`}
            {...props}
        />
        {error && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" />
                {error}
            </p>
        )}
    </div>
);

const SelectField = ({
    label,
    name,
    value,
    onChange,
    options,
    error,
    required,
    className = "",
}) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white ${
                error
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
            }`}
        >
            <option value="">Select {label}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
        {error && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" />
                {error}
            </p>
        )}
    </div>
);

const ArrayInputField = ({ label, placeholder, defaultValue, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <input
            type="text"
            placeholder={placeholder}
            defaultValue={defaultValue}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <p className="text-gray-500 text-xs mt-2">Separate items with commas</p>
    </div>
);

export default ArbitratorModal;
