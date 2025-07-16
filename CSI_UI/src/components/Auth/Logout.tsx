import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
  const { signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await signOut();
      navigate("/login");
    };
    doLogout();
    // eslint-disable-next-line
  }, []);

  return <div>Signing out...</div>;
};

export default Logout;
