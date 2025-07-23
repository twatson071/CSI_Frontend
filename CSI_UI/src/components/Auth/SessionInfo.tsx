import React, { useState, useEffect } from "react";
import { RuxCard, RuxIcon, RuxButton } from "@astrouxds/react";
import { useAuth } from "../../contexts/AuthContext";
import { authClient } from "../../lib/auth-client";
import "./SessionInfo.css";

interface SessionInfoProps {
  compact?: boolean;
}

export const SessionInfo: React.FC<SessionInfoProps> = ({ compact = false }) => {
  const { user, isAuthenticated, refreshSession } = useAuth();
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const session = await authClient.getSession();
        setSessionDetails(session);
      } catch (error) {
        console.error("Failed to fetch session details:", error);
      }
    };

    if (isAuthenticated) {
      fetchSessionDetails();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      const session = await authClient.getSession();
      setSessionDetails(session);
    } catch (error) {
      console.error("Failed to refresh session:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const getTimeRemaining = () => {
    if (!sessionDetails?.expiresAt) return "N/A";
    const expiresAt = new Date(sessionDetails.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRoleLabel = (roleId?: number) => {
    switch (roleId) {
      case 1: return "Admin";
      case 2: return "System Maintainer";
      case 3: return "Operator";
      default: return "Unknown";
    }
  };

  if (compact) {
    return (
      <div className="session-info-compact">
        <RuxIcon icon="account-circle" size="extra-small" />
        <span className="session-user-email">{user.email}</span>
        <span className="session-time-remaining">({getTimeRemaining()})</span>
      </div>
    );
  }

  return (
    <RuxCard className="session-info-card">
      <div className="session-info-header">
        <div className="session-info-title">
          <RuxIcon icon="security" />
          <h3>Session Information</h3>
        </div>
        <RuxButton
          size="small"
          variant="secondary"
          icon={isRefreshing ? "refresh" : "refresh"}
          className={isRefreshing ? "spinning" : ""}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          Refresh
        </RuxButton>
      </div>

      <div className="session-info-content">
        <div className="session-info-row">
          <span className="session-label">User:</span>
          <span className="session-value">{user.email}</span>
        </div>
        
        {user.name && (
          <div className="session-info-row">
            <span className="session-label">Name:</span>
            <span className="session-value">{user.name}</span>
          </div>
        )}

        <div className="session-info-row">
          <span className="session-label">Role:</span>
          <span className="session-value">{getRoleLabel(user.roleId)}</span>
        </div>

        <div className="session-info-row">
          <span className="session-label">Session Status:</span>
          <span className={`session-value session-status ${getTimeRemaining() === "Expired" ? "expired" : "active"}`}>
            {getTimeRemaining() === "Expired" ? "Expired" : "Active"}
          </span>
        </div>

        <div className="session-info-row">
          <span className="session-label">Time Remaining:</span>
          <span className="session-value">{getTimeRemaining()}</span>
        </div>

        {sessionDetails && (
          <>
            <button
              className="session-toggle-details"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Technical Details
              <RuxIcon icon={showDetails ? "expand-less" : "expand-more"} size="extra-small" />
            </button>

            {showDetails && (
              <div className="session-details">
                <div className="session-info-row">
                  <span className="session-label">Session ID:</span>
                  <span className="session-value mono">{sessionDetails.id || "N/A"}</span>
                </div>
                <div className="session-info-row">
                  <span className="session-label">Created At:</span>
                  <span className="session-value">
                    {sessionDetails.createdAt
                      ? new Date(sessionDetails.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="session-info-row">
                  <span className="session-label">Expires At:</span>
                  <span className="session-value">
                    {sessionDetails.expiresAt
                      ? new Date(sessionDetails.expiresAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RuxCard>
  );
};

export default SessionInfo;