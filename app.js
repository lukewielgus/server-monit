/**
 * Service Monitor Dashboard - JavaScript
 * Handles service health checks and time updates
 * 
 * Configuration is loaded from config.json for easy customization
 */

// Configuration defaults (fallback if config.json fails to load)
const DEFAULT_CONFIG = {
    server: {
        ip: '192.168.1.41',
        protocol: 'https'
    },
    services: {
        'portainer': {
            name: 'Portainer',
            subLabel: 'Docker Dashboard',
            icon: 'fa-brands fa-docker',
            iconColor: 'text-red-400',
            port: '9443',
            link: '9443',
            statusClass: 'bg-green-900 text-green-300'
        },
        'searxng': {
            name: 'SearXNG',
            subLabel: 'Search Engine',
            icon: 'fa-solid fa-magnifying-glass',
            iconColor: 'text-red-400',
            port: '8081',
            link: '8081',
            statusClass: 'bg-green-900 text-green-300'
        },
        'plex': {
            name: 'Plex Media',
            subLabel: 'Movies & TV',
            icon: 'fa-solid fa-film',
            iconColor: 'text-green-400',
            port: '32400',
            link: '32400/web',
            statusClass: 'bg-green-900 text-green-300'
        },
        'transmission': {
            name: 'Transmission',
            subLabel: 'Torrent Client',
            icon: 'fa-solid fa-bolt',
            iconColor: 'text-yellow-400',
            port: '6881',
            link: '6881/web',
            statusClass: 'bg-green-900 text-green-300'
        }
    }
};

let currentConfig = null;

/**
 * Load configuration from config.json
 */
async function loadConfig() {
    try {
        // Try to load config.json
        const response = await fetch('config.json', {
            mode: 'no-cors',
            cache: 'default'
        });
        
        // Use no-cors mode - we just need to know if it exists and is accessible
        if (response.status === 0) {
            console.log('config.json not accessible, using defaults');
            return DEFAULT_CONFIG;
        }
        
        // If CORS is an issue, fall back to defaults
        const text = await response.text();
        const config = JSON.parse(text);
        
        console.log('✅ Loaded config.json');
        return config;
        
    } catch (error) {
        console.log('⚠️ Could not load config.json, using defaults:', error.message);
        return DEFAULT_CONFIG;
    }
}

/**
 * Build service URL from config
 */
function buildServiceUrl(serviceKey, config) {
    const server = config.server || DEFAULT_CONFIG.server;
    const service = config.services[serviceKey] || DEFAULT_CONFIG.services[serviceKey];
    
    // Use protocol from service config, or default from server config
    const protocol = service.protocol || server.defaultProtocol || 'https';
    const ip = server.ip;
    const port = service.port || '';
    const linkPath = service.link || '';
    
    return {
        url: `${protocol}://${ip}${port ? ':' + port : ''}${linkPath ? '/' + linkPath : ''}`,
        link: `${protocol}://${ip}${port ? ':' + port : ''}${linkPath ? '/' + linkPath : ''}`
    };
}

/**
 * Determine if we're in development mode
 * Development: localhost, 127.0.0.1, ::1
 * Production: Any other hostname/IP
 */
function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '::1' ||
           /127\./.test(window.location.hostname);
}

/**
 * Check service health via HTTP HEAD request
 * @param {string} serviceKey - Service identifier
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Status information
 */
async function checkServiceHealth(serviceKey, serviceConfig) {
    try {
        const urlInfo = buildServiceUrl(serviceKey, currentConfig);
        
        // Make HEAD request to check if service is responding
        const response = await fetch(urlInfo.url, { 
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
            iconClass: serviceConfig.iconColor, 
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
    for (const [key, service] of Object.entries(currentConfig.services)) {
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
                        iconElement.className = `fa-${service.icon.split(' ').pop()} text-3xl ${service.iconColor}`;
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
async function initDashboard() {
    // Load configuration
    currentConfig = await loadConfig();
    
    // Log configuration for debugging
    console.log('=== Service Monitor Dashboard ===');
    console.log('Server IP:', currentConfig.server.ip);
    console.log('Environment:', isDevelopmentMode() ? 'Development (localhost)' : 'Production (192.168.1.41)');
    console.log('Configured services:', Object.keys(currentConfig.services).length);
    
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
