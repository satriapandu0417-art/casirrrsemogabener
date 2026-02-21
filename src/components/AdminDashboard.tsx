import { useState } from 'react';
import React from 'react';
import { useStore } from '../hooks/useStore';
import { formatCurrency } from '../utils';
import { ItemModal } from './ItemModal';
import { OrderDetailPanel } from './OrderDetailPanel';
import { DailyAnalytics } from './DailyAnalytics';
import { MenuItem, Order, OrderStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  DollarSign,
  Package,
  ChefHat,
  ShoppingBag,
  Lock,
  Wifi,
  WifiOff
} from 'lucide-react';

export function AdminDashboard() {
  const { menu, orders, addMenuItem, updateMenuItem, deleteMenuItem, updateOrderStatus, deleteOrder, isRealtime } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics'>('orders');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Derive selectedOrder from the live orders array to ensure updates (like checklist toggles) reflect immediately
  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  // Stats
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Picked Up').length;

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (itemData: Omit<MenuItem, 'id'>) => {
    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }
    setEditingItem(undefined);
  };

  const handleDeleteOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
      deleteOrder(orderId);
    }
  };

  const handleCancelOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'Cancelled');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'All') return true;
    return order.status === orderFilter;
  });

  const filterTabs: (OrderStatus | 'All')[] = ['All', 'Pending', 'Preparing', 'Completed', 'Picked Up', 'Cancelled'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingOrders}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{completedOrders}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'orders' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Orders History
          {activeTab === 'orders' && (
            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'menu' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Menu Management
          {activeTab === 'menu' && (
            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'analytics' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
          {activeTab === 'analytics' && (
            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {/* Order Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filterTabs.map(status => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    orderFilter === status
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredOrders.map(order => (
              <motion.div 
                key={order.id} 
                layoutId={`order-${order.id}`}
                onClick={() => setSelectedOrderId(order.id)}
                className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all hover:border-orange-200 ${
                  order.status === 'Picked Up' ? 'opacity-75' : 
                  order.status === 'Cancelled' ? 'opacity-60 grayscale bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                    order.status === 'Picked Up' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                    order.status === 'Preparing' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status === 'Preparing' ? <ChefHat className="w-5 h-5" /> : 
                     order.status === 'Picked Up' ? <ShoppingBag className="w-5 h-5" /> :
                     order.status === 'Cancelled' ? <XCircle className="w-5 h-5" /> :
                     <Package className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-gray-900 ${order.status === 'Cancelled' ? 'line-through text-gray-500' : ''}`}>{order.customerName}</h4>
                      <span className="text-xs text-gray-400">#{order.id}</span>
                      {order.status === 'Picked Up' && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`font-bold text-gray-900 ${order.status === 'Cancelled' ? 'line-through text-gray-400' : ''}`}>{formatCurrency(order.total)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      order.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                      order.status === 'Picked Up' ? 'bg-blue-50 text-blue-600' :
                      order.status === 'Preparing' ? 'bg-orange-50 text-orange-600' :
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                    {order.status !== 'Cancelled' && order.status !== 'Picked Up' && (
                      <button
                        onClick={(e) => handleCancelOrder(e, order.id)}
                        className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteOrder(e, order.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        ) : activeTab === 'menu' ? (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setEditingItem(undefined);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
              >
                <Plus className="w-4 h-4" />
                Add New Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {item.category}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(item.basePrice)}</p>
                  
                  {item.bundle?.enabled && (
                    <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-600">
                      <p className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Bundle: {item.bundle.buyQuantity} for {formatCurrency(item.bundle.bundlePrice)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DailyAnalytics orders={orders} />
        )}
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailPanel 
            order={selectedOrder} 
            onClose={() => setSelectedOrderId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
