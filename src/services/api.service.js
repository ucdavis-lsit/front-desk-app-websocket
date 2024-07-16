const api_url = process.env.API_URL;
const api_key = process.env.API_KEY;

const getAgent = async ( email, domain ) => {
  try{
    const response = await fetch( `${api_url}agent?key=${api_key}&domain=${domain}&email=${email}`)
    .then( res => res.json() )
    .then( data => data )
    .catch(err => {
      throw new Error( err );
    });

    if( response?.length > 0 ){
      return response[ 0 ];
    } else {
      return null;
    }
  } catch ( err ) {
    console.error( 'Failed to get agent', err );

    return null;
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
  try {
    const response = await fetch( `${api_url}guest?key=${api_key}&domain=${domain}&email=${email}`)
    .then( res => res.json() )
    .then( data => data )
    .catch(err => {
      throw new Error( err );
      });

    if( response?.length > 0 ){
      return response[ 0 ];
    } else {
      return null;
    }
  } catch ( err ) {
    console.error( 'Failed to get guest', err );

    return null;
  }
}

const updateGuest = async ( id, body ) => {
    const response = await fetch( `${api_url}guest/${id}?key=${api_key}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'x-vfd-issystem': '1'
        },
    } )
    .then( res => res.json() )
    .then( data => data )
    .catch( err => {
        console.error('Failed to update guest',err);
    });
}

const unclaimGuests = async ( agentId ) => {
  const response = await fetch( `${api_url}guest?key=${api_key}&claimed_by=${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        claimed_by: null,
        claimed_time: null
      }),
      headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'x-vfd-issystem': '1'
      },
  } )
  .then( res => res.json() )
  .then( data => data )
  .catch( err => {
      console.error('Failed to update guests',err);
  });
}

module.exports = {
    getAgent,
    updateAgent,
    getGuest,
    updateGuest,
    unclaimGuests
}