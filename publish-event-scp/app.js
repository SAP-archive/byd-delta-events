/**
 * A Lambda function that returns a static string
 */
exports.lambdaHandler = async (event, context) => {
    const message = 'Lets send tthis to SCP';
    console.info(`${message}`);
    console.log(event.Records[0].Sns.Message)
    return message;
}
