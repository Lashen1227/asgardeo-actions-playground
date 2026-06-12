import ballerina/http;
import ballerina/log;
import ballerina/lang.value;

service / on new http:Listener(9090) {

    resource function post actionHandler(http:Request req) returns http:Response|error {
        json|error payload = req.getJsonPayload();
        if payload is error {
            log:printError("Error parsing request payload", payload);
            return error("Failed to parse request payload");
        }

        ActionHandlerRequest|error actionRequest = value:ensureType(payload, ActionHandlerRequest);
        if actionRequest is error {
            log:printError("Error converting payload to ActionHandlerRequest: " + actionRequest.message());
            return error("Invalid request payload format: " + actionRequest.message());
        }

        ActionHandlerResponse|error response = processAction(actionRequest);
        if response is error {
            log:printError("Error processing action", response);
            return error("Failed to process action");
        }

        json responseJson = <json>response;

        http:Response httpResponse = new;
        httpResponse.setJsonPayload(responseJson);
        httpResponse.setHeader("Content-Type", "application/json");
        return httpResponse;
    }

    resource function get health() returns json {
        return {
            status: "success",
            "service": "asgardeo-action-handler"
        };
    }
}
