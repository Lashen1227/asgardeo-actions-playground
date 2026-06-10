import ballerina/log;

// Handler function type for custom action processing
public type ActionHandler function(ActionHandlerRequest) returns ActionHandlerResponse|error;

// Default handler that processes the action request
public function processAction(ActionHandlerRequest request, ActionHandler? customHandler = ())
returns ActionHandlerResponse|error {
    log:printInfo("Processing action: " + request.actionType);

    // If custom handler is provided, use it
    if customHandler is ActionHandler {
        return customHandler(request);
    }

    // Default handler - returns the event as-is
    ActionHandlerResponse response = {
        event: request.event,
        requestId: request.requestId
    };

    return response;
}

// Helper function to add a claim to access token
public function addClaim(AccessToken accessToken, string claimName, string|string[]|int claimValue)
returns error? {
    if accessToken.claims is Claim[] {
        Claim newClaim = {
            name: claimName,
            value: claimValue
        };
        accessToken.claims.push(newClaim);
    } else {
        accessToken.claims = [{
            name: claimName,
            value: claimValue
        }];
    }
}

// Helper function to remove a claim from access token
public function removeClaim(AccessToken accessToken, string claimName) returns error? {
    if accessToken.claims is Claim[] {
        int i = 0;
        while i < accessToken.claims.length() {
            if accessToken.claims[i].name == claimName {
                _ = accessToken.claims.remove(i);
                break;
            }
            i += 1;
        }
    }
}

// Helper function to replace a claim value in access token
public function replaceClaim(AccessToken accessToken, string claimName, string|string[]|int newValue)
returns error? {
    if accessToken.claims is Claim[] {
        foreach Claim claim in accessToken.claims {
            if claim.name == claimName {
                claim.value = newValue;
                break;
            }
        }
    }
}

// Helper function to add a scope to access token
public function addScope(AccessToken accessToken, string scope) returns error? {
    if accessToken.scopes is string[] {
        if !accessToken.scopes.includes(scope) {
            accessToken.scopes.push(scope);
        }
    } else {
        accessToken.scopes = [scope];
    }
}

// Helper function to remove a scope from access token
public function removeScope(AccessToken accessToken, string scope) returns error? {
    if accessToken.scopes is string[] {
        int i = 0;
        while i < accessToken.scopes.length() {
            if accessToken.scopes[i] == scope {
                _ = accessToken.scopes.remove(i);
                break;
            }
            i += 1;
        }
    }
}

// Helper function to replace a scope in access token
public function replaceScope(AccessToken accessToken, string oldScope, string newScope) returns error? {
    if accessToken.scopes is string[] {
        int i = 0;
        while i < accessToken.scopes.length() {
            if accessToken.scopes[i] == oldScope {
                accessToken.scopes[i] = newScope;
                break;
            }
            i += 1;
        }
    }
}

// Process allowed operations based on the paths (basic skeleton)
public function processAllowedOperations(ActionHandlerRequest request) returns error? {
    if request.allowedOperations is AllowedOperation[] {
        if request.event.accessToken is AccessToken {
            foreach AllowedOperation operation in request.allowedOperations {
                foreach string path in operation.paths {
                    match operation.op {
                        "add" => {
                            if path.startsWith("/accessToken/claims/") {
                                string claimName = path.substring(path.lastIndexOf("/") + 1);
                                addClaim(request.event.accessToken, claimName, "");
                            }
                        }
                        "remove" => {
                            if path.startsWith("/accessToken/claims/") {
                                string claimName = path.substring(path.lastIndexOf("/") + 1);
                                removeClaim(request.event.accessToken, claimName);
                            }
                        }
                        "replace" => {
                            // No-op by default; implement as needed.
                        }
                        _ => {
                            log:printWarn("Unknown operation: " + operation.op);
                        }
                    }
                }
            }
        }
    }
}
