import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import OwnerDashboard from "./pages/OwnerDashboard";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/owner/dashboard" element={<OwnerDashboard />}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
