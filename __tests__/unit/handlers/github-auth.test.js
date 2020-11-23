const qs = require('qs');
const axios = require('axios');
const lambda = require('../../../src/handlers/github-auth');
const { createRedirectResponse } = require('../../../src/utils/redirect');
const githubCredentials = require('../../data/github_credentials.json');
const userEmails = require('../../data/user_emails.json');
const user = require('../../data/user.json');
const userDocument = require('../../data/user_document.json');
const dynamodb = require('aws-sdk/clients/dynamodb'); 

jest.mock('axios');
jest.mock('../../../src/utils/redirect', ()=>({
    createRedirectResponse: jest.fn()
}));

describe('Test github-auth handler', function () { 

    beforeEach(() => {
        process.env.USER_TABLE = 'User';
        process.env.REDIRECT_URI = 'http://localhost:7248';
        process.env.CLIENT_ID = 'test';
        process.env.CLIENT_SECRET = 'test';
    })

    afterEach(() => jest.resetAllMocks());
    
    it('should get github credentials and save it to dynamodb user table', async () => {
        axios.post.mockImplementationOnce(() => Promise.resolve({ data: githubCredentials}));
        axios.get.mockImplementationOnce(() => Promise.resolve({data: user}));
        axios.get.mockImplementationOnce(() => Promise.resolve({data: userEmails}));
        let documentClientSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put'); 
        documentClientSpy.mockReturnValue({ 
            promise: () => Promise.resolve(userDocument) 
        });

        const successData = {
            user,
            access_token : githubCredentials.access_token,
            expires_in : githubCredentials.expires_in
        }
        const successResponse = {
            statusCode: 301,
            headers: {
                "Location": `http://localhost:7482?${qs.stringify(successData)}`
            },
            body: null
        };
        
        createRedirectResponse.mockReturnValueOnce(successResponse);

        const event = { 
            httpMethod: 'GET', 
            queryStringParameters: {
                code: 'dsa7d6a7da9s7da9sd7a9'
            },
            headers: {
                Host: 'dsadsadasdadsa.aws.com'
            },
            requestContext: {
                stage: 'Prod'
            },
            path: '/auth/github'
        }; 

        await lambda.main(event, null, (error, success) => {
            expect(success).toEqual(successResponse);
        });
    });
}); 
 