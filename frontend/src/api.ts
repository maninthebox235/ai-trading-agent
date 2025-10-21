import type { DiaryResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async getDiary(limit: number = 200): Promise<DiaryResponse> {
    const response = await fetch(`${API_BASE_URL}/diary?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch diary');
    }
    return response.json();
  },

  async getLogs(path: string = 'llm_requests.log', limit: number = 2000): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/logs?path=${path}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }
    return response.text();
  },

  async downloadDiary(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/diary?download=1`);
    if (!response.ok) {
      throw new Error('Failed to download diary');
    }
    return response.blob();
  }
};
