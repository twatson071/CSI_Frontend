import React, { useState } from "react";
import { RuxButton, RuxInput, RuxCard, RuxIcon } from "@astrouxds/react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LOCAL_ROLES = [
  { label: "Admin", value: 1 },
  { label: "System Maintainer", value: 2 },
  { label: "Operator", value: 3 },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localRole, setLocalRole] = useState(1);
  const { signIn, signUp, isLoading, setLocalUser, isLocalLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email domain
    if (!email.endsWith(".mil")) {
      setError("Email must end with .mil");
      return;
    }

    // Validate password
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const result = isSignUp
        ? await signUp(email, password, name)
        : await signIn(email, password);

      if (result.success) {
        // Success - navigation will be handled by the auth context
        navigate("/");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(message);
    }
  };

  const handleLocalLogin = () => {
    if (setLocalUser) {
      setLocalUser({
        id: 999,
        email: `local${localRole}@test.dev`,
        name: `Local ${LOCAL_ROLES.find((r) => r.value === localRole)?.label}`,
        roleId: localRole,
      });
      navigate("/");
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setName("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLocalLogin) {
    return (
      <div className="login-container">
        <RuxCard className="login-card">
          <div className="login-header">
            <RuxIcon icon="account-circle" size="4rem" />
            <h2>Local Login</h2>
            <p className="login-subtitle">Select a role to log in locally</p>
          </div>
          <div className="form-field">
            <label htmlFor="local-role">Role</label>
            <select
              id="local-role"
              value={localRole}
              onChange={(e) => setLocalRole(Number(e.target.value))}
            >
              {LOCAL_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <RuxButton onClick={handleLocalLogin}>
              Log In as {LOCAL_ROLES.find((r) => r.value === localRole)?.label}
            </RuxButton>
          </div>
        </RuxCard>
      </div>
    );
  }

  return (
    <div className="login-container">
      <RuxCard className="login-card">
        <div className="login-header">
          <RuxIcon icon="account-circle" size="4rem" />
          <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>
          <p className="login-subtitle">
            {isSignUp
              ? "Create your CSI account to get started"
              : "Welcome back to CSI Dashboard"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-field">
              <RuxInput
                label="Full Name"
                value={name}
                placeholder="Enter your full name"
                onRuxinput={(e: CustomEvent<{value: string}>) => setName(e.detail.value)}
                required={isSignUp}
              />
            </div>
          )}

          <div className="form-field">
            <RuxInput
              label="Email Address"
              type="email"
              value={email}
              placeholder="your.name@domain.mil"
              onRuxinput={(e: CustomEvent<{value: string}>) => setEmail(e.detail.value)}
              required
            />
            <small className="field-hint">Must be a .mil email address</small>
          </div>

          <div className="form-field">
            <div className="password-field">
              <RuxInput
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                placeholder={
                  isSignUp ? "Create a secure password" : "Enter your password"
                }
                onRuxinput={(e: CustomEvent<{value: string}>) => setPassword(e.detail.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <RuxIcon
                  icon={showPassword ? "visibility-off" : "visibility"}
                />
              </button>
            </div>
            {isSignUp && (
              <small className="field-hint">
                Password must be at least 8 characters long
              </small>
            )}
          </div>

          {error && (
            <div className="error-message">
              <RuxIcon icon="error" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <RuxButton
              type="submit"
              disabled={isLoading}
              className="primary-button"
            >
              {isLoading ? (
                <>
                  <RuxIcon icon="refresh" className="spinning" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </RuxButton>
          </div>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="link-button"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </RuxCard>
    </div>
  );
};

export default Login;
