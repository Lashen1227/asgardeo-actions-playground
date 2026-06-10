import ballerina/http;
import ballerina/jsonutils;
import ballerina/log;
import ballerina/lang.value;

// HTTP service for handling Asgardeo action handler requests
service / on new http:Listener(9090) {
    
    resource function post action-handler(http:Request req) returns http:Response|http:InternalServerError {
        // Parse the request body
        json|error payload = req.getJsonPayload();
        if payload is error {
            log:printError("Error parsing request payload", payload);
            return http:INTERNAL_SERVER_ERROR;
        }
        
        // Convert JSON to ActionHandlerRequest
        ActionHandlerRequest|error actionRequest = value:ensureType(payload, ActionHandlerRequest);
        if actionRequest is error {
            log:printError("Error converting payload to ActionHandlerRequest", actionRequest);
            return http:INTERNAL_SERVER_ERROR;
        }
        
        // Process the action
        ActionHandlerResponse|error response = processAction(actionRequest);
        if response is error {
            log:printError("Error processing action", response);
            return http:INTERNAL_SERVER_ERROR;
        }
        
        // Convert response to JSON
        json responseJson = <json>response;
        
        // Return HTTP response
        http:Response httpResponse = new;
        httpResponse.setJsonPayload(responseJson);
        httpResponse.setHeader("Content-Type", "application/json");
        return httpResponse;
    }
    
    // Health check endpoint
    resource function get health() returns json {
        return {
            status: "healthy",
            service: "asgardeo-action-handler"
        };
    }
}
