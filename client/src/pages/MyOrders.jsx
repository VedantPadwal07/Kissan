import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/orders/my-orders');
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleComplete = async (orderId) => {
        try {
            await axios.put(`/orders/${orderId}/complete`);
            const updatedOrders = orders.map(o => {
                if (o._id === orderId) return { ...o, order_status: 'completed' };
                return o;
            });
            setOrders(updatedOrders);
            alert("Order completed successfully");
        } catch (err) {
            alert("Failed to complete order: " + (err.response?.data?.msg || err.message));
        }
    };

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Orders</h2>

            </div>
            <Table striped bordered hover responsive className="align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>Product</th>
                        <th>Farmer</th>
                        <th>Qty</th>
                        <th>Price/kg</th>
                        <th>Total</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>
                                <div className="d-flex align-items-center">
                                    <img
                                        src={order.product_id?.image_url || 'https://via.placeholder.com/50'}
                                        alt={order.product_id?.crop_name || 'Product'}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }}
                                    />
                                    <div>
                                        <div className="fw-bold">{order.product_id?.crop_name || 'Unknown'}</div>
                                        <small className="text-muted">{new Date(order.order_date).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            </td>
                            <td>{order.farmer_id?.name || 'Unknown Farmer'}</td>
                            <td>{order.requested_quantity} kg</td>
                            <td>₹{order.negotiated_price}</td>
                            <td className="fw-bold">₹{order.requested_quantity * order.negotiated_price}</td>
                            <td>
                                <Badge bg={order.payment_method === 'Cash' ? 'secondary' : 'info'}>
                                    {order.payment_method.toUpperCase()}
                                </Badge>
                            </td>
                            <td>
                                <Badge bg={
                                    order.order_status === 'completed' ? 'success' :
                                        order.order_status === 'approved' ? 'primary' :
                                            order.order_status === 'rejected' ? 'danger' : 'warning'
                                }>
                                    {order.order_status.toUpperCase()}
                                </Badge>
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Link to={`/chat/${order.farmer_id?._id}`} className="btn btn-sm btn-outline-primary">
                                        <i className="bi bi-chat-dots"></i> Chat
                                    </Link>

                                    {order.order_status === 'approved' && (
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => handleComplete(order._id)}
                                        >
                                            <i className="bi bi-check-circle-fill"></i> Mark Completed
                                        </Button>
                                    )}

                                    {order.order_status === 'completed' && order.product_id && (
                                        <Link
                                            to={`/product/${order.product_id._id}`}
                                            className="btn btn-sm btn-warning text-dark"
                                        >
                                            <i className="bi bi-star-fill"></i> Add Review
                                        </Link>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan="8" className="text-center py-5 text-muted">No orders found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default MyOrders;
