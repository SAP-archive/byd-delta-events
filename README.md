[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/byd-delta-events)](https://api.reuse.software/info/github.com/SAP-samples/byd-delta-events)
# A Decoupled Approach for SAP Business ByDesign Event Handling
[![](https://i.imgur.com/ZGPBj6Y.png)]()

## Description
This application produces events based on SAP Business ByDesign objects' changes. It works by pulling data, every minute, from OData services and checking if there were changes. It has a serverless, loosely coupled architecture and has been implemented using [AWS Serverless Application Model](https://aws.amazon.com/serverless/sam/).

## Requirments
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

**NOTE:** the OData service must expose **at least** the Object ID, LastChangeDateTime and CreationDateTime attributes
```yaml
Environment:
       Variables:
         #ByD Details
         BYD_ODATA: "https://my000000.sapbydesign.com/sap/byd/odata/cust/v1"
         BYD_AUTH: "user:password base64 encoded"
         BYD_NEWOBJECT: "/newObject/newObjectCollection"
         BYD_NEWOBJECT_ID: "ID"
```
2 - Create a new promise to invoke the new object service in the [get-byd-objects](get-byd-objects/app.js) function:
```javascript
let NewObject = function (lastRun) {
    return new Promise(function (resolve, reject) {
        console.log("Retrieving ByD New Objects")
        getBydObject(lastRun, process.env.BYD_NEWOBJECT, process.env.BYD_NEWOBJECT_ID).then((data) => {
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
A practical example in [this commit](https://github.com/B1SA/byd-delta-events/commit/a26171a14fae53d9982bacf3b6005f892eb034c0)
### Adding new Subscribers
To add a new subscriber to to the notification system, do the following on the [template.yaml](template.yaml) file:

1 - Add the new subscriber details (in this case a new Lambda Function)
```yaml
#New Subscriber Function
NewSubscriberFunction:
  Type: AWS::Serverless::Function 
  Properties:
    CodeUri: new-subscriber-function/
    Handler: app.lambdaHandler
    Runtime: nodejs12.x
```
2 - Add the new function as a subscriber to the **existing** SNS topic **BydEventTopic**
```yaml
    Subscription:
      - Protocol: lambda
        Endpoint: !GetAtt NewSubscriberFunction.Arn
```
3 - Define a new invoke permission for the new function
```yaml
NewSubscriberFunctionInvokePermission:
 Type: 'AWS::Lambda::Permission'
 Properties:
   Action: 'lambda:InvokeFunction'
   FunctionName: !Ref NewSubscriberFunction
   Principal: sns.amazonaws.com   
```
A practical example of those changes [can be found in here](https://github.com/B1SA/byd-delta-events/commit/2141568ce4e21bbddbdf60426d2297b6a98194b9)

4 - The last step is to implement the New Subscriber's function as shown on [this commit](https://github.com/B1SA/byd-delta-events/commit/3b3c05dc19ea721cbc95885a83e593bdacb46eab)

5 - Redeploy the app
 
## Support and Contributions
This repository is provided "as-is". No support is available. Feel free to open issues or provide pull requests.

## License
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.

