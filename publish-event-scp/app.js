/**
 * A Lambda function that returns a static string
 */
exports.helloFromLambdaHandler = async () => {
    const message = 'Letws send this to SAP Cloud Platform';
    // All log statements are written to CloudWatch
    console.info(`${message}`);
    return message;
}
