export interface Org {
  id?: string;
  name?: string;
  orgHandle?: string;
  depth?: number;
}

export interface User {
  id?: string;
  organization?: Org;
}

export interface Tenant {
  id?: string;
  name?: string;
}

export interface Header {
  name: string;
  value: string[];
}

export interface Parameter {
  name: string;
  value: string[];
}

export interface RequestDetails {
  additionalHeaders?: Header[];
  additionalParams?: Parameter[];
  clientId?: string;
  grantType?: string;
  scopes?: string[];
}

export interface Claim {
  name: string;
  value: string | string[] | number;
}

export interface AccessToken {
  tokenType?: string;
  claims?: Claim[];
  scopes?: string[];
}

export interface UserStore {}

export interface Event {
  request?: RequestDetails;
  tenant?: Tenant;
  user?: User;
  userStore?: UserStore;
  accessToken?: AccessToken;
}

export interface AllowedOperation {
  op: string;
  paths: string[];
}

export interface ActionHandlerRequest {
  actionType: string;
  event: Event;
  allowedOperations?: AllowedOperation[];
  requestId?: string;
}

export interface ActionHandlerResponse {
  event: Event;
  requestId?: string;
}

export interface FormState {
  actionType: string;
  clientId: string;
  grantType: string;
  scopes: string;
  userId: string;
  orgId: string;
  orgName: string;
  orgHandle: string;
  tenantId: string;
  tenantName: string;
  tokenType: string;
  claims: Claim[];
  accessTokenScopes: string;
  enabled: boolean;
}

export function buildRequest(form: FormState): ActionHandlerRequest {
  const scopeList = form.scopes.split(',').map(s => s.trim()).filter(Boolean);
  const tokenScopes = form.accessTokenScopes
    ? form.accessTokenScopes.split(',').map(s => s.trim()).filter(Boolean)
    : scopeList;

  return {
    actionType: form.actionType,
    event: {
      request: {
        clientId: form.clientId || undefined,
        grantType: form.grantType || undefined,
        scopes: scopeList.length > 0 ? scopeList : undefined,
      },
      tenant: {
        id: form.tenantId || undefined,
        name: form.tenantName || undefined,
      },
      user: {
        id: form.userId || undefined,
        organization: {
          id: form.orgId || undefined,
          name: form.orgName || undefined,
          orgHandle: form.orgHandle || undefined,
        },
      },
      accessToken: {
        tokenType: form.tokenType || 'JWT',
        claims: form.claims.length > 0 ? form.claims : undefined,
        scopes: tokenScopes.length > 0 ? tokenScopes : undefined,
      },
    },
    requestId: `req-${Date.now()}`,
  };
}

export const defaultFormState: FormState = {
  actionType: 'PRE_ISSUE_ACCESS_TOKEN',
  clientId: 'test-client',
  grantType: 'authorization_code',
  scopes: 'openid, profile',
  userId: '33b987ee-fa8e-4fb4-9bb1-b92564602163',
  orgId: '10084a8d-113f-4211-a0d5-efe36b082211',
  orgName: 'Super',
  orgHandle: 'carbon.super',
  tenantId: '-1234',
  tenantName: 'carbon.super',
  tokenType: 'JWT',
  claims: [
    { name: 'sub', value: 'test-user' },
    { name: 'iss', value: 'https://localhost:9443/oauth2/token' },
  ],
  accessTokenScopes: '',
  enabled: false,
};
