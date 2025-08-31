export interface StoredMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  recommendations?: any[];
  emergencySymptoms?: string[];
  severity?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: StoredMessage[];
  lastUpdated: Date;
  createdAt: Date;
}

class ChatStorageService {
  private storageKey = 'health-assistant-chats';
  private currentSessionKey = 'health-assistant-current-session';
  private sessions: ChatSession[] = [];

  constructor() {
    this.loadSessions();
  }

  private loadSessions(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.sessions = parsed.map((session: any) => ({
          ...session,
          lastUpdated: new Date(session.lastUpdated),
          createdAt: new Date(session.createdAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      this.sessions = [];
    }
  }

  private saveSessions(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving chat sessions:', error);
    }
  }

  private generateSessionTitle(messages: StoredMessage[]): string {
    // Find the first user message to create a title
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      // Take first 50 characters and add ellipsis if longer
      const title = firstUserMessage.content.substring(0, 50);
      return title.length < firstUserMessage.content.length ? `${title}...` : title;
    }
    return `Chat ${new Date().toLocaleDateString()}`;
  }

  getCurrentSession(): ChatSession | null {
    try {
      const currentSessionId = localStorage.getItem(this.currentSessionKey);
      if (currentSessionId) {
        return this.sessions.find(session => session.id === currentSessionId) || null;
      }
    } catch (error) {
      console.error('Error getting current session:', error);
    }
    return null;
  }

  createNewSession(): ChatSession {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date(),
      createdAt: new Date()
    };

    this.sessions.unshift(newSession); // Add to beginning
    this.setCurrentSession(newSession.id);
    this.saveSessions();
    
    return newSession;
  }

  setCurrentSession(sessionId: string): void {
    try {
      localStorage.setItem(this.currentSessionKey, sessionId);
    } catch (error) {
      console.error('Error setting current session:', error);
    }
  }

  saveMessage(message: StoredMessage): void {
    const currentSession = this.getCurrentSession();
    if (!currentSession) {
      // Create new session if none exists
      const newSession = this.createNewSession();
      newSession.messages.push(message);
      newSession.title = this.generateSessionTitle(newSession.messages);
      newSession.lastUpdated = new Date();
    } else {
      // Add to existing session
      currentSession.messages.push(message);
      currentSession.lastUpdated = new Date();
      
      // Update title if this is the first user message
      if (currentSession.messages.length === 1 && message.role === 'user') {
        currentSession.title = this.generateSessionTitle(currentSession.messages);
      }
    }
    
    this.saveSessions();
  }

  getAllSessions(): ChatSession[] {
    return [...this.sessions].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  getSession(sessionId: string): ChatSession | null {
    return this.sessions.find(session => session.id === sessionId) || null;
  }

  deleteSession(sessionId: string): void {
    this.sessions = this.sessions.filter(session => session.id !== sessionId);
    
    // If we're deleting the current session, clear the current session
    const currentSessionId = localStorage.getItem(this.currentSessionKey);
    if (currentSessionId === sessionId) {
      localStorage.removeItem(this.currentSessionKey);
    }
    
    this.saveSessions();
  }

  clearAllSessions(): void {
    this.sessions = [];
    localStorage.removeItem(this.currentSessionKey);
    this.saveSessions();
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = title;
      session.lastUpdated = new Date();
      this.saveSessions();
    }
  }
}

export const chatStorageService = new ChatStorageService();