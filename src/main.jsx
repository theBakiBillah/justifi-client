import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "./index.css";
// Providers & Layout
import AuthProvider from "./providers/AuthProviders";
import Root from "./routes/Root";
import Dashboard from "./dashboard/Dashboard";
// ================= PUBLIC PAGES =================
import Home from "./pages/Home/Home";
import Login from "./pages/auth/Login";
import Registration from "./pages/auth/Registration";
import AboutUs from "./pages/about/AboutUs";
import Blog from "./pages/blog/Blog";
import BlogDetails from "./pages/blog/components/BlogDetails";
import Lawyer from "./pages/lawyers/Lawyer";
import LawyerDetails from "./pages/lawyers/LawyerDetails";
import BookLawyer from "./pages/lawyers/BookLawyer";
import Arbitrator from "./pages/arbitrator/Arbitrator";
import ArbitratorDetails from "./pages/arbitrator/components/ArbitratorDetails";
import Mediator from "./pages/mediator/Mediator";
import MediatorDetails from "./pages/mediator/components/MediatorDetails";
import Arbitration from "./pages/arbitration/Arbitration";
import ArbitrationProcess from "./pages/arbitration/components/ArbitrationProcess";
import Mediation from "./pages/mediation/Mediation";
import MediationProcess from "./pages/mediation/components/MediationProcess";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentFailed from "./pages/payment/PaymentFailed";
// ================= USER DASHBOARD =================
import UserProfile from "./dashboard/userDashboard/pages/UserProfile";
import UserAppointments from "./dashboard/userDashboard/pages/UserAppointments";
import MyArbitrations from "./dashboard/userDashboard/pages/MyArbitrations";
import ArbitrationDetails from "./dashboard/userDashboard/pages/ArbitrationDetails";
import MyMediation from "./dashboard/userDashboard/pages/MyMediation";
import MediationDetails from "./dashboard/userDashboard/pages/MediationDetails";
// ================= LAWYER DASHBOARD =================
import LawyerProfile from "./dashboard/lawyerDasgboard/pages/LawyerProfile";
import LawyerAppointments from "./dashboard/lawyerDasgboard/pages/LawyerAppointments";
import LawyerArbitration from "./dashboard/lawyerDasgboard/pages/LawyerArbitration";
import LawyerArbitrationDetails from "./dashboard/lawyerDasgboard/pages/LawyerArbitrationDetails";
import LawyerTimeSlots from "./dashboard/lawyerDasgboard/pages/lawyerTimeSlots/LawyerTimeSlots";
// ================= ARBITRATOR DASHBOARD =================
import ArbitratorProfile from "./dashboard/arbitratorDashboard/pages/ArbitratorProfile";
// ================= ADMIN DASHBOARD =================
import AllUsers from "./dashboard/admin/pages/AllUsers";
import LawyerManagement from "./dashboard/admin/pages/lawyerManagement/LawyerManagement";
import ArbitratorManagement from "./dashboard/admin/pages/arbitratorsManagement/ArbitratorManagement";
import MediatorManagement from "./dashboard/admin/pages/MediatorManagement";
import MyArbitrationFile from "./dashboard/ArbitratorDashboard/pages/MyArbitrationFile"; 
import ArbitrationDetail from "./dashboard/ArbitratorDashboard/pages/ArbitrationDetail";
 import Notification from "./dashboard/ArbitratorDashboard/pages/Notification";
import Finance from "./dashboard/ArbitratorDashboard/pages/Finance";
import UpcomingHearings from './dashboard/ArbitratorDashboard/pages/UpcommingHearing';
import HearingDetails from './dashboard/ArbitratorDashboard/pages/HearingDetails';
import ArbitrationsManagement from "./dashboard/admin/pages/arbitrationManagement/ArbitrationsManagement";
import AdminArbitrationDetails from "./dashboard/admin/pages/arbitrationManagement/AdminArbitrationDetails";
import Arbitration_Agreement from "./dashboard/admin/pages/Arbitration_Agreement";
import Mediation_Agreement from "./dashboard/admin/pages/Mediation_Agreement";
import MediationManagement from "./dashboard/admin/pages/mediationManagement/MediationManagement";
import AdminMediationDetails from "./dashboard/admin/pages/mediationManagement/AdminMediationDetails";
import MediatorProfile from "./dashboard/mediatorDashboard/MediatorProfile";

