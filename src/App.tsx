import Dashboard from "./pages/Dashboard";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import DeviceDetail from "./pages/DeviceDetail";

function App() {
  return (
    <Router>
      <main className="h-full min-h-screen bg-slate-50">
        {/* <Navbar /> */}
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/detail/:deviceId' element={<DeviceDetail />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
