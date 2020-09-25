/**
 * A Lambda function that returns a static string
 */
const axios = require("axios")

exports.lambdaHandler = async (event, context) => {

    const token = await getEmToken()

    const localMsg= {
        ObjectID: '00163E71D7E21EEABF9A8DD263CAF2B0',
        ID: '1INV-12-2020',
        CreationDateTime: '/Date(1600779993000)/',
        LastChangeDateTime: '/Date(1600779993000)/',
        GenericId: '1INV-12-2020',
        Updated: false,
        GenericType: 'CustomerInvoice',
        DateStr: "2020-09-22T13:06:33.000Z"
      }

    await publishMsgSCP(token, process.env.AWS_SAM_LOCAL?localMsg:event.Records[0].Sns.Message)
    return ;

}

let getEmToken = function () {
    return new Promise(function (resolve, reject) {

        console.log("Preparing request to SCP Messaging")

        var params = new URLSearchParams({
            "grant_type": "client_credentials",
            "response_type": "token",
        })

        const options = {
            method: "POST",
            baseURL: process.env.SCP_EM_URL,
            url:  process.env.SCP_EM_AUTH_ENDPOINT,
            headers: {
                "Content-Type": " application/x-www-form-urlencoded",
                "Authorization": "Basic " + process.env.SCP_EM_AUTHORIZATION
            },
            params: params
        }

        console.log("REQUEST!!!!!")
        console.dir(options)

        // console.debug(options)

        axios.request(options).then((response) => {
                console.log(`SCP Response: is ${response.status} - ${response.statusText}`)
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    return reject(
                        new Error(`${response.statusCode}: ${response.req.getHeader("host")} ${response.req.path}`)
                    );
                } else {
                    console.log("Received token is ")
                    console.log(response.data.access_token)
                    return resolve(response.data.access_token)
                }
            })
            .catch((err) => {
                console.error("Error calling SCP to retrieve Token -" + err)
                reject(new Error(err));
            })
    })
}

let publishMsgSCP = function (token,msg) {
    return new Promise(function (resolve, reject) {
        console.log("Preparing request to SCP Messaging")

        const options = {
            method: "POST",
            baseURL: process.env.SCP_EM_PUB_URL,
            url:  process.env.SCP_EM_PUB_ENDPOINT,
            headers: {
                "x-qos": 0,
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            data: msg
        }

        console.log("REQUEST TO PUBLISH Message")
        console.log(options)

        // console.debug(options)
        axios.request(options).then((response) => {
                console.log(`SCP Response: is ${response.status} - ${response.statusText}`)
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    return reject(
                        new Error(`${response.statusCode}: ${response.req.getHeader("host")} ${response.req.path}`)
                    );
                } else {
                    console.log("Message Published o SCP")
                    return resolve(true)
                }
            })
            .catch((err) => {
                console.error("Error calling SCP to publish message -" + err)
                reject(new Error(err));
            })
    })
}

