import ballerina/log;

// Example custom handler that adds custom claims based on user organization
public function customOrganizationHandler(ActionHandlerRequest request) returns ActionHandlerResponse|error {
    log:printInfo("Custom handler: Processing organization-based claims");

    Event event = request.event;

    if event.accessToken is AccessToken {
        AccessToken accessToken = event.accessToken;

        if event.user?.organization is Organization {
            Organization org = event.user.organization;
            addClaim(accessToken, "org_id", org.id ?: "");
            addClaim(accessToken, "org_name", org.name ?: "");
            if org.orgHandle is string {
                addClaim(accessToken, "org_handle", org.orgHandle);
            }
        }

        if event.user?.id is string {
            boolean hasUserIdClaim = false;
            if accessToken.claims is Claim[] {
                foreach Claim claim in accessToken.claims {
                    if claim.name == "user_id" {
                        hasUserIdClaim = true;
                        break;
                    }
                }
            }
            if !hasUserIdClaim {
                addClaim(accessToken, "user_id", event.user.id);
            }
        }

        if event.request?.grantType is string {
            if event.request.grantType.contains("token-exchange") {
                addScope(accessToken, "token_exchange");
            }
        }
    }

    return {
        event: event,
        requestId: request.requestId
    };
}

// Example handler that modifies token expiration
public function customExpirationHandler(ActionHandlerRequest request) returns ActionHandlerResponse|error {
    log:printInfo("Custom handler: Modifying token expiration");

    Event event = request.event;

    if event.accessToken is AccessToken {
        AccessToken accessToken = event.accessToken;

        if accessToken.claims is Claim[] {
            foreach Claim claim in accessToken.claims {
                if claim.name == "expires_in" {
                    int currentExp = 3600;
                    if claim.value is int {
                        currentExp = claim.value;
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
