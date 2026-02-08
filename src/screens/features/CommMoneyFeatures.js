import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Badge, MetricsRow, SectionLabel, Button, AlertBanner } from '../../components';
import { getAccessToken } from '../../services/api';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

// ============== COMM MANAGER FEATURES ==============

// Email Digest Screen
export const EmailDigestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [digest, setDigest] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState(null);

  const fetchDigest = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setError('Please log in to view emails');
        setLoading(false);
        return;
      }

      // First sync emails
      await fetch(`${API_BASE_URL}/gmail/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Then get digest
      const response = await fetch(`${API_BASE_URL}/gmail/digest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('Digest response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        setDigest(data.data);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to load digest');
      }
    } catch (err) {
      console.error('Error fetching digest:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAISummary = async () => {
    setLoadingSummary(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_BASE_URL}/gmail/ai-summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setAiSummary(data.data);
      }
    } catch (err) {
      console.error('Error fetching AI summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDigest();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setAiSummary(null);
    fetchDigest();
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'URGENT': return '🔴';
      case 'ACTION': return '🟠';
      case 'FYI': return '🔵';
      case 'NEWSLETTER': return '📰';
      default: return '📧';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const openEmail = (email) => {
    navigation.navigate('EmailDetail', { email });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          variant="orange"
          title={"EMAIL\nDIGEST"}
          subtitle="Loading..."
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Syncing emails...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header
          variant="orange"
          title={"EMAIL\nDIGEST"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchDigest} style={{ marginTop: 16 }} />
        </View>
      </View>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });

  // Support both formats: categories object or summary object
  const totalEmails = digest?.totalEmails || digest?.summary?.total || 0;
  const urgentCount = digest?.categories?.URGENT?.length || digest?.summary?.urgent || 0;
  const actionCount = digest?.categories?.ACTION?.length || digest?.summary?.action || 0;
  const fyiCount = digest?.categories?.FYI?.length || digest?.summary?.fyi || 0;
  const newsletterCount = digest?.categories?.NEWSLETTER?.length || digest?.summary?.newsletter || 0;

  const metrics = [
    { value: totalEmails.toString(), label: 'Total', color: COLORS.black },
    { value: urgentCount.toString(), label: 'Urgent', color: COLORS.error },
    { value: actionCount.toString(), label: 'Action', color: COLORS.orange },
  ];

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"EMAIL\nDIGEST"}
        subtitle={`Last 7 days • ${totalEmails} emails`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="AI Generated" variant="ai" />}
      />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: SIZES.xl }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />
        }
      >
        <MetricsRow metrics={metrics} />

        {/* AI Summary Section */}
        {aiSummary ? (
          <Card style={styles.aiSummaryCard}>
            <View style={styles.aiSummaryHeader}>
              <Text style={styles.aiSummaryTitle}>✨ AI Summary</Text>
              <Badge text="GPT-4" variant="ai" size="sm" />
            </View>
            <Text style={styles.aiSummaryText}>{aiSummary.summary}</Text>
            
            {aiSummary.actionItems && aiSummary.actionItems.length > 0 && (
              <View style={styles.actionItemsSection}>
                <Text style={styles.actionItemsTitle}>📋 Action Items:</Text>
                {aiSummary.actionItems.map((item, index) => (
                  <View key={index} style={styles.actionItem}>
                    <Text style={styles.actionItemBullet}>•</Text>
                    <Text style={styles.actionItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {aiSummary.highlights && aiSummary.highlights.length > 0 && (
              <View style={styles.highlightsSection}>
                <Text style={styles.highlightsTitle}>💡 Key Highlights:</Text>
                {aiSummary.highlights.map((item, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <Text style={styles.highlightText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ) : (
          <TouchableOpacity 
            style={styles.generateSummaryBtn}
            onPress={fetchAISummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? (
              <View style={styles.loadingSummaryRow}>
                <ActivityIndicator color={COLORS.black} size="small" />
                <Text style={styles.generateSummaryText}>Generating AI summary...</Text>
              </View>
            ) : (
              <Text style={styles.generateSummaryText}>✨ Generate AI Summary</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Urgent Emails */}
        {urgentCount > 0 && digest?.categories?.URGENT && (
          <>
            <SectionLabel>🔴 Urgent ({urgentCount})</SectionLabel>
            {digest.categories.URGENT.map((email, index) => (
              <Card key={email.id || index} onPress={() => openEmail(email)}>
                <Text style={styles.emailTitle}>{email.subject}</Text>
                <Text style={styles.emailSender}>{email.from}</Text>
                <Text style={styles.emailPreview} numberOfLines={2}>{email.snippet}</Text>
                <Text style={styles.emailTime}>{formatTime(email.receivedAt)}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Action Emails */}
        {actionCount > 0 && digest?.categories?.ACTION && (
          <>
            <SectionLabel>🟠 Action Required ({actionCount})</SectionLabel>
            {digest.categories.ACTION.slice(0, 5).map((email, index) => (
              <Card key={email.id || index} onPress={() => openEmail(email)}>
                <Text style={styles.emailTitle}>{email.subject}</Text>
                <Text style={styles.emailSender}>{email.from}</Text>
                <Text style={styles.emailPreview} numberOfLines={2}>{email.snippet}</Text>
              </Card>
            ))}
            {actionCount > 5 && (
              <Text style={styles.moreText}>+{actionCount - 5} more action emails</Text>
            )}
          </>
        )}

        {/* FYI Emails */}
        {fyiCount > 0 && (
          <>
            <SectionLabel>🔵 FYI ({fyiCount})</SectionLabel>
            {digest?.categories?.FYI ? (
              digest.categories.FYI.slice(0, 3).map((email, index) => (
                <Card key={email.id || index} onPress={() => openEmail(email)} style={{ opacity: 0.9 }}>
                  <Text style={styles.emailTitle}>{email.subject}</Text>
                  <Text style={styles.emailSender}>{email.from}</Text>
                </Card>
              ))
            ) : (
              <Card style={{ opacity: 0.8 }}>
                <Text style={styles.emailTitle}>Info & Updates</Text>
                <Text style={styles.emailPreview}>
                  {fyiCount} emails for your information.
                </Text>
              </Card>
            )}
            {fyiCount > 3 && (
              <Text style={styles.moreText}>+{fyiCount - 3} more FYI emails</Text>
            )}
          </>
        )}

        {/* Newsletters */}
        {newsletterCount > 0 && (
          <>
            <SectionLabel>📰 Newsletters ({newsletterCount})</SectionLabel>
            <Card style={{ opacity: 0.7 }}>
              <Text style={styles.emailTitle}>Newsletters & Digests</Text>
              <Text style={styles.emailPreview}>
                {newsletterCount} newsletters archived and ready to browse.
              </Text>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Priority Inbox Screen
export const PriorityInboxScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emails, setEmails] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [counts, setCounts] = useState({ urgent: 0, action: 0, fyi: 0, newsletter: 0, all: 0 });
  const [error, setError] = useState(null);

  const fetchInbox = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setError('Please log in to view emails');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/gmail/inbox?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.data || []);
        
        // Calculate counts
        const all = data.data || [];
        setCounts({
          urgent: all.filter(e => e.category === 'URGENT').length,
          action: all.filter(e => e.category === 'ACTION').length,
          fyi: all.filter(e => e.category === 'FYI').length,
          newsletter: all.filter(e => e.category === 'NEWSLETTER').length,
          all: all.length,
        });
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to load inbox');
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox();
  };

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'URGENT': return '🔴';
      case 'ACTION': return '🟠';
      case 'FYI': return '🔵';
      case 'NEWSLETTER': return '📰';
      default: return '📧';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Gmail can return various date formats
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return '';
    }
  };

  const openEmail = (email) => {
    navigation.navigate('EmailDetail', { email });
  };

  const filteredEmails = activeTab === 'all' 
    ? emails 
    : emails.filter(e => e.category === activeTab.toUpperCase());

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'urgent', label: 'Urgent', count: counts.urgent },
    { id: 'action', label: 'Action', count: counts.action },
    { id: 'fyi', label: 'FYI', count: counts.fyi },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          variant="orange"
          title={"PRIORITY\nINBOX"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Loading inbox...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"PRIORITY\nINBOX"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        statusText="Live"
        statusActive={true}
      />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />
        }
      >
        {/* Tabs */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.id && styles.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Email List */}
        {filteredEmails.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No emails in this category</Text>
          </Card>
        ) : (
          filteredEmails.map((email, index) => (
            <Card key={email.id || index} onPress={() => openEmail(email)}>
              <View style={styles.emailRow}>
                <Text style={styles.emailEmoji}>{getCategoryEmoji(email.category)}</Text>
                <View style={styles.emailContent}>
                  <View style={styles.emailHeader}>
                    <Text style={styles.emailTitle} numberOfLines={1}>{email.subject}</Text>
                  </View>
                  <Text style={styles.emailSender} numberOfLines={1}>{email.from}</Text>
                  <Text style={styles.emailPreview} numberOfLines={1}>{email.snippet}</Text>
                </View>
                <Text style={styles.emailTime}>{formatTime(email.receivedAt)}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// ============== MONEY BOT FEATURES ==============

// Statement Scanner Screen
export const StatementScannerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Add expense form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch categories
      const catResponse = await fetch(`${API_BASE_URL}/expenses/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const catData = await catResponse.json();
      if (catData.success) {
        setCategories(catData.data);
      }

      // Fetch spending summary
      const summaryResponse = await fetch(`${API_BASE_URL}/expenses/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }
    } catch (err) {
      console.error('Error fetching expense data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddExpense = async () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Please enter amount and description');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          category: selectedCategory,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAmount('');
        setDescription('');
        setShowAddExpense(false);
        fetchData(); // Refresh
        Alert.alert('Success', 'Expense added successfully!');
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to add expense');
      }
    } catch (err) {
      console.error('Add expense error:', err);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          variant="orange"
          title={"EXPENSE\nTRACKER"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        variant="orange"
        title={"EXPENSE\nTRACKER"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="Money Bot" variant="ai" />}
      />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: SIZES.xl }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />
        }
      >
        {/* Total Card */}
        <Card variant="selected" style={styles.totalCard}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>This Month</Text>
              <Text style={styles.totalValue}>{formatCurrency(summary?.totalSpent)}</Text>
            </View>
            <View style={styles.totalChange}>
              <Text style={styles.changeLabel}>{summary?.transactionCount || 0} transactions</Text>
              <Text style={styles.changeValue}>Avg {formatCurrency(summary?.averagePerDay)}/day</Text>
            </View>
          </View>
        </Card>

        {/* Add Expense Button */}
        <TouchableOpacity 
          style={styles.addExpenseBtn}
          onPress={() => setShowAddExpense(!showAddExpense)}
        >
          <Text style={styles.addExpenseBtnText}>
            {showAddExpense ? '✕ Cancel' : '+ Add Expense'}
          </Text>
        </TouchableOpacity>

        {/* Add Expense Form */}
        {showAddExpense && (
          <Card style={styles.addExpenseCard}>
            <Text style={styles.addExpenseTitle}>New Expense</Text>
            
            <TextInput
              style={styles.expenseInput}
              placeholder="Amount (₹)"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            
            <TextInput
              style={styles.expenseInput}
              placeholder="Description"
              placeholderTextColor={COLORS.textTertiary}
              value={description}
              onChangeText={setDescription}
            />
            
            <Text style={styles.categoryLabel}>Category:</Text>
            <View style={styles.categoryPicker}>
              {categories.slice(0, 6).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPickerItem,
                    selectedCategory === cat.id && styles.categoryPickerItemActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryPickerEmoji}>{cat.emoji}</Text>
                  <Text style={[
                    styles.categoryPickerText,
                    selectedCategory === cat.id && styles.categoryPickerTextActive,
                  ]}>{cat.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title={saving ? "Saving..." : "Save Expense"}
              variant="primary"
              onPress={handleAddExpense}
              loading={saving}
              disabled={saving}
            />
          </Card>
        )}

        {/* Category Breakdown */}
        <SectionLabel>By Category</SectionLabel>
        {summary?.categoryBreakdown?.length > 0 ? (
          summary.categoryBreakdown.map((cat, index) => (
            <Card key={cat.id || index}>
              <View style={styles.categoryRow}>
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{cat.count} transactions • {cat.percentage}%</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>No expenses this month. Add your first expense above!</Text>
          </Card>
        )}

        {/* Top Expenses */}
        {summary?.topExpenses?.length > 0 && (
          <>
            <SectionLabel>💰 Top Expenses</SectionLabel>
            {summary.topExpenses.map((expense, index) => (
              <Card key={expense.id || index}>
                <View style={styles.billRow}>
                  <View>
                    <Text style={styles.billName}>{expense.description}</Text>
                    <Text style={styles.billDue}>
                      {categories.find(c => c.id === expense.category)?.emoji || '📦'} {expense.category}
                    </Text>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(expense.amount)}</Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Spend Rate Alert Screen
export const SpendAlertScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch categories
      const catResponse = await fetch(`${API_BASE_URL}/expenses/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const catData = await catResponse.json();
      if (catData.success) {
        setCategories(catData.data);
      }

      // Fetch budget status
      const statusResponse = await fetch(`${API_BASE_URL}/expenses/budgets/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusResponse.json();
      if (statusData.success) {
        setBudgetStatus(statusData.data);
      }
    } catch (err) {
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSetBudget = async () => {
    if (!budgetAmount) {
      Alert.alert('Error', 'Please enter a budget amount');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/expenses/budgets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          amount: parseFloat(budgetAmount),
          period: 'MONTHLY',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBudgetAmount('');
        setShowSetBudget(false);
        fetchData();
        Alert.alert('Success', 'Budget set successfully!');
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to set budget');
      }
    } catch (err) {
      console.error('Set budget error:', err);
      Alert.alert('Error', 'Failed to set budget');
    } finally {
      setSaving(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return COLORS.error;
    if (percentage >= 80) return COLORS.warning;
    return COLORS.success;
  };

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  const totalBudget = budgetStatus.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          variant="gray"
          title={"BUDGET\nTRACKER"}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        variant="gray"
        title={"BUDGET\nTRACKER"}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingTop: SIZES.xl }]}>
        {budgetStatus.length > 0 ? (
          <>
            {/* Overall Status */}
            <AlertBanner
              emoji={overallPercentage >= 100 ? "🚨" : overallPercentage >= 80 ? "⚠️" : "✅"}
              title={overallPercentage >= 100 ? "Over Budget!" : overallPercentage >= 80 ? "Approaching Limit" : "On Track"}
              description={`You've spent ${formatCurrency(totalSpent)} of ${formatCurrency(totalBudget)} (${overallPercentage}%)`}
              variant={overallPercentage >= 100 ? "error" : overallPercentage >= 80 ? "warning" : "success"}
            />

            <Card>
              <View style={styles.compareRow}>
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Total Budget</Text>
                  <Text style={styles.compareValue}>{formatCurrency(totalBudget)}</Text>
                </View>
                <View style={styles.compareDivider} />
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Total Spent</Text>
                  <Text style={[styles.compareValue, overallPercentage >= 100 && { color: COLORS.error }]}>
                    {formatCurrency(totalSpent)}
                  </Text>
                </View>
              </View>
            </Card>

            <SectionLabel>Budget Progress</SectionLabel>
            {budgetStatus.map((cat, index) => {
              const progressColor = getProgressColor(cat.percentage);
              const isOver = cat.percentage >= 100;
              
              return (
                <Card key={index}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetEmoji}>{cat.emoji}</Text>
                    <Text style={styles.budgetName}>{cat.categoryName}</Text>
                    <Text style={[styles.budgetAmount, isOver && { color: COLORS.error }]}>
                      {formatCurrency(cat.spent)}/{formatCurrency(cat.budget)}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: progressColor }
                      ]} 
                    />
                  </View>
                  {isOver && (
                    <Text style={styles.overBudgetText}>⚠️ Over budget by {formatCurrency(cat.spent - cat.budget)}</Text>
                  )}
                </Card>
              );
            })}
          </>
        ) : (
          <Card>
            <Text style={styles.emptyText}>No budgets set yet. Add your first budget below!</Text>
          </Card>
        )}

        {/* Set Budget Button */}
        <TouchableOpacity 
          style={styles.addExpenseBtn}
          onPress={() => setShowSetBudget(!showSetBudget)}
        >
          <Text style={styles.addExpenseBtnText}>
            {showSetBudget ? '✕ Cancel' : '+ Set Budget'}
          </Text>
        </TouchableOpacity>

        {/* Set Budget Form */}
        {showSetBudget && (
          <Card style={styles.addExpenseCard}>
            <Text style={styles.addExpenseTitle}>Set Monthly Budget</Text>
            
            <Text style={styles.categoryLabel}>Category:</Text>
            <View style={styles.categoryPicker}>
              {categories.slice(0, 6).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPickerItem,
                    selectedCategory === cat.id && styles.categoryPickerItemActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.categoryPickerEmoji}>{cat.emoji}</Text>
                  <Text style={[
                    styles.categoryPickerText,
                    selectedCategory === cat.id && styles.categoryPickerTextActive,
                  ]}>{cat.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.expenseInput}
              placeholder="Monthly Budget Amount (₹)"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="numeric"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />
            
            <Button
              title={saving ? "Saving..." : "Set Budget"}
              variant="primary"
              onPress={handleSetBudget}
              loading={saving}
              disabled={saving}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    marginTop: -20,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: SIZES.fontMd,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SIZES.lg,
  },
  moreText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  aiSummaryCard: {
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: COLORS.orange,
    marginBottom: SIZES.lg,
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  aiSummaryTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  aiSummaryText: {
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    lineHeight: 22,
    marginBottom: SIZES.md,
  },
  actionItemsSection: {
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.orange + '40',
  },
  actionItemsTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SIZES.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  actionItemBullet: {
    fontSize: SIZES.fontSm,
    color: COLORS.orange,
    marginRight: 8,
    fontWeight: '700',
  },
  actionItemText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  highlightsSection: {
    marginTop: SIZES.sm,
  },
  highlightsTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SIZES.xs,
  },
  highlightItem: {
    backgroundColor: COLORS.orange + '20',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    marginTop: 4,
  },
  highlightText: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
  },
  generateSummaryBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginBottom: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  generateSummaryText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  loadingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  // Email styles
  emailTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  emailSender: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.orange,
    marginBottom: 4,
  },
  emailPreview: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emailTime: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
    marginTop: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.md,
  },
  emailEmoji: {
    fontSize: 20,
  },
  emailContent: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 4,
    marginBottom: SIZES.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SIZES.sm + 2,
    borderRadius: SIZES.radiusSm,
  },
  tabActive: {
    backgroundColor: COLORS.black,
  },
  tabText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeActive: {
    backgroundColor: COLORS.orange,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBadgeTextActive: {
    color: COLORS.black,
  },
  // Total card
  totalCard: {
    marginBottom: SIZES.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
    opacity: 0.8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.black,
  },
  totalChange: {
    alignItems: 'flex-end',
  },
  changeLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.black,
    opacity: 0.8,
  },
  changeValue: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.black,
  },
  // Category
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radiusSm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  categoryCount: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  categoryAmount: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  // Bills
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  billDue: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  billAmount: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.black,
  },
  // Compare
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareItem: {
    flex: 1,
    alignItems: 'center',
  },
  compareDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray,
  },
  compareLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  compareValue: {
    fontSize: SIZES.fontXxl,
    fontWeight: '900',
    color: COLORS.black,
  },
  // Budget
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  budgetEmoji: {
    fontSize: 18,
  },
  budgetName: {
    flex: 1,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.black,
  },
  budgetAmount: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overBudgetText: {
    fontSize: SIZES.fontXs,
    color: COLORS.error,
    marginTop: 6,
  },
  recText: {
    fontSize: SIZES.fontMd,
    color: COLORS.white,
    lineHeight: 22,
  },
  recBold: {
    fontWeight: '700',
  },
  // Expense Tracker styles
  addExpenseBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  addExpenseBtnText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
  },
  addExpenseCard: {
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: COLORS.orange,
    marginBottom: SIZES.lg,
  },
  addExpenseTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SIZES.md,
  },
  expenseInput: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.black,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  categoryLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.sm,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  categoryPickerItem: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryPickerItemActive: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orange + '20',
  },
  categoryPickerEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryPickerText: {
    fontSize: SIZES.fontSm - 1,
    color: COLORS.textSecondary,
  },
  categoryPickerTextActive: {
    color: COLORS.black,
    fontWeight: '600',
  },
});

export default {
  EmailDigestScreen,
  PriorityInboxScreen,
  StatementScannerScreen,
  SpendAlertScreen,
};
