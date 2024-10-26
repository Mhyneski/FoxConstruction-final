import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import ProjectProgress from './components/ProjectProgress';
import ContractorDashboard from './pages/ContractorDashboard';
import ProjectList from './pages/ProjectList';
import AdminDashboard from './pages/AdminDashboard';
import Generator from './pages/Generator';
import Accounts from './pages/Accounts';
import Materials from './pages/Materials';
import Location from './pages/Location';
import Collection from './pages/Collection';
import Services from './pages/Services';
import Contacts from './pages/Contacts';
import Unauthorized from './pages/Unauthorized'; 
import ProtectedRoute from './components/ProtectedRoute';
import AboutUs from './pages/AboutUs';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={<Homepage />} />

        {/* Routes accessible only by Admin */}
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Accounts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Materials"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Materials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Location"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Location />
            </ProtectedRoute>
          }
        />

        {/* Routes accessible only by User */}
        <Route
          path="/UserDashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ProjectProgress />
            </ProtectedRoute>
          }
        />

        {/* Routes accessible only by Contractor */}
        <Route
          path="/ContractorDashboard"
          element={
            <ProtectedRoute allowedRoles={['contractor']}>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ProjectList"
          element={
            <ProtectedRoute allowedRoles={['contractor']}>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Generator"
          element={
            <ProtectedRoute allowedRoles={['contractor']}>
              <Generator />
            </ProtectedRoute>
          }
        />

        {/* General Routes */}
        <Route path="/AboutUs" element={<AboutUs/>} />
        <Route path="/Collection" element={<Collection />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Contacts" element={<Contacts />} />

        {/* Unauthorized page */}
        <Route path="/Unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
