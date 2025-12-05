const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectTimeout = null;
    this.listeners = new Map();
    this.currentEventId = null;
    this.currentTeamId = null;
    this.currentTeamName = null;
  }

  connect(eventId, teamId = null, teamName = null) {
    this.currentEventId = eventId;
    this.currentTeamId = teamId;
    this.currentTeamName = teamName;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.subscribe(eventId, teamId, teamName);
      return;
    }

    this.ws = new WebSocket(`${WS_URL}/ws`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.subscribe(eventId, teamId, teamName);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Notify all listeners
        this.listeners.forEach((callback) => {
          callback(data);
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after 3 seconds
      this.reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.connect(this.currentEventId, this.currentTeamId, this.currentTeamName);
      }, 3000);
    };
  }

  subscribe(eventId, teamId = null, teamName = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        eventId,
        teamId,
        teamName
      }));
    }
  }

  addListener(id, callback) {
    this.listeners.set(id, callback);
  }

  removeListener(id) {
    this.listeners.delete(id);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.listeners.clear();
  }
}

export default new WebSocketService();
