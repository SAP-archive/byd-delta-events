/**
 * A Lambda function that returns a static string
 */
exports.lambdaHandler =  async (event, context) => {
    // If you change this message, you will need to change hello-from-lambda.test.js
    const message = 'Lets get this tweeted';
    console.info(`${message}`);
    console.log(event.Records[0].Sns.Message)
    return message;
}
