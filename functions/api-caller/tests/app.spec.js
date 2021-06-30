const axios = require('axios')
const app = require('../app');


jest.mock('axios');
beforeEach(() => {
    jest.mock('axios');
});

afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
});

test('should call external api with given input payload', async () => {
    //given:
    const event = {
        "id": "722c31f1ebe59cee6272847def1750bf",
        "price": "60",
        "type": "sell",
        "qty": "5",
        "timestamp": "2021-06-25T13:33:44.938Z",
        "trasactionResult": {
            "credited": "60"
        }
    }

    const responseData = {
        "id": 101,
        "price": "60",
        "type": "sell",
        "qty": "5",
        "timestamp": "2021-06-25T13:33:44.938Z",
        "trasactionResult": {
            "credited": "60"
        }
    }
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 201, data: responseData }));
    //when:
    const response = await app.lambdaHandler(event, null)
    //then
    expect(response).toBe(responseData);
});

test('should throw error when external api returns error response', async () => {
    //given:
    const event = {
        "id": "722c31f1ebe59cee6272847def1750bf",
        "price": "60",
        "type": "sell",
        "qty": "5",
        "timestamp": "2021-06-25T13:33:44.938Z",
        "trasactionResult": {
            "credited": "60"
        }
    }

    
    axios.post.mockImplementationOnce(() => Promise.reject({ status: 400, data: {} }));
    //when:
    //then
    // const response = await app.lambdaHandler(event, null)
    await expect(app.lambdaHandler(event, null)).rejects.toThrowError(Error);
});