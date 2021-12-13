const clientErrorObj = { 'status': 422, 'param': 'Client', 'statusText': 'Incorrect/Missing Parameters' }
const dbErrorObj = { 'status': 503, 'param': 'Server', 'statusText': 'Database error' };
const authErrorObj = { 'status': 401, 'param': 'Server', 'statusText': 'Authorization error' }
const credentialsErrorObj = { "status": 422, "param": "Client", "statusText": "Wrong Credentials" }

exports.errorObjs = {
    dbError: { "errorCode": 0, errorMessage: "" },
    parameterError: { 'errorCode': 1, 'errorMessage': 'Incorrect/Missing Parameters' },
    authError: { "errorCode": 2, "errorMessage": "Unauthorized action" },
    credentialsError: { "errorCode": 3, "errorMessage": "Wrong Credentials" }
};

exports.successObj = { 'status': 200, 'param': 'Server', 'statusText': 'OK' };

exports.resolveErrors = function (err, res) {
    switch (err.errorCode) {
        case 0:
            let error = dbErrorObj
            error.statusText = err.errorMessage
            res.status(error.status).json(error)
            break;
        case 1:
            res.status(clientErrorObj.status).json(clientErrorObj)
            break;
        case 2:
            res.status(authErrorObj.status).json(authErrorObj)
            break;
        case 3:
            res.status(authErrorObj.status).json(credentialsErrorObj)
            break

    }
}

exports.resolveExpressValidator = function (errors, res) {
    if (!errors.isEmpty()) {
        let err = clientErrorObj;
        err.content = errors.errors.map((e) => { return { 'param': e.param, 'msg': e.msg } });
        res.status(err.status).json(err);
        return false;
    }
    return true
}

exports.getClientErrorObject = function (res) {
    return clientErrorObj
}
