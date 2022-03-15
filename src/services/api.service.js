const fetch = require('node-fetch');
const api_url = process.env.API_URL;
const api_key = process.env.API_KEY;

const getAgent = async ( email, domain ) => {
    const response = await fetch( `${api_url}agent?key=${api_key}&domain=${domain}&email=${email}`)
    .then( res => res.json() )
    .then( data => data )
    .catch(err => {
        console.error('Failed to get agent',err);
     });
    if( response.length < 1){
        return null;
    } else {
        return response[0];
    }
}

const updateAgent = async ( id, body ) => {
    const response = await fetch( `${api_url}agent/${id}?key=${api_key}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    } )
    .then( res => res.json() )
    .then( data => data )
    .catch( err => {
        console.error('Failed to update agent',err);
    });
}

const getGuest = async ( email, domain ) => {
    const response = await fetch( `${api_url}guest?key=${api_key}&domain=${domain}&email=${email}`)
    .then( res => res.json() )
    .then( data => data )
    .catch(err => {
        console.error('Failed to get guest',err);
     });
    if( response.length < 1){
        return null;
    } else {
        return response[0];
    }
}

const updateGuest = async ( id, body ) => {
    const response = await fetch( `${api_url}guest/${id}?key=${api_key}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    } )
    .then( res => res.json() )
    .then( data => data )
    .catch( err => {
        console.error('Failed to update guest',err);
    });
}

module.exports = {
    getAgent,
    updateAgent,
    getGuest,
    updateGuest
}