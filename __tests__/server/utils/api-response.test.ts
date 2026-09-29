import { apiSuccess, apiError, apiCreated, apiUnauthorized } from '@/server/utils/api-response';

describe('API Response Formatting', () => {
  describe('Success Responses', () => {
    it('should format success response correctly', async () => {
      const response = apiSuccess({ id: 1, name: 'Test' }, 'Success message');
      
      expect(response.status).toBe(200);
      
      const json = await response.json();
      expect(json).toHaveProperty('success', true);
      expect(json).toHaveProperty('data');
      expect(json.data).toEqual({ id: 1, name: 'Test' });
      expect(json).toHaveProperty('message', 'Success message');
    });

    it('should work without message', async () => {
      const response = apiSuccess({ id: 1 });
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual({ id: 1 });
    });

    it('should handle null data', async () => {
      const response = apiSuccess(null, 'Null data');
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeNull();
    });

    it('should handle array data', async () => {
      const response = apiSuccess([1, 2, 3]);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual([1, 2, 3]);
    });
  });

  describe('Created Responses (201)', () => {
    it('should return 201 status for created response', async () => {
      const response = apiCreated({ id: 1, name: 'New Resource' }, 'Created successfully');
      
      expect(response.status).toBe(201);
      
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual({ id: 1, name: 'New Resource' });
      expect(json.message).toBe('Created successfully');
    });
  });

  describe('Error Responses', () => {
    it('should format error response correctly', async () => {
      const response = apiError('Error message', 400);
      
      expect(response.status).toBe(400);
      
      const json = await response.json();
      expect(json).toHaveProperty('success', false);
      expect(json).toHaveProperty('error', 'Error message');
      expect(json).not.toHaveProperty('data');
    });

    it('should handle 404 errors', async () => {
      const response = apiError('Resource not found', 404);
      
      expect(response.status).toBe(404);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Resource not found');
    });

    it('should handle 500 errors', async () => {
      const response = apiError('Internal server error', 500);
      
      expect(response.status).toBe(500);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Internal server error');
    });

    it('should handle 409 conflict errors', async () => {
      const response = apiError('Resource already exists', 409);
      
      expect(response.status).toBe(409);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Resource already exists');
    });
  });

  describe('Unauthorized Responses (401)', () => {
    it('should return 401 for unauthorized', async () => {
      const response = apiUnauthorized('Please log in');
      
      expect(response.status).toBe(401);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Please log in');
    });

    it('should use default message if none provided', async () => {
      const response = apiUnauthorized();
      
      expect(response.status).toBe(401);
      
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });

  describe('Response Consistency', () => {
    it('all success responses should have success:true', async () => {
      const responses = [
        apiSuccess({ id: 1 }),
        apiCreated({ id: 2 }),
      ];

      for (const response of responses) {
        const json = await response.json();
        expect(json.success).toBe(true);
      }
    });

    it('all error responses should have success:false', async () => {
      const responses = [
        apiError('Bad request', 400),
        apiUnauthorized('Unauthorized'),
        apiError('Not found', 404),
        apiError('Server error', 500),
      ];

      for (const response of responses) {
        const json = await response.json();
        expect(json.success).toBe(false);
      }
    });

    it('success responses should have data, errors should have error', async () => {
      const successResponse = apiSuccess({ id: 1 });
      const errorResponse = apiError('Error', 400);

      const successJson = await successResponse.json();
      const errorJson = await errorResponse.json();

      expect(successJson).toHaveProperty('data');
      expect(successJson).not.toHaveProperty('error');
      
      expect(errorJson).toHaveProperty('error');
      expect(errorJson).not.toHaveProperty('data');
    });
  });

  describe('Content-Type Headers', () => {
    it('should set application/json content-type', () => {
      const response = apiSuccess({ id: 1 });
      
      expect(response.headers.get('Content-Type')).toContain('application/json');
    });
  });
});
