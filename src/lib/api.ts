const API_URLS = {
  auth: 'https://functions.poehali.dev/6f04c3dd-35e6-44d1-b712-5573fee6857d',
  chats: 'https://functions.poehali.dev/07fbc4dd-0a01-4f86-b4ce-ddfcc6311ba7',
  users: 'https://functions.poehali.dev/2c31383a-db1f-4ce4-9db7-6aa4fa45a043',
  messages: 'https://functions.poehali.dev/877f60b1-4aaa-4207-a859-c814d6c25cb0',
};

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'developer' | 'user';
  isFriend?: boolean;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'developer' | 'user';
  isFriend?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const api = {
  async login(username: string, password: string): Promise<User> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    return response.json();
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(API_URLS.users);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getChats(userId: string): Promise<Chat[]> {
    const response = await fetch(`${API_URLS.chats}?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  },

  async getMessages(userId: string, contactId: string): Promise<Message[]> {
    const response = await fetch(`${API_URLS.messages}?userId=${userId}&contactId=${contactId}`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async sendMessage(senderId: string, receiverId: string, text: string): Promise<Message> {
    const response = await fetch(API_URLS.messages, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId, text }),
    });
    
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },
};
