# server-monit

Simple server dashboard for the purpose of providing health status and quick clickable links that bring you to the selected service.

## Architecture

- **Frontend**: Single `index.html` page with embedded cards for each service
- **JavaScript**: Separated into `app.js` for better maintainability
- **Technology**: HTML5, CSS3, vanilla JavaScript (no frameworks)
- **Deployment**: Nginx

## Libraries

- **FontAwesome 6.4.0** - Icons for services and status indicators
- **Tailwind CSS** - Utility-first CSS framework for styling
- **CDN Links** - No build process required, serves from static files

## Features

### Service Health Monitoring
- **HTTP-based health checks** - Polls each service URL to detect online/offline status
- **Auto-refresh** - Updates every 10 seconds
- **Visual indicators**:
  - ✅ **Green badge**: Service is running and healthy
  - ⚠️ **Gray icon**: Service is offline or unreachable
- **Smart sub-labels**: Shows "Online", "Offline", or "Healthy" status text

## Environment Detection

The dashboard automatically detects whether it's running in **Development** or **Production** mode based on the hostname:

- **Development Mode** (`localhost`, `127.0.0.1`, `::1`):
  - Services are checked against `http://localhost:PORT`
  - Example: `http://localhost:9443` for Portainer

- **Production Mode** (`192.168.x.x`, domain names, etc.):
  - Services are checked against `https://192.168.1.41:PORT`
  - Example: `https://192.168.1.41:9443` for Portainer

When you access the dashboard at `192.168.1.41:3000`, it will use production URLs to check the actual services on `192.168.1.41`, not `localhost`.

**Console Output:**
- Open browser console (F12) to see environment detection logs
- Shows: Environment, Current hostname, and configured service base URL

### Time Display
- Live clock in the header
- Shows current date with weekday, month, and day

### Service Cards
- Clickable links to each service dashboard
- Hover effects on cards
- Custom colors per service (red, green, yellow icons)

## Configuration

### Config File (`config.json`)

The dashboard loads configuration from `config.json` for easy customization. This makes it portable across different networks.

**How It Works:**

The dashboard tries to load `config.json` when it starts. If it fails (missing file, CORS restrictions, or network issue), it falls back to default configuration values. This means:

- ✅ **config.json exists** → Uses your custom server IP and service settings
- ❌ **config.json missing** → Uses defaults (192.168.1.41 with all current services)

This dual approach ensures:
1. Custom deployments work with your own config
2. The code is still usable out-of-the-box without any configuration
3. No breaking changes if you update the config structure

### Using Your Own Configuration

1. **Copy `config.json`** to your project
2. **Edit the values**:
   - Change `"server.ip"` to your network IP
   - Update service ports if needed
   - Add/remove services as needed
3. **Deploy** - No code changes required!
4. **Refresh browser** - New configuration takes effect immediately

### Editing Your Config

Example - Customizing for a different network:

```json
{
  "server": {
    "ip": "192.168.1.100",  // Your new server IP
    "defaultProtocol": "http"
  },
  "services": {
    // ... update service ports as needed
  }
}
```

**To customize for your network:**
1. Edit `config.json` with your server IP
2. Update service ports if needed
3. Add new services as described below
4. No code changes required!

### Server Configuration

- **`ip`**: Your server's IP address on the network (e.g., `"192.168.1.41"`)
- **`defaultProtocol`**: Default protocol for all services (`"http"` or `"https"`)

### Service Configuration

Each service needs:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name in the card |
| `subLabel` | Yes | Description text below name |
| `icon` | Yes | FontAwesome icon class (e.g., `"fa-solid fa-film"`) |
| `iconColor` | Yes | Tailwind color class (e.g., `"text-red-400"`) |
| `port` | Yes | Port number the service runs on |
| `link` | Yes | Path to the service dashboard |
| `protocol` | No | Override for this service (e.g., `"http"` or `"https"`) |

### Protocol Override Example

Some services require different protocols. If not specified, they'll use the `defaultProtocol`:

```json
"server": {
  "ip": "192.168.1.41",
  "defaultProtocol": "https"
},
"services": {
  "searxng": {
    "protocol": "http"  // This service needs HTTP, not HTTPS
  }
}
```

