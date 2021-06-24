'use strict';

const app = require('../../app.js');
const chai = require('chai');
var sinon = require('sinon');
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;


var context;
const taskToken = "AAAAKgAAAAIAAAAAAAAAASFX3x9mQ1sdDZRUa0unobAkyezxngO4yoMbpw6ojApMpA/90uWZoFGex61LS6lPODkJ89KNgIZm1y0QQZ0IqqarpYDpxKuN8yTmy/kOwLm6LVfW7O6M8oNvsGigyE8eioAJ0/8jAp8FdEDPC3EuVw5x0fa6WuJFpeaWCHxw284pZQPhIkPPlOTc7n66TjNFw/h0LbzB7wKCKLXEN8Kow7SJCVpV4iwXzYFrWkHKgUB5aWA87iNyG1GkhKcHyslt91KheoSY6aqp+T9yXMAnJSZwtpfneflywgi0jVWcCmSHH8M2uQ5a1RQxNlH7uvxQd74e/ceLyHeeynzq4twL9Ts9sv2An8K8EyCvfJyXlI/hu5aFxhWF4H32z5drMHtAonFJm2t1sXKnHcTFuytnh19WrkxQQZZng1WG5xA4eGdISqZudbkcV8gWV5fTHfxMiyjdlD+BoxyaYo2J1dQAU+00vtZt7T15D2qWan54m8Y8NNxM/VZWq9rdmqEHquMfSo2y5YuFhdHaz9/2ikgEm9+46smwV4Ss6K8mV32p6NRXmxRy74TWyNaJAVtJn0blZtdK1SFmchGPOJMdtV7VNZ3SD8WgDIKMQvkViEzIKrQUPW9nm1XxTuzg6RqpANLGag=="

let event = {
    Records: [
        {
            messageId: 'f21b4ad2-53f1-4b27-9383-d998fcfc310e',
            receiptHandle: 'AQEBBGYlajB7nggyJnt0Z9KtljM12abFrcAc3hLrWQsd4VWsgY6I00E3CP1wTEZpPOZv7vkI16VMLSXf/sP7/fUU81C6hMyj4XJEPNpDS7lFYLzxKBYYoZT7cmkrZhVPCxdAuGcjrYanRXhrPZE13ov3ZrsxeUv09HePPRay/GcWmyrKm+L7ZtvLHWqZfbAlQ/tKpjPhLilQIzN8jz5GZ6u2poia7zuPc3IPSW3zAF6gs2vMIU5wcm6MUkzMaKaW8v6YR2rs8/6/TTy3mhqJAtGPEAbFK8kmrnWUrJmJqGk8FK3nhtoITQRArhU7wFXGNoxR7nF7PSTVwXnsxw/MWjmK0DMdOuxCj6amzAKFuLXuGTt995PHv4fWIpUfsTUysOGY1r9Jz/HfEZVSmK3DYR+aD0oC/KL7zK+zj3Zr7PxOPAYyFVVt06JzsEuoXpfjwpVB58GrU+1ZKXG6EbFCw9+blQ==',
            body: `{"input":{"id":"c3a1a75b8e4acfc43a6463f3871f5a1c","price":"50","type":"buy","qty":"3","timestamp":"2021-06-23T18:02:36.662Z"},"taskToken":"${taskToken}"}`,
            attributes: [Object],
            messageAttributes: {},
            md5OfBody: '7ec0b5446bf118df3181dbf284336417',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-east-1:197165941969:async-stepfunction-demo-BankTransactionInputQueue-15QXG9XQDQCK0',
            awsRegion: 'us-east-1'
        }
    ]
}

let sandbox = sinon.createSandbox()

describe('Tests Bank Transaction Handler', function () {

    describe('#lambdaHandler success', function () {
        beforeEach('stub sendTaskSuccess', function () {
            sandbox = sinon.createSandbox()
            sandbox.stub(app, 'sendTaskSuccess').returns(Promise.resolve({}));
        });

        afterEach('restore stub', function () {
            sandbox.restore();
        });

        it('should return amount debited response from event', async () => {
            //given:
            const expectedResponse = { "debited": "50" }

            //when:
            const result = await app.lambdaHandler(event, context)

            expect(result).to.be.an('object');
            expect(result.debited).to.equal("50");
            expect(app.sendTaskSuccess).to.have.been.calledOnceWith(expectedResponse, taskToken)
        });

        it('should return amount credited response', async () => {
            //given:
            let originalBody = event.Records[0].body
            event.Records[0].body = `{"input":{"id":"c3a1a75b8e4acfc43a6463f3871f5a1c","price":"40","type":"sell","qty":"3","timestamp":"2021-06-23T18:02:36.662Z"},"taskToken":"${taskToken}"}`
            const expectedResponse = { "credited": "40" }

            //when:
            const result = await app.lambdaHandler(event, context)

            //then
            expect(result).to.be.an('object');
            expect(result.credited).to.equal("40");
            expect(app.sendTaskSuccess).to.have.been.calledOnceWith(expectedResponse, taskToken)

            //restore original mocked message body
            event.Records[0].body = originalBody
        });
    });

    describe('#lambdaHandler error', function () {
        it('should call sendTaskFailure when error processing input', async () => {
            //given:
            const errorToBeThrown = new Error('Error processing input')
            sinon.stub(app, 'sendTaskSuccess').returns(Promise.reject(errorToBeThrown));
            sinon.stub(app, 'sendTaskFailure').returns(Promise.resolve({}));
            //when:
            await app.lambdaHandler(event, context)
                .then(function (m) { throw new Error('was not supposed to succeed'); })
                .catch(function (m) { expect(m).to.equal(errorToBeThrown); })
            //then:
            expect(app.sendTaskFailure).to.have.been.calledOnceWith(errorToBeThrown, taskToken)
        })
    })




});
