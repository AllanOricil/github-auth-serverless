const qs = require('qs');
const createRedirectResponse = (responseData) => {
    const response = {
        statusCode: 301,
        headers: {
            "Location": `${process.env.REDIRECT_URI}?${qs.stringify(responseData)}`
        },
        body: null
    }
    console.log(response);
    return response;
}


module.exports = { 
    createRedirectResponse
}