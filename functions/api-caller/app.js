const axios = require('axios')

const API_URL = 'https://jsonplaceholder.typicode.com/posts';
exports.lambdaHandler = async (event, context) => {
    console.log(`Received event`)
    console.log(event)
    console.log(`calling ${API_URL}`)
    try{
        const response = await axios.post(API_URL, event);
        console.log(response)
        return response.data
    }catch(error){
        throw new Error(`Error calling external api ${API_URL}: ${error}`)
    }
};