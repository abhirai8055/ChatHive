import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./modules/Dashboard/index";
import Form from "./modules/Form/index";
// import NotFound from "./components/NotFound/NotFound";

// ProtectedRoutes for authenticated access
const ProtectedRoute = ({ children, auth = false }) => {
  const isLoggedIn = localStorage.getItem("user:token") !== null;

  if (auth && !isLoggedIn) {
    // Redirect to sign-in if not logged in and auth is required
    return <Navigate to="/users/sign_in" />;
  } else if (isLoggedIn && ["/users/sign_in", "/users/sign_up"].includes(window.location.pathname)) {
    // Redirect to Dashboard if logged in and trying to access sign-in or sign-up
    return <Navigate to="/" />;
  }

  return children; // Render children if all checks pass
};

function App() {
  return (
    <Routes>
      {/* Protected Route for Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute auth={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Public Routes */}
      <Route
        path="/users/sign_in"
        element={
          <ProtectedRoute>
            <Form isSignInPage={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/sign_up"
        element={
          <ProtectedRoute>
            <Form isSignInPage={false} />
          </ProtectedRoute>
        }
      />

      {/* Catch-All Route for 404 Not Found */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
