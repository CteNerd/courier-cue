const { DatabaseService } = require('./utils/database');
const { requireAuth, createResponse, hasRole } = require('./utils/auth');
const { validateDriver } = require('./utils/validation');

const db = new DatabaseService();

// GET /drivers - List all drivers (dispatcher/admin only)
exports.listDrivers = async (event) => {
    console.log('Listing drivers', { requestId: event.requestContext.requestId });

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

        const drivers = await db.listDrivers();

        // Sort by name
        drivers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        return createResponse(200, { drivers });

    } catch (error) {
        console.error('Error listing drivers:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to list drivers'
        });
    }
};

// GET /drivers/me - Get current driver profile and active order
exports.getDriverProfile = async (event) => {
    console.log('Getting driver profile', { requestId: event.requestContext.requestId });

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
        const driverId = userInfo.sub;

        // Get driver profile
        let driver = await db.getDriver(driverId);
        
        // If driver doesn't exist, create a basic profile
        if (!driver) {
            const driverData = {
                driverId: driverId,
                name: userInfo.given_name && userInfo.family_name 
                    ? `${userInfo.given_name} ${userInfo.family_name}`
                    : userInfo.email,
                phone: '', // Will need to be updated by driver
                email: userInfo.email
            };

            driver = await db.createDriver(driverData);
        }

        // Get active order if exists
        let activeOrder = null;
        if (driver.activeOrderId) {
            activeOrder = await db.getOrder(driver.activeOrderId);
        }

        const response = {
            driver,
            activeOrder
        };

        return createResponse(200, response);

    } catch (error) {
        console.error('Error getting driver profile:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to get driver profile'
        });
    }
};

// PUT /drivers/me - Update driver profile
exports.updateDriverProfile = async (event) => {
    console.log('Updating driver profile', { requestId: event.requestContext.requestId });

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
        const driverId = userInfo.sub;
        const updates = JSON.parse(event.body || '{}');

        // Validate allowed fields
        const allowedFields = ['name', 'phone'];
        const filteredUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            return createResponse(400, {
                error: 'No valid fields to update',
                allowedFields
            });
        }

        // Validate the updates
        const tempDriver = { driverId, ...filteredUpdates };
        const validation = validateDriver(tempDriver);
        if (!validation.isValid) {
            return createResponse(400, {
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Get current driver or create if doesn't exist
        let driver = await db.getDriver(driverId);
        if (!driver) {
            const driverData = {
                driverId: driverId,
                name: userInfo.given_name && userInfo.family_name 
                    ? `${userInfo.given_name} ${userInfo.family_name}`
                    : userInfo.email,
                phone: '',
                email: userInfo.email,
                ...filteredUpdates
            };

            driver = await db.createDriver(driverData);
        } else {
            // Update existing driver
            driver = await db.updateDriver(driverId, filteredUpdates);
        }

        console.log('Driver profile updated successfully', {
            requestId: event.requestContext.requestId,
            driverId,
            updatedFields: Object.keys(filteredUpdates)
        });

        return createResponse(200, driver);

    } catch (error) {
        console.error('Error updating driver profile:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to update driver profile'
        });
    }
};

// POST /drivers - Create new driver (admin only)
exports.createDriver = async (event) => {
    console.log('Creating driver', { requestId: event.requestContext.requestId });

    try {
        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, {});
        }

        // Authenticate and authorize (admin only)
        const authResult = await requireAuth(['admin'])(event);
        if (authResult.statusCode) {
            return authResult;
        }

        const { userInfo } = authResult;
        const driverData = JSON.parse(event.body || '{}');

        // Validate input
        const validation = validateDriver(driverData);
        if (!validation.isValid) {
            return createResponse(400, {
                error: 'Validation failed',
                errors: validation.errors
            });
        }

        // Check if driver already exists
        const existingDriver = await db.getDriver(driverData.driverId);
        if (existingDriver) {
            return createResponse(409, {
                error: 'Driver already exists',
                message: 'A driver with this ID already exists'
            });
        }

        // Add metadata
        driverData.createdBy = userInfo.sub;

        // Create driver
        const driver = await db.createDriver(driverData);

        console.log('Driver created successfully', {
            requestId: event.requestContext.requestId,
            driverId: driver.driverId,
            createdBy: userInfo.sub
        });

        return createResponse(201, driver);

    } catch (error) {
        console.error('Error creating driver:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to create driver'
        });
    }
};

// GET /drivers/{driverId} - Get specific driver (dispatcher/admin only)
exports.getDriver = async (event) => {
    console.log('Getting driver', { requestId: event.requestContext.requestId });

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

        const driverId = event.pathParameters?.driverId;

        if (!driverId) {
            return createResponse(400, {
                error: 'Driver ID is required'
            });
        }

        const driver = await db.getDriver(driverId);
        if (!driver) {
            return createResponse(404, {
                error: 'Driver not found'
            });
        }

        // Get active order if exists
        let activeOrder = null;
        if (driver.activeOrderId) {
            activeOrder = await db.getOrder(driver.activeOrderId);
        }

        const response = {
            driver,
            activeOrder
        };

        return createResponse(200, response);

    } catch (error) {
        console.error('Error getting driver:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to get driver'
        });
    }
};