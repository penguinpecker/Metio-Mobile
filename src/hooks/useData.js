import { useState, useEffect, useCallback } from 'react';
import { agentsAPI, activityAPI, pendingActionsAPI, notificationsAPI, userAPI } from '../services/api';

// ==========================================
// useAgents - Fetch all agents
// ==========================================

export function useAgents() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await agentsAPI.getAll();
      if (response.success) {
        setAgents(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const pauseAgent = async (id) => {
    const response = await agentsAPI.pause(id);
    if (response.success) {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'PAUSED' } : a));
    }
    return response;
  };

  const resumeAgent = async (id) => {
    const response = await agentsAPI.resume(id);
    if (response.success) {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'ACTIVE' } : a));
    }
    return response;
  };

  return { agents, isLoading, error, refetch: fetchAgents, pauseAgent, resumeAgent };
}

// ==========================================
// useAgent - Fetch single agent
// ==========================================

export function useAgent(agentId) {
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await agentsAPI.getOne(agentId);
      if (response.success) {
        setAgent(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return { agent, isLoading, error, refetch: fetchAgent };
}

// ==========================================
// useActivity - Fetch activity logs
// ==========================================

export function useActivity(agentId = null) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const fetchActivity = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await activityAPI.getAll(page, 20, agentId);
      if (response.success) {
        setActivities(response.data);
        if (response.meta) {
          setPagination(response.meta);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activities, isLoading, error, pagination, refetch: fetchActivity };
}

// ==========================================
// usePendingActions - Fetch pending approvals
// ==========================================

export function usePendingActions() {
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pendingActionsAPI.getAll();
      if (response.success) {
        setActions(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const approveAction = async (id, modifications = null) => {
    const response = await pendingActionsAPI.approve(id, modifications);
    if (response.success) {
      setActions(prev => prev.filter(a => a.id !== id));
    }
    return response;
  };

  const rejectAction = async (id) => {
    const response = await pendingActionsAPI.reject(id);
    if (response.success) {
      setActions(prev => prev.filter(a => a.id !== id));
    }
    return response;
  };

  return { actions, isLoading, error, refetch: fetchActions, approveAction, rejectAction };
}

// ==========================================
// useNotifications - Fetch notifications
// ==========================================

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsAPI.getAll();
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (ids) => {
    const response = await notificationsAPI.markAsRead(ids);
    if (response.success) {
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    }
    return response;
  };

  const markAllAsRead = async () => {
    const response = await notificationsAPI.markAllAsRead();
    if (response.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return response;
  };

  return { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

// ==========================================
// useStats - Dashboard stats
// ==========================================

export function useStats() {
  const [stats, setStats] = useState({
    activeAgents: 0,
    tasksToday: 0,
    pendingApprovals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

// ==========================================
// useConnectedAccounts - Connected services
// ==========================================

export function useConnectedAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userAPI.getConnectedAccounts();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const disconnectAccount = async (accountId) => {
    const response = await userAPI.disconnectAccount(accountId);
    if (response.success) {
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    }
    return response;
  };

  return { accounts, isLoading, error, refetch: fetchAccounts, disconnectAccount };
}

export default {
  useAgents,
  useAgent,
  useActivity,
  usePendingActions,
  useNotifications,
  useStats,
  useConnectedAccounts,
};
