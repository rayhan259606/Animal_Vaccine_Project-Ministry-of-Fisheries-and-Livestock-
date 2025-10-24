import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/header";
import Login from "./pages/login";
import Register from "./pages/registration";
import Layout from "./layouts/layouts";



// Dashboards
import AdminDashboard from "./dashboard/admindashboard";
import OfficerDashboard from "./dashboard/officerdashboard";
import FarmerDashboard from "./dashboard/farmerdashboard";

//Farmer Pages
import FarmerProfile from "./pages/farmer/farmerprofile";
import FarmerFarms from "./pages/farmer/farmerFarms";
import FarmerAnimal from "./pages/farmer/farmerAnimal";
import FarmerVaccines from "./pages/farmer/availableVacine";
import FarmerVaccinations from "./pages/farmer/FarmerVaccinations";
import FarmerAllocations from "./pages/farmer/FarmerAllocations";
import FarmerDisbursements from "./pages/farmer/FarmerDisbursements"; 
import FarmerReports from "./pages/farmer/FarmerReports"; 



//admin  pages

import AdminProfile from "./pages/admin/AdminProfile";
import AdminUser from "./pages/admin/AdminUsers";
import OfficerPage from "./pages/admin/OfficerPage";
import FarmerPage from "./pages/admin/FarmerPage";
import AdminFarmPage from "./pages/admin/AdminFarmPage";
import AdminVaccinePage from "./pages/admin/AdminVaccinePage";


// 🔹 Public layout for Header + nested routes
function PublicLayout() {
  return (
    <>
      <Header />
      <div className="container py-4">
        <Outlet />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 Public routes (Header visible) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* 🔐 Protected Dashboard routes */}
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/officerdashboard" element={<OfficerDashboard />} />
          <Route path="/farmerdashboard" element={<FarmerDashboard />} />



          <Route path="/farmerprofile" element={<FarmerProfile />} />
          <Route path="/farmer-farms" element={<FarmerFarms />} />
          <Route path="/farmer-animals" element={<FarmerAnimal/>} />
          <Route path="/farmer-vaccines" element={<FarmerVaccines/>} />
          <Route path="/farmer-vaccinations" element={<FarmerVaccinations/>} />
          <Route path="/farmer-allocations" element={<FarmerAllocations />} />
          <Route path="/farmer-disbursements" element={<FarmerDisbursements />} />
          <Route path="/farmer-reports" element={<FarmerReports />} />

          {/* admin all pages */}

          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUser/>} />
          <Route path="/admin/officers" element={<OfficerPage/>} />
          <Route path="/admin/farmers" element={<FarmerPage/>} />
          <Route path="/admin/farms" element={<AdminFarmPage/>} />
          <Route path="/admin/vaccines" element={<AdminVaccinePage/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
