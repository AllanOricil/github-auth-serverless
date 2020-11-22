const lambda = require('../../../src/handlers/github-auth.js'); 
const dynamodb = require('aws-sdk/clients/dynamodb'); 
 
describe('Test github-auth handler', function () { 
    let putSpy; 
 
    beforeAll(() => { 
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put'); 
    }); 
 
    // Clean up mocks 
    afterAll(() => { 
        putSpy.mockRestore(); 
    }); 
 
    // This test invokes putItemHandler() and compare the result  
    it('should add id to the table', async () => { 
        const returnedItem = { id: 'id1', name: 'name1' }; 
 
        // Return the specified value whenever the spied put function is called 
        putSpy.mockReturnValue({ 
            promise: () => Promise.resolve(returnedItem) 
        }); 
 
        const event = { 
            httpMethod: 'POST', 
            body: '{"id": "id1","name": "name1"}' 
        }; 
     
        // Invoke putItemHandler() 
        const result = await lambda.putItemHandler(event); 
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(returnedItem) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
 