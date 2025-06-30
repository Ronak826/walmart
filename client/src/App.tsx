import { Route, Routes } from "react-router-dom"
import Signin from "./pages/signin"
import Signup from "./pages/signup"
import Home from "./pages/Home"
import Dashboard from "./Components/Dashboard"
import HelpDashboard from "./Components/HelpDashboard"
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MyProfile from "./pages/myProfile"
import Completed from "./pages/Completed"

// 🛠 Fix marker icons for deployment
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/completed" element={<Completed></Completed>}></Route>
        <Route path="/signin" element={<Signin/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/help-dashboard" element={<HelpDashboard/>}></Route>
        <Route path="/my-profile" element={<MyProfile/>}></Route>
      </Routes>
    </div>
  )
}

export default App