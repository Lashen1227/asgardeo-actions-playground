import ballerina/http;
import ballerina/log;

// HTTP client for calling Asgardeo action handler service
public function main() returns error? {
    // Create HTTP client
    http:Client actionHandlerClient = check new ("http://localhost:9090");
    
    // Create a test action handler request as JSON
    json testRequest = {
        actionType: "PRE_ISSUE_ACCESS_TOKEN",
        event: {
            request: {
                clientId: "test-client",
                grantType: "authorization_code",
                scopes: ["openid", "profile"]
            },
            tenant: {
                id: "test-tenant",
                name: "test-tenant"
            },
            user: {
                id: "test-user-id",
                organization: {
                    id: "test-org-id",
                    name: "Test Organization",
                    orgHandle: "test-org"
                }
            },
            accessToken: {
                tokenType: "JWT",
                claims: [
                    {
                        name: "sub",
                        value: "test-user"
                    }
                ],
                scopes: ["openid"]
            }
        },
        requestId: "test-request-id"
    };
    
    // Send POST request to action handler
    http:Request request = new;
    request.setJsonPayload(testRequest);
    request.setHeader("Content-Type", "application/json");
    
    http:Response response = check actionHandlerClient->post("/action-handler", request);
    
    // Process response
    json|error responsePayload = response.getJsonPayload();
    if responsePayload is error {
        log:printError("Error reading response payload", responsePayload);
        return responsePayload;
    }
    
    log:printInfo("Response received from action handler");
    log:printInfo("Status Code: " + response.statusCode.toString());
    log:printInfo("Response: " + responsePayload.toJsonString());
    
    return;
}
