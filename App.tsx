
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Import User from local types file.
import type { Commodity, BuyerOrder, ProducerYield, Theme, TransportBid, User } from './types';
import { supabase } from './services/supabaseClient';
import { fetchCommodityPrices } from './services/geminiService';
import { Header } from './components/Header';
import CommodityList from './components/CommodityList';
import LoadingSpinner from './components/LoadingSpinner';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import YieldForm from './components/YieldForm';
import YieldList from './components/YieldList';
import Tabs from './components/Tabs';
import OfferModal from './components/OfferModal';
import AuthModal from './components/AuthModal';
import SearchInput from './components/SearchInput';
import CompactCommodityList from './components/CompactCommodityList';
import TransportList from './components/TransportList';
import TransportBidModal from './components/TransportBidModal';
import PriceChart from './components/PriceChart';


type Tab = 'orders' | 'yields' | 'prices' | 'transport';
export type SortKey = 'name' | 'price' | 'priceChange';
export type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  // FIX: Corrected typo from Commodority to Commodity.
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [yields, setYields] = useState<ProducerYield[]>([]);
  const [transportBids, setTransportBids] = useState<TransportBid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('yields');
  const [offerModalYield, setOfferModalYield] = useState<ProducerYield | null>(null);
  const [bidModalDeal, setBidModalDeal] = useState<BuyerOrder | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Supabase Auth Listener
  useEffect(() => {
    setIsSessionLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUser(session?.user ?? null);
        setIsSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setIsSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Supabase Real-time Subscriptions
  useEffect(() => {
      if (!currentUser) return; // Don't subscribe if not logged in

      const yieldChannel = supabase.channel('public:producer_yields')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'producer_yields' }, () => fetchYields())
        .subscribe();
        
      const orderChannel = supabase.channel('public:buyer_orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'buyer_orders' }, () => fetchOrders())
        .subscribe();

      const bidChannel = supabase.channel('public:transport_bids')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_bids' }, () => fetchTransportBids())
        .subscribe();

      return () => {
          supabase.removeChannel(yieldChannel);
          supabase.removeChannel(orderChannel);
          supabase.removeChannel(bidChannel);
      };
  }, [currentUser]);

  const fetchYields = async () => {
      const { data, error } = await supabase.from('producer_yields').select('*').order('timestamp', { ascending: false });
      if (error) console.error('Error fetching yields:', error);
      else setYields(data || []);
  };
  const fetchOrders = async () => {
      const { data, error } = await supabase.from('buyer_orders').select('*').order('timestamp', { ascending: false });
      if (error) console.error('Error fetching orders:', error);
      else setOrders(data || []);
  };
  const fetchTransportBids = async () => {
      const { data, error } = await supabase.from('transport_bids').select('*').order('timestamp', { ascending: false });
      if (error) console.error('Error fetching bids:', error);
      else setTransportBids(data || []);
  };
  
  const fetchInitialData = useCallback(async () => {
      await Promise.all([
          fetchYields(),
          fetchOrders(),
          fetchTransportBids()
      ]);
  }, [])


  const loadCommodityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCommodityPrices();
      setCommodities(data);
      if (data.length > 0) {
        setSelectedCommodity(prev => data.find(c => c.id === prev?.id) || data[0]);
      } else {
        setSelectedCommodity(null);
      }
    } catch (err) {
      setError('Failed to fetch commodity prices. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data only when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadCommodityData();
      fetchInitialData();
    }
  }, [currentUser, loadCommodityData, fetchInitialData]);


  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSelectCommodity = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
  };

  const handleAddOrder = async (order: Omit<BuyerOrder, 'id' | 'timestamp' | 'buyerName' | 'user_id'>) => {
    if (!currentUser) return;
    const { error } = await supabase.from('buyer_orders').insert({ 
      ...order,
      buyerName: currentUser.email,
      user_id: currentUser.id
    });
    if (error) {
      console.error("Error adding order:", error);
      setError("Could not post your order. Please try again.");
    } else {
      setOfferModalYield(null); // Close modal on success
    }
  };

  const handleAddYield = async (yieldPost: Omit<ProducerYield, 'id' | 'timestamp' | 'producerName' | 'user_id'>) => {
    if(!currentUser) return;
    const { error } = await supabase.from('producer_yields').insert({
        ...yieldPost,
        producerName: currentUser.email,
        user_id: currentUser.id,
    });
    if (error) {
        console.error("Error adding yield:", error);
        setError("Could not post your yield. Please try again.");
    }
  };
  
  const handleAddTransportBid = async (bid: Omit<TransportBid, 'id' | 'timestamp' | 'transporterName' | 'user_id'>) => {
    if (!currentUser) return;
     const { error } = await supabase.from('transport_bids').insert({
        ...bid,
        transporterName: currentUser.email,
        user_id: currentUser.id,
    });
    if (error) {
        console.error("Error adding transport bid:", error);
        setError("Could not post your bid. Please try again.");
    } else {
        setBidModalDeal(null); // Close modal
    }
  }

  const handleOpenOfferModal = (yieldPost: ProducerYield) => {
    setOfferModalYield(yieldPost);
  };

  const handleCloseOfferModal = () => {
    setOfferModalYield(null);
  };
  
  const handleOpenBidModal = (deal: BuyerOrder) => {
    setBidModalDeal(deal);
  }
  
  const handleCloseBidModal = () => {
    setBidModalDeal(null);
  }

  const handleSignIn = async (email: string) => {
    // FIX: Add `emailRedirectTo` to ensure the magic link returns to the correct application URL,
    // not the default localhost:3000.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
        console.error('Error signing in:', error);
        throw error;
    }
  };

  const handleSignOut = async () => {
    // FIX: A type error on this line is likely a symptom of a broader type resolution issue.
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCommodities([]);
    setSelectedCommodity(null);
    setOrders([]);
    setYields([]);
    setTransportBids([]);
  };
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery(''); // Reset search on tab change
  };

  const handleSortRequest = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Filtering logic
  const filteredCommodities = useMemo(() => {
    if (!searchQuery) return commodities;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return commodities.filter(c => 
      c.name.toLowerCase().includes(lowerCaseQuery)
    );
  }, [commodities, searchQuery]);

  // Sorting logic
  const sortedAndFilteredCommodities = useMemo(() => {
    const sortableItems = [...filteredCommodities];
    sortableItems.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return sortableItems;
  }, [filteredCommodities, sortConfig]);


  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return orders.filter(o =>
      o.commodityName.toLowerCase().includes(lowerCaseQuery) ||
      o.buyerName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [orders, searchQuery]);

  const filteredYields = useMemo(() => {
    if (!searchQuery) return yields;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return yields.filter(y =>
      y.commodityName.toLowerCase().includes(lowerCaseQuery) ||
      y.producerName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [yields, searchQuery]);
  
  const completedDeals = useMemo(() => {
    return orders.filter(o => !!o.yieldId);
  }, [orders]);

  const filteredDeals = useMemo(() => {
      if (!searchQuery) return completedDeals;
      const lowerCaseQuery = searchQuery.toLowerCase();
      return completedDeals.filter(d =>
          d.commodityName.toLowerCase().includes(lowerCaseQuery) ||
          d.producerName?.toLowerCase().includes(lowerCaseQuery) ||
          d.buyerName.toLowerCase().includes(lowerCaseQuery)
      );
  }, [completedDeals, searchQuery]);

  const getSearchPlaceholder = (tab: Tab): string => {
    switch (tab) {
        case 'prices':
            return 'Search commodities by name...';
        case 'orders':
            return 'Search orders by commodity or buyer...';
        case 'yields':
            return 'Search yields by commodity or producer...';
        case 'transport':
            return 'Search gigs by commodity, producer, or buyer...';
        default:
            return 'Search...';
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
          <LoadingSpinner />
          <p className="mt-4 text-lg">Fetching latest market data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <p className="text-xl font-semibold">An Error Occurred</p>
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      );
    }

    if (commodities.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
          <p>No commodity data available at the moment.</p>
           <button
            onClick={loadCommodityData}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry Fetching Data
          </button>
        </div>
      );
    }

    return (
      <>
        <Tabs activeTab={activeTab} onTabClick={handleTabChange} />
        <div className="mt-6">
          <div className="mb-6">
            <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getSearchPlaceholder(activeTab)} 
            />
          </div>

          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Post a General Buyer Request</h2>
                <OrderForm commodities={commodities} onAddOrder={handleAddOrder} />
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Live Buyer Orders & Offers</h2>
                <OrderList orders={filteredOrders} searchQuery={searchQuery} />
              </div>
            </div>
          )}

          {activeTab === 'yields' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Post an Expected Yield</h2>
                  <YieldForm commodities={commodities} onAddYield={handleAddYield} />
                </div>
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Producer Yield Postings</h2>
                  <YieldList yields={filteredYields} orders={orders} onMakeOffer={handleOpenOfferModal} searchQuery={searchQuery} />
                </div>
              </div>
          )}
          
          {activeTab === 'prices' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                 <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Select Commodity</h2>
                <CompactCommodityList
                  commodities={sortedAndFilteredCommodities}
                  selectedCommodityId={selectedCommodity?.id}
                  onSelectCommodity={handleSelectCommodity}
                />
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Detailed Market Data</h2>
                <div className="space-y-8">
                  <CommodityList
                    commodities={sortedAndFilteredCommodities}
                    selectedCommodityId={selectedCommodity?.id}
                    onSelectCommodity={handleSelectCommodity}
                    searchQuery={searchQuery}
                    sortConfig={sortConfig}
                    onSort={handleSortRequest}
                  />
                  {selectedCommodity && <PriceChart commodity={selectedCommodity} theme={theme} />}
                </div>
              </div>
           </div>
          )}

          {activeTab === 'transport' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Available Transport Gigs</h2>
               <TransportList
                  deals={filteredDeals}
                  bids={transportBids}
                  onPlaceBid={handleOpenBidModal}
                  searchQuery={searchQuery}
               />
            </div>
          )}
        </div>
      </>
    );
  };

  if (isSessionLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200">
      <Header currentUser={currentUser} onSignOut={handleSignOut} theme={theme} onThemeToggle={handleThemeToggle} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!currentUser ? (
            <AuthModal onSignIn={handleSignIn} />
        ) : (
            renderContent()
        )}
      </main>
      {currentUser && offerModalYield && (
        <OfferModal
          yieldPost={offerModalYield}
          isOpen={!!offerModalYield}
          onClose={handleCloseOfferModal}
          onAddOrder={handleAddOrder}
        />
      )}
      {currentUser && bidModalDeal && (
        <TransportBidModal
          deal={bidModalDeal}
          isOpen={!!bidModalDeal}
          onClose={handleCloseBidModal}
          onAddBid={handleAddTransportBid}
        />
      )}
    </div>
  );
};

export default App;