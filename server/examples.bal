import ballerina/log;

public function customOrganizationHandler(ActionHandlerRequest request) returns ActionHandlerResponse|error {
    log:printInfo("Custom handler: Processing organization-based claims");

    Event event = request.event;

    AccessToken? maybeToken = event.accessToken;
    if maybeToken is AccessToken {
        AccessToken accessToken = maybeToken;

        User? maybeUser = event.user;
        if maybeUser is User {
            Organization? maybeOrg = maybeUser.organization;
            if maybeOrg is Organization {
                string? orgId = maybeOrg.id;
                if orgId is string {
                    addClaim(accessToken, "org_id", orgId);
                }
                string? orgName = maybeOrg.name;
                if orgName is string {
                    addClaim(accessToken, "org_name", orgName);
                }
                string? orgHandle = maybeOrg.orgHandle;
                if orgHandle is string {
                    addClaim(accessToken, "org_handle", orgHandle);
                }
            }

            string? userId = maybeUser.id;
            if userId is string {
                boolean hasUserIdClaim = false;
                Claim[]? existingClaims = accessToken.claims;
                if existingClaims is Claim[] {
                    foreach Claim claim in existingClaims {
                        if claim.name == "user_id" {
                            hasUserIdClaim = true;
                            break;
                        }
                    }
                }
                if !hasUserIdClaim {
                    addClaim(accessToken, "user_id", userId);
                }
            }
        }

        Request? maybeRequest = event.request;
        if maybeRequest is Request {
            string? grantType = maybeRequest.grantType;
            if grantType is string {
                if grantType.includes("token-exchange") {
                    addScope(accessToken, "token_exchange");
                }
            }
        }
    }

    return {
        event: event,
        requestId: request.requestId
    };
}

public function customExpirationHandler(ActionHandlerRequest request) returns ActionHandlerResponse|error {
    log:printInfo("Custom handler: Modifying token expiration");

    Event event = request.event;

    AccessToken? maybeToken = event.accessToken;
    if maybeToken is AccessToken {
        AccessToken accessToken = maybeToken;

        Claim[]? existingClaims = accessToken.claims;
        if existingClaims is Claim[] {
            foreach Claim claim in existingClaims {
                if claim.name == "expires_in" {
                    int currentExp = 3600;
                    if claim.value is int {
                        currentExp = <int>claim.value;
                    }
                    replaceClaim(accessToken, "expires_in", currentExp + 3600);
                    break;
                }
            }
        }
    }

    return {
        event: event,
        requestId: request.requestId
    };
}
