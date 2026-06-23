const API_URL = 'http://localhost:3000'; // Puerto expuesto por tu API Gateway o Auth-Service

export const authService = {
  async register(phoneNumber: string, name: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, name, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el registro');
    }
    return response.json();
  },

  async login(phoneNumber: string, password: string): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el login');
    }
    const data = await response.json();
    return { token: data.accessToken, user: data.user };
  }
};