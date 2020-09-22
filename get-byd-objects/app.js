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

       await getConfig().then(function(data){
            console.log(data)
            response = {'statusCode': 200,'body': JSON.stringify({message: 'get ByD objects'})}
            return response
        }).catch((error) => {
            console.error(error.step)
            console.error(error.mess)
            return error;    
        });
    } catch (err) {
        console.log(err);
        return err;
    }
};

let getConfig = function(){
    return new Promise(function (resolve, reject) {
        const params = {
            Key: { configId: { "N": process.env.CONFIG_ID}},
            TableName: process.env.CONFIG_TABLE,
        }; 

        console.log("Getting config from DybamoDB")

        dynamo.getItem(params).promise()
        .then(function(data){
            console.log("Back from dynamo")
            resolve(data)
        })
        .catch(function(error){
            console.error("error from dynamo"+ error)
            reject(manageErrorStep("Loading Condiguration", error))
        })
        console.log("terminou")
    })
}

function manageErrorStep(step, mess){
    const managedError = {"step": step, "mess": mess}
    return manageErrorStep
}
