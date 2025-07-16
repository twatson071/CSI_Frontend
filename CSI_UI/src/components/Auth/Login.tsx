import React, { useState } from "react";
import { RuxButton, RuxInput } from "@astrouxds/react";
import { signIn } from "../../services";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith(".mil")) {
      setError("Email must end with .mil");
      return;
    }
    try {
      await signIn({ email, password });
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <RuxInput
          label="Email"
          value={email}
          onRuxinput={(e: any) => setEmail(e.target.value)}
        />
        <RuxInput
          type="password"
          label="Password"
          value={password}
          onRuxinput={(e: any) => setPassword(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <RuxButton type="submit">Sign In</RuxButton>
      </form>
    </div>
  );
};

export default Login;
