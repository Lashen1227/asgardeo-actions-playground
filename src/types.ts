export interface Org {
  id?: string;
  name?: string;
  orgHandle?: string;
  depth?: number;
}

export interface User {
  id?: string;
  organization?: Org;
  userType?: 'LOCAL' | 'FEDERATED';
  federatedIdP?: string;
  accessingOrganization?: string;
  claims?: UserClaim[];
  groups?: string[];
  updatingCredential?: UpdatingCredential;
}

export interface Tenant {
  id?: string;
  name?: string;
}

export type UserStore = {
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
  responseType?: string;
  claims?: ProfileClaim[];
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

export interface IdToken {
  claims?: Claim[];
}

export interface RefreshToken {
  claims?: Claim[];
}

export interface UpdatingCredential {
  type?: string;
  format?: string;
  value?: string;
  additionalData?: { algorithm?: string };
}

export interface UserClaim {
  uri: string;
  value: string | string[];
}

export interface ProfileClaim {
  uri: string;
  value: string | string[];
  updatingValue?: string | string[];
}

export interface Event {
  request?: RequestDetails;
  tenant?: Tenant;
  organization?: Org;
  user?: User;
  userStore?: UserStore;
  accessToken?: AccessToken;
  idToken?: IdToken;
  refreshToken?: RefreshToken;
  initiatorType?: 'USER' | 'ADMIN' | 'APPLICATION';
  action?: 'UPDATE' | 'RESET' | 'INVITE' | 'REGISTER';
}

export interface AllowedOperation {
  op: string;
  paths: string[];
}

export interface Operation {
  op: string;
  path: string;
  value?: unknown;
}

export interface ActionHandlerRequest {
  actionType: string;
  event: Event;
  allowedOperations?: AllowedOperation[];
  requestId?: string;
}

export interface ActionHandlerResponse {
  actionStatus: string;
  event?: Event;
  operations?: Operation[];
  requestId?: string;
  failureReason?: string;
  failureDescription?: string;
  errorMessage?: string;
  errorDescription?: string;
}

export interface FormState {
  actionType: string;
  clientId: string;
  grantType: string;
  scopes: string;
  responseType: string;
  userId: string;
  userType: 'LOCAL' | 'FEDERATED';
  orgId: string;
  orgName: string;
  orgHandle: string;
  tenantId: string;
  tenantName: string;
  tokenType: string;
  claims: Claim[];
  idTokenClaims: Claim[];
  accessTokenScopes: string;
  initiatorType: 'USER' | 'ADMIN' | 'APPLICATION';
  action: 'UPDATE' | 'RESET' | 'INVITE' | 'REGISTER';
  credentialFormat: string;
  credentialAlgorithm: string;
  credentialValue: string;
  profileClaims: ProfileClaim[];
  enablePreview: boolean;
}

export const defaultFormState: FormState = {
  actionType: 'PRE_ISSUE_ACCESS_TOKEN',
  clientId: 'test-client',
  grantType: 'authorization_code',
  scopes: 'openid, profile',
  responseType: '',
  userId: '33b987ee-fa8e-4fb4-9bb1-b92564602163',
  userType: 'LOCAL',
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
  idTokenClaims: [
    { name: 'sub', value: 'test-user' },
    { name: 'iss', value: 'https://localhost:9443/oauth2/token' },
  ],
  accessTokenScopes: '',
  initiatorType: 'USER',
  action: 'UPDATE',
  credentialFormat: 'PLAIN_TEXT',
  credentialAlgorithm: '',
  credentialValue: 'newPassword123!',
  profileClaims: [
    { uri: 'http://wso2.org/claims/emailAddresses', value: ['old@email.com'], updatingValue: ['new@email.com'] },
    { uri: 'http://wso2.org/claims/givenName', value: 'John', updatingValue: 'Johnny' },
  ],
  enablePreview: false,
};

function buildTokenEvent(form: FormState): Event {
  const scopeList = form.scopes.split(',').map(s => s.trim()).filter(Boolean);
  const tokenScopes = form.accessTokenScopes
    ? form.accessTokenScopes.split(',').map(s => s.trim()).filter(Boolean)
    : scopeList;

  return {
    request: {
      clientId: form.clientId || undefined,
      grantType: form.grantType || undefined,
      scopes: scopeList.length > 0 ? scopeList : undefined,
    },
    tenant: {
      id: form.tenantId || undefined,
      name: form.tenantName || undefined,
    },
    organization: {
      id: form.orgId || undefined,
      name: form.orgName || undefined,
      orgHandle: form.orgHandle || undefined,
    },
    user: {
      id: form.userId || undefined,
      organization: {
        id: form.orgId || undefined,
        name: form.orgName || undefined,
      },
      userType: form.userType,
    },
    userStore: {},
    accessToken: {
      tokenType: form.tokenType || 'JWT',
      claims: form.claims.length > 0 ? form.claims : undefined,
      scopes: tokenScopes.length > 0 ? tokenScopes : undefined,
    },
  };
}

function buildIdTokenEvent(form: FormState): Event {
  const scopeList = form.scopes.split(',').map(s => s.trim()).filter(Boolean);

  return {
    request: {
      clientId: form.clientId || undefined,
      grantType: form.grantType || undefined,
      scopes: scopeList.length > 0 ? scopeList : undefined,
      responseType: form.responseType || undefined,
    },
    tenant: {
      id: form.tenantId || undefined,
      name: form.tenantName || undefined,
    },
    organization: {
      id: form.orgId || undefined,
      name: form.orgName || undefined,
      orgHandle: form.orgHandle || undefined,
    },
    user: {
      id: form.userId || undefined,
      organization: {
        id: form.orgId || undefined,
        name: form.orgName || undefined,
      },
      userType: form.userType,
    },
    userStore: {},
    idToken: {
      claims: form.idTokenClaims.length > 0 ? form.idTokenClaims : undefined,
    },
  };
}

function buildPasswordEvent(form: FormState): Event {
  return {
    tenant: {
      id: form.tenantId || undefined,
      name: form.tenantName || undefined,
    },
    organization: {
      id: form.orgId || undefined,
      name: form.orgName || undefined,
      orgHandle: form.orgHandle || undefined,
    },
    user: {
      id: form.userId || undefined,
      organization: {
        id: form.orgId || undefined,
        name: form.orgName || undefined,
      },
      updatingCredential: {
        type: 'PASSWORD',
        format: form.credentialFormat || undefined,
        value: form.credentialValue || undefined,
        additionalData: form.credentialAlgorithm
          ? { algorithm: form.credentialAlgorithm }
          : undefined,
      },
    },
    userStore: {},
    initiatorType: form.initiatorType,
    action: form.action,
  };
}

function buildProfileEvent(form: FormState): Event {
  return {
    request: {
      claims: form.profileClaims.length > 0 ? form.profileClaims : undefined,
    },
    tenant: {
      id: form.tenantId || undefined,
      name: form.tenantName || undefined,
    },
    organization: {
      id: form.orgId || undefined,
      name: form.orgName || undefined,
      orgHandle: form.orgHandle || undefined,
    },
    user: {
      id: form.userId || undefined,
      organization: {
        id: form.orgId || undefined,
        name: form.orgName || undefined,
      },
    },
    userStore: {},
    initiatorType: form.initiatorType,
    action: 'UPDATE',
  };
}

export function buildRequest(form: FormState): ActionHandlerRequest {
  let event: Event;
  let allowedOperations: AllowedOperation[] | undefined;

  switch (form.actionType) {
    case 'PRE_ISSUE_ACCESS_TOKEN':
      event = buildTokenEvent(form);
      allowedOperations = [
        { op: 'add', paths: ['/accessToken/claims/', '/accessToken/scopes/', '/accessToken/claims/aud/'] },
        { op: 'remove', paths: ['/accessToken/scopes/', '/accessToken/claims/aud/'] },
        { op: 'replace', paths: ['/accessToken/scopes/', '/accessToken/claims/aud/', '/accessToken/claims/expires_in'] },
      ];
      break;
    case 'PRE_ISSUE_ID_TOKEN':
      event = buildIdTokenEvent(form);
      allowedOperations = [
        { op: 'add', paths: ['/idToken/claims/', '/idToken/claims/aud/'] },
        { op: 'remove', paths: ['/idToken/claims/', '/idToken/claims/aud/'] },
        { op: 'replace', paths: ['/idToken/claims/', '/idToken/claims/aud/', '/idToken/claims/expires_in'] },
      ];
      break;
    case 'PRE_UPDATE_PASSWORD':
      event = buildPasswordEvent(form);
      break;
    case 'PRE_UPDATE_PROFILE':
      event = buildProfileEvent(form);
      break;
    default:
      event = buildTokenEvent(form);
  }

  return {
    actionType: form.actionType,
    event,
    allowedOperations,
    requestId: `req-${Date.now()}`,
  };
}

export function processRequest(req: ActionHandlerRequest): ActionHandlerResponse {
  const event: Event = JSON.parse(JSON.stringify(req.event));
  const ops = req.allowedOperations;

  if (req.actionType === 'PRE_ISSUE_ACCESS_TOKEN' && ops) {
    const accessToken = event.accessToken;
    if (accessToken) {
      for (const op of ops) {
        for (const path of op.paths) {
          const clean = path.endsWith('/') ? path.slice(0, -1) : path;
          if (op.op === 'add') {
            if (clean.startsWith('/accessToken/claims/')) {
              const name = clean.slice('/accessToken/claims/'.length);
              if (name && accessToken.claims) accessToken.claims.push({ name, value: '' });
            } else if (clean.startsWith('/accessToken/scopes/')) {
              const scope = clean.slice('/accessToken/scopes/'.length);
              if (scope && accessToken.scopes) accessToken.scopes.push(scope);
            }
          } else if (op.op === 'remove') {
            if (clean.startsWith('/accessToken/claims/')) {
              const name = clean.slice('/accessToken/claims/'.length);
              if (name && accessToken.claims) {
                accessToken.claims = accessToken.claims.filter(c => c.name !== name);
              }
            } else if (clean.startsWith('/accessToken/scopes/')) {
              const scope = clean.slice('/accessToken/scopes/'.length);
              if (scope && accessToken.scopes) {
                accessToken.scopes = accessToken.scopes.filter(s => s !== scope);
              }
            }
          } else if (op.op === 'replace') {
            if (clean.startsWith('/accessToken/scopes/')) {
              const scope = clean.slice('/accessToken/scopes/'.length);
              if (scope && accessToken.scopes && accessToken.scopes.includes(scope)) {
                // replace semantics: keep existing scope as is in simulation
              }
            }
          }
        }
      }
    }
    return {
      actionStatus: 'SUCCESS',
      event,
      requestId: req.requestId,
    };
  }

  if (req.actionType === 'PRE_ISSUE_ID_TOKEN' && ops) {
    const idToken = event.idToken;
    if (idToken) {
      for (const op of ops) {
        for (const path of op.paths) {
          const clean = path.endsWith('/') ? path.slice(0, -1) : path;
          if (op.op === 'add') {
            if (clean.startsWith('/idToken/claims/')) {
              const name = clean.slice('/idToken/claims/'.length);
              if (name && idToken.claims) idToken.claims.push({ name, value: '' });
            }
          } else if (op.op === 'remove') {
            if (clean.startsWith('/idToken/claims/')) {
              const name = clean.slice('/idToken/claims/'.length);
              if (name && idToken.claims) {
                idToken.claims = idToken.claims.filter(c => c.name !== name);
              }
            }
          }
        }
      }
    }
    return {
      actionStatus: 'SUCCESS',
      event,
      requestId: req.requestId,
    };
  }

  if (req.actionType === 'PRE_UPDATE_PASSWORD' || req.actionType === 'PRE_UPDATE_PROFILE') {
    return {
      actionStatus: 'SUCCESS',
      event,
      requestId: req.requestId,
    };
  }

  return {
    actionStatus: 'SUCCESS',
    event,
    requestId: req.requestId,
  };
}
