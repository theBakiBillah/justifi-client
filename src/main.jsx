import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import Dashboard from "./dashboard/Dashboard";
import LawyerAppointments from "./dashboard/lawyerDasgboard/pages/LawyerAppointments";
import LawyerProfile from "./dashboard/lawyerDasgboard/pages/LawyerProfile";
import UserAppointments from "./dashboard/userDashboard/pages/UserAppointments";
import "./index.css";
import Arbitration from "./pages/arbitration/Arbitration";
import ArbitrationProcess from "./pages/arbitration/components/ArbitrationProcess";
import PaymentFailed from "./pages/payment/PaymentFailed";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import Arbitrator from "./pages/arbitrator/Arbitrator";
import ArbitratorDetails from "./pages/arbitrator/components/ArbitratorDetails";
import Login from "./pages/auth/Login";
import Registration from "./pages/auth/Registration";
import Blog from "./pages/blog/Blog";
import BlogDetails from "./pages/blog/components/BlogDetails";
import Home from "./pages/Home/Home";
import BookLawyer from "./pages/lawyers/BookLawyer";
import Lawyer from "./pages/lawyers/Lawyer";
import LawyerDetails from "./pages/lawyers/LawyerDetails";
import MediationProcess from "./pages/mediation/components/MediationProcess";
import Mediation from "./pages/mediation/Mediation";
import MediatorDetails from "./pages/mediator/components/MediatorDetails";
import Mediator from "./pages/mediator/Mediator";
import AuthProvider from "./providers/AuthProviders";
import Root from "./routes/Root";
import MyArbitrations from "./dashboard/userDashboard/pages/MyArbitrations";
import ArbitrationDetails from "./dashboard/userDashboard/pages/ArbitrationDetails";
import AllUsers from "./dashboard/admin/pages/AllUsers";
import UserProfile from "./dashboard/userDashboard/pages/UserProfile";
import LawyerManagement from "./dashboard/admin/pages/lawyerManagement/LawyerManagement";
import ArbitratorManagement from "./dashboard/admin/pages/arbitratorsManagement/ArbitratorManagement";
import MediatorManagement from "./dashboard/admin/pages/MediatorManagement";
import ArbitrationsManagement from "./dashboard/admin/pages/arbitrationManagement/ArbitrationsManagement";
import AdminArbitrationDetails from "./dashboard/admin/pages/arbitrationManagement/AdminArbitrationDetails";
import Arbitration_Agreement from "./dashboard/admin/pages/Arbitration_Agreement";
import Mediation_Agreement from "./dashboard/admin/pages/Mediation_Agreement";
import AboutUs from "./pages/about/AboutUs";
import LawyerArbitration from "./dashboard/lawyerDasgboard/pages/LawyerArbitration";
import LawyerArbitrationDetails from "./dashboard/lawyerDasgboard/pages/LawyerArbitrationDetails";
import ArbitratorProfile from "./dashboard/arbitratorDashboard/pages/ArbitratorProfile";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route path="/" element={<Root />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/lawyers" element={<Lawyer />} />
                        <Route
                            path="lawyers/:lawyerId"
                            element={<LawyerDetails />}
                        />
                        <Route
                            path="/book-lawyer/:lawyerId"
                            element={<BookLawyer />}
                        />

                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:blogId" element={<BlogDetails />} />
                        <Route path="/arbitrators" element={<Arbitrator />} />
                        <Route
                            path="/arbitrators/:arbitratorID"
                            element={<ArbitratorDetails />}
                        />
                        <Route path="/mediators" element={<Mediator />} />
                        <Route
                            path="/mediators/:mediatorsobj"
                            element={<MediatorDetails />}
                        />
                        <Route
                            path="/arbitration-process"
                            element={<ArbitrationProcess />}
                        />
                        <Route path="/arbitration" element={<Arbitration />} />
                        <Route
                            path="/mediation-process"
                            element={<MediationProcess />}
                        />
                        <Route path="/mediation" element={<Mediation />} />
                        <Route
                            path="/payment/success/:id"
                            element={<PaymentSuccess />}
                        />
                        <Route
                            path="/payment/fail/:id"
                            element={<PaymentFailed />}
                        />
                    </Route>

                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route index element={<Dashboard />} />
                        <Route
                            path="lawyer-profile/:email"
                            element={<LawyerProfile />}
                        />
                        <Route
                            path="arbitrator-profile/:email"
                            element={<ArbitratorProfile />}
                        />
                        <Route
                            path="appointments"
                            element={<LawyerAppointments />}
                        />
                        <Route path="user-profile" element={<UserProfile />} />
                        <Route
                            path="my-appointments"
                            element={<UserAppointments />}
                        />
                        <Route
                            path="my-arbitrations"
                            element={<MyArbitrations />}
                        />
                        <Route
                            path="my-arbitrations/:id"
                            element={<ArbitrationDetails />}
                        />
                        <Route
                            path="lawyer-arbitrations"
                            element={<LawyerArbitration />}
                        />
                        <Route
                            path="lawyer-arbitrations/:id"
                            element={<LawyerArbitrationDetails />}
                        />
                    </Route>

                    {/* Admin routes */}
                    <Route path="/admin" element={<Dashboard />}>
                        <Route path="all-users" element={<AllUsers />} />
                        <Route
                            path="all-lawyers"
                            element={<LawyerManagement />}
                        />
                        <Route
                            path="all-arbitrators"
                            element={<ArbitratorManagement />}
                        />
                        <Route
                            path="all-mediators"
                            element={<MediatorManagement />}
                        />
                        <Route
                            path="arbitrations-management"
                            element={<ArbitrationsManagement />}
                        />
                        <Route
                            path="arbitrations/:id"
                            element={<AdminArbitrationDetails />}
                        />
                        <Route
                            path="mediation-agreement/:caseId"
                            element={<Mediation_Agreement />}
                        />
                        <Route
                            path="arbitration-agreement/:caseId"
                            element={<Arbitration_Agreement />}
                        />
                    </Route>
                </Routes>
            </QueryClientProvider>
        </AuthProvider>
        <ToastContainer />
    </BrowserRouter>
);
