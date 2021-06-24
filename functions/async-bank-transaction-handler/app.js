var aws = require('aws-sdk')

var stepfunctions = new aws.StepFunctions()
const BUY = 'buy'
const SELL = 'sell'
/**
 * Sample Lambda function which mocks the operation of updating bank transaction based on the input stock price.
 * For demonstration purposes this Lambda function simply identifies transaction type and return credited or debited response for the equivalent stock price.
 * 
 * @param {Object} event - Input event to the Lambda function
 * @param {Object} context - Lambda Context runtime methods and attributes
 *
 * @returns {Object} object - Object containing the current price of the stock
 * 
 */
exports.lambdaHandler = async (event, context) => {
    console.log(event)
    const { body } = event.Records[0]
    const jsonBody = JSON.parse(body)
    try {
        var response = {}
        // Check price of the stock
        const stock_price = jsonBody.input.price
        const type = jsonBody.input.type

        switch (type) {
            case BUY:
                console.log(`debit amount ${stock_price} from account`)
                response.debited = stock_price
                break;
            case SELL:
                console.log(`credit amount ${stock_price} to account`)
                response.credited = stock_price
                break;
            default:
                throw new Error(`transaction type ${type} not supported`)

        }

        await this.sendTaskSuccess(response, jsonBody.taskToken)
        return response
    } catch (error) {
        await this.sendTaskFailure(error, jsonBody.taskToken)
        throw error
    }

};

exports.sendTaskSuccess = function (response, taskToken) {
    var params = {
        output: JSON.stringify(response),
        taskToken: taskToken
    };
    return stepfunctions.sendTaskSuccess(params).promise()
}

exports.sendTaskFailure = function (error, taskToken) {
    var params = {
        taskToken: taskToken,
        error: error.message
    };
    return stepfunctions.sendTaskFailure(params).promise()
}
