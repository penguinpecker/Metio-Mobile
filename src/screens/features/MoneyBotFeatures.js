import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Badge, MetricsRow, SectionLabel, Button } from '../../components';

const API_BASE_URL = 'https://metio-backend-production.up.railway.app/api/v1';

// ============== STATEMENT SCANNER ==============

export const StatementScannerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [statementText, setStatementText] = useState('');
  const [bankName, setBankName] = useState('');
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState('pdf'); // 'pdf' or 'text'
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      // For web, use input file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedFile(file);
        }
      };
      input.click();
    } catch (err) {
      Alert.alert('Error', 'Could not pick file');
    }
  };

  const handleUploadPdf = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (bankName.trim()) {
        formData.append('bankName', bankName.trim());
      }

      const response = await fetch(`${API_BASE_URL}/statement/upload-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.data?.transactions) {
        setExtractedTransactions(data.data.transactions);
        setShowResults(true);
      } else {
        Alert.alert('No Transactions Found', data.error?.message || 'Could not extract transactions from PDF.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload and parse PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!statementText.trim()) {
      Alert.alert('Error', 'Please paste your bank statement text');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/statement/parse`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          statementText: statementText.trim(),
          bankName: bankName.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.transactions) {
        setExtractedTransactions(data.data.transactions);
        setShowResults(true);
      } else {
        Alert.alert('No Transactions Found', 'Could not extract transactions. Try pasting clearer statement text.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to parse statement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransactions = async () => {
    const debits = extractedTransactions.filter(tx => tx.type === 'debit');
    if (debits.length === 0) {
      Alert.alert('No Expenses', 'No debit transactions found to save');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/statement/save-transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transactions: debits,
          source: bankName || 'Bank Statement',
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success! 🎉', `Saved ${data.data.saved} expenses`, [
          { text: 'View Expenses', onPress: () => navigation.navigate('ExpenseTracker') },
          { text: 'OK' },
        ]);
        setShowResults(false);
        setStatementText('');
        setSelectedFile(null);
        setExtractedTransactions([]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save transactions');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = { food: '🍔', transport: '🚗', shopping: '🛒', entertainment: '🎬', bills: '📱', health: '💊', education: '📚', travel: '✈️', groceries: '🥬', subscription: '📺', other: '📦' };
    return emojis[category] || '📦';
  };

  return (
    <View style={styles.container}>
      <Header variant="gray" title={"STATEMENT\nSCANNER"} subtitle="AI-powered extraction" showBack={true} onBackPress={() => navigation.goBack()} rightComponent={<Badge text="AI" variant="ai" />} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!showResults ? (
          <>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity 
                style={[styles.modeBtn, uploadMode === 'pdf' && styles.modeBtnActive]}
                onPress={() => setUploadMode('pdf')}
              >
                <Text style={[styles.modeBtnText, uploadMode === 'pdf' && styles.modeBtnTextActive]}>📄 Upload PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeBtn, uploadMode === 'text' && styles.modeBtnActive]}
                onPress={() => setUploadMode('text')}
              >
                <Text style={[styles.modeBtnText, uploadMode === 'text' && styles.modeBtnTextActive]}>📝 Paste Text</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>
                {uploadMode === 'pdf' ? '📄 Upload Bank Statement PDF' : '📝 Paste Statement Text'}
              </Text>
              <Text style={styles.instructionText}>
                {uploadMode === 'pdf' 
                  ? 'Upload your bank statement PDF and AI will automatically extract all transactions.'
                  : 'Copy-paste your bank statement text and AI will extract transactions.'}
              </Text>
            </Card>

            <Text style={styles.inputLabel}>Bank Name (optional)</Text>
            <TextInput style={styles.input} placeholder="e.g., HDFC, ICICI, SBI, IndusInd" placeholderTextColor={COLORS.textTertiary} value={bankName} onChangeText={setBankName} />

            {uploadMode === 'pdf' ? (
              <>
                {/* PDF Upload */}
                <TouchableOpacity style={styles.uploadBox} onPress={handleFilePick}>
                  {selectedFile ? (
                    <View style={styles.fileSelected}>
                      <Text style={styles.fileIcon}>📄</Text>
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                      <Text style={styles.fileSize}>({(selectedFile.size / 1024).toFixed(1)} KB)</Text>
                      <TouchableOpacity onPress={() => setSelectedFile(null)}>
                        <Text style={styles.removeFile}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.uploadIcon}>📤</Text>
                      <Text style={styles.uploadText}>Tap to select PDF file</Text>
                      <Text style={styles.uploadSubtext}>Max 10MB</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Button 
                  title={loading ? "🔍 Analyzing PDF..." : "🔍 Extract Transactions"} 
                  variant="primary" 
                  onPress={handleUploadPdf} 
                  disabled={loading || !selectedFile} 
                  style={{ marginTop: SIZES.lg }} 
                />
              </>
            ) : (
              <>
                {/* Text Input */}
                <Text style={styles.inputLabel}>Paste Statement Text</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Paste your bank statement text here...

Example:
15-Jan-2024  AMAZON PURCHASE  -1,500.00
16-Jan-2024  SALARY CREDIT    +50,000.00
17-Jan-2024  SWIGGY ORDER     -450.00"
                  placeholderTextColor={COLORS.textTertiary}
                  value={statementText}
                  onChangeText={setStatementText}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />

                <Button 
                  title={loading ? "🔍 Analyzing..." : "🔍 Extract Transactions"} 
                  variant="primary" 
                  onPress={handleParse} 
                  disabled={loading || !statementText.trim()} 
                  style={{ marginTop: SIZES.lg }} 
                />
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Found {extractedTransactions.length} Transactions</Text>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <Text style={styles.backLink}>← Back</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>💸 Debits:</Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                  ₹{extractedTransactions.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>💰 Credits:</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  ₹{extractedTransactions.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                </Text>
              </View>
            </Card>

            <SectionLabel>Extracted Transactions</SectionLabel>
            {extractedTransactions.map((tx, index) => (
              <Card key={index} style={styles.transactionCard}>
                <View style={styles.transactionRow}>
                  <Text style={styles.transactionEmoji}>{getCategoryEmoji(tx.category)}</Text>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDesc}>{tx.description}</Text>
                    <Text style={styles.transactionMeta}>{tx.date} • {tx.category}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: tx.type === 'debit' ? COLORS.error : COLORS.success }]}>
                    {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </Text>
                </View>
              </Card>
            ))}

            <Button title={saving ? "Saving..." : `💾 Save ${extractedTransactions.filter(tx => tx.type === 'debit').length} Expenses`} variant="primary" onPress={handleSaveTransactions} disabled={saving} style={{ marginTop: SIZES.lg }} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ============== RECEIPT SCANNER (Gmail) ==============

export const ReceiptScannerScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/statement/scan-receipts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 }),
      });

      const data = await response.json();
      if (data.success) {
        setReceipts(data.data.receipts || []);
        setSelectedReceipts(data.data.receipts?.map((_, i) => i) || []);
        if (data.data.receipts?.length === 0) {
          Alert.alert('No Receipts Found', `Scanned ${data.data.scannedEmails || 0} emails but found no receipts.`);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to scan emails. Make sure Gmail is connected.');
    } finally {
      setScanning(false);
    }
  };

  const toggleReceipt = (index) => {
    setSelectedReceipts(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const handleSave = async () => {
    const toSave = selectedReceipts.map(i => receipts[i]);
    if (toSave.length === 0) return;

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/statement/save-receipts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipts: toSave }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success! 🎉', `Saved ${data.data.saved} expenses from receipts`, [
          { text: 'View Expenses', onPress: () => navigation.navigate('ExpenseTracker') },
          { text: 'OK' },
        ]);
        setReceipts([]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save receipts');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = { food: '🍔', transport: '🚗', shopping: '🛒', entertainment: '🎬', bills: '📱', health: '💊', education: '📚', travel: '✈️', groceries: '🥬', subscription: '📺', other: '📦' };
    return emojis[category] || '📦';
  };

  return (
    <View style={styles.container}>
      <Header variant="gray" title={"RECEIPT\nSCANNER"} subtitle="Auto-extract from Gmail" showBack={true} onBackPress={() => navigation.goBack()} rightComponent={<Badge text="AI" variant="ai" />} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📧 Scan Email Receipts</Text>
          <Text style={styles.instructionText}>
            AI scans your Gmail for purchase receipts, invoices, and payment confirmations from the last 30 days.
          </Text>
        </Card>

        {receipts.length === 0 ? (
          <>
            <Button title={scanning ? "🔍 Scanning Emails..." : "🔍 Scan Gmail for Receipts"} variant="primary" onPress={handleScan} disabled={scanning} style={{ marginTop: SIZES.lg }} />
            {scanning && (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="large" color={COLORS.orange} />
                <Text style={styles.scanningText}>Scanning your emails...</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Found {receipts.length} Receipts</Text>
              <TouchableOpacity onPress={() => setReceipts([])}>
                <Text style={styles.backLink}>Scan Again</Text>
              </TouchableOpacity>
            </View>

            {receipts.map((receipt, index) => (
              <TouchableOpacity key={index} onPress={() => toggleReceipt(index)}>
                <Card style={[styles.receiptCard, selectedReceipts.includes(index) && styles.receiptCardSelected]}>
                  <View style={styles.receiptRow}>
                    <View style={styles.checkbox}>
                      {selectedReceipts.includes(index) && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.receiptEmoji}>{getCategoryEmoji(receipt.category)}</Text>
                    <View style={styles.receiptInfo}>
                      <Text style={styles.receiptMerchant}>{receipt.merchantName}</Text>
                      <Text style={styles.receiptMeta}>{receipt.date} • {receipt.category}</Text>
                      <Text style={styles.receiptEmail} numberOfLines={1}>📧 {receipt.emailSubject}</Text>
                    </View>
                    <Text style={styles.receiptAmount}>₹{receipt.amount.toLocaleString()}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}

            <Button title={saving ? "Saving..." : `💾 Save ${selectedReceipts.length} Selected`} variant="primary" onPress={handleSave} disabled={saving || selectedReceipts.length === 0} style={{ marginTop: SIZES.lg }} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ============== SPENDING INSIGHTS ==============

export const SpendingInsightsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const [insightsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/statement/insights`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/statement/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const insightsData = await insightsRes.json();
      const summaryData = await summaryRes.json();
      if (insightsData.success) setInsights(insightsData.data);
      if (summaryData.success) setSummary(summaryData.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = { food: '🍔', transport: '🚗', shopping: '🛒', entertainment: '🎬', bills: '📱', health: '💊', education: '📚', travel: '✈️', groceries: '🥬', subscription: '📺', other: '📦' };
    return emojis[category] || '📦';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header variant="gray" title={"SPENDING\nINSIGHTS"} showBack={true} onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.loadingText}>Analyzing your spending...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header variant="gray" title={"SPENDING\nINSIGHTS"} subtitle="AI-powered analysis" showBack={true} onBackPress={() => navigation.goBack()} rightComponent={<Badge text="AI" variant="ai" />} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {insights && (
          <Card style={styles.insightSummaryCard}>
            <Text style={styles.insightSummary}>{insights.summary}</Text>
          </Card>
        )}

        {summary && (
          <>
            <SectionLabel>📊 This Month</SectionLabel>
            <Card>
              <View style={styles.overviewRow}><Text style={styles.overviewLabel}>Total Spent</Text><Text style={styles.overviewValue}>₹{summary.totalSpent?.toLocaleString() || 0}</Text></View>
              <View style={styles.overviewRow}><Text style={styles.overviewLabel}>Transactions</Text><Text style={styles.overviewValue}>{summary.transactionCount || 0}</Text></View>
              <View style={styles.overviewRow}><Text style={styles.overviewLabel}>Daily Average</Text><Text style={styles.overviewValue}>₹{summary.averagePerDay || 0}</Text></View>
            </Card>

            {summary.categoryBreakdown?.length > 0 && (
              <>
                <SectionLabel>💳 By Category</SectionLabel>
                <Card>
                  {summary.categoryBreakdown.map((cat, index) => (
                    <View key={index} style={styles.categoryRow}>
                      <Text style={styles.categoryEmoji}>{cat.emoji || getCategoryEmoji(cat.id)}</Text>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{cat.name || cat.id}</Text>
                        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${cat.percentage || 0}%` }]} /></View>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryAmount}>₹{cat.amount?.toLocaleString() || 0}</Text>
                        <Text style={styles.categoryPercent}>{cat.percentage || 0}%</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </>
        )}

        {insights?.insights?.length > 0 && (
          <>
            <SectionLabel>💡 Key Insights</SectionLabel>
            {insights.insights.map((insight, i) => <Card key={i} style={styles.insightCard}><Text style={styles.insightText}>💡 {insight}</Text></Card>)}
          </>
        )}

        {insights?.recommendations?.length > 0 && (
          <>
            <SectionLabel>🎯 Recommendations</SectionLabel>
            {insights.recommendations.map((rec, i) => <Card key={i} style={styles.recommendationCard}><Text style={styles.recommendationText}>✨ {rec}</Text></Card>)}
          </>
        )}

        <SectionLabel>⚡ Quick Actions</SectionLabel>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('StatementScanner')}>
            <Text style={styles.quickActionEmoji}>📋</Text>
            <Text style={styles.quickActionText}>Scan Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('ReceiptScanner')}>
            <Text style={styles.quickActionEmoji}>📧</Text>
            <Text style={styles.quickActionText}>Scan Receipts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ============== EXPENSE TRACKER ==============

