# React Client for WSO2 Asgardeo Action Handler

A modern React web application for testing and interacting with the WSO2 Asgardeo Action Handler server. This client provides an intuitive interface to create, send, and visualize action handler requests and responses.

## Features

- **Interactive Form** - Easy-to-use form for creating action handler requests
- **Real-time Testing** - Send requests and view responses instantly
- **JSON Display** - Formatted JSON response viewer
- **Token Information** - Detailed view of access token claims and scopes
- **Modern UI** - Clean, responsive design with dark/light mode support

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ActionHandlerForm.jsx    # Form component for creating requests
│   │   ├── ActionHandlerForm.css
│   │   ├── ResponseDisplay.jsx       # Component for displaying responses
│   │   └── ResponseDisplay.css
│   ├── App.jsx                       # Main application component
│   ├── App.css
│   ├── main.jsx                      # Application entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── package.json                      # Dependencies and scripts
├── vite.config.js                    # Vite configuration
└── README.md                         # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- The action handler server running on `http://localhost:9090`

## Quick Start

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Installation

### Prerequisites Check

Before installing, ensure you have:
- **Node.js** v16 or higher installed
- **npm** or **yarn** package manager
- The action handler **server running** on `http://localhost:9090`

### Step-by-Step Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

This will install all required packages including React, Vite, and other dependencies.

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Make sure the action handler server is running:
```bash
# In another terminal, from the server directory
cd ../server
bal run
```

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. To preview the production build:

```bash
npm run preview
```

## Usage

### Creating a Request

1. **Fill in the form fields:**
   - **Action Type**: Select the action type (currently supports `PRE_ISSUE_ACCESS_TOKEN`)
   - **Request Details**: Enter client ID, grant type, and scopes
   - **User Information**: Provide user ID and organization details
   - **Tenant Information**: Enter tenant ID and name

2. **Click "Send Request"** to submit the request to the server

3. **View the response** in the **Server Response** section:
   - Full JSON response with syntax highlighting
   - Access token information breakdown
   - Claims and scopes display

### Form Fields Explained

#### Request Details
- **Client ID**: OAuth2 client identifier (e.g., `J4uqZ4GXRwXOWnZhOdTjrzl4FPka`)
- **Grant Type**: OAuth2 grant type (e.g., `authorization_code`, `client_credentials`)
- **Scopes**: Comma-separated list of scopes (e.g., `openid, profile, email`)

#### User Information
- **User ID**: Unique identifier for the user (UUID format recommended)
- **Organization ID**: Organization identifier
- **Organization Name**: Display name of the organization
- **Organization Handle**: Organization handle/slug

#### Tenant Information
- **Tenant ID**: Tenant identifier
- **Tenant Name**: Tenant display name

### Example Request

Here's an example of a complete request payload:

```json
{
  "actionType": "PRE_ISSUE_ACCESS_TOKEN",
  "event": {
    "request": {
      "clientId": "test-client",
      "grantType": "authorization_code",
      "scopes": ["openid", "profile"]
    },
    "tenant": {
      "id": "test-tenant",
      "name": "test-tenant"
    },
    "user": {
      "id": "33b987ee-fa8e-4fb4-9bb1-b92564602163",
      "organization": {
        "id": "10084a8d-113f-4211-a0d5-efe36b082211",
        "name": "Test Organization",
        "orgHandle": "test-org"
      }
    },
    "accessToken": {
      "tokenType": "JWT",
      "claims": [
        {
          "name": "sub",
          "value": "test-user"
        }
      ],
      "scopes": ["openid"]
    }
  },
  "requestId": "req-1234567890"
}
```

## Configuration

### Changing the Server URL

To connect to a different server, edit `src/App.jsx`:

```javascript
const response = await fetch('http://your-server:9090/action-handler', {
  // ...
})
```

Or configure a proxy in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-server:9090',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

The application is structured with reusable components:

- **ActionHandlerForm**: Handles form input and submission
- **ResponseDisplay**: Displays server responses

To add new features:

1. Create new components in `src/components/`
2. Import and use them in `App.jsx`
3. Add corresponding CSS files for styling

## Troubleshooting

### CORS Errors

If you encounter CORS errors, ensure:
- The server is running and accessible
- The server allows requests from `http://localhost:3000`
- Check browser console for specific error messages

### Connection Errors

- Verify the server is running on `http://localhost:9090`
- Check the server logs for errors
- Ensure no firewall is blocking the connection

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)
- Review error messages in the terminal

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **CSS3** - Styling with modern features

## API Reference

### Endpoints

The client communicates with the following server endpoints:

- **POST** `/action-handler` - Main endpoint for processing action handler requests
- **GET** `/health` - Health check endpoint (not used by client, but available)

### Request Format

All requests must be sent as `application/json` with the following structure:

```javascript
{
  actionType: string,
  event: {
    request: { ... },
    tenant: { ... },
    user: { ... },
    accessToken: { ... }
  },
  requestId: string
}
```

### Response Format

The server returns a JSON response with the processed event:

```javascript
{
  event: {
    accessToken: {
      tokenType: string,
      claims: Array<{name: string, value: any}>,
      scopes: Array<string>
    },
    ...
  },
  requestId: string
}
```

## Examples

### Testing with Real Asgardeo Data

1. Copy a real request payload from your Asgardeo console
2. Fill in the form fields with the actual values
3. Click "Send Request" to see how the server processes it
4. Review the modified claims and scopes in the response

### Customizing the Form

To add new form fields, edit `src/components/ActionHandlerForm.jsx`:

```javascript
// Add new field to formData state
const [formData, setFormData] = useState({
  // ... existing fields
  newField: 'default-value'
})

// Add form input
<div className="form-group">
  <label htmlFor="newField">New Field</label>
  <input
    type="text"
    id="newField"
    name="newField"
    value={formData.newField}
    onChange={handleChange}
  />
</div>
```

## Contributing

When contributing to this client:

1. Follow the existing code structure
2. Use functional components with hooks
3. Keep components focused and reusable
4. Add appropriate error handling
5. Update this README with any new features

## License

See the main project README for license information.
