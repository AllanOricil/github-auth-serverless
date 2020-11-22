const { getAccessToken, getUser, getUserEmails } = require('../services/github');
const { createRedirectResponse } = require('../utils/redirect');
const qs = require('qs');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

exports.main = async (event, context, callback) => {
    const redirect_uri = `https://${event.headers.Host}/${event.requestContext.stage}${event.path}`;
    const code = event.queryStringParameters.code;

    try{
        const requestBody = {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            redirect_uri
        }

        const githubCredentialsResponse = await getAccessToken(requestBody);
    
        console.log(githubCredentialsResponse.data);
        
        const githubCredentials = qs.parse(githubCredentialsResponse.data);

        try{
            const userDetailsPromises = [
                getUser(githubCredentials.access_token), 
                getUserEmails(githubCredentials.access_token)
            ];
            const success = await Promise.all(userDetailsPromises);

            const githubUserResponse = success[0];
            console.log(githubUserResponse.data);
            
            const githubUserEmailsResponse = success[1];
            console.log(githubUserEmailsResponse.data);

            const user = githubUserResponse.data;
            const emails = githubUserEmailsResponse.data;

            var params = {
                TableName: process.env.USERS_TABLE,
                Item: {
                    email: emails.find(email => email.primary).email,
                    github: { 
                        credentials: githubCredentials, 
                        user : user 
                    },
                    name: user.name
                }
            };

            try {
                await docClient.put(params).promise();
                console.log("Save operation was successful.");
                callback(null,  createRedirectResponse({
                    user : user,
                    access_token : githubCredentials.access_token,
                    expires_in : githubCredentials.expires_in
                }));
            } catch (error) {
                console.error(error);
                callback(null, createRedirectResponse({
                    error: 'Could not save User'
                }));
            }
        }catch(error){
            console.error(error);
            callback(null, createRedirectResponse({
                error: 'Could not get Github User and Emails'
            }));
        }
    }catch(err){
        console.log(err);
        callback(null, createRedirectResponse({
            error: 'Could not get Github Access Token'
        }));
    };  
}