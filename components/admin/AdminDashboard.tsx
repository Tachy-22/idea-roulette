'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Heart, 
  RotateCcw, 
  Share, 
  Eye, 
  Clock, 
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserBehavior, IdeaInteraction, UserSession } from '@/lib/analytics';
import { getAllUsers } from '@/lib/firebase-storage';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalIdeasViewed: number;
  totalIdeasLiked: number;
  totalIdeasShared: number;
  totalSwipes: number;
  averageSessionLength: number;
  topCategories: Array<{ category: string; count: number }>;
  deviceDistribution: Record<string, number>;
  browserDistribution: Record<string, number>;
  geographicDistribution: Record<string, number>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

interface RecentActivity {
  userId: string;
  action: string;
  ideaName?: string;
  timestamp: Date;
  category?: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        usersData,
        sessionsData,
        interactionsData,
        behaviorData
      ] = await Promise.all([
        getAllUsers(),
        loadSessionsData(),
        loadInteractionsData(),
        loadBehaviorData()
      ]);

      // Calculate comprehensive stats
      const calculatedStats = calculateStats(usersData, sessionsData, interactionsData, behaviorData);
      setStats(calculatedStats);

      // Load recent activity
      const activity = await loadRecentActivity();
      setRecentActivity(activity);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsData = async () => {
    try {
      const sessionsRef = collection(db, 'userSessions');
      const sessionsQuery = query(sessionsRef, orderBy('startTime', 'desc'), limit(1000));
      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  };

  const loadInteractionsData = async () => {
    try {
      const interactionsRef = collection(db, 'ideaInteractions');
      const interactionsQuery = query(interactionsRef, orderBy('timestamp', 'desc'), limit(1000));
      const snapshot = await getDocs(interactionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading interactions:', error);
      return [];
    }
  };

  const loadBehaviorData = async () => {
    try {
      const behaviorRef = collection(db, 'userBehavior');
      const snapshot = await getDocs(behaviorRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading behavior data:', error);
      return [];
    }
  };

  const loadRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      const interactionsRef = collection(db, 'ideaInteractions');
      const recentQuery = query(
        interactionsRef, 
        orderBy('timestamp', 'desc'), 
        limit(50)
      );
      const snapshot = await getDocs(recentQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data() as IdeaInteraction;
        return {
          userId: data.userId,
          action: data.action,
          ideaName: data.ideaName,
          category: data.ideaCategory,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date()
        };
      });
    } catch (error) {
      console.error('Error loading recent activity:', error);
      return [];
    }
  };

  const calculateStats = (
    users: unknown[], 
    sessions: unknown[], 
    interactions: unknown[], 
    behaviors: unknown[]
  ): AdminStats => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate active users (users with sessions in last 24 hours)
    const activeSessions = sessions.filter((session: unknown) => {
      const sessionData = session as { startTime?: Timestamp };
      const startTime = sessionData.startTime instanceof Timestamp 
        ? sessionData.startTime.toDate() 
        : new Date();
      return startTime > oneDayAgo;
    });

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    interactions.forEach((interaction: unknown) => {
      const data = interaction as IdeaInteraction;
      if (data.action === 'view' && data.ideaCategory) {
        categoryCount[data.ideaCategory] = (categoryCount[data.ideaCategory] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate device and browser distribution
    const deviceCount: Record<string, number> = {};
    const browserCount: Record<string, number> = {};
    const geoCount: Record<string, number> = {};

    sessions.forEach((session: unknown) => {
      const data = session as UserSession;
      if (data.device) {
        deviceCount[data.device] = (deviceCount[data.device] || 0) + 1;
      }
      if (data.browser) {
        browserCount[data.browser] = (browserCount[data.browser] || 0) + 1;
      }
      if (data.country) {
        geoCount[data.country] = (geoCount[data.country] || 0) + 1;
      }
    });

    // Calculate totals
    const totalIdeasViewed = interactions.filter((i: unknown) => (i as IdeaInteraction).action === 'view').length;
    const totalIdeasLiked = interactions.filter((i: unknown) => (i as IdeaInteraction).action === 'like').length;
    const totalIdeasShared = interactions.filter((i: unknown) => (i as IdeaInteraction).action === 'share').length;
    
    const totalSwipes = behaviors.reduce((sum: number, behavior: unknown) => {
      const data = behavior as UserBehavior;
      return sum + (data.totalSwipes || 0);
    }, 0);

    // Calculate average session length
    const sessionsWithDuration = sessions.filter((s: unknown) => (s as { duration?: number }).duration);
    const averageSessionLength = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum: number, s: unknown) => sum + ((s as { duration: number }).duration || 0), 0) / sessionsWithDuration.length
      : 0;

    // Calculate retention (simplified)
    const day1Retention = users.filter((user: unknown) => {
      const userData = user as { data: { lastActiveAt?: Timestamp } };
      const lastActive = userData.data.lastActiveAt instanceof Timestamp
        ? userData.data.lastActiveAt.toDate()
        : new Date();
      return lastActive > oneDayAgo;
    }).length;

    const day7Retention = users.filter((user: unknown) => {
      const userData = user as { data: { lastActiveAt?: Timestamp } };
      const lastActive = userData.data.lastActiveAt instanceof Timestamp
        ? userData.data.lastActiveAt.toDate()
        : new Date();
      return lastActive > sevenDaysAgo;
    }).length;

    const day30Retention = users.filter((user: unknown) => {
      const userData = user as { data: { lastActiveAt?: Timestamp } };
      const lastActive = userData.data.lastActiveAt instanceof Timestamp
        ? userData.data.lastActiveAt.toDate()
        : new Date();
      return lastActive > thirtyDaysAgo;
    }).length;

    return {
      totalUsers: users.length,
      activeUsers: activeSessions.length,
      totalSessions: sessions.length,
      totalIdeasViewed,
      totalIdeasLiked,
      totalIdeasShared,
      totalSwipes,
      averageSessionLength: Math.round(averageSessionLength),
      topCategories,
      deviceDistribution: deviceCount,
      browserDistribution: browserCount,
      geographicDistribution: geoCount,
      userRetention: {
        day1: Math.round((day1Retention / users.length) * 100),
        day7: Math.round((day7Retention / users.length) * 100),
        day30: Math.round((day30Retention / users.length) * 100)
      }
    };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'share': return <Share className="w-4 h-4 text-blue-500" />;
      case 'remix': return <RotateCcw className="w-4 h-4 text-purple-500" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full h-dvh bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IdeaRoulette Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time user behavior and engagement analytics</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active today
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalSessions)}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatDuration(stats.averageSessionLength)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ideas Viewed</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.totalIdeasViewed)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalSwipes)} total swipes
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalIdeasViewed > 0 
                    ? Math.round((stats.totalIdeasLiked / stats.totalIdeasViewed) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalIdeasLiked)} likes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topCategories.slice(0, 8).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {category.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(category.count / stats.topCategories[0].count) * 100} 
                          className="w-16 h-2"
                        />
                        <span className="text-sm text-gray-500 min-w-[3ch]">
                          {formatNumber(category.count)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {recentActivity.slice(0, 20).map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="flex-shrink-0">
                          {getActionIcon(activity.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">
                            {activity.action}
                          </span>
                          {activity.ideaName && (
                            <span className="text-gray-500 ml-1 truncate">
                              "{activity.ideaName.slice(0, 30)}{activity.ideaName.length > 30 ? '...' : ''}"
                            </span>
                          )}
                          {activity.category && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {activity.category}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Device & Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.deviceDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([device, count]) => (
                    <div key={device} className="flex justify-between items-center">
                      <span className="text-sm">{device}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / Math.max(...Object.values(stats.deviceDistribution))) * 100} 
                          className="w-12 h-2"
                        />
                        <span className="text-sm text-gray-500 min-w-[2ch]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Browser Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Browsers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.browserDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([browser, count]) => (
                    <div key={browser} className="flex justify-between items-center">
                      <span className="text-sm">{browser}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / Math.max(...Object.values(stats.browserDistribution))) * 100} 
                          className="w-12 h-2"
                        />
                        <span className="text-sm text-gray-500 min-w-[2ch]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Geographic Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.geographicDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                    <div key={country} className="flex justify-between items-center">
                      <span className="text-sm">{country}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / Math.max(...Object.values(stats.geographicDistribution))) * 100} 
                          className="w-12 h-2"
                        />
                        <span className="text-sm text-gray-500 min-w-[2ch]">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* User Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                User Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.userRetention.day1}%</div>
                  <p className="text-sm text-gray-600">1 Day</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.userRetention.day7}%</div>
                  <p className="text-sm text-gray-600">7 Days</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.userRetention.day30}%</div>
                  <p className="text-sm text-gray-600">30 Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}