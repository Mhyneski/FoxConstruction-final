import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import ProjectProgress from './components/ProjectProgress';
import ContractorDashboard from './pages/ContractorDashboard';
import ProjectList from './pages/ProjectList';
import AdminDashboard from './pages/AdminDashboard';
import Generator from './pages/Generator';
import Accounts from './pages/Accounts';
import Materials from './pages/Materials';
import Location from './pages/Location';

function App() {

  return (
    <Router>
      <Routes>
      <Route path="/Login" element={<Login/>}/>
      <Route path="/UserDashboard" element={<UserDashboard/>}/>
      <Route path="/AdminDashboard" element={<AdminDashboard/>}/>
      <Route path="/project/:projectId" element={<ProjectProgress />} />
      <Route path="/ContractorDashboard" element={<ContractorDashboard/>} />
      <Route path="/ProjectList" element={<ProjectList/>} />
      <Route path="/Accounts" element={<Accounts/>} />
      <Route path="/Generator" element={<Generator/>} />
      <Route path="/Materials" element={<Materials/>} />
      <Route path="/Location" element={<Location/>} />
      <Route path="/" element={<Homepage/>}/>
      </Routes>
    </Router>
  )
}

export default App
