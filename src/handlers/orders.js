const { DatabaseService } = require('./utils/database');
const { requireAuth, createResponse, hasRole } = require('./utils/auth');
const { validateOrder, validateAssignment, validateCompletion, validateOrderStatus } = require('./utils/validation');

const db = new DatabaseService();

// POST /orders - Create new order
exports.createOrder = async (event) => {
    console.log('Creating order', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate and authorize
        const authResult = await requireAuth(['dispatcher', 'admin'])(event);
        if (authResult.statusCode) {
            return authResult; // Return error response
        }

        const { userInfo } = authResult;
        const orderData = JSON.parse(event.body || '{}');

        // Validate input
        const validation = validateOrder(orderData);
        if (!validation.isValid) {
            return createResponse(400, {
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Add metadata
        orderData.createdBy = userInfo.sub;

        // Create order
        const order = await db.createOrder(orderData);

        console.log('Order created successfully', { 
            requestId: event.requestContext.requestId,
            orderId: order.orderId,
            createdBy: userInfo.sub
        });

        return createResponse(201, order);

    } catch (error) {
        console.error('Error creating order:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to create order'
        });
    }
};

// PATCH /orders/{orderId}/assign - Assign order to driver
exports.assignOrder = async (event) => {
    console.log('Assigning order', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate and authorize
        const authResult = await requireAuth(['dispatcher', 'admin'])(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const orderId = event.pathParameters?.orderId;
        const { driverId } = JSON.parse(event.body || '{}');

        // Validate input
        const validation = validateAssignment(orderId, driverId);
        if (!validation.isValid) {
            return createResponse(400, {
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Check if order exists
        const order = await db.getOrder(orderId);
        if (!order) {
            return createResponse(404, {
                error: 'Order not found'
            });
        }

        // Check if driver exists
        const driver = await db.getDriver(driverId);
        if (!driver) {
            return createResponse(404, {
                error: 'Driver not found'
            });
        }

        // Attempt assignment (transactional)
        try {
            await db.assignOrder(orderId, driverId, userInfo.sub);
            
            console.log('Order assigned successfully', {
                requestId: event.requestContext.requestId,
                orderId,
                driverId,
                assignedBy: userInfo.sub
            });

            // Return updated order
            const updatedOrder = await db.getOrder(orderId);
            return createResponse(200, updatedOrder);

        } catch (assignmentError) {
            console.warn('Assignment conflict', {
                requestId: event.requestContext.requestId,
                orderId,
                driverId,
                error: assignmentError.message
            });

            return createResponse(409, {
                error: 'Assignment conflict',
                message: assignmentError.message
            });
        }

    } catch (error) {
        console.error('Error assigning order:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to assign order'
        });
    }
};

// POST /orders/{orderId}/start - Start delivery (driver only)
exports.startDelivery = async (event) => {
    console.log('Starting delivery', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate (driver only)
        const authResult = await requireAuth(['driver'])(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const orderId = event.pathParameters?.orderId;

        if (!orderId) {
            return createResponse(400, {
                error: 'Order ID is required'
            });
        }

        // Get order
        const order = await db.getOrder(orderId);
        if (!order) {
            return createResponse(404, {
                error: 'Order not found'
            });
        }

        // Check if order is assigned to this driver
        if (order.assignedTo !== userInfo.sub) {
            return createResponse(403, {
                error: 'Forbidden',
                message: 'Order not assigned to you'
            });
        }

        // Check if order is in correct status
        if (order.status !== 'ASSIGNED') {
            return createResponse(409, {
                error: 'Invalid status',
                message: `Cannot start delivery from status: ${order.status}`
            });
        }

        // Update order to ENROUTE
        const updatedOrder = await db.updateOrder(orderId, { 
            status: 'ENROUTE',
            startedAt: new Date().toISOString()
        }, userInfo.sub);

        console.log('Delivery started successfully', {
            requestId: event.requestContext.requestId,
            orderId,
            driverId: userInfo.sub
        });

        return createResponse(200, updatedOrder);

    } catch (error) {
        console.error('Error starting delivery:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to start delivery'
        });
    }
};

// POST /orders/{orderId}/complete - Complete delivery (driver only)
exports.completeDelivery = async (event) => {
    console.log('Completing delivery', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate (driver only)
        const authResult = await requireAuth(['driver'])(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const orderId = event.pathParameters?.orderId;
        const completionData = JSON.parse(event.body || '{}');

        if (!orderId) {
            return createResponse(400, {
                error: 'Order ID is required'
            });
        }

        // Validate completion data
        const validation = validateCompletion(completionData);
        if (!validation.isValid) {
            return createResponse(400, {
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Get order
        const order = await db.getOrder(orderId);
        if (!order) {
            return createResponse(404, {
                error: 'Order not found'
            });
        }

        // Check if order is assigned to this driver
        if (order.assignedTo !== userInfo.sub) {
            return createResponse(403, {
                error: 'Forbidden',
                message: 'Order not assigned to you'
            });
        }

        // Attempt completion (transactional)
        try {
            await db.completeOrder(orderId, userInfo.sub, completionData, userInfo.sub);
            
            console.log('Delivery completed successfully', {
                requestId: event.requestContext.requestId,
                orderId,
                driverId: userInfo.sub
            });

            // Return updated order
            const updatedOrder = await db.getOrder(orderId);
            return createResponse(200, updatedOrder);

        } catch (completionError) {
            console.warn('Completion conflict', {
                requestId: event.requestContext.requestId,
                orderId,
                error: completionError.message
            });

            return createResponse(409, {
                error: 'Completion conflict',
                message: completionError.message
            });
        }

    } catch (error) {
        console.error('Error completing delivery:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to complete delivery'
        });
    }
};

// POST /orders/{orderId}/cancel - Cancel order
exports.cancelOrder = async (event) => {
    console.log('Cancelling order', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate and authorize
        const authResult = await requireAuth(['dispatcher', 'admin'])(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const orderId = event.pathParameters?.orderId;

        if (!orderId) {
            return createResponse(400, {
                error: 'Order ID is required'
            });
        }

        // Get order
        const order = await db.getOrder(orderId);
        if (!order) {
            return createResponse(404, {
                error: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (order.status === 'COMPLETED') {
            return createResponse(409, {
                error: 'Cannot cancel completed order'
            });
        }

        if (order.status === 'CANCELLED') {
            return createResponse(409, {
                error: 'Order already cancelled'
            });
        }

        // Update order status
        const updatedOrder = await db.updateOrder(orderId, { 
            status: 'CANCELLED',
            cancelledAt: new Date().toISOString(),
            cancelledBy: userInfo.sub
        }, userInfo.sub);

        // If order was assigned, clear driver's active order
        if (order.assignedTo) {
            await db.updateDriver(order.assignedTo, { activeOrderId: null });
        }

        console.log('Order cancelled successfully', {
            requestId: event.requestContext.requestId,
            orderId,
            cancelledBy: userInfo.sub
        });

        return createResponse(200, updatedOrder);

    } catch (error) {
        console.error('Error cancelling order:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to cancel order'
        });
    }
};

// GET /orders - List orders
exports.listOrders = async (event) => {
    console.log('Listing orders', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate
        const authResult = await requireAuth()(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const queryParams = event.queryStringParameters || {};
        const status = queryParams.status;

        let orders;

        if (hasRole(userInfo, ['dispatcher', 'admin'])) {
            // Dispatchers/admins can see all orders
            if (status) {
                orders = await db.listOrdersByStatus(status);
            } else {
                // Get all orders (would use GSI in production)
                const allStatuses = ['OPEN', 'ASSIGNED', 'ENROUTE', 'COMPLETED', 'CANCELLED'];
                const orderPromises = allStatuses.map(s => db.listOrdersByStatus(s));
                const orderArrays = await Promise.all(orderPromises);
                orders = orderArrays.flat();
            }
        } else if (hasRole(userInfo, ['driver'])) {
            // Drivers can only see their own orders
            orders = await db.getOrdersByDriver(userInfo.sub);
            
            // Filter by status if requested
            if (status) {
                orders = orders.filter(order => order.status === status);
            }
        } else {
            return createResponse(403, {
                error: 'Forbidden',
                message: 'Insufficient permissions to list orders'
            });
        }

        // Sort by creation date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return createResponse(200, { orders });

    } catch (error) {
        console.error('Error listing orders:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to list orders'
        });
    }
};

// GET /orders/{orderId} - Get single order
exports.getOrder = async (event) => {
    console.log('Getting order', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate
        const authResult = await requireAuth()(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const orderId = event.pathParameters?.orderId;

        if (!orderId) {
            return createResponse(400, {
                error: 'Order ID is required'
            });
        }

        // Get order
        const order = await db.getOrder(orderId);
        if (!order) {
            return createResponse(404, {
                error: 'Order not found'
            });
        }

        // Check permissions
        if (hasRole(userInfo, ['driver'])) {
            // Drivers can only see their own orders
            if (order.assignedTo !== userInfo.sub) {
                return createResponse(403, {
                    error: 'Forbidden',
                    message: 'You can only view your own orders'
                });
            }
        }
        // Dispatchers and admins can see all orders

        // Get audit trail for dispatchers/admins
        let auditTrail = null;
        if (hasRole(userInfo, ['dispatcher', 'admin'])) {
            auditTrail = await db.getOrderAuditTrail(orderId);
        }

        const response = { order };
        if (auditTrail) {
            response.auditTrail = auditTrail;
        }

        return createResponse(200, response);

    } catch (error) {
        console.error('Error getting order:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to get order'
        });
    }
};