### Available Services Configuration

**Current services:**

| Service | Port | Protocol | Link Path | Icon | Color |
|---------|------|----------|-----------|------|-------|
| Portainer | 9443 | https | `9443` | `fa-brands fa-docker` | Red |
| SearXNG | 8081 | http | `8081` | `fa-solid fa-magnifying-glass` | Red |
| Plex Media | 32400 | http | `32400/web` | `fa-solid fa-film` | Green |
| Transmission | 6881 | http | `6881/web` | `fa-solid fa-bolt` | Yellow |

**Custom `statusClass`** (for the RUNNING badge):

| Service | Status Class |
|---------|--------------|
| Portainer | `bg-green-900 text-green-300` |
| SearXNG | `bg-green-900 text-green-300` |
| Plex Media | `bg-green-900 text-green-300` |
| Transmission | `bg-green-900 text-green-300` |

## Adding New Services

### Step 1: Add to `config.json`

```json
"services": {
  "your-new-service": {
    "name": "Your Service",
    "subLabel": "What it does",
    "icon": "fa-solid fa-star",
    "iconColor": "text-purple-400",
    "port": "8080",
    "link": "/dashboard",
    "protocol": "http",
    "statusClass": "bg-green-900 text-green-300"
  }
}
```

### Step 2: Add HTML Card to `index.html`

```html
<a href="" target="_blank" class="card block bg-slate-800 p-6 rounded-xl border border-slate-700" data-service="your-new-service">
    <div class="flex items-center justify-between mb-4">
        <i class="fa-solid fa-star text-3xl text-purple-400"></i>
        <span class="text-xs font-bold bg-green-900 text-green-300 px-2 py-1 rounded">RUNNING</span>
    </div>
    <h2 class="text-xl font-bold mb-1">Your Service</h2>
    <p class="text-slate-400 text-sm mb-4">What it does</p>
    <div class="flex items-center text-sm text-blue-400">
        <i class="fa-solid fa-arrow-right mr-2"></i> Open Service
    </div>
</a>
```

### Step 3: Refresh

Reload the page and the new service will appear with automatic health monitoring!

## Customizing Icons

### FontAwesome Icons

Use any FontAwesome 6 icon:
- **Brands**: `fa-brands fa-facebook`, `fa-brands fa-docker`
- **Solid**: `fa-solid fa-server`, `fa-solid fa-film`
- **Regular**: `fa-regular fa-heart`

### Color Classes

Use Tailwind color classes:
- `text-red-400`, `text-green-400`, `text-yellow-400`, `text-blue-400`
- `text-purple-400`, `text-pink-400`, `text-indigo-400`
- Or any other Tailwind color scheme

## Deployment

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/server-monit;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Optional: Enable caching for static assets
    location ~* \.(js|css|png|jpg|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Building for Production

No build step required - serves directly from static files.

## Development

```bash
# Serve locally for testing
npx serve .

# Or use any static file server
python3 -m http.server 8000
```

## File Structure

```
server-monit/
├── index.html      # Main dashboard page
├── app.js          # Service configuration and health check logic
├── style.css       # (Optional - currently using Tailwind CDN)
└── README.md       # This file
```

## Troubleshooting

### Services Show as "Offline"

1. **Check service is actually running**: Open the service URL directly in your browser
2. **Check browser console** (F12) for error messages
3. **Verify CORS settings**: Services need to allow cross-origin requests
4. **Check firewall**: Ensure ports are open (9443, 8081, 32400, 6881)
5. **Test locally**: Try accessing `http://192.168.1.41:9443` from another device on the network

### Dashboard Won't Load

1. **Check `npx serve .` is running**: `http://192.168.1.41:3000` should be accessible
2. **Check HTML references**: Ensure `app.js` is in the same directory as `index.html`

### CORS Errors

If you see CORS errors in the console, some services may be blocking the health checks. The dashboard uses `no-cors` mode which only checks if the service responds (status 200) without returning the actual response body.

### Adding Docker Health Checks

Currently using HTTP-based health checks for simplicity. To add Docker API health monitoring:
- Requires serving from a browser with Docker socket access
- Would need `http://unix:/var/run/docker.sock:/` accessible
- More complex setup but provides container health status