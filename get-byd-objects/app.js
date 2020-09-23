// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
*/

const AWS = require("aws-sdk");

if(process.env.AWS_SAM_LOCAL){
    // To use local DynamoDB
    console.log("Local environment detected")
    AWS.config.update({endpoint: "http://localhost:8000", region: "eu-central-1"});
}

const dynamo = new AWS.DynamoDB();

exports.lambdaHandler = async (event, context) => {
    try {
        // Default Response. This is an asynchronous function. 
        // caller do not wait for it to finish processing
        response = {
            'statusCode': 200,
            'body': JSON.stringify({message: 'get ByD objects Started'})
        }
        
        //Retrieve configuration from DynamoDB
        const data  = await getConfig()
        console.log("Config Loaded from DynamoDB")

        //Retrieve delta from ByD Objects
        await Promise.all([getSalesInvoices(data.lastRun.S),getAccounts(data.lastRun.S)]).then((values) => {
            console.log(values[0]);
            console.log(values[1]);
          });

    } catch (err) {
        console.error(err);
        return response

    }
    return response
};

let getConfig = function(){
    // Returns Configuration Record from DynamoDB
    return new Promise(function (resolve, reject) {
        
        const params = {
            Key: { configId: { "N": process.env.CONFIG_ID}},
            TableName: process.env.CONFIG_TABLE,
        }; 

        //Workaround while LOCAL Dynamo isn't ready
        if(process.env.AWS_SAM_LOCAL){
            var response = { Item: {
                                lastRun: { S: 'Tuesday, 20 September 2020 19:27:37'},
                                configId: { N: '0' } 
                            }}
            resolve(response.Item)
        }

        dynamo.getItem(params).promise()
        .then(function(data){
            resolve(data.Item)
        })
        .catch(function(error){
            console.error("error loading from dynamo"+ error)
            reject( new Error("Error Loading Condiguration! - " + error))
        })
    })
}

let getSalesInvoices = function(lastRun){
    // Returns Invoices from ByD
    return new Promise(function (resolve, reject){ 
        console.log("Retrieving ByD Invoices") 
        resolve("ByD Invoices Retrieved from "+ lastRun)
    })
}


let getAccounts = function(lastRun){
    // Returns Accounts from BYD
    return new Promise(function (resolve, reject){ 
        console.log("Retrieving ByD Accounts") 
        resolve("ByD Accounts Retrieved from "+ lastRun)
    })
}

let updateLastRun = function(lastRun){
    // Returns Configuration Record from DynamoDB
    return new Promise(function (resolve, reject){ 
        console.log("Updating Last Run on DynamoDB") 
        resolve()
    })
}
