# A Decoupled Approach for SAP Business ByDesign Event Handling
[![](https://i.imgur.com/ZGPBj6Y.png)]()

## Overview
This application produces events based on SAP Business ByDesign objects' changes. It works by pulling data, every minute, from OData services and checking if there were changes. It has a serverless, loosely coupled architecture and has been implemented using [AWS Serverless Application Model](https://aws.amazon.com/serverless/sam/).

## Pre requisites
* AWS Account (free tier will do it)
* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* SAP Business ByDesign Tenant
* These [ByD Custom Odata Services](https://github.com/SAP-samples/sapbydesign-api-samples/) for [Invoices](https://github.com/SAP-samples/sapbydesign-api-samples/blob/master/Custom%20OData%20Services/khcustomerinvoice.xml), [Customers](https://github.com/SAP-samples/sapbydesign-api-samples/blob/master/Custom%20OData%20Services/khcustomer.xml), [Sales Orders](https://github.com/SAP-samples/sapbydesign-api-samples/blob/master/Custom%20OData%20Services/khsalesorder.xml) and [Service Orders](https://github.com/SAP-samples/sapbydesign-api-samples/blob/master/Custom%20OData%20Services/tmserviceorder.xml)

## Deployment
Clone or download this repository:
```bash
git clone https://github.com/B1SA/byd-delta-events.git
```
Update the environment variables located on the [template.yaml](template.yaml) file. The minimum requirement is the BYD credentials.

From its root folder, build and deploy it to your account.
```bash
sam build
sam deploy --guided
```
For details on how to deploy/test it locally check [README-SAM](README-SAM.md)
## Enhancement
You can easily enhance this solution to support more SAP Business ByDesign objects or to implement new subscribers that will receive the events
### Adding  Business Objects
1 - Add the new object OData endpoint details on the env variables for the [get-byd-objects](get-byd-objects/app.js) functions on [template.yaml](template.yaml)
**NOTE:** the OData service must expose -at least- the Object ID, LastChangeDateTime and CreationDateTime attributes
```yaml
 Environment:
        Variables:
          #ByD Details
          BYD_ODATA: "https://my000000.sapbydesign.com/sap/byd/odata/cust/v1"
          BYD_AUTH: "user:password base64 encoded"
          BYS_NEWOBJECT: "/newObject/newObjectCollection"
          BYD_NEWOBJECT_ID: "ID"
```
2 - Create a new promise to invoke the new object service in the [get-byd-objects](get-byd-objects/app.js) function:
```javascript
let NewObject = function (lastRun) {
    return new Promise(function (resolve, reject) {
        console.log("Retrieving ByD New Objects")
        getBydObject(lastRun, process.env.BYS_NEWOBJECT, process.env.BYD_NEWOBJECT_ID).then((data) => {
            console.log(data.length + "ByD New Objects Retrieved")
            resolve(data)
        })
    })
}
```

3 - Add the call for the NewObject promise to the [getBydObjectsPromises](get-byd-objects/app.js#L33) array
```javascript
        const getBydObjectsPromises = [ SalesInvoices(data.lastRun.S), 
                                        Customers(data.lastRun.S),
                                        SalesOrders(data.lastRun.S),
                                        ServiceOrders(data.lastRun.S),
                                        NewObject(data.lastRun.S)]
```
### Adding new Subscribers

## License
This proof of concept is is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.
 
## Support and Contributions
This repository is provided "as-is". No support is available. Feel free to open issues or provide pull requests.

