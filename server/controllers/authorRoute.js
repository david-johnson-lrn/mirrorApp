const Learnosity = require('learnosity-sdk-nodejs/index'); // Include Learnosity SDK constructor
const uuid = require('uuid'); // Load the UUID library
const production_domain = require('../utils/domains');

const authorRoute = () => {

  // - - - - - - Learnosity's server-side configuration - - - - - - //

  // Generate the user ID and session ID as UUIDs, set the web server domain.
  const user_id = {
    id: uuid.v4()
  };


  let domain = 'localhost';

  // switch for Domain if prod is hosted on a different domain.
  if (process.env.NODE_ENV === 'production') {
    domain = production_domain.name;
  };


  // Instantiate the SDK
  const learnositySdk = new Learnosity();


  // Primer configuration parameters:
  const request = learnositySdk.init(

    'author', // selects Items API

    /*  Your Consumer Key and Consumer Secret are the public & private security keys required to 
        access Learnosity APIs and data.
        These keys grant access to Learnosity's public demos account. Learnosity will provide 
        keys for your own account. 
    */
    {
      consumer_key: process.env.CONSUMER_KEY,
      domain: domain
    },
    process.env.CONSUMER_SECRET,
    //Request object here below
    {
      // Unique student identifier, a UUID generated on line 9.
      user: user_id,

      // A reference of the Activity to retrieve from the Item bank, defining which
      // Items will be served in this assessment.
      mode: "activity_list"

    });
  console.log(request)
  return { request };
}

module.exports = authorRoute;
