import React, { useState, useMemo } from 'react';
import type { ProducerYield, BuyerOrder, TransportBid, UserRatingStats, Commodity } from '../../types';
import YieldList from '../lists/YieldList';
import OrderList from '../lists/OrderList';
import Pagination from '../ui/Pagination';
import StarRating from '../ui/StarRating';
import EditYieldModal from '../modals/EditYieldModal';
import BuyerDetailsModal from '../modals/BuyerDetailsModal';
import TransporterDetailsModal from '../modals/TransporterDetailsModal';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface TransportBidListProps {
  bids: TransportBid[];
  orders: BuyerOrder[];
  yields?: ProducerYield[];
  userRatingStatsMap?: Record<string, UserRatingStats>;
  onTransporterClick?: (bid: TransportBid) => void;
}

interface MyOrderListProps {
  orders: BuyerOrder[];
  userRatingStatsMap?: Record<string, UserRatingStats>;
  onOrderClick: (order: BuyerOrder) => void;
}

const MyOrderList: React.FC<MyOrderListProps> = ({ orders, userRatingStatsMap, onOrderClick }) => {
  const MyOrderItem: React.FC<{ order: BuyerOrder }> = ({ order }) => {
    const isOffer = !!order.yieldId;

    return (
      <div 
        onClick={() => onOrderClick(order)}
        className={`p-4 rounded-lg shadow-sm border transition-all cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 ${isOffer ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">
              {isOffer && <span className="text-emerald-600 dark:text-emerald-400 font-normal">Offer for </span>}
              {order.commodityName}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Wants: {order.quantity} {order.commodityUnit}(s)
            </p>
            {isOffer && order.producerName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Producer: <span className="font-medium">{order.producerName}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">{formatPrice(order.offerPrice)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">per unit</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate" title={order.buyerName}>
              Buyer: <span className="font-normal">{order.buyerName}</span>
            </p>
            <StarRating
              rating={userRatingStatsMap?.[order.user_id]?.average_overall || 0}
              size="sm"
              readOnly
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatTimeAgo(order.timestamp)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <MyOrderItem key={order.id} order={order} />
      ))}
    </div>
  );
};

interface MyYieldListProps {
  yields: ProducerYield[];
  orders: BuyerOrder[];
  currentUserId: string;
  userRatingStatsMap?: Record<string, UserRatingStats>;
  onEdit: (yieldPost: ProducerYield) => void;
}

const MyYieldList: React.FC<MyYieldListProps> = ({ yields, orders, currentUserId, userRatingStatsMap, onEdit }) => {
  const MyYieldItem: React.FC<{ yieldPost: ProducerYield; orders: BuyerOrder[] }> = ({ yieldPost, orders }) => {
    const { offerCount, highestOffer } = useMemo(() => {
      const relevantOffers = orders.filter(o => o.yieldId === yieldPost.id);
      const count = relevantOffers.length;
      const highest = relevantOffers.reduce((max, order) => order.offerPrice > max ? order.offerPrice : max, 0);
      return { offerCount: count, highestOffer: highest };
    }, [orders, yieldPost.id]);

    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-md flex flex-col sm:flex-row sm:space-x-4">
        {yieldPost.productImage && (
          <div className="flex-shrink-0 w-full sm:w-32 mb-4 sm:mb-0">
            <img
              src={yieldPost.productImage}
              alt={yieldPost.commodityName}
              className="w-full h-32 sm:w-32 sm:h-32 object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex-grow flex flex-col">
          <div className="flex justify-between items-start flex-grow">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100">{yieldPost.commodityName}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Expected: {yieldPost.expectedQuantity} {yieldPost.commodityUnit}(s)
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                Producer: <span className="font-normal">{yieldPost.producerName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-md text-emerald-600 dark:text-emerald-400">Available From</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(yieldPost.expectedDate)}</p>
              {userRatingStatsMap && (
                <div className="mt-2 flex justify-end">
                  <StarRating
                    rating={userRatingStatsMap[yieldPost.user_id]?.average_overall || 0}
                    size="sm"
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
            <div className="text-sm">
              <p className="dark:text-slate-200">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{offerCount}</span> {offerCount === 1 ? 'Offer' : 'Offers'}
              </p>
              {highestOffer > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Top Bid: <span className="font-bold">{formatPrice(highestOffer)}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => onEdit(yieldPost)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {yields.map(yieldPost => (
        <MyYieldItem key={yieldPost.id} yieldPost={yieldPost} orders={orders} />
      ))}
    </div>
  );
};

const TransportBidList: React.FC<TransportBidListProps> = ({ bids, orders, yields, userRatingStatsMap, onTransporterClick }) => {
  return (
    <div className="space-y-3">
      {bids.map(bid => {
        const order = orders.find(o => o.id === bid.orderId);
        if (!order) return null;

        const yieldPost = order.yieldId ? yields?.find(y => y.id === order.yieldId) : null;

        return (
          <div 
            key={bid.id} 
            onClick={() => onTransporterClick?.(bid)}
            className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-all ${onTransporterClick ? 'cursor-pointer hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600' : 'hover:shadow-md'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{order.commodityName}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {order.quantity} {order.commodityUnit}(s) from {order.producerName || 'Producer'} to {order.buyerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Your Bid</p>
                <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">{formatPrice(bid.bidAmount)}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {yieldPost && (
                <div className="flex items-center gap-2">
                  <p><span className="font-semibold">Producer:</span> {yieldPost.producerName}</p>
                  {userRatingStatsMap && (
                    <StarRating
                      rating={userRatingStatsMap[yieldPost.user_id]?.average_overall || 0}
                      size="sm"
                      readOnly
                    />
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <p><span className="font-semibold">Buyer:</span> {order.buyerName}</p>
                {userRatingStatsMap && (
                  <StarRating
                    rating={userRatingStatsMap[order.user_id]?.average_overall || 0}
                    size="sm"
                    readOnly
                  />
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
              <div className="text-sm">
                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Estimated Delivery:</span> {formatDate(bid.estimatedDeliveryDate)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatTimeAgo(bid.timestamp)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface MyListingsPageProps {
  yields: ProducerYield[];
  orders: BuyerOrder[];
  transportBids: TransportBid[];
  commodities: Commodity[];
  currentUserId: string;
  userRatingStatsMap?: Record<string, UserRatingStats>;
  itemsPerPage?: number;
  onMakeOffer?: (yieldPost: ProducerYield) => void;
  onUpdateYield: (id: string, yieldPost: Omit<ProducerYield, 'id' | 'timestamp' | 'producerName' | 'user_id'>) => Promise<void>;
}

type ListingTab = 'yields' | 'orders' | 'transport';

const MyListingsPage: React.FC<MyListingsPageProps> = ({
  yields,
  orders,
  transportBids,
  commodities,
  currentUserId,
  userRatingStatsMap,
  itemsPerPage = 10,
  onMakeOffer,
  onUpdateYield,
}) => {
  const [activeTab, setActiveTab] = useState<ListingTab>('yields');
  const [yieldsPage, setYieldsPage] = useState<number>(1);
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [transportPage, setTransportPage] = useState<number>(1);
  const [editingYield, setEditingYield] = useState<ProducerYield | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);
  const [isBuyerDetailsModalOpen, setIsBuyerDetailsModalOpen] = useState<boolean>(false);
  const [selectedTransportBid, setSelectedTransportBid] = useState<TransportBid | null>(null);
  const [isTransporterDetailsModalOpen, setIsTransporterDetailsModalOpen] = useState<boolean>(false);

  // Filter listings to only show those posted by the current user
  const myYields = yields.filter(y => y.user_id === currentUserId);
  const myOrders = orders.filter(o => o.user_id === currentUserId);
  const myTransportBids = transportBids.filter(tb => tb.user_id === currentUserId);

  // Pagination calculations
  const paginatedYields = myYields.slice((yieldsPage - 1) * itemsPerPage, yieldsPage * itemsPerPage);
  const paginatedOrders = myOrders.slice((ordersPage - 1) * itemsPerPage, ordersPage * itemsPerPage);
  const paginatedTransportBids = myTransportBids.slice((transportPage - 1) * itemsPerPage, transportPage * itemsPerPage);

  const tabs: { id: ListingTab; label: string; count: number }[] = [
    {
      id: 'yields',
      label: 'My Yields',
      count: myYields.length,
    },
    {
      id: 'orders',
      label: 'My Orders',
      count: myOrders.length,
    },
    {
      id: 'transport',
      label: 'My Transport Bids',
      count: myTransportBids.length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Listings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your posted yields, orders, and transport bids
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'yields' && (
          <div className="space-y-4">
            {myYields.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[200px]">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                    No yield postings
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You haven't posted any producer yields yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <MyYieldList
                  yields={paginatedYields}
                  orders={orders}
                  currentUserId={currentUserId}
                  userRatingStatsMap={userRatingStatsMap}
                  onEdit={(yieldPost) => {
                    setEditingYield(yieldPost);
                    setIsEditModalOpen(true);
                  }}
                />
                {myYields.length > 0 && (
                  <Pagination
                    currentPage={yieldsPage}
                    totalPages={Math.ceil(myYields.length / itemsPerPage)}
                    onPageChange={setYieldsPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={myYields.length}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[200px]">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                    No buyer orders
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You haven't posted any buyer orders yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <MyOrderList
                  orders={paginatedOrders}
                  userRatingStatsMap={userRatingStatsMap}
                  onOrderClick={(order) => {
                    setSelectedOrder(order);
                    setIsBuyerDetailsModalOpen(true);
                  }}
                />
                {myOrders.length > 0 && (
                  <Pagination
                    currentPage={ordersPage}
                    totalPages={Math.ceil(myOrders.length / itemsPerPage)}
                    onPageChange={setOrdersPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={myOrders.length}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'transport' && (
          <div className="space-y-4">
            {myTransportBids.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[200px]">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                    No transport bids
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You haven't placed any transport bids yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <TransportBidList
                  bids={paginatedTransportBids}
                  orders={orders}
                  yields={yields}
                  userRatingStatsMap={userRatingStatsMap}
                  onTransporterClick={(bid) => {
                    setSelectedTransportBid(bid);
                    setIsTransporterDetailsModalOpen(true);
                  }}
                />
                {myTransportBids.length > 0 && (
                  <Pagination
                    currentPage={transportPage}
                    totalPages={Math.ceil(myTransportBids.length / itemsPerPage)}
                    onPageChange={setTransportPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={myTransportBids.length}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Yield Modal */}
      {editingYield && (
        <EditYieldModal
          yieldPost={editingYield}
          commodities={commodities}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingYield(null);
          }}
          onUpdateYield={async (id, yieldPost) => {
            await onUpdateYield(id, yieldPost);
            setIsEditModalOpen(false);
            setEditingYield(null);
          }}
        />
      )}

      {/* Buyer Details Modal */}
      {selectedOrder && (
        <BuyerDetailsModal
          order={selectedOrder}
          isOpen={isBuyerDetailsModalOpen}
          onClose={() => {
            setIsBuyerDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          userRatingStats={selectedOrder.user_id ? userRatingStatsMap?.[selectedOrder.user_id] : undefined}
        />
      )}

      {/* Transporter Details Modal */}
      {selectedTransportBid && (
        <TransporterDetailsModal
          transportBid={selectedTransportBid}
          isOpen={isTransporterDetailsModalOpen}
          onClose={() => {
            setIsTransporterDetailsModalOpen(false);
            setSelectedTransportBid(null);
          }}
          userRatingStats={selectedTransportBid.user_id ? userRatingStatsMap?.[selectedTransportBid.user_id] : undefined}
        />
      )}
    </div>
  );
};

export default MyListingsPage;
