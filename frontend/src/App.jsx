import Register from "./pages/Register";
import SignIn from "./pages/SignIn"
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />}/>
          <Route path="/register" element={<Register />}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
