import { describe, it, expect, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import { authMiddleware } from '../../src/middleware/authMiddleware';

describe('Auth Middleware', () => {
  let app: Hono;
  
  beforeEach(() => {
    app = new Hono();
    
    // Add test routes
    app.get('/public', (c) => c.json({ message: 'public' }));
    app.get('/protected', authMiddleware, (c) => c.json({ message: 'protected' }));
  });
  
  describe('Public routes', () => {
    it('should allow access without authentication', async () => {
      const req = new Request('http://localhost/public');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe('public');
    });
  });
  
  describe('Protected routes', () => {
    it('should reject requests without authorization header', async () => {
      const req = new Request('http://localhost/protected');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(401);
    });
    
    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/protected', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      const res = await app.fetch(req);
      
      expect(res.status).toBe(401);
    });
    
    // Add more tests for valid tokens when auth is properly set up
  });
});