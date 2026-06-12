import ballerina/log;

public type ActionHandler function(ActionHandlerRequest) returns ActionHandlerResponse|error;

public function processAction(ActionHandlerRequest request, ActionHandler? customHandler = ())
returns ActionHandlerResponse|error {
    log:printInfo("Processing action: " + request.actionType);

    if customHandler is ActionHandler {
        return customHandler(request);
    }

    check processAllowedOperations(request);

    ActionHandlerResponse response = {
        event: request.event,
        requestId: request.requestId
    };

    return response;
}

public function addClaim(AccessToken accessToken, string claimName, string|string[]|int claimValue) {
    Claim[]? existingClaims = accessToken.claims;
    if existingClaims is Claim[] {
        existingClaims.push({ name: claimName, value: claimValue });
        accessToken.claims = existingClaims;
    } else {
        accessToken.claims = [{ name: claimName, value: claimValue }];
    }
}

public function removeClaim(AccessToken accessToken, string claimName) {
    Claim[]? existingClaims = accessToken.claims;
    if existingClaims is Claim[] {
        int i = 0;
        while i < existingClaims.length() {
            if existingClaims[i].name == claimName {
                _ = existingClaims.remove(i);
                break;
            }
            i += 1;
        }
        accessToken.claims = existingClaims;
    }
}

public function replaceClaim(AccessToken accessToken, string claimName, string|string[]|int newValue) {
    Claim[]? existingClaims = accessToken.claims;
    if existingClaims is Claim[] {
        foreach Claim claim in existingClaims {
            if claim.name == claimName {
                claim.value = newValue;
                break;
            }
        }
        accessToken.claims = existingClaims;
    }
}

public function addScope(AccessToken accessToken, string scope) {
    string[]? existingScopes = accessToken.scopes;
    if existingScopes is string[] {
        boolean found = false;
        foreach string s in existingScopes {
            if s == scope {
                found = true;
                break;
            }
        }
        if !found {
            existingScopes.push(scope);
        }
        accessToken.scopes = existingScopes;
    } else {
        accessToken.scopes = [scope];
    }
}

public function removeScope(AccessToken accessToken, string scope) {
    string[]? existingScopes = accessToken.scopes;
    if existingScopes is string[] {
        int i = 0;
        while i < existingScopes.length() {
            if existingScopes[i] == scope {
                _ = existingScopes.remove(i);
                break;
            }
            i += 1;
        }
        accessToken.scopes = existingScopes;
    }
}

public function replaceScope(AccessToken accessToken, string oldScope, string newScope) {
    string[]? existingScopes = accessToken.scopes;
    if existingScopes is string[] {
        int i = 0;
        while i < existingScopes.length() {
            if existingScopes[i] == oldScope {
                existingScopes[i] = newScope;
                break;
            }
            i += 1;
        }
        accessToken.scopes = existingScopes;
    }
}

public function processAllowedOperations(ActionHandlerRequest request) returns error? {
    AllowedOperation[]? ops = request.allowedOperations;
    if ops is AllowedOperation[] {
        AccessToken? maybeToken = request.event.accessToken;
        if maybeToken is AccessToken {
            foreach AllowedOperation operation in ops {
                foreach string path in operation.paths {
                    string cleanPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
                    match operation.op {
                        "add" => {
                            if cleanPath.startsWith("/accessToken/claims/") {
                                string claimName = cleanPath.substring("/accessToken/claims/".length());
                                if claimName.length() > 0 {
                                    addClaim(maybeToken, claimName, "");
                                }
                            } else if cleanPath.startsWith("/accessToken/scopes/") {
                                string scope = cleanPath.substring("/accessToken/scopes/".length());
                                if scope.length() > 0 {
                                    addScope(maybeToken, scope);
                                }
                            }
                        }
                        "remove" => {
                            if cleanPath.startsWith("/accessToken/claims/") {
                                string claimName = cleanPath.substring("/accessToken/claims/".length());
                                if claimName.length() > 0 {
                                    removeClaim(maybeToken, claimName);
                                }
                            } else if cleanPath.startsWith("/accessToken/scopes/") {
                                string scope = cleanPath.substring("/accessToken/scopes/".length());
                                if scope.length() > 0 {
                                    removeScope(maybeToken, scope);
                                }
                            }
                        }
                        "replace" => {
                            // No-op by default
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
