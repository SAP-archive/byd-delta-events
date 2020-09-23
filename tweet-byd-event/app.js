/**
 * A Lambda function that returns a static string
 */
exports.helloFromLambdaHandler = async () => {
    // If you change this message, you will need to change hello-from-lambda.test.js
    const message = 'Lets get this tweeted';
    // All log statements are written to CloudWatch
    console.info(`${message}`);
    return message;
}