import Arb_HearingDetails from "./dashboard/userDashboard/components/Arb_HearingDetails.jsx" ;
import VerdictInputForm from './dashboard/ArbitratorDashboard/pages/Verdictinputform';
import UserFinance from './dashboard/userDashboard/pages/UserFinance.jsx' ; 

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* ================= ROOT ROUTES ================= */}
          <Route path="/" element={<Root />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Registration />} />
            <Route path="lawyers" element={<Lawyer />} />
            <Route path="lawyers/:lawyerId" element={<LawyerDetails />} />
            <Route path="book-lawyer/:lawyerId" element={<BookLawyer />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:blogId" element={<BlogDetails />} />
            <Route path="arbitrators" element={<Arbitrator />} />
            <Route
              path="arbitrators/:arbitratorID"
              element={<ArbitratorDetails />}
            />
            <Route path="mediators" element={<Mediator />} />
            <Route
              path="mediators/:mediatorsobj"
              element={<MediatorDetails />}
            />
            <Route
              path="arbitration-process"
              element={<ArbitrationProcess />}
            />
            <Route path="arbitration" element={<Arbitration />} />
            <Route path="mediation-process" element={<MediationProcess />} />
            <Route path="mediation" element={<Mediation />} />
            <Route path="payment/success/:id" element={<PaymentSuccess />} />
            <Route path="payment/fail/:id" element={<PaymentFailed />} />
          </Route>

          {/* ================= USER / LAWYER / ARBITRATOR DASHBOARD ================= */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Dashboard />} />
            {/* Profiles */}
            <Route path="lawyer-profile/:email" element={<LawyerProfile />} />
            <Route
              path="arbitrator-profile/:email"
              element={<ArbitratorProfile />}
            />
            <Route path="UserFinance" element={<UserFinance />} />
            <Route path="user-profile" element={<UserProfile />} />
            {/* Appointments */}
            <Route path="appointments" element={<LawyerAppointments />} />
            <Route path="my-appointments" element={<UserAppointments />} />
            {/* Arbitrations */}
            <Route path="my-arbitrations" element={<MyArbitrations />} />
            <Route
              path="my-arbitrations/:id"
              element={<ArbitrationDetails />}
            />
            <Route path="lawyer-arbitrations" element={<LawyerArbitration />} />
            <Route
              path="lawyer-arbitrations/:id"
              element={<LawyerArbitrationDetails />}
            />
              <Route path="/dashboard/verdict/create/:arbitrationId" element={<VerdictInputForm />} />
             <Route path="arbitrator/arbitration/:arbitrationId/hearing/:hearingId" element={<Arb_HearingDetails/>}/>
              <Route path="arb-arbitrations" element={<MyArbitrationFile />} />
              <Route path="arbitration-details/:arbitrationId" element={< ArbitrationDetail/>} />
              <Route path="notification" element={<Notification />} />
              <Route path="Finance" element={<Finance />} />
              <Route path="upcoming-hearings" element={<UpcomingHearings />} />
              <Route path="hearing-details/:arbitrationId/:hearingId" element={<HearingDetails />} />
            {/* Mediations */}
            <Route path="my-mediations" element={<MyMediation />} />
            <Route path="my-mediations/:id" element={<MediationDetails />} />
            {/* Lawyer Time Slots */}
            <Route path="my-time-slots/:email" element={<LawyerTimeSlots />} />
            <Route path="mediator-profile" element={<MediatorProfile />} />
          </Route>


                   


                
          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin" element={<Dashboard />}>
            <Route path="all-users" element={<AllUsers />} />
            <Route path="all-lawyers" element={<LawyerManagement />} />
            <Route path="all-arbitrators" element={<ArbitratorManagement />} />
            <Route path="all-mediators" element={<MediatorManagement />} />
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
            <Route
              path="mediation-management"
              element={<MediationManagement />}
            />
            <Route
              path="mediations/:id"
              element={<AdminMediationDetails />}
            />
          </Route>

        </Routes>
      </QueryClientProvider>
    </AuthProvider>

    <ToastContainer />
  </BrowserRouter>,

);
