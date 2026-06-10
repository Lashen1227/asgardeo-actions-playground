// Types for WSO2 Asgardeo Action Handler

// Header structure
public type Header record {
    string name;
    string[] value;
};

// Parameter structure
public type Parameter record {
    string name;
    string[] value;
};

// Request structure
public type Request record {
    Header[] additionalHeaders?;
    Parameter[] additionalParams?;
    string clientId?;
    string grantType?;
    string[] scopes?;
};

// Tenant structure
public type Tenant record {
    string id?;
    string name?;
};

// Organization structure
public type Organization record {
    string id?;
    string name?;
    string orgHandle?;
    int depth?;
};

// User structure
public type User record {
    string id?;
    Organization organization?;
};

// UserStore structure (can be empty or extended)
public type UserStore record {};

// Claim structure
public type Claim record {
    string name;
    string|string[]|int value;
};

// AccessToken structure
public type AccessToken record {
    string tokenType?;
    Claim[] claims?;
    string[] scopes?;
};

// Event structure
public type Event record {
    Request request?;
    Tenant tenant?;
    User user?;
    UserStore userStore?;
    AccessToken accessToken?;
};

// Allowed operation structure
public type AllowedOperation record {
    string op; // "add", "remove", or "replace"
    string[] paths;
};

// Action Handler Request structure
public type ActionHandlerRequest record {
    string actionType;
    Event event;
    AllowedOperation[] allowedOperations?;
    string requestId?;
};

// Action Handler Response structure
public type ActionHandlerResponse record {
    Event event;
    string requestId?;
};
