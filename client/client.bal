import ballerina/log;

// Client example for creating Asgardeo action handler requests
// Note: This is a client-side example. Actual processing happens on the server.
public function main() returns error? {
    // Example: Create a test action handler request as JSON
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
                    },
                    {
                        name: "iss",
                        value: "https://test.issuer.com"
                    }
                ],
                scopes: ["openid"]
            }
        },
        requestId: "test-request-id"
    };
    
    log:printInfo("Created test action handler request");
    string actionType = check testRequest.actionType.ensureType(string);
    log:printInfo("Action Type: " + actionType);
    log:printInfo("Request JSON: " + testRequest.toJsonString());
    log:printInfo("Note: To process this request, send it to the server endpoint using http_client.bal");
    
    return;
}
