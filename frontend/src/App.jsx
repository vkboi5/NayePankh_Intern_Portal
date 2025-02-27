import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary"; // Import ErrorBoundary
import Dashboard from "./pages/Dashboard/Dashboard";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Donate from "./pages/Donate";

// Fallback component for errors
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" style={{ padding: "20px", textAlign: "center", backgroundColor: "#ffebee", color: "#d32f2f" }}>
      <h2>Something Went Wrong</h2>
      <p>An error occurred: {error.message}</p>
      <button
        onClick={resetErrorBoundary}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#FF9933",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

// Wrapper component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/donate" || location.pathname === "/dashboard";

  return (
    <>
      {!hideNavbar && <Navbar />} {/* Render Navbar only if not on /donate or /dashboard */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donate" element={<Donate />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
}

export default App;