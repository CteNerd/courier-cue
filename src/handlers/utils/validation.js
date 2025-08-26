function validateOrder(order) {
    const errors = [];

    // Required fields
    if (!order.pickup?.address) {
        errors.push('Pickup address is required');
    }
    if (!order.delivery?.address) {
        errors.push('Delivery address is required');
    }
    if (!order.load?.description) {
        errors.push('Load description is required');
    }
    if (!order.recipientName?.trim()) {
        errors.push('Recipient name is required');
    }

    // Validate pickup details
    if (order.pickup) {
        if (order.pickup.scheduledTime && !isValidDateTime(order.pickup.scheduledTime)) {
            errors.push('Invalid pickup scheduled time format');
        }
    }

    // Validate delivery details
    if (order.delivery) {
        if (order.delivery.scheduledTime && !isValidDateTime(order.delivery.scheduledTime)) {
            errors.push('Invalid delivery scheduled time format');
        }
    }

    // Validate load details
    if (order.load) {
        if (order.load.weight && (isNaN(order.load.weight) || order.load.weight <= 0)) {
            errors.push('Load weight must be a positive number');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateAssignment(orderId, driverId) {
    const errors = [];

    if (!orderId?.trim()) {
        errors.push('Order ID is required');
    }
    if (!driverId?.trim()) {
        errors.push('Driver ID is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateCompletion(completionData) {
    const errors = [];

    if (!completionData.recipientName?.trim()) {
        errors.push('Recipient name is required');
    }
    if (!completionData.signature) {
        errors.push('Recipient signature is required');
    }

    // Validate signature structure
    if (completionData.signature) {
        if (!Array.isArray(completionData.signature.strokes)) {
            errors.push('Signature must contain stroke data');
        }
        if (!completionData.signature.timestamp) {
            errors.push('Signature timestamp is required');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateDriver(driver) {
    const errors = [];

    if (!driver.name?.trim()) {
        errors.push('Driver name is required');
    }
    if (!driver.phone?.trim()) {
        errors.push('Driver phone is required');
    }
    if (!driver.driverId?.trim()) {
        errors.push('Driver ID is required');
    }

    // Validate phone format (simple validation)
    if (driver.phone && !/^\+?[\d\s\-\(\)]+$/.test(driver.phone)) {
        errors.push('Invalid phone number format');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function isValidDateTime(dateTime) {
    if (typeof dateTime !== 'string') return false;
    const date = new Date(dateTime);
    return date instanceof Date && !isNaN(date);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim();
}

function validateOrderStatus(currentStatus, newStatus) {
    const validTransitions = {
        'OPEN': ['ASSIGNED', 'CANCELLED'],
        'ASSIGNED': ['ENROUTE', 'CANCELLED'],
        'ENROUTE': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [],
        'CANCELLED': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
}

module.exports = {
    validateOrder,
    validateAssignment,
    validateCompletion,
    validateDriver,
    validateOrderStatus,
    sanitizeInput
};