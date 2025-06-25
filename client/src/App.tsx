import { Route, Routes } from "react-router-dom"
import Signin from "./pages/signin"
import Signup from "./pages/signup"
import Home from "./pages/Home"
import Dashboard from "./Components/Dashboard"
import HelpDashboard from "./Components/HelpDashboard"


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/signin" element={<Signin/>}></Route>
        <Route path="/signup" element={<Signup/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/help-dashboard" element={<HelpDashboard/>}></Route>
      </Routes>
    </div>
  )
}

export default App