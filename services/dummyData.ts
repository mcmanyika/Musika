
import type { Commodity, ProducerYield, BuyerOrder, TransportBid } from '../types';

// Omit database-generated fields
type DummyYield = Omit<ProducerYield, 'id' | 'timestamp' | 'user_id' | 'producerName'> & { _id: string, producerName: string };
type DummyOrder = Omit<BuyerOrder, 'id' | 'timestamp' | 'user_id' | 'buyerName'> & { _id: string, buyerName: string };
type DummyBid = Omit<TransportBid, 'id' | 'timestamp' | 'user_id' | 'transporterName'> & { transporterName: string };

const today = new Date();
const getDate = (offset: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
};

const getHistoryDate = (offset: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const dummyCommodities: Commodity[] = [
    {
        id: "tomatoes",
        name: "Tomatoes",
        unit: "bucket",
        price: 7.50,
        priceChange: 0.25,
        history: [
            { date: getHistoryDate(6), price: 7.10 },
            { date: getHistoryDate(5), price: 7.20 },
            { date: getHistoryDate(4), price: 7.00 },
            { date: getHistoryDate(3), price: 7.30 },
            { date: getHistoryDate(2), price: 7.25 },
            { date: getHistoryDate(1), price: 7.25 },
            { date: getHistoryDate(0), price: 7.50 },
        ]
    },
    {
        id: "onions",
        name: "Onions",
        unit: "10kg pocket",
        price: 12.00,
        priceChange: -0.50,
        history: [
            { date: getHistoryDate(6), price: 11.80 },
            { date: getHistoryDate(5), price: 12.10 },
            { date: getHistoryDate(4), price: 12.30 },
            { date: getHistoryDate(3), price: 12.50 },
            { date: getHistoryDate(2), price: 12.60 },
            { date: getHistoryDate(1), price: 12.50 },
            { date: getHistoryDate(0), price: 12.00 },
        ]
    },
     {
        id: "maize-meal",
        name: "Maize Meal",
        unit: "10kg bag",
        price: 8.00,
        priceChange: 0.00,
        history: [
            { date: getHistoryDate(6), price: 8.00 },
            { date: getHistoryDate(5), price: 7.90 },
            { date: getHistoryDate(4), price: 8.00 },
            { date: getHistoryDate(3), price: 8.10 },
            { date: getHistoryDate(2), price: 8.00 },
            { date: getHistoryDate(1), price: 8.00 },
            { date: getHistoryDate(0), price: 8.00 },
        ]
    },
];

export const dummyYields: DummyYield[] = [
    {
        _id: 'yield1',
        commodityName: "Tomatoes",
        commodityUnit: "bucket",
        expectedQuantity: 200,
        expectedDate: getDate(14),
        producerName: "Farm Fresh Inc."
    },
    {
        _id: 'yield2',
        commodityName: "Onions",
        commodityUnit: "10kg pocket",
        expectedQuantity: 500,
        expectedDate: getDate(21),
        producerName: "Green Valley Produce"
    }
];

export const dummyOrders: DummyOrder[] = [
    {
        _id: 'order1',
        commodityName: "Tomatoes",
        commodityUnit: "bucket",
        quantity: 50,
        offerPrice: 7.20,
        yieldId: 'yield1',
        producerName: "Farm Fresh Inc.",
        buyerName: "City Supermarket"
    },
    {
        _id: 'order2',
        commodityName: "Maize Meal",
        commodityUnit: "10kg bag",
        quantity: 100,
        offerPrice: 7.80,
        buyerName: "Local Grocers"
    },
     {
        _id: 'order3',
        commodityName: "Onions",
        commodityUnit: "10kg pocket",
        quantity: 75,
        offerPrice: 11.50,
        yieldId: 'yield2',
        producerName: "Green Valley Produce",
        buyerName: "Restaurant Supply Co."
    }
];

export const dummyTransportBids: DummyBid[] = [
    {
        orderId: 'order1',
        bidAmount: 60,
        estimatedDeliveryDate: getDate(15),
        transporterName: "Fast Haulage"
    },
    {
        orderId: 'order1',
        bidAmount: 55,
        estimatedDeliveryDate: getDate(16),
        transporterName: "Zim Logistics"
    },
    {
        orderId: 'order3',
        bidAmount: 120,
        estimatedDeliveryDate: getDate(22),
        transporterName: "Capital Transport"
    }
];