export const ExpenseTrackerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const [catRes, summaryRes, expenseRes] = await Promise.all([
        fetch(`${API_BASE_URL}/expenses/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/expenses/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/expenses?limit=10`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const catData = await catRes.json();
      const summaryData = await summaryRes.json();
      const expenseData = await expenseRes.json();
      if (catData.success) setCategories(catData.data);
      if (summaryData.success) setSummary(summaryData.data);
      if (expenseData.success) setRecentExpenses(expenseData.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const getCategoryEmoji = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.emoji || '📦';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header variant="gray" title={"EXPENSE\nTRACKER"} showBack={true} onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.orange} /></View>
      </View>
    );
  }

  const metrics = [
    { value: `₹${(summary?.totalSpent || 0).toLocaleString()}`, label: 'This Month' },
    { value: (summary?.transactionCount || 0).toString(), label: 'Transactions' },
    { value: `₹${summary?.averagePerDay || 0}`, label: 'Daily Avg' },
  ];

  return (
    <View style={styles.container}>
      <Header variant="gray" title={"EXPENSE\nTRACKER"} subtitle="All your expenses" showBack={true} onBackPress={() => navigation.goBack()} rightComponent={<TouchableOpacity onPress={() => setShowAddModal(true)}><Badge text="+ Add" variant="active" /></TouchableOpacity>} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
        <MetricsRow metrics={metrics} />

        <SectionLabel>🤖 AI Tools</SectionLabel>
        <View style={styles.aiTools}>
          <TouchableOpacity style={styles.aiToolBtn} onPress={() => navigation.navigate('StatementScanner')}>
            <Text style={styles.aiToolEmoji}>📋</Text>
            <Text style={styles.aiToolText}>Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiToolBtn} onPress={() => navigation.navigate('ReceiptScanner')}>
            <Text style={styles.aiToolEmoji}>📧</Text>
            <Text style={styles.aiToolText}>Receipts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiToolBtn} onPress={() => navigation.navigate('SpendingInsights')}>
            <Text style={styles.aiToolEmoji}>💡</Text>
            <Text style={styles.aiToolText}>Insights</Text>
          </TouchableOpacity>
        </View>

        <SectionLabel>📝 Recent Expenses</SectionLabel>
        {recentExpenses.length > 0 ? recentExpenses.map((expense, index) => (
          <Card key={expense.id || index} style={styles.expenseCard}>
            <View style={styles.expenseRow}>
              <Text style={styles.expenseEmoji}>{getCategoryEmoji(expense.category)}</Text>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDesc}>{expense.description}</Text>
                <Text style={styles.expenseDate}>{formatDate(expense.date)}{expense.notes ? ` • ${expense.notes.substring(0, 20)}...` : ''}</Text>
              </View>
              <Text style={styles.expenseAmount}>-₹{expense.amount.toLocaleString()}</Text>
            </View>
          </Card>
        )) : (
          <Card>
            <Text style={styles.emptyText}>No expenses yet.</Text>
            <Text style={styles.emptySubtext}>Use AI tools above to auto-import, or add manually.</Text>
          </Card>
        )}
      </ScrollView>

      <AddExpenseModal visible={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} categories={categories} />
    </View>
  );
};

