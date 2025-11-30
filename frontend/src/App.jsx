import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import HomePage from "./pages/HomePage";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignIn />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/owner/dashboard" element={<OwnerDashboard />}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
