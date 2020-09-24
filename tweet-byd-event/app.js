const config = {
    consumer_key: process.env.TWITER_API_KEY,
    consumer_secret: process.env.TWITTER_SECRET_KEY,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
}
const twitter = require('twitter');
var client = new twitter(config);

exports.lambdaHandler = async (event, context) => {
    try {
        const toTweet = prepareTweet(event.Records[0].Sns.Message)
        await client.post('statuses/update', {status: toTweet})
        .then(function (tweet) {
            console.log(tweet);
        })
        .catch(function (error) {
            throw error;
        })
    } catch (error) {
        console.error(error)
    }
}

function prepareTweet(message) {
    // Returns Configuration Record from DynamoDB
    console.log("Extracting datat of SNS message " + message)
    try {
        var parserMessage = JSON.parse(message)
        var tweet = `${parserMessage.GenericType} - ${parserMessage.GenericId} ` +
            `was ${parserMessage.Updated?"updated":"created"} ` +
            `on our system @ ${parserMessage.DateStr}. Keep the core clean 😎`
        console.log(tweet)
        return tweet

    } catch (error) {
        throw new Error(error)
    }
}