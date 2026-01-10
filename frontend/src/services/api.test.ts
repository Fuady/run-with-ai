import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

// Mock fetch
global.fetch = vi.fn();

describe('ApiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('login calls the correct endpoint', async () => {
        const mockUser = { id: '1', email: 'test@example.com', name: 'Test' };
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ user: mockUser, token: 'token' }),
        });

        const response = await api.login('test@example.com', 'pass');

        expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'pass' }),
        }));
        expect(response.user.email).toBe('test@example.com');
    });

    it('getNutritionTips handles category filter', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });

        await api.getNutritionTips('hydration');

        expect(fetch).toHaveBeenCalledWith('/api/nutrition-tips?category=hydration', expect.any(Object));
    });

    it('throws error on failed response', async () => {
        (fetch as any).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ detail: 'Error happened' }),
        });

        await expect(api.login('t@e.com', 'p')).rejects.toThrow('Error happened');
    });
});