// ============== ADD EXPENSE MODAL ==============

const AddExpenseModal = ({ visible, onClose, onSuccess, categories }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !description) { Alert.alert('Error', 'Please fill in amount and description'); return; }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@metio_access_token');
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), description, category: selectedCategory }),
      });
      const data = await response.json();
      if (data.success) { setAmount(''); setDescription(''); onSuccess(); }
      else Alert.alert('Error', data.error?.message || 'Failed to add expense');
    } catch (err) { Alert.alert('Error', 'Failed to save expense'); }
    finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.textTertiary} keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput style={styles.input} placeholder="What did you spend on?" placeholderTextColor={COLORS.textTertiary} value={description} onChangeText={setDescription} />
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]} onPress={() => setSelectedCategory(cat.id)}>
                <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title={saving ? "Saving..." : "Save Expense"} variant="primary" onPress={handleSave} disabled={saving} style={{ marginTop: SIZES.lg }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  content: { flex: 1, backgroundColor: COLORS.gray, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, marginTop: -20 },
  contentContainer: { padding: SIZES.lg, paddingTop: SIZES.xl, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  instructionCard: { backgroundColor: COLORS.orange + '15', marginBottom: SIZES.lg },
  instructionTitle: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
  instructionText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, lineHeight: 20 },
  inputLabel: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.black, marginBottom: 4, marginTop: SIZES.md },
  input: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: SIZES.md, fontSize: SIZES.fontMd, color: COLORS.black, borderWidth: 1, borderColor: COLORS.gray },
  textArea: { height: 200, textAlignVertical: 'top' },
  modeToggle: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: 4, marginBottom: SIZES.lg },
  modeBtn: { flex: 1, paddingVertical: SIZES.sm, paddingHorizontal: SIZES.md, borderRadius: SIZES.radiusSm, alignItems: 'center' },
  modeBtnActive: { backgroundColor: COLORS.orange },
  modeBtnText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '600' },
  modeBtnTextActive: { color: COLORS.white },
  uploadBox: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, borderWidth: 2, borderColor: COLORS.orange, borderStyle: 'dashed', padding: SIZES.xl, alignItems: 'center', justifyContent: 'center', marginTop: SIZES.md },
  uploadIcon: { fontSize: 48, marginBottom: SIZES.sm },
  uploadText: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black },
  uploadSubtext: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 4 },
  fileSelected: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  fileIcon: { fontSize: 32 },
  fileName: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black, flex: 1 },
  fileSize: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  removeFile: { fontSize: 20, color: COLORS.error, padding: 8 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  resultsTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.black },
  backLink: { fontSize: SIZES.fontSm, color: COLORS.orange, fontWeight: '600' },
  summaryCard: { marginBottom: SIZES.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  summaryValue: { fontSize: SIZES.fontMd, fontWeight: '700' },
  transactionCard: { marginBottom: SIZES.sm },
  transactionRow: { flexDirection: 'row', alignItems: 'center' },
  transactionEmoji: { fontSize: 24, marginRight: SIZES.md },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black },
  transactionMeta: { fontSize: SIZES.fontSm - 1, color: COLORS.textSecondary },
  transactionAmount: { fontSize: SIZES.fontMd, fontWeight: '700' },
  receiptCard: { marginBottom: SIZES.sm, borderWidth: 2, borderColor: 'transparent' },
  receiptCardSelected: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '10' },
  receiptRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.orange, marginRight: SIZES.sm, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 14, color: COLORS.orange, fontWeight: '700' },
  receiptEmoji: { fontSize: 24, marginRight: SIZES.sm },
  receiptInfo: { flex: 1 },
  receiptMerchant: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black },
  receiptMeta: { fontSize: SIZES.fontSm - 1, color: COLORS.textSecondary },
  receiptEmail: { fontSize: SIZES.fontSm - 2, color: COLORS.textTertiary, marginTop: 2 },
  receiptAmount: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.error },
  scanningIndicator: { alignItems: 'center', marginTop: SIZES.xl },
  scanningText: { marginTop: 16, fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  insightSummaryCard: { backgroundColor: COLORS.lavender + '20', marginBottom: SIZES.lg },
  insightSummary: { fontSize: SIZES.fontMd, color: COLORS.black, lineHeight: 22 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray },
  overviewLabel: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  overviewValue: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.black },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  categoryEmoji: { fontSize: 20, marginRight: SIZES.sm },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: SIZES.fontSm, color: COLORS.black, marginBottom: 4 },
  progressBar: { height: 6, backgroundColor: COLORS.gray, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.orange, borderRadius: 3 },
  categoryRight: { alignItems: 'flex-end', marginLeft: SIZES.sm },
  categoryAmount: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.black },
  categoryPercent: { fontSize: SIZES.fontSm - 2, color: COLORS.textSecondary },
  insightCard: { marginBottom: SIZES.sm, backgroundColor: COLORS.lavender + '10' },
  insightText: { fontSize: SIZES.fontSm, color: COLORS.black, lineHeight: 20 },
  recommendationCard: { marginBottom: SIZES.sm, backgroundColor: COLORS.orange + '10' },
  recommendationText: { fontSize: SIZES.fontSm, color: COLORS.black, lineHeight: 20 },
  quickActions: { flexDirection: 'row', gap: SIZES.sm },
  quickActionBtn: { flex: 1, backgroundColor: COLORS.white, borderRadius: SIZES.radiusMd, padding: SIZES.md, alignItems: 'center', borderWidth: 2, borderColor: COLORS.black },
  quickActionEmoji: { fontSize: 28, marginBottom: 4 },
  quickActionText: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.black },
  aiTools: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.lg },
  aiToolBtn: { flex: 1, backgroundColor: COLORS.orange + '15', borderRadius: SIZES.radiusMd, padding: SIZES.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.orange },
  aiToolEmoji: { fontSize: 24, marginBottom: 4 },
  aiToolText: { fontSize: SIZES.fontSm - 1, fontWeight: '600', color: COLORS.black },
  expenseCard: { marginBottom: SIZES.sm },
  expenseRow: { flexDirection: 'row', alignItems: 'center' },
  expenseEmoji: { fontSize: 24, marginRight: SIZES.md },
  expenseInfo: { flex: 1 },
  expenseDesc: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black },
  expenseDate: { fontSize: SIZES.fontSm - 1, color: COLORS.textSecondary, marginTop: 2 },
  expenseAmount: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.error },
  emptyText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, textAlign: 'center' },
  emptySubtext: { fontSize: SIZES.fontSm, color: COLORS.textTertiary, textAlign: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.lg, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg },
  modalTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.black },
  modalClose: { fontSize: 24, color: COLORS.textSecondary, padding: 8 },
  categorySelector: { flexDirection: 'row', marginTop: SIZES.sm },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray, borderRadius: SIZES.radiusMd, paddingVertical: SIZES.sm, paddingHorizontal: SIZES.md, marginRight: SIZES.sm, borderWidth: 2, borderColor: 'transparent' },
  categoryChipActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + '20' },
  categoryChipEmoji: { fontSize: 16, marginRight: 4 },
  categoryChipText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  categoryChipTextActive: { color: COLORS.black, fontWeight: '600' },
});
