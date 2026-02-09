import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';
import { Header, Card, Badge, MetricsRow, SectionLabel, Button } from '../../components';
import { watchlistAPI } from '../../services/api';

// ============== HELPERS ==============

const extractProductInfo = (url) => {
  const asinMatch = url.match(/\/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i) 
    || url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/i);
  
  const isAmazon = url.includes('amazon');
  const isFlipkart = url.includes('flipkart');

  if (asinMatch || isAmazon) {
    return { platform: 'Amazon', platformIcon: '🛒', asin: asinMatch ? asinMatch[1] : null, url: url.trim() };
  }
  if (isFlipkart) {
    return { platform: 'Flipkart', platformIcon: '🛍️', asin: null, url: url.trim() };
  }
  return { platform: 'Other', platformIcon: '🔗', asin: null, url: url.trim() };
};

const formatPrice = (price) => {
  if (price == null) return '₹—';
  return '₹' + Number(price).toLocaleString('en-IN');
};

const extractNameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (url.includes('amazon')) {
      const match = path.match(/\/([^/]+)\/dp\//i);
      if (match && match[1]) return match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 80);
    }
    if (url.includes('flipkart')) {
      const match = path.match(/\/([^/]+)\/p\//i);
      if (match && match[1]) return match[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 80);
    }
    return null;
  } catch { return null; }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
};

const enrichItem = (item) => ({
  ...item,
  priceDropped: item.status === 'target_hit' || (item.originalPrice && item.currentPrice && item.currentPrice < item.originalPrice),
  emoji: item.platformIcon || '📦',
  addedAt: item.createdAt,
});


// ============== PRICE CHART COMPONENT ==============

