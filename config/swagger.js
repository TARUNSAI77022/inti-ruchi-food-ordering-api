const swaggerJSDoc = require('swagger-jsdoc');

const isProduction = process.env.NODE_ENV === 'production';
const serverUrl = isProduction
    ? process.env.BASE_URL || 'http://localhost:5000'
    : 'http://localhost:5000';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Inti Ruchi Bhojanam API',
            version: '1.0.0',
            description: 'API documentation for the Inti Ruchi Bhojanam food ordering application backend.',
        },
        servers: [
            {
                url: serverUrl,
                description: isProduction ? 'Production server (AWS ECS)' : 'Development server',
            },
            ...(!isProduction
                ? []
                : [{ url: 'http://localhost:5000', description: 'Local development server' }]
            ),
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js', './routes/**/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
