import React, { useEffect } from "react";
import { RuxButton, RuxIcon } from "@astrouxds/react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

interface LogoutButtonProps {
  className?: string;
  secondary?: boolean;
  onLogout?: () => void;
  showIcon?: boolean;
  fullWidth?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className,
  secondary = false,
  onLogout,
  showIcon = true,
  fullWidth = false,
}) => {
  const { signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <RuxButton
      icon={showIcon ? "logout" : undefined}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
      secondary={secondary}
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </RuxButton>
  );
};

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const { signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    try {
      await signOut();
      onConfirm();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="logout-dialog-backdrop" onClick={onClose}>
      <div
        className="logout-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logout-dialog-header">
          <RuxIcon icon="warning" size="2rem" />
          <h3>Confirm Sign Out</h3>
        </div>
        <p>Are you sure you want to sign out? Any unsaved changes will be lost.</p>
        <div className="dialog-actions">
          <RuxButton secondary onClick={onClose} disabled={isLoading}>
            Cancel
          </RuxButton>
          <RuxButton
            onClick={handleConfirmLogout}
            disabled={isLoading}
          >
            {isLoading ? "Signing out..." : "Sign Out"}
          </RuxButton>
        </div>
      </div>
    </div>
  );
};

const Logout: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await signOut();
      navigate("/login");
    };
    doLogout();
  }, [signOut, navigate]);

  return (
    <div className="logout-page">
      <div className="logout-content">
        <RuxIcon icon="refresh" className="spinning" size="3rem" />
        <h2>Signing out...</h2>
        <p>Please wait while we sign you out securely.</p>
      </div>
    </div>
  );
};

export default Logout;
