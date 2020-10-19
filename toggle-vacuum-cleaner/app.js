const axios = require("axios")

exports.lambdaHandler = async (event, context) => {

    try{
        const message = event.Records[0].Sns.Message

        if (message == "ServiceOrder") {
            console.log("Toggling Vacuum Cleaner")
            await callWebHook()
        }

    }catch(error){
        console.error(error)
    }
}

let callWebHook = function () {
    return new Promise(function (resolve, reject) {
        console.log("Preparing request to Vacuum Webhook")

        const options = {
            method: "POST",
            baseURL: process.env.WEBHOOK_BASE,
            url: process.env.WEBHOOK_ENDPOINT
        }

        console.log("REQUEST TO PUBLISH Message")
        console.log(options)

        // console.debug(options)
        axios.request(options).then((response) => {
                console.log(`WebHook Response: is ${response.status} - ${response.statusText}`)
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    return reject(
                        new Error(`${response.statusCode}: ${response.req.getHeader("host")} ${response.req.path}`)
                    );
                } else {
                    console.log("Webhook Called - Robot should have started")
                    return resolve(true)
                }
            })
            .catch((err) => {
                console.error("Error calling WebHook to publish message -" + err)
                reject(new Error(err));
            })
    })
}
