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

### Environment Detection
- **Development mode** (localhost) - Uses `http://localhost` endpoints
- **Production mode** - Uses `https://192.168.1.41` endpoints
- Automatically switches based on `window.location.hostname`

### Time Display
- Live clock in the header
- Shows current date with weekday, month, and day

### Service Cards
- Clickable links to each service dashboard
- Hover effects on cards
- Custom colors per service (red, green, yellow icons)

## Configuration

### Service URLs
Edit `app.js` to configure service endpoints:

```javascript
const SERVICE_ENDPOINTS = {
    production: 'https://192.168.1.41',
    development: 'http://localhost'
};
```

### Available Services

| Service | Container | URL | Icon |
|---------|-----------|-----|------|
| Portainer | portainer | :9443 | `fa-brands fa-docker` |
| SearXNG | searxng | :8081 | `fa-solid fa-magnifying-glass` |
| Plex Media | plex | :32400 | `fa-solid fa-film` |
| Transmission | transmission | :6881 | `fa-solid fa-bolt` |

### Adding New Services

1. Add service configuration to `app.js` services object
2. Add HTML card in `index.html` with `data-service` attribute matching the key
3. Specify URL, icon, and colors

### Example Service Addition

**In `app.js`:**
```javascript
'newservice': { 
    container: 'newservice',
    url: SERVICE_ENDPOINTS.production + ':8080',
    label: 'New Service',
    subLabel: 'Description',
    icon: 'fa-solid fa-star',
    iconClass: 'text-purple-400',
    link: SERVICE_ENDPOINTS.production + ':8080',
    statusClass: 'bg-green-900 text-green-300',
    iconColor: 'text-purple-400'
}
```

**In `index.html`:**
```html
<a href="https://192.168.1.41:8080" target="_blank" class="card block bg-slate-800 p-6 rounded-xl border border-slate-700" data-service="newservice">
    <div class="flex items-center justify-between mb-4">
        <i class="fa-solid fa-star text-3xl text-purple-400"></i>
        <span class="text-xs font-bold bg-green-900 text-green-300 px-2 py-1 rounded">RUNNING</span>
    </div>
    <h2 class="text-xl font-bold mb-1">New Service</h2>
    <p class="text-slate-400 text-sm mb-4">Description</p>
    <div class="flex items-center text-sm text-blue-400">
        <i class="fa-solid fa-arrow-right mr-2"></i> Open Service
    </div>
</a>
```

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