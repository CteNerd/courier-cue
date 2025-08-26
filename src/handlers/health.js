exports.handler = async (event) => {
    console.log('Health check requested', { requestId: event.requestContext.requestId });
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.AWS_SAM_LOCAL ? 'local' : 'aws',
            version: '1.0.0'
        })
    };
};
