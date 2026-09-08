import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConstructionPublic from "./pages/construction/ConstructionPublic";
import ProjectDetail from "./pages/construction/ProjectDetail";
import TourismPublic from "./pages/tourism/TourismPublic";
import PackageDetail from "./pages/tourism/PackageDetail";
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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/construction" element={<ConstructionPublic />} />
          <Route path="/construction/:id" element={<ProjectDetail />} />

          <Route path="/tourism" element={<TourismPublic />} />
          <Route path="/tourism/:id" element={<PackageDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />

              <Route element={<ProtectedRoute roles={["CONSTRUCTION_MANAGER", "ADMIN"]} />}>
                <Route path="construction" element={<ConstructionStaff />} />
              </Route>

              <Route element={<ProtectedRoute roles={["TOURISM_AGENT", "ADMIN"]} />}>
                <Route path="tourism" element={<TourismStaff />} />
              </Route>

              <Route element={<ProtectedRoute roles={["FINANCE_APPROVER", "ADMIN"]} />}>
                <Route path="payments" element={<PaymentApprovals />} />
              </Route>

              <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                <Route path="users" element={<StaffUsers />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
