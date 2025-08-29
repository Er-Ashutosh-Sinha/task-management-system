const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class StatsService {
  async getStatsOverview(token) {
    const response = await fetch(`${API_BASE_URL}/stats/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stats');
    }

    return data;
  }
}

export default new StatsService();