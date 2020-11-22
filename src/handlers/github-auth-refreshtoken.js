const { getAccessToken } = require('../services/github');
const { createRedirectResponse } = require('../utils/redirect');
const qs = require('qs');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

exports.main = async (event, context, callback) => {
    const email = event.queryStringParameters.email;
    console.log(email);
    try{
        var queryParams = {
            TableName : process.env.USER_TABLE,
            Key: { email },
        };
        const data = await docClient.get(queryParams).promise();
        const user = data.Item;
        console.log(user);
        const refreshToken = user.github.credentials.refresh_token;
        
        try{
            const requestBody = {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }

            const githubCredentialsResponse = await getAccessToken(requestBody);
        
            console.log(githubCredentialsResponse.data);
            
            const githubCredentials = qs.parse(githubCredentialsResponse.data);
            
            var updateParams = {
                TableName: process.env.USER_TABLE,
                Key:{ email },
                UpdateExpression: "set github.credentials.access_token = :r, github.credentials.expires_in = :p",
                ExpressionAttributeValues:{
                    ":r": githubCredentials.access_token,
                    ":p": githubCredentials.expires_in
                },
                ReturnValues:"UPDATED_NEW"
            };

            try {
                await docClient.update(updateParams).promise();
                console.log("Save operation was successful.");
                callback(null, createRedirectResponse({
                    user : user,
                    access_token : githubCredentials.access_token,
                    expires_in : githubCredentials.expires_in
                }));
            } catch (error) {
                console.error(error);
                callback(null, createRedirectResponse({
                    error: 'Could not Update User Credentials'
                }));
            }
        }catch(error){
            console.log(error);
            callback(null, createRedirectResponse({
                error: 'Could not Refresh Access Token'
            }));
        };
    }catch(error){
        console.error(error);
        callback(null, createRedirectResponse({
            error: 'Could not Fetch User Document'
        }));
    }
}



