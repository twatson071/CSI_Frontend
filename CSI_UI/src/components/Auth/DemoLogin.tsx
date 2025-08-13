import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const DemoLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@csi.mil',
          password: 'DemoPass123!'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userEmail', 'demo@csi.mil');
        navigate('/dashboard');
      } else {
        setError('Demo login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>CSI Demo Application</h1>
          <p className="demo-badge">DEMO ENVIRONMENT</p>
        </div>

        <div className="demo-info">
          <h2>Welcome to the CSI Monitoring System Demo</h2>
          <p>This is a demonstration environment with sample data for testing and evaluation purposes.</p>
          
          <div className="feature-list">
            <h3>Features Available in Demo:</h3>
            <ul>
              <li>✓ Real-time device monitoring dashboard</li>
              <li>✓ PDU outlet control and management</li>
              <li>✓ Network switch port status monitoring</li>
              <li>✓ Server performance metrics</li>
              <li>✓ RF equipment management</li>
              <li>✓ Alert system with thresholds</li>
              <li>✓ Site hierarchy management</li>
              <li>✓ User role management</li>
            </ul>
          </div>

          <div className="demo-credentials">
            <h3>Demo Credentials:</h3>
            <div className="credential-box">
              <p><strong>Email:</strong> demo@csi.mil</p>
              <p><strong>Password:</strong> DemoPass123!</p>
            </div>
          </div>
        </div>

        <div className="login-actions">
          <button
            className="demo-login-button"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login with Demo Account'}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            className="custom-login-button"
            onClick={handleCustomLogin}
          >
            Login with Custom Credentials
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="demo-footer">
          <p className="disclaimer">
            <strong>Note:</strong> This is a demonstration environment. 
            Data is reset periodically and should not be used for production purposes.
          </p>
          <p className="version">Version 1.0.0-demo</p>
        </div>
      </div>

      <style jsx>{`
        .demo-badge {
          background: #ff6b6b;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-top: 8px;
          display: inline-block;
        }

        .demo-info {
          margin: 24px 0;
          text-align: left;
        }

        .feature-list {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .feature-list h3 {
          margin-top: 0;
          color: #333;
        }

        .feature-list ul {
          list-style: none;
          padding: 0;
          margin: 8px 0 0 0;
        }

        .feature-list li {
          padding: 4px 0;
          color: #666;
        }

        .demo-credentials {
          margin: 20px 0;
        }

        .credential-box {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 12px;
          font-family: monospace;
        }

        .credential-box p {
          margin: 4px 0;
        }

        .demo-login-button {
          width: 100%;
          padding: 12px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }

        .demo-login-button:hover:not(:disabled) {
          background: #45a049;
        }

        .demo-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .custom-login-button {
          width: 100%;
          padding: 12px;
          background: white;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .custom-login-button:hover {
          background: #f5f5f5;
        }

        .divider {
          text-align: center;
          margin: 16px 0;
          position: relative;
        }

        .divider span {
          background: white;
          padding: 0 16px;
          color: #999;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 6px;
          margin-top: 16px;
        }

        .demo-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }

        .disclaimer {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        }

        .version {
          font-size: 11px;
          color: #999;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export default DemoLogin;