/**
 * Service Monitor Dashboard - JavaScript
 * Handles service health checks and time updates
 */

// Configuration: Service URLs for production server (192.168.1.41)
// Override these if serving from a different server
const SERVICE_ENDPOINTS = {
    production: 'https://192.168.1.41',
    development: 'http://localhost' // For local development
};

// Service configuration with URLs and custom styles
const services = {
    'portainer': { 
        container: 'portainer',
        url: SERVICE_ENDPOINTS.production + ':9443',
        label: 'Portainer',
        subLabel: 'Docker Dashboard',
        icon: 'fa-brands fa-docker',
        iconClass: 'text-red-400',
        link: SERVICE_ENDPOINTS.production + ':9443',
        statusClass: 'bg-green-900 text-green-300',
        iconColor: 'text-red-400'
    },
    'searxng': { 
        container: 'searxng',
        url: SERVICE_ENDPOINTS.production + ':8081',
        label: 'SearXNG',
        subLabel: 'Search Engine',
        icon: 'fa-solid fa-magnifying-glass',
        iconClass: 'text-red-400',
        link: SERVICE_ENDPOINTS.production + ':8081',
        statusClass: 'bg-green-900 text-green-300',
        iconColor: 'text-red-400'
    },
    'plex': { 
        container: 'plex',
        url: SERVICE_ENDPOINTS.production + ':32400',
        label: 'Plex Media',
        subLabel: 'Movies & TV',
        icon: 'fa-solid fa-film',
        iconClass: 'text-green-400',
        link: SERVICE_ENDPOINTS.production + ':32400/web',
        statusClass: 'bg-green-900 text-green-300',
        iconColor: 'text-green-400'
    },
    'transmission': { 
        container: 'transmission',
        url: SERVICE_ENDPOINTS.production + ':6881',
        label: 'Transmission',
        subLabel: 'Torrent Client',
        icon: 'fa-solid fa-bolt',
        iconClass: 'text-yellow-400',
        link: SERVICE_ENDPOINTS.production + ':6881/web',
        statusClass: 'bg-green-900 text-green-300',
        iconColor: 'text-yellow-400'
    }
};

// Determine if we're in development mode
// Development: localhost, 127.0.0.1, ::1, or IPv4-mapped IPv6 addresses
// Production: Any other hostname/IP (including 192.168.x.x when served from the server itself)
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '::1' ||
                      /127\./.test(window.location.hostname);

console.log('Environment:', isDevelopment ? 'Development (localhost)' : 'Production (192.168.1.41)');
console.log('Current hostname:', window.location.hostname);
console.log('Service base URL:', isDevelopment ? SERVICE_ENDPOINTS.development : SERVICE_ENDPOINTS.production);

// Override URLs for development - replace production base URL with localhost
Object.values(services).forEach(service => {
    if (service.url.includes(SERVICE_ENDPOINTS.production)) {
        service.url = SERVICE_ENDPOINTS.development + service.url.replace(SERVICE_ENDPOINTS.production, '');
        service.link = SERVICE_ENDPOINTS.development + service.link.replace(SERVICE_ENDPOINTS.production, '');
    }
});

console.log('Service URLs configured for:', isDevelopment ? 'localhost' : '192.168.1.41');

/**
 * Check service health via HTTP HEAD request
 * @param {string} serviceKey - Service identifier
 * @returns {Object} Status information
 */
async function checkServiceHealth(serviceKey, serviceConfig) {
    try {
        // Make HEAD request to check if service is responding
        // Using no-cors mode to handle CORS restrictions
        const response = await fetch(serviceConfig.url, { 
            method: 'HEAD',
            mode: 'no-cors', 
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        // Status 0 means network error or blocked
        if (response.status === 0) {
            return { 
                status: 'OFFLINE', 
                iconClass: 'text-slate-500', 
                badgeClass: 'bg-red-900 text-red-300', 
                badgeText: 'OFFLINE',
                subLabel: 'Offline'
            };
        }
        
        // Service is responding
        return { 
            status: 'RUNNING', 
            iconClass: serviceConfig.iconClass, 
            badgeClass: serviceConfig.statusClass, 
            badgeText: 'RUNNING',
            subLabel: 'Healthy'
        };
    } catch (error) {
        console.error(`Service ${serviceKey} is offline:`, error);
        return { 
            status: 'OFFLINE', 
            iconClass: 'text-slate-500', 
            badgeClass: 'bg-red-900 text-red-300', 
            badgeText: 'OFFLINE',
            subLabel: 'Offline'
        };
    }
}

/**
 * Update all service status badges and icons in the DOM
 */
async function updateServiceStatus() {
    for (const [key, service] of Object.entries(services)) {
        try {
            const status = await checkServiceHealth(key, service);
            
            // Find and update the card elements
            const card = document.querySelector(`[data-service="${key}"]`);
            if (card) {
                const iconElement = card.querySelector('.fa-solid, .fa-brands');
                const badgeElement = card.querySelector('span.text-xs.font-bold');
                const subLabelElement = card.querySelector('p.text-slate-400.text-sm');
                
                // Update status badge
                if (badgeElement) {
                    badgeElement.className = `text-xs font-bold ${status.badgeClass} px-2 py-1 rounded`;
                    badgeElement.textContent = status.badgeText;
                }
                
                // Update icon color based on status
                if (iconElement) {
                    if (status.status === 'RUNNING') {
                        // Service is running, use configured icon color
                        iconElement.className = `fa-${service.icon.split(' ').pop()} text-3xl ${service.iconClass}`;
                    } else {
                        // Service is offline, use gray icon
                        iconElement.className = `fa-${service.icon.split(' ').pop()} text-3xl ${status.iconClass}`;
                    }
                }
                
                // Update sub-label if available
                if (subLabelElement && status.subLabel) {
                    subLabelElement.textContent = status.subLabel;
                }
            }
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
        }
    }
}

/**
 * Update the time and date display
 */
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const dateTimeElement = document.getElementById('date-time');
    const dateElement = document.getElementById('current-date');
    
    if (dateTimeElement) {
        dateTimeElement.textContent = timeString;
    }
    
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}

/**
 * Initialize the dashboard
 */
function initDashboard() {
    // Run first health check immediately
    updateServiceStatus();
    
    // Check service status every 10 seconds
    setInterval(updateServiceStatus, 10000);
    
    // Update time immediately and every second
    updateTime();
    setInterval(updateTime, 1000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
