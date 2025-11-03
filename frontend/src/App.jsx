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
import  AdminBudgetPage  from "./pages/admin/AdminBudgetPage";
import AdminReportPage from "./pages/admin/AdminReportPage";



// officer pagess

import OfficerProfile from "./pages/officer/OfficerProfile";
import OfficerFarms from "./pages/officer/OfficerFarms";
import OfficerFarmDetails from "./pages/officer/OfficerFarmDetails"; //farmer all detis assingn

import OfficerFarmers from "./pages/officer/OfficerFarmers";
import OfficerAnimals from "./pages/officer/OfficerAnimals";
import OfficerVaccines from "./pages/officer/OfficerVaccines";
import OfficerAllocations from "./pages/officer/OfficerAllocations";
import OfficerDisbursements from "./pages/officer/OfficerDisbursements";
import OfficerReports from "./pages/officer/OfficerReports";

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
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
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
          <Route path="/admin/budget" element={<AdminBudgetPage/>} />
          <Route path="/admin/reports" element={<AdminReportPage/>} /> 

          {/* officer all pagess */} 
        <Route path="/officer/profile" element={<OfficerProfile/>} /> 
        <Route path="/officer/farms" element={<OfficerFarms />} />
        <Route path="/officer/farms/:id" element={<OfficerFarmDetails />} />
        <Route path="/officer/farmers" element={<OfficerFarmers />} />
        <Route path="/officer/animals" element={<OfficerAnimals />} />  
        <Route path="/officer/vaccines" element={<OfficerVaccines />} />  
        <Route path="/officer/allocations" element={<OfficerAllocations />} />  
        <Route path="/officer/disbursements" element={<OfficerDisbursements />} /> 
        <Route path="/officer/reports" element={<OfficerReports/>} /> 

                



        </Route>
      </Routes>
    </BrowserRouter>
  );
}
