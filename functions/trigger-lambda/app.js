var aws = require('aws-sdk')

exports.lambdaHandler = async function(event, context) {
    const { body } = event.Records[0]
    const result = await triggerStepfunction(body)
    console.log(result)
    return result;
  }

  const triggerStepfunction = function(input){
    var params = {
        stateMachineArn: process.env.statemachine_arn,
        input: input
      }
      var stepfunctions = new aws.StepFunctions()
      return stepfunctions.startExecution(params).promise()
  }