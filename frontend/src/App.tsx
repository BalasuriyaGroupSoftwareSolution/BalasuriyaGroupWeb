import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CustomerPortal from "./pages/CustomerPortal";

import ConstructionPublic from "./pages/construction/ConstructionPublic";
import ProjectDetail from "./pages/construction/ProjectDetail";
import TourismPublic from "./pages/tourism/TourismPublic";
import PackageDetail from "./pages/tourism/PackageDetail";
import AirTicketingPublic from "./pages/AirTicketingPublic";
import SoftwarePublic from "./pages/SoftwarePublic";
import QuoteWizard from "./pages/QuoteWizard";
import Careers from "./pages/Careers";
import Sustainability from "./pages/Sustainability";

import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ConstructionStaff from "./pages/staff/ConstructionStaff";
import TourismStaff from "./pages/staff/TourismStaff";
import PaymentApprovals from "./pages/staff/PaymentApprovals";
import StaffUsers from "./pages/staff/StaffUsers";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Corporate Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/quote" element={<QuoteWizard />} />

          {/* Authentication & Security Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Division Showcases */}
          <Route path="/construction" element={<ConstructionPublic />} />
          <Route path="/construction/:id" element={<ProjectDetail />} />
          <Route path="/tourism" element={<TourismPublic />} />
          <Route path="/tourism/:id" element={<PackageDetail />} />
          <Route path="/air-ticketing" element={<AirTicketingPublic />} />
          <Route path="/software" element={<SoftwarePublic />} />

          {/* Customer / Client Portal (Protected) */}
          <Route element={<ProtectedRoute redirectTo="/login" />}>
            <Route path="/portal" element={<CustomerPortal />} />
          </Route>

          {/* Staff / Admin Portal (Role-Protected) */}
          <Route
            element={
              <ProtectedRoute
                roles={[
                  "ADMIN",
                  "CONSTRUCTION_MANAGER",
                  "CONSTRUCTION_STAFF",
                  "TOURISM_AGENT",
                  "TOURISM_STAFF",
                  "FINANCE_APPROVER",
                  "FINANCE_STAFF",
                  "TICKET_AGENT",
                  "TICKET_STAFF",
                  "SOFTWARE_ENGINEER",
                  "SOFTWARE_STAFF",
                  "CHARTERED_ACCOUNTANT",
                ]}
                redirectTo="/"
              />
            }
          >
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />

              <Route element={<ProtectedRoute roles={["CONSTRUCTION_MANAGER", "CONSTRUCTION_STAFF", "ADMIN"]} />}>
                <Route path="construction" element={<ConstructionStaff />} />
              </Route>

              <Route element={<ProtectedRoute roles={["TOURISM_AGENT", "TOURISM_STAFF", "ADMIN"]} />}>
                <Route path="tourism" element={<TourismStaff />} />
              </Route>

              <Route element={<ProtectedRoute roles={["FINANCE_APPROVER", "CHARTERED_ACCOUNTANT", "FINANCE_STAFF", "ADMIN"]} />}>
                <Route path="payments" element={<PaymentApprovals />} />
              </Route>

              <Route element={<ProtectedRoute roles={["ADMIN", "CONSTRUCTION_MANAGER", "TOURISM_AGENT", "SOFTWARE_ENGINEER", "TICKET_AGENT", "FINANCE_APPROVER"]} />}>
                <Route path="users" element={<StaffUsers />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </div>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