const PriceChart = ({ priceHistory, currentPrice, lowestPrice, highestPrice }) => {
  if (!priceHistory || priceHistory.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={{ fontSize: 24, marginBottom: 8 }}>📈</Text>
        <Text style={chartStyles.emptyText}>
          Chart will appear after 2+ price checks.{'\n'}Prices are checked automatically twice daily.
        </Text>
      </View>
    );
  }

  const CHART_HEIGHT = 160;
  const sorted = [...priceHistory].sort(
    (a, b) => new Date(a.recordedAt || a.date).getTime() - new Date(b.recordedAt || b.date).getTime()
  );

  const prices = sorted.map(p => p.price);
  const minPrice = Math.min(...prices) * 0.97;
  const maxPrice = Math.max(...prices) * 1.03;
  const range = maxPrice - minPrice || 1;
  const getY = (price) => CHART_HEIGHT - ((price - minPrice) / range) * CHART_HEIGHT;

  const lastPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent = firstPrice ? ((totalChange / firstPrice) * 100).toFixed(1) : 0;
  const isDown = totalChange < 0;

  const firstDate = new Date(sorted[0].recordedAt || sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].recordedAt || sorted[sorted.length - 1].date);
  const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <View>
      <View style={chartStyles.header}>
        <View>
          <Text style={chartStyles.headerLabel}>Price Trend</Text>
          <Text style={[chartStyles.headerValue, { color: isDown ? COLORS.success : COLORS.error }]}>
            {isDown ? '↓' : '↑'} {formatPrice(Math.abs(totalChange))} ({isDown ? '' : '+'}{totalChangePercent}%)
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={chartStyles.headerLabel}>{sorted.length} data points</Text>
          <Text style={chartStyles.headerSub}>{fmtDate(firstDate)} — {fmtDate(lastDate)}</Text>
        </View>
      </View>

      <View style={[chartStyles.chartArea, { height: CHART_HEIGHT + 40 }]}>
        <View style={chartStyles.yAxis}>
          <Text style={chartStyles.axisLabel}>{formatPrice(Math.round(maxPrice))}</Text>
          <Text style={chartStyles.axisLabel}>{formatPrice(Math.round((maxPrice + minPrice) / 2))}</Text>
          <Text style={chartStyles.axisLabel}>{formatPrice(Math.round(minPrice))}</Text>
        </View>
        <View style={chartStyles.chartBody}>
          <View style={[chartStyles.gridLine, { top: 0 }]} />
          <View style={[chartStyles.gridLine, { top: CHART_HEIGHT / 2 }]} />
          <View style={[chartStyles.gridLine, { top: CHART_HEIGHT }]} />
          {sorted.map((point, i) => {
            const x = sorted.length > 1 ? (i / (sorted.length - 1)) * 100 : 50;
            const y = getY(point.price);
            const prevPoint = i > 0 ? sorted[i - 1] : null;
            const priceChange = prevPoint ? point.price - prevPoint.price : 0;
            const isLast = i === sorted.length - 1;
            const isLowest = point.price === Math.min(...prices);
            return (
              <React.Fragment key={point.id || i}>
                <View style={[chartStyles.stem, { left: x + '%', top: y, height: CHART_HEIGHT - y, backgroundColor: priceChange <= 0 ? '#DCF5E7' : '#FEE2E2' }]} />
                <View style={[chartStyles.dot, {
                  left: x + '%', top: y - 5,
                  backgroundColor: isLast ? COLORS.orange : priceChange <= 0 ? COLORS.success : COLORS.error,
                  width: isLast ? 12 : 8, height: isLast ? 12 : 8,
                  marginLeft: isLast ? -6 : -4, borderWidth: isLast ? 2 : 1.5,
                }]} />
                {isLast && (
                  <View style={[chartStyles.priceTag, { left: Math.min(x, 80) + '%', top: y - 28 }]}>
                    <Text style={chartStyles.priceTagText}>{formatPrice(point.price)}</Text>
                  </View>
                )}
                {isLowest && !isLast && sorted.length > 3 && (
                  <View style={[chartStyles.priceTag, { left: Math.min(x, 80) + '%', top: y + 12, backgroundColor: '#DCFCE7' }]}>
                    <Text style={[chartStyles.priceTagText, { color: COLORS.success }]}>{formatPrice(point.price)}</Text>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <View style={chartStyles.xAxis}>
        <Text style={chartStyles.axisLabel}>{fmtDate(firstDate)}</Text>
        {sorted.length > 2 && <Text style={chartStyles.axisLabel}>{fmtDate(new Date(sorted[Math.floor(sorted.length / 2)].recordedAt || sorted[Math.floor(sorted.length / 2)].date))}</Text>}
        <Text style={chartStyles.axisLabel}>{fmtDate(lastDate)}</Text>
      </View>

      <View style={chartStyles.legend}>
        <View style={chartStyles.legendItem}><View style={[chartStyles.legendDot, { backgroundColor: COLORS.orange }]} /><Text style={chartStyles.legendText}>Current</Text></View>
        <View style={chartStyles.legendItem}><View style={[chartStyles.legendDot, { backgroundColor: COLORS.success }]} /><Text style={chartStyles.legendText}>Drop</Text></View>
        <View style={chartStyles.legendItem}><View style={[chartStyles.legendDot, { backgroundColor: COLORS.error }]} /><Text style={chartStyles.legendText}>Increase</Text></View>
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  headerValue: { fontSize: 16, fontWeight: '800' },
  headerSub: { fontSize: 12, color: '#777', fontWeight: '500' },
  chartArea: { flexDirection: 'row', gap: 4 },
  yAxis: { width: 55, justifyContent: 'space-between' },
  axisLabel: { fontSize: 10, color: '#AAA', fontWeight: '500' },
  chartBody: { flex: 1, position: 'relative', overflow: 'hidden' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F0F0F0' },
  stem: { position: 'absolute', width: 3, borderRadius: 1.5, opacity: 0.5 },
  dot: { position: 'absolute', borderRadius: 10, borderColor: '#FFF', zIndex: 2 },
  priceTag: { position: 'absolute', backgroundColor: '#333', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 3 },
  priceTagText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingLeft: 59 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#999' },
});


// ============== WATCHLIST SCREEN ==============

export const WatchlistScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadItems = async () => {
    try {
      const res = await watchlistAPI.getAll();
      if (res.success) setItems((res.data?.items || []).map(enrichItem));
    } catch (err) { console.warn('Failed to load watchlist:', err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadItems(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    try { await watchlistAPI.checkPrices(); } catch (err) { console.warn('Price check failed:', err); }
    await loadItems();
  };

  const filteredItems = items.filter(item => {
    if (filter === 'drops') return item.priceDropped;
    if (filter === 'tracking') return !item.priceDropped;
    return true;
  });

  const totalSaved = items.reduce((sum, item) => {
    if (item.priceDropped && item.originalPrice > item.currentPrice) return sum + (item.originalPrice - item.currentPrice);
    return sum;
  }, 0);

  const dropsCount = items.filter(i => i.priceDropped).length;
  const metrics = [
    { value: items.length.toString(), label: 'Tracking' },
    { value: dropsCount.toString(), label: 'Price Drops', color: COLORS.success },
    { value: totalSaved > 0 ? '₹' + (totalSaved / 1000).toFixed(1) + 'K' : '₹0', label: 'Saved' },
  ];

  const deleteItem = (id) => {
    Alert.alert('Remove Product', 'Stop tracking this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await watchlistAPI.remove(id); setItems(prev => prev.filter(i => i.id !== id)); }
        catch (err) { Alert.alert('Error', 'Failed to remove product'); }
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <Header variant="orange" title={"MY\nWATCHLIST"} showBack={true} onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text={items.length + ' items'} variant="default" />} />
      <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orange} />}>
        <MetricsRow metrics={metrics} />
        <View style={styles.filterRow}>
          {[{ key: 'all', label: '✨ All' }, { key: 'drops', label: '📉 Drops' }, { key: 'tracking', label: '👁️ Tracking' }].map(f => (
            <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
              <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.centerState}><ActivityIndicator size="large" color={COLORS.orange} /></View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🐕</Text>
            <Text style={styles.emptyTitle}>{items.length === 0 ? 'No products yet' : 'No matches'}</Text>
            <Text style={styles.emptyText}>{items.length === 0 ? 'Share a product link from Amazon or Flipkart to start tracking!' : 'Try a different filter'}</Text>
            {items.length === 0 && <Button title="+ Add Product" variant="orange" style={{ marginTop: 16 }} onPress={() => navigation.navigate('AddProduct')} />}
          </View>
        ) : (
          filteredItems.map(item => (
            <Card key={item.id} variant={item.priceDropped ? 'success' : 'default'} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
              <View style={styles.productRow}>
                <View style={styles.productIconWrap}><Text style={{ fontSize: 28 }}>{item.emoji || '📦'}</Text></View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.currentPrice, item.priceDropped && { color: COLORS.success }]}>{formatPrice(item.currentPrice)}</Text>
                    {item.originalPrice && item.originalPrice !== item.currentPrice && <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>}
                    {item.priceDropped && item.originalPrice && <Badge text={'-' + Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100) + '%'} variant="active" size="sm" />}
                  </View>
                  <View style={styles.productMeta}>
                    <Text style={styles.metaText}>{item.platformIcon} {item.platform}</Text>
                    <Text style={styles.metaText}>• Checked {timeAgo(item.lastChecked)}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteBtn}>
                  <Text style={{ fontSize: 14, color: COLORS.textTertiary }}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        {items.length > 0 && (
          <>
            <SectionLabel>How It Works</SectionLabel>
            <Card>
              {[['📤', 'Share any product link from Amazon/Flipkart'], ['🐕', 'Watchdog checks the price automatically twice daily'], ['🔔', 'Get notified instantly when price drops']].map(([icon, text], i) => (
                <View key={i} style={[styles.howRow, i < 2 && styles.howRowBorder]}>
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                  <Text style={styles.howText}>{text}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddProduct')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};


// ============== ADD PRODUCT SCREEN ==============

export const AddProductScreen = ({ navigation, route }) => {
  const [url, setUrl] = useState(route?.params?.sharedUrl || '');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [step, setStep] = useState(1);
  const [scrapedPrice, setScrapedPrice] = useState(0);
  const [scrapedImage, setScrapedImage] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (route?.params?.sharedUrl) { setUrl(route.params.sharedUrl); handleParse(route.params.sharedUrl); }
  }, [route?.params?.sharedUrl]);

  const handleParse = async (inputUrl) => {
    const urlToParse = inputUrl || url;
    if (!urlToParse.trim()) { Alert.alert('Error', 'Please paste a product link'); return; }
    const info = extractProductInfo(urlToParse);
    setParsed(info); setStep(2);
    const nameFromUrl = extractNameFromUrl(urlToParse);
    if (nameFromUrl) setProductName(nameFromUrl);
    setFetching(true);
    try {
      const res = await watchlistAPI.scrapeUrl(urlToParse);
      if (res.success && res.data) {
        const scrapedName = res.data.name;
        if (scrapedName && scrapedName !== 'Unknown Product' && scrapedName !== 'Unknown' && scrapedName.length > 3) setProductName(scrapedName);
        if (res.data.price) setScrapedPrice(res.data.price);
        if (res.data.imageUrl) setScrapedImage(res.data.imageUrl);
      }
    } catch (err) { console.warn('Auto-fetch failed:', err); }
    finally { setFetching(false); }
  };

  const handleSave = async () => {
    if (!productName.trim()) { Alert.alert('Error', 'Please enter a product name'); return; }
    const targetPrice = productPrice.trim() && !isNaN(productPrice) ? parseFloat(productPrice) : null;
    setSaving(true);
    try {
      const res = await watchlistAPI.add(parsed?.url || url.trim(), productName.trim(), targetPrice, scrapedPrice, scrapedImage);
      if (res.success) navigation.goBack();
      else Alert.alert('Error', res.error?.message || 'Failed to add product');
    } catch (err) { Alert.alert('Error', 'Failed to save product. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.container}>
      <Header variant="orange" title={"ADD\nPRODUCT"} showBack={true} onBackPress={() => navigation.goBack()}
        rightComponent={<Badge text="🐕 Watchdog" variant="default" />} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 ? (
          <>
            <Card variant="warning">
              <View style={styles.tipRow}>
                <Text style={{ fontSize: 20 }}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Fastest way to add</Text>
                  <Text style={styles.tipText}>Share any Amazon or Flipkart product page directly to Metio — it'll be added automatically!</Text>
                </View>
              </View>
            </Card>
            <SectionLabel>Or paste a product link</SectionLabel>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>PRODUCT URL</Text>
              <View style={styles.urlInputRow}>
                <TextInput style={styles.urlInput} placeholder="https://www.amazon.in/dp/..." placeholderTextColor="#999" value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
                {url.length > 0 && <TouchableOpacity onPress={() => setUrl('')} style={styles.clearBtn}><Text style={{ color: COLORS.textTertiary, fontSize: 16 }}>✕</Text></TouchableOpacity>}
              </View>
            </View>
            <View style={styles.platformRow}>
              {[{ icon: '🛒', name: 'Amazon' }, { icon: '🛍️', name: 'Flipkart' }, { icon: '🔗', name: 'Any URL' }].map((p, i) => (
                <View key={i} style={styles.platformChip}><Text style={{ fontSize: 14 }}>{p.icon}</Text><Text style={styles.platformText}>{p.name}</Text></View>
              ))}
            </View>
          </>
        ) : (
          <>
            {parsed && <Card variant="success"><View style={styles.tipRow}><Text style={{ fontSize: 20 }}>✓</Text><View style={{ flex: 1 }}><Text style={styles.tipTitle}>Link detected — {parsed.platform}</Text><Text style={styles.tipText} numberOfLines={1}>{parsed.url}</Text></View></View></Card>}
            <SectionLabel>Product Details</SectionLabel>
            {fetching && <Card variant="warning"><View style={styles.tipRow}><ActivityIndicator size="small" color={COLORS.orange} /><View style={{ flex: 1 }}><Text style={styles.tipTitle}>Fetching product details...</Text><Text style={styles.tipText}>Getting name and price from the store</Text></View></View></Card>}
            {!fetching && scrapedPrice > 0 && <Card variant="success"><View style={styles.tipRow}><Text style={{ fontSize: 20 }}>💰</Text><View style={{ flex: 1 }}><Text style={styles.tipTitle}>Current price: ₹{scrapedPrice.toLocaleString('en-IN')}</Text><Text style={styles.tipText}>Set a target price below to get alerted on drops</Text></View></View></Card>}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>PRODUCT NAME</Text>
              <TextInput style={styles.textInput} placeholder="e.g. boAt Rockerz 450 Headphones" placeholderTextColor="#999" value={productName} onChangeText={setProductName} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>TARGET PRICE (₹) — optional</Text>
              <TextInput style={styles.textInput} placeholder="e.g. 999 — alert me when it drops to this" placeholderTextColor="#999" value={productPrice} onChangeText={setProductPrice} keyboardType="numeric" />
              <Text style={styles.inputHint}>Leave blank to get notified on any price drop</Text>
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.bottomActions}>
        {step === 1 ? (
          <Button title="Next →" variant="orange" style={{ flex: 1 }} onPress={() => handleParse()} disabled={!url.trim()} />
        ) : (
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <Button title="← Back" variant="secondary" style={{ flex: 0.35 }} onPress={() => setStep(1)} />
            <Button title={saving ? 'Adding...' : '🐕 Start Tracking →'} variant="orange" style={{ flex: 0.65 }} onPress={handleSave} disabled={saving} />
          </View>
        )}
      </View>
    </View>
  );
};


// ============== PRODUCT DETAIL SCREEN ==============

export const ProductDetailScreen = ({ navigation, route }) => {
  const productId = route.params?.productId || route.params?.product?.id;
  const [item, setItem] = useState(route.params?.product ? enrichItem(route.params.product) : null);
  const [loading, setLoading] = useState(!item);
  const [checking, setChecking] = useState(false);

  const loadProduct = async () => {
    try {
      const res = await watchlistAPI.getOne(productId);
      if (res.success) setItem(enrichItem(res.data));
    } catch (err) { console.warn('Failed to load product:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProduct(); }, [productId]);

  const checkPrice = async () => {
    setChecking(true);
    try { await watchlistAPI.checkPrices(); await loadProduct(); Alert.alert('Price Checked', 'Price has been refreshed from the store.'); }
    catch (err) { Alert.alert('Error', 'Failed to check price. Try again later.'); }
    finally { setChecking(false); }
  };

  const removeProduct = async () => {
    Alert.alert('Remove Product', 'Stop tracking this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await watchlistAPI.remove(productId); navigation.goBack(); }
        catch (err) { Alert.alert('Error', 'Failed to remove product'); }
      }},
    ]);
  };

  if (loading || !item) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={COLORS.orange} /></View>;

  const priceHistory = item.priceHistory || [];
  const lowestPrice = item.lowestPrice || item.currentPrice;
  const highestPrice = item.highestPrice || item.originalPrice || item.currentPrice;
  const metrics = [
    { value: formatPrice(lowestPrice), label: 'Lowest', color: COLORS.success },
    { value: formatPrice(item.currentPrice), label: 'Current' },
    { value: formatPrice(highestPrice), label: 'Highest', color: COLORS.error },
  ];

  return (
    <View style={styles.container}>
      <Header variant={item.priceDropped ? 'orange' : 'gray'} showBack={true} onBackPress={() => navigation.goBack()}
        rightComponent={item.priceDropped ? <Badge text="PRICE DROP!" variant="active" /> : <Badge text="Tracking" variant="default" />}>
        <View style={styles.productHeaderRow}>
          <View style={styles.productHeaderIcon}><Text style={{ fontSize: 32 }}>{item.emoji || '📦'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.productHeaderName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productHeaderMeta}>{item.platformIcon} {item.platform}</Text>
          </View>
        </View>
      </Header>

      <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <MetricsRow metrics={metrics} />

        <Card variant={item.priceDropped ? 'success' : 'default'}>
          <View style={styles.priceHighlight}>
            <View>
              <Text style={styles.priceLabel}>Current Price</Text>
              <Text style={[styles.priceValue, item.priceDropped && { color: COLORS.success }]}>{formatPrice(item.currentPrice)}</Text>
            </View>
            {item.originalPrice && item.originalPrice !== item.currentPrice && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.priceLabel}>Was</Text>
                <Text style={styles.priceOriginal}>{formatPrice(item.originalPrice)}</Text>
                <Badge text={(item.currentPrice < item.originalPrice ? '-' : '+') + Math.abs(Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100)) + '%'}
                  variant={item.currentPrice < item.originalPrice ? 'active' : 'warning'} size="sm" />
              </View>
            )}
          </View>
        </Card>

        {item.targetPrice && (
          <Card>
            <View style={styles.priceHighlight}>
              <View>
                <Text style={styles.priceLabel}>Target Price</Text>
                <Text style={styles.targetPriceValue}>{formatPrice(item.targetPrice)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.priceLabel}>{item.currentPrice <= item.targetPrice ? '🎯 Target hit!' : 'Waiting...'}</Text>
                {item.currentPrice > item.targetPrice && <Text style={styles.targetGap}>{formatPrice(item.currentPrice - item.targetPrice)} to go</Text>}
              </View>
            </View>
          </Card>
        )}

        {/* Price History Chart */}
        <SectionLabel>Price History</SectionLabel>
        <Card>
          <PriceChart priceHistory={priceHistory} currentPrice={item.currentPrice} lowestPrice={lowestPrice} highestPrice={highestPrice} />
        </Card>

        {/* Price History List */}
        {priceHistory.length > 1 && (
          <>
            <SectionLabel>Tracking Log</SectionLabel>
            <Card>
              {priceHistory.slice().reverse().slice(0, 10).map((entry, i) => {
                const prev = priceHistory.slice().reverse()[i + 1];
                const entryPrice = entry.price;
                const prevPrice = prev ? prev.price : null;
                const change = prevPrice ? entryPrice - prevPrice : 0;
                const changePercent = prevPrice ? Math.round((change / prevPrice) * 100) : 0;
                const date = new Date(entry.recordedAt || entry.date);
                const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                return (
                  <View key={entry.id || i} style={[styles.historyRow, i < Math.min(priceHistory.length, 10) - 1 && styles.historyRowBorder]}>
                    <View style={styles.historyLeft}>
                      <Text style={{ fontSize: 14 }}>{change < 0 ? '📉' : change > 0 ? '📈' : '•'}</Text>
                      <Text style={styles.historyDate}>{dateStr}</Text>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={[styles.historyPrice, i === 0 && item.priceDropped && { color: COLORS.success }]}>{formatPrice(entryPrice)}</Text>
                      {change !== 0 && (
                        <View style={[styles.changeBadge, { backgroundColor: change < 0 ? '#DCFCE7' : '#FEE2E2' }]}>
                          <Text style={[styles.changeText, { color: change < 0 ? COLORS.success : COLORS.error }]}>{change < 0 ? '' : '+'}{changePercent}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
              {priceHistory.length > 10 && <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 }}>Showing latest 10 of {priceHistory.length} records</Text>}
            </Card>
          </>
        )}

        <SectionLabel>Product Info</SectionLabel>
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Added</Text>
            <Text style={styles.infoValue}>{new Date(item.createdAt || item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Last checked</Text>
            <Text style={styles.infoValue}>{timeAgo(item.lastChecked)}</Text>
          </View>
        </Card>

        <SectionLabel>Actions</SectionLabel>
        <Card variant="warning">
          <TouchableOpacity style={styles.tipRow} onPress={checkPrice} disabled={checking}>
            <Text style={{ fontSize: 20 }}>{checking ? '⏳' : '🔄'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{checking ? 'Checking...' : 'Check Price Now'}</Text>
              <Text style={styles.tipText}>Fetch the latest price from the store</Text>
            </View>
            <Text style={{ fontSize: 16 }}>→</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button title="🗑️ Remove" variant="secondary" style={{ flex: 0.35 }} onPress={removeProduct} />
        <Button title={item.priceDropped ? '🛒 Buy Now →' : '🔗 View on ' + item.platform} variant="orange" style={{ flex: 0.65 }}
          onPress={() => { if (item.url) Linking.openURL(item.url); }} />
      </View>
    </View>
  );
};


// ============== PRICE ALERTS SCREEN ==============

export const PriceAlertsScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { loadAlerts(); }, []));

  const loadAlerts = async () => {
    try {
      const res = await watchlistAPI.getAlerts(false, 50, 1);
      if (res.success) setAlerts(res.data?.alerts || []);
    } catch (err) { console.warn('Failed to load alerts:', err); }
    finally { setLoading(false); }
  };

  const clearAlerts = () => {
    Alert.alert('Mark All Read', 'Mark all alerts as read?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Read', onPress: async () => {
        try {
          const ids = alerts.filter(a => !a.read).map(a => a.id);
          if (ids.length > 0) await watchlistAPI.markAlertsRead(ids);
          await loadAlerts();
        } catch (err) { console.warn('Failed to mark alerts read:', err); }
      }},
    ]);
  };

  const mapAlert = (alert) => {
    const typeMap = {
      'price_drop': { icon: '📉', displayType: 'drop' },
      'target_hit': { icon: '🎯', displayType: 'drop' },
      'back_in_stock': { icon: '📦', displayType: 'deal' },
      'price_increase': { icon: '📈', displayType: 'tracking' },
    };
    const mapped = typeMap[alert.type] || { icon: '🔔', displayType: 'tracking' };
    return {
      ...alert, icon: mapped.icon, displayType: mapped.displayType,
      title: alert.type === 'target_hit' ? '🎯 Target price hit on ' + alert.productName + '!'
        : alert.type === 'price_drop' ? 'Price dropped on ' + alert.productName + '!'
        : alert.productName + ' — ' + alert.type.replace('_', ' '),
      subtitle: alert.previousPrice && alert.newPrice
        ? formatPrice(alert.previousPrice) + ' → ' + formatPrice(alert.newPrice) + (alert.dropPercentage ? ' (-' + alert.dropPercentage + '%)' : '')
        : alert.productName,
      date: alert.createdAt,
    };
  };

  const displayAlerts = alerts.map(mapAlert);

  const groupByDate = (items) => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    items.forEach(item => {
      const d = new Date(item.date).toDateString();
      let label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(displayAlerts);

  const getAlertStyle = (type) => {
    switch (type) {
      case 'drop': return { bg: '#F0FDF4', border: COLORS.success };
      case 'deal': return { bg: '#FEFCE8', border: COLORS.warning };
      case 'tracking': return { bg: '#F5F5F5', border: COLORS.gray };
      default: return { bg: COLORS.white, border: COLORS.black };
    }
  };

  return (
    <View style={styles.container}>
      <Header variant="gray" title={"PRICE\nALERTS"} showBack={true} onBackPress={() => navigation.goBack()}
        rightComponent={alerts.length > 0 ? <TouchableOpacity onPress={clearAlerts}><Badge text="Mark Read" variant="default" /></TouchableOpacity> : null} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerState}><ActivityIndicator size="large" color={COLORS.orange} /></View>
        ) : displayAlerts.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptyText}>Price drop notifications will appear here when a tracked product's price changes.</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([dateLabel, items]) => (
            <View key={dateLabel}>
              <SectionLabel>{dateLabel}</SectionLabel>
              {items.map(alert => {
                const alertStyle = getAlertStyle(alert.displayType);
                return (
                  <Card key={alert.id} style={{ backgroundColor: alertStyle.bg, borderColor: alertStyle.border }}>
                    <View style={styles.alertRow}>
                      <Text style={{ fontSize: 22 }}>{alert.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Text style={styles.alertSubtitle}>{alert.subtitle}</Text>
                      </View>
                      <Text style={styles.alertTime}>{new Date(alert.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};


// ============== STYLES ==============

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  content: { flex: 1, backgroundColor: COLORS.gray, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, marginTop: -20 },
  contentContainer: { padding: SIZES.lg, paddingBottom: 40 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.md },
  filterChip: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.black, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.black },
  filterChipText: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.black },
  filterChipTextActive: { color: COLORS.orange },
  productRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  productIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.lightGray, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  currentPrice: { fontSize: SIZES.fontLg, fontWeight: '900', color: COLORS.black },
  originalPrice: { fontSize: SIZES.fontSm, color: COLORS.textTertiary, textDecorationLine: 'line-through' },
  productMeta: { flexDirection: 'row', gap: 4 },
  metaText: { fontSize: SIZES.fontXs + 1, color: COLORS.textTertiary },
  deleteBtn: { padding: 8 },
  centerState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: SIZES.fontXl, fontWeight: '700', color: COLORS.black, marginBottom: 6 },
  emptyText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  howRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  howText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, flex: 1 },
  inputWrap: { marginBottom: SIZES.lg },
  inputLabel: { fontSize: SIZES.fontSm - 1, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputHint: { fontSize: SIZES.fontXs + 1, color: COLORS.textTertiary, marginTop: 4, fontStyle: 'italic' },
  urlInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.black, borderRadius: SIZES.radiusMd, overflow: 'hidden' },
  urlInput: { flex: 1, paddingVertical: SIZES.md + 2, paddingHorizontal: SIZES.lg, fontSize: SIZES.fontMd, color: COLORS.black },
  clearBtn: { padding: 12 },
  textInput: { backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.black, borderRadius: SIZES.radiusMd, paddingVertical: SIZES.md + 2, paddingHorizontal: SIZES.lg, fontSize: SIZES.fontMd, color: COLORS.black },
  platformRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  platformChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: COLORS.lightGray, borderRadius: 8 },
  platformText: { fontSize: SIZES.fontXs + 1, color: COLORS.textSecondary },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipTitle: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.black, marginBottom: 2 },
  tipText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, lineHeight: 18 },
  productHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: SIZES.sm },
  productHeaderIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  productHeaderName: { fontSize: SIZES.fontLg, fontWeight: '800', color: COLORS.black, lineHeight: 20 },
  productHeaderMeta: { fontSize: SIZES.fontSm, color: COLORS.black, opacity: 0.7, marginTop: 4 },
  priceHighlight: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: SIZES.fontSm - 1, color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  priceValue: { fontSize: 28, fontWeight: '900', color: COLORS.black },
  priceOriginal: { fontSize: SIZES.fontLg, fontWeight: '600', color: COLORS.textTertiary, textDecorationLine: 'line-through' },
  targetPriceValue: { fontSize: 22, fontWeight: '800', color: COLORS.orange },
  targetGap: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '600' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyPrice: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.black },
  changeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  changeText: { fontSize: SIZES.fontXs, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  infoLabel: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertTitle: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.black, marginBottom: 2 },
  alertSubtitle: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  alertTime: { fontSize: SIZES.fontXs, color: COLORS.textTertiary },
  fab: { position: 'absolute', right: SIZES.lg, bottom: 24, width: 56, height: 56, backgroundColor: COLORS.orange, borderRadius: 28, borderWidth: 2, borderColor: COLORS.black, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.black, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  fabIcon: { fontSize: 28, color: COLORS.black, fontWeight: '600' },
  bottomActions: { backgroundColor: COLORS.black, padding: SIZES.lg, flexDirection: 'row', gap: SIZES.md },
});
