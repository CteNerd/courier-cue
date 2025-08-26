const AWS = require('aws-sdk');

class DatabaseService {
    constructor() {
        this.dynamodb = new AWS.DynamoDB.DocumentClient();
        this.tableName = process.env.TABLE_NAME;
    }

    // Order operations
    async createOrder(order) {
        const timestamp = new Date().toISOString();
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        const item = {
            PK: `ORDER#${orderId}`,
            SK: `ORDER#${orderId}`,
            orderId,
            status: 'OPEN',
            createdAt: timestamp,
            updatedAt: timestamp,
            // GSI1 for querying by status
            GSI1PK: `ORDER#STATUS#OPEN`,
            GSI1SK: timestamp,
            ...order
        };

        await this.dynamodb.put({
            TableName: this.tableName,
            Item: item
        }).promise();

        // Create audit event
        await this.createAuditEvent(orderId, 'CREATED', order.createdBy, { order: item });

        return item;
    }

    async getOrder(orderId) {
        const result = await this.dynamodb.get({
            TableName: this.tableName,
            Key: {
                PK: `ORDER#${orderId}`,
                SK: `ORDER#${orderId}`
            }
        }).promise();

        return result.Item;
    }

    async updateOrder(orderId, updates, actor) {
        const timestamp = new Date().toISOString();
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        // Build update expression
        Object.keys(updates).forEach((key, index) => {
            const attrName = `#attr${index}`;
            const attrValue = `:val${index}`;
            updateExpression.push(`${attrName} = ${attrValue}`);
            expressionAttributeNames[attrName] = key;
            expressionAttributeValues[attrValue] = updates[key];
        });

        // Always update the timestamp
        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = timestamp;

        // Update GSI1 if status is changing
        if (updates.status) {
            updateExpression.push('#GSI1PK = :GSI1PK');
            expressionAttributeNames['#GSI1PK'] = 'GSI1PK';
            expressionAttributeValues[':GSI1PK'] = `ORDER#STATUS#${updates.status}`;
        }

        // Update GSI2 if assignedTo is changing
        if (updates.assignedTo) {
            updateExpression.push('#GSI2PK = :GSI2PK', '#GSI2SK = :GSI2SK');
            expressionAttributeNames['#GSI2PK'] = 'GSI2PK';
            expressionAttributeNames['#GSI2SK'] = 'GSI2SK';
            expressionAttributeValues[':GSI2PK'] = `DRIVER#${updates.assignedTo}`;
            expressionAttributeValues[':GSI2SK'] = timestamp;
        }

        const result = await this.dynamodb.update({
            TableName: this.tableName,
            Key: {
                PK: `ORDER#${orderId}`,
                SK: `ORDER#${orderId}`
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }).promise();

        // Create audit event for status changes
        if (updates.status) {
            await this.createAuditEvent(orderId, updates.status, actor, updates);
        }

        return result.Attributes;
    }

    async listOrdersByStatus(status) {
        const result = await this.dynamodb.query({
            TableName: this.tableName,
            IndexName: 'GSI1',
            KeyConditionExpression: 'GSI1PK = :gsi1pk',
            ExpressionAttributeValues: {
                ':gsi1pk': `ORDER#STATUS#${status}`
            },
            ScanIndexForward: false // Newest first
        }).promise();

        return result.Items;
    }

    async getOrdersByDriver(driverId) {
        const result = await this.dynamodb.query({
            TableName: this.tableName,
            IndexName: 'GSI2',
            KeyConditionExpression: 'GSI2PK = :gsi2pk',
            ExpressionAttributeValues: {
                ':gsi2pk': `DRIVER#${driverId}`
            },
            ScanIndexForward: false // Newest first
        }).promise();

        return result.Items;
    }

    // Driver operations
    async getDriver(driverId) {
        const result = await this.dynamodb.get({
            TableName: this.tableName,
            Key: {
                PK: `DRIVER#${driverId}`,
                SK: `DRIVER#${driverId}`
            }
        }).promise();

        return result.Item;
    }

    async createDriver(driver) {
        const timestamp = new Date().toISOString();
        const item = {
            PK: `DRIVER#${driver.driverId}`,
            SK: `DRIVER#${driver.driverId}`,
            createdAt: timestamp,
            updatedAt: timestamp,
            activeOrderId: null,
            ...driver
        };

        await this.dynamodb.put({
            TableName: this.tableName,
            Item: item
        }).promise();

        return item;
    }

    async updateDriver(driverId, updates) {
        const timestamp = new Date().toISOString();
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(updates).forEach((key, index) => {
            const attrName = `#attr${index}`;
            const attrValue = `:val${index}`;
            updateExpression.push(`${attrName} = ${attrValue}`);
            expressionAttributeNames[attrName] = key;
            expressionAttributeValues[attrValue] = updates[key];
        });

        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = timestamp;

        const result = await this.dynamodb.update({
            TableName: this.tableName,
            Key: {
                PK: `DRIVER#${driverId}`,
                SK: `DRIVER#${driverId}`
            },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }).promise();

        return result.Attributes;
    }

    async listDrivers() {
        const result = await this.dynamodb.scan({
            TableName: this.tableName,
            FilterExpression: 'begins_with(PK, :driverPrefix)',
            ExpressionAttributeValues: {
                ':driverPrefix': 'DRIVER#'
            }
        }).promise();

        return result.Items;
    }

    // Transactional operations
    async assignOrder(orderId, driverId, assignedBy) {
        const timestamp = new Date().toISOString();

        const params = {
            TransactItems: [
                {
                    Update: {
                        TableName: this.tableName,
                        Key: {
                            PK: `ORDER#${orderId}`,
                            SK: `ORDER#${orderId}`
                        },
                        UpdateExpression: 'SET #status = :assigned, assignedTo = :driverId, assignedAt = :timestamp, updatedAt = :timestamp, GSI1PK = :gsi1pk, GSI2PK = :gsi2pk, GSI2SK = :gsi2sk',
                        ConditionExpression: '#status = :open AND attribute_not_exists(assignedTo)',
                        ExpressionAttributeNames: {
                            '#status': 'status'
                        },
                        ExpressionAttributeValues: {
                            ':assigned': 'ASSIGNED',
                            ':open': 'OPEN',
                            ':driverId': driverId,
                            ':timestamp': timestamp,
                            ':gsi1pk': 'ORDER#STATUS#ASSIGNED',
                            ':gsi2pk': `DRIVER#${driverId}`,
                            ':gsi2sk': timestamp
                        }
                    }
                },
                {
                    Update: {
                        TableName: this.tableName,
                        Key: {
                            PK: `DRIVER#${driverId}`,
                            SK: `DRIVER#${driverId}`
                        },
                        UpdateExpression: 'SET activeOrderId = :orderId, updatedAt = :timestamp',
                        ConditionExpression: 'attribute_not_exists(activeOrderId) OR activeOrderId = :null',
                        ExpressionAttributeValues: {
                            ':orderId': orderId,
                            ':timestamp': timestamp,
                            ':null': null
                        }
                    }
                }
            ]
        };

        try {
            await this.dynamodb.transactWrite(params).promise();
            
            // Create audit event
            await this.createAuditEvent(orderId, 'ASSIGNED', assignedBy, { 
                driverId, 
                assignedAt: timestamp 
            });

            return true;
        } catch (error) {
            if (error.code === 'TransactionCanceledException') {
                throw new Error('Assignment conflict: Order already assigned or driver has active order');
            }
            throw error;
        }
    }

    async completeOrder(orderId, driverId, completionData, completedBy) {
        const timestamp = new Date().toISOString();

        const params = {
            TransactItems: [
                {
                    Update: {
                        TableName: this.tableName,
                        Key: {
                            PK: `ORDER#${orderId}`,
                            SK: `ORDER#${orderId}`
                        },
                        UpdateExpression: 'SET #status = :completed, deliveredAt = :timestamp, updatedAt = :timestamp, recipientName = :recipientName, signature = :signature, GSI1PK = :gsi1pk',
                        ConditionExpression: '#status = :enroute AND assignedTo = :driverId',
                        ExpressionAttributeNames: {
                            '#status': 'status'
                        },
                        ExpressionAttributeValues: {
                            ':completed': 'COMPLETED',
                            ':enroute': 'ENROUTE',
                            ':driverId': driverId,
                            ':timestamp': timestamp,
                            ':recipientName': completionData.recipientName,
                            ':signature': completionData.signature,
                            ':gsi1pk': 'ORDER#STATUS#COMPLETED'
                        }
                    }
                },
                {
                    Update: {
                        TableName: this.tableName,
                        Key: {
                            PK: `DRIVER#${driverId}`,
                            SK: `DRIVER#${driverId}`
                        },
                        UpdateExpression: 'SET activeOrderId = :null, updatedAt = :timestamp',
                        ConditionExpression: 'activeOrderId = :orderId',
                        ExpressionAttributeValues: {
                            ':null': null,
                            ':orderId': orderId,
                            ':timestamp': timestamp
                        }
                    }
                }
            ]
        };

        try {
            await this.dynamodb.transactWrite(params).promise();
            
            // Create audit event
            await this.createAuditEvent(orderId, 'COMPLETED', completedBy, {
                ...completionData,
                deliveredAt: timestamp
            });

            return true;
        } catch (error) {
            if (error.code === 'TransactionCanceledException') {
                throw new Error('Completion conflict: Order not in ENROUTE status or not assigned to driver');
            }
            throw error;
        }
    }

    // Audit operations
    async createAuditEvent(orderId, eventType, actor, payload) {
        const timestamp = new Date().toISOString();
        const eventId = `EVT#${timestamp}#${Math.random().toString(36).substring(2, 15)}`;

        const item = {
            PK: `ORDER#${orderId}`,
            SK: eventId,
            eventType,
            actor,
            timestamp,
            payload
        };

        await this.dynamodb.put({
            TableName: this.tableName,
            Item: item
        }).promise();

        return item;
    }

    async getOrderAuditTrail(orderId) {
        const result = await this.dynamodb.query({
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :evtPrefix)',
            ExpressionAttributeValues: {
                ':pk': `ORDER#${orderId}`,
                ':evtPrefix': 'EVT#'
            },
            ScanIndexForward: true
        }).promise();

        return result.Items;
    }
}

module.exports = { DatabaseService };