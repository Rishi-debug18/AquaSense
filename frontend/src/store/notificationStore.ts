import { create } from 'zustand'
import { Alert, Message } from '../types'

interface NotificationState {
  alerts: Alert[];
  messages: Message[];
  unreadAlertCount: number;
  unreadMessageCount: number;
  addAlert: (alert: Alert) => void;
  addMessage: (message: Message) => void;
  markAlertRead: (id: string) => void;
  markMessageRead: (id: string) => void;
  setAlerts: (alerts: Alert[]) => void;
  setMessages: (messages: Message[]) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  alerts: [],
  messages: [],
  unreadAlertCount: 0,
  unreadMessageCount: 0,
  addAlert: (alert) => set((state) => ({ 
    alerts: [alert, ...state.alerts],
    unreadAlertCount: state.unreadAlertCount + 1 
  })),
  addMessage: (message) => set((state) => ({ 
    messages: [message, ...state.messages],
    unreadMessageCount: state.unreadMessageCount + 1 
  })),
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, is_read: true } : a),
    unreadAlertCount: Math.max(0, state.unreadAlertCount - 1)
  })),
  markMessageRead: (id) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, is_read: true } : m),
    unreadMessageCount: Math.max(0, state.unreadMessageCount - 1)
  })),
  setAlerts: (alerts) => set({ alerts, unreadAlertCount: alerts.filter(a => !a.is_read).length }),
  setMessages: (messages) => set({ messages, unreadMessageCount: messages.filter(m => !m.is_read).length }),
  clearAll: () => set({ alerts: [], messages: [], unreadAlertCount: 0, unreadMessageCount: 0 })
}))
