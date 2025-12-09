import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('coopquest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('coopquest_token');
      localStorage.removeItem('coopquest_team');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Events
export const getActiveEvents = () => api.get('/events/active');
export const getEventById = (id) => api.get(`/events/${id}`);
export const getEventStats = (id) => api.get(`/events/${id}/stats`);

// Teams
export const registerTeam = (eventId, teamName) => 
  api.post('/teams/register', { eventId, teamName });
export const getLeaderboard = (eventId) => api.get(`/teams/leaderboard/${eventId}`);

// Game
export const getProgress = () => api.get('/game/progress');
export const scanQR = (qrCode) => api.post('/game/scan', { qrCode });
export const submitAnswer = (checkpointId, answer) => 
  api.post('/game/answer', { checkpointId, answer });

// Checkpoints
export const getCheckpoints = (eventId) => api.get(`/checkpoints/${eventId}`);

// Admin
export const adminLogin = (password) => api.post('/admin/login', { password });

// Admin - Events
export const adminGetEvents = (adminPassword) =>
  api.get('/admin/events', {
    headers: { 'x-admin-password': adminPassword }
  });
export const createEvent = (eventData, adminPassword) => 
  api.post('/admin/events', eventData, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminUpdateEvent = (eventId, eventData, adminPassword) =>
  api.put(`/admin/events/${eventId}`, eventData, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminDeleteEvent = (eventId, adminPassword) =>
  api.delete(`/admin/events/${eventId}`, {
    headers: { 'x-admin-password': adminPassword }
  });

// Admin - Checkpoints
export const adminGetCheckpoints = (eventId, adminPassword) =>
  api.get(`/admin/checkpoints/${eventId}`, {
    headers: { 'x-admin-password': adminPassword }
  });
export const createCheckpoint = (eventId, checkpointData, adminPassword) => 
  api.post('/admin/checkpoints', { ...checkpointData, event_id: eventId }, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminUpdateCheckpoint = (checkpointId, checkpointData, adminPassword) =>
  api.put(`/admin/checkpoints/${checkpointId}`, checkpointData, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminDeleteCheckpoint = (checkpointId, adminPassword) =>
  api.delete(`/admin/checkpoints/${checkpointId}`, {
    headers: { 'x-admin-password': adminPassword }
  });
export const getCheckpointQR = async (checkpointId, adminPassword) => {
  const response = await api.get(`/admin/checkpoints/${checkpointId}/qr`, {
    headers: { 'x-admin-password': adminPassword },
    responseType: 'blob'
  });
  // Return the blob data directly
  return response.data;
};

// Admin - Export
export const exportEventResults = (eventId, adminPassword) =>
  api.get(`/admin/events/${eventId}/export`, {
    headers: { 'x-admin-password': adminPassword }
  });

// Admin - Teams Stats
export const adminGetTeamsStats = (eventId, adminPassword) =>
  api.get(`/admin/teams-stats/${eventId}`, {
    headers: { 'x-admin-password': adminPassword }
  });

// Encounters - Collaborative Networking
export const getOnlineTeams = () => api.get('/encounters/teams/online');
export const getPendingEncounters = () => api.get('/encounters/pending');
export const getEncounterHistory = () => api.get('/encounters/history');
export const getActiveEncounter = () => api.get('/encounters/active');
export const scanParticipantQR = (qrCode) => api.post('/encounters/scan', { qrCode });
export const submitEncounterAnswer = (encounterId, answer) => 
  api.post(`/encounters/${encounterId}/answer`, { answer });
export const getEncounterStatus = (encounterId) => api.get(`/encounters/${encounterId}`);
export const getTeamQR = (teamId) => api.get(`/encounters/qr/${teamId}`);

// Admin - Collaborative Challenges
export const adminGetChallenges = (eventId, adminPassword) =>
  api.get(`/admin/challenges/${eventId}`, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminCreateChallenge = (challengeData, adminPassword) =>
  api.post('/admin/challenges', challengeData, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminUpdateChallenge = (challengeId, challengeData, adminPassword) =>
  api.put(`/admin/challenges/${challengeId}`, challengeData, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminDeleteChallenge = (challengeId, adminPassword) =>
  api.delete(`/admin/challenges/${challengeId}`, {
    headers: { 'x-admin-password': adminPassword }
  });

// Admin - Encounters
export const adminGetEncounters = (eventId, adminPassword) =>
  api.get(`/admin/encounters/${eventId}`, {
    headers: { 'x-admin-password': adminPassword }
  });
export const adminGetEncounterStats = (eventId, adminPassword) =>
  api.get(`/admin/encounters/${eventId}/stats`, {
    headers: { 'x-admin-password': adminPassword }
  });

export default api;
