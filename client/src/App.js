import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./modules/Dashboard";
import Form from "./modules/Form";
import NotFound from "./components/NotFound/NotFound";

// ProtectedRoutes for authenticated access
const ProtectedRoutes = ({ children }) => {
  const isLoggedIn = localStorage.getItem("user:token") !== null;
  console.log("ProtectedRoutes - isLoggedIn:", isLoggedIn);

  if (!isLoggedIn) {
    console.log("ProtectedRoutes - Redirecting to /users/sign_in");
    return <Navigate to="/users/sign_in" replace />;
  }

  return children;
};

// PublicRoutes to prevent access by authenticated users
const PublicRoutes = ({ children, auth = false }) => {
  const isLoggedIn = localStorage.getItem("user:token") !== null;
  console.log("PublicRoutes - isLoggedIn:", isLoggedIn);

  if (isLoggedIn && auth) {
    console.log("PublicRoutes - Redirecting to /");
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Protected Route for Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        }
      />

      {/* Public Route for Sign In */}
      <Route
        path="/users/sign_in"
        element={
          <PublicRoutes auth={true}>
            <Form isSignInPage={true} />
          </PublicRoutes>
        }
      />

      {/* Public Route for Sign Up */}
      <Route
        path="/users/sign_up"
        element={
          <PublicRoutes auth={true}>
            <Form isSignInPage={false} />
          </PublicRoutes>
        }
      />

      {/* Catch-All Route for 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
