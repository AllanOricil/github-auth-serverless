const axios = require('axios');

const getAccessToken = (requestBody) => {
    return axios.post('https://github.com/login/oauth/access_token', requestBody);
}

const getUser = (accessToken)=>{
    return axios.get('https://api.github.com/user', 
    {
        headers: {
            Authorization : 'token ' + accessToken
        }
    });
}

const getUserEmails = (accessToken) => {
    return axios.get('https://api.github.com/user/emails', 
    {
        headers: {
            Authorization : 'token ' + accessToken
        }
    });
}


module.exports = {
    getAccessToken,
    getUser,
    getUserEmails
}
