import ballerina/log;

// Main entry point
public function main() returns error? {
    log:printInfo("Starting WSO2 Asgardeo Action Handler Service");
    log:printInfo("Service will be available at http://localhost:9090/action-handler");
    log:printInfo("Health check available at http://localhost:9090/health");
}
