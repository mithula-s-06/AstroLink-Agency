// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Current user data
let currentUser = null;
let currentViewData = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login-new.html';
        return;
    }

    currentUser = JSON.parse(user);
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = currentUser.name || 'User';
    }

    // Show admin section if user is admin
    if (currentUser.role === 'admin') {
        const adminSection = document.getElementById('adminSection');
        if (adminSection) {
            adminSection.classList.remove('hidden');
        }
    }

    // Load initial overview data
    await loadOverviewData();
    setupMenuListeners();
});

// Setup menu click listeners
function setupMenuListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view, item);
        });
    });
}

// Switch view and load data
async function switchView(viewName, clickedItem) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    if (clickedItem) {
        clickedItem.classList.add('active');
    }

    // Load data based on view
    switch(viewName) {
        case 'overview':
            await loadOverviewData();
            break;
        case 'missions':
            await loadMissions();
            break;
        case 'satellites':
            await loadSatellites();
            break;
        case 'groundstations':
            await loadGroundStations();
            break;
        case 'anomalies':
            await loadAnomalies();
            break;
        case 'crewlogs':
            await loadCrewLogs();
            break;
        case 'telemetry':
            await loadTelemetry();
            break;
        case 'add-mission':
            showAddMissionForm();
            break;
    }

    // Show selected view
    const selectedView = document.getElementById(viewName + 'View');
    if (selectedView) {
        selectedView.classList.add('active');
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        const missionsRes = await fetch(`${API_BASE_URL}/missions`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const satellitesRes = await fetch(`${API_BASE_URL}/satellites`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const anomaliesRes = await fetch(`${API_BASE_URL}/anomalies`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        const groundstationsRes = await fetch(`${API_BASE_URL}/groundstations`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        const missions = await missionsRes.json();
        const satellites = await satellitesRes.json();
        const anomalies = await anomaliesRes.json();
        const groundstations = await groundstationsRes.json();

        // Update stats
        document.querySelectorAll('.stat-value')[0].textContent = missions.data?.length || 0;
        document.querySelectorAll('.stat-value')[1].textContent = satellites.data?.length || 0;
        document.querySelectorAll('.stat-value')[2].textContent = (anomalies.data?.filter(a => a.is_resolved === false) || []).length;
        document.querySelectorAll('.stat-value')[3].textContent = groundstations.data?.length || 0;
    } catch (error) {
        console.error('Error loading overview:', error);
        showToast('Error loading overview data', 'error');
    }
}

// Load missions
async function loadMissions() {
    try {
        const response = await fetch(`${API_BASE_URL}/missions`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch missions');

        const data = await response.json();
        const itemsList = document.querySelector('#missionsView .items-list');
        
        if (!itemsList) return;

        itemsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(mission => {
                const card = createMissionCard(mission);
                itemsList.appendChild(card);
            });
        } else {
            itemsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No missions found</p>';
        }
    } catch (error) {
        console.error('Error loading missions:', error);
        showToast('Error loading missions', 'error');
    }
}

// Create mission card
function createMissionCard(mission) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const statusClass = mission.mission_status === 'In Progress' ? 'active' : 
                       mission.mission_status === 'Planned' ? '' : 'warning';
    
    card.innerHTML = `
        <span class="badge ${statusClass}">${mission.mission_status || 'Planning'}</span>
        ${mission.image_url ? `<img src="${mission.image_url}" style="width: 100%; height: 200px; object-fit: cover; margin: 0 -1rem -1rem -1rem; border-radius: 8px 8px 0 0;">` : ''}
        <h3>${mission.mission_name}</h3>
        <div class="item-info">
            <p><strong>Type:</strong> ${mission.mission_type}</p>
            <p><strong>Status:</strong> ${mission.mission_status}</p>
            <p><strong>Progress:</strong> ${mission.progress || 0}%</p>
            <p style="color: var(--accent-cyan);">Budget: $${mission.budget || 'N/A'}</p>
        </div>
        <div class="item-footer">
            <span style="font-size: 0.85rem;">Start: ${new Date(mission.start_date).toLocaleDateString()}</span>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="window.location.href='mission-details.html?id=${mission.mission_id}'">View</button>
                ${currentUser.role === 'admin' ? `
                    <button class="btn btn-small btn-warning" onclick="editMission(${mission.mission_id})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteMission(${mission.mission_id})">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// View mission details
async function viewMissionDetails(missionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/missions/${missionId}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch mission details');

        const data = await response.json();
        currentViewData.selectedMission = data.data;
        
        // Create modal or detailed view
        showMissionDetailsModal(data.data);
    } catch (error) {
        console.error('Error loading mission details:', error);
        showToast('Error loading mission details', 'error');
    }
}

// Show mission details modal
function showMissionDetailsModal(missionData) {
    const html = `
        <div id="detailsModal" class="modal" onclick="closeMissionDetailsModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close" onclick="closeMissionDetailsModal()">&times;</span>
                <h2>${missionData.mission.mission_name}</h2>
                
                ${missionData.mission.image_url ? `<img src="${missionData.mission.image_url}" style="width: 100%; height: 300px; object-fit: cover; margin: 1rem 0; border-radius: 8px;">` : ''}
                
                <h3>Mission Details</h3>
                <p><strong>Type:</strong> ${missionData.mission.mission_type}</p>
                <p><strong>Status:</strong> ${missionData.mission.mission_status}</p>
                <p><strong>Description:</strong> ${missionData.mission.mission_description || 'N/A'}</p>
                <p><strong>Budget:</strong> $${missionData.mission.budget || 'N/A'}</p>
                <p><strong>Start Date:</strong> ${new Date(missionData.mission.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(missionData.mission.end_date).toLocaleDateString()}</p>
                
                <h3>Satellites (${missionData.satellites.length})</h3>
                <div style="overflow-y: auto; max-height: 200px;">
                    ${missionData.satellites.map(s => `<p>• ${s.satellite_name} (${s.satellite_type}) - ${s.status}</p>`).join('')}
                </div>
                
                <h3>Ground Stations (${missionData.ground_stations.length})</h3>
                <div style="overflow-y: auto; max-height: 200px;">
                    ${missionData.ground_stations.map(gs => `<p>• ${gs.station_name} (${gs.station_code}) - ${gs.country}</p>`).join('')}
                </div>
                
                <h3>Anomalies (${missionData.anomalies.length})</h3>
                <div style="overflow-y: auto; max-height: 200px;">
                    ${missionData.anomalies.length > 0 ? missionData.anomalies.map(a => `<p>• ${a.anomaly_type} - ${a.severity}</p>`).join('') : '<p>No anomalies</p>'}
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.getElementById('detailsModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
    addModalStyles();
}

// Close mission details modal
function closeMissionDetailsModal(event) {
    if (event && event.target.id !== 'detailsModal') return;
    const modal = document.getElementById('detailsModal');
    if (modal) modal.remove();
}

// Add modal styles
function addModalStyles() {
    if (document.getElementById('modalStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'modalStyles';
    style.textContent = `
        .modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background-color: var(--bg-card);
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: var(--text-primary);
        }
        .close {
            color: var(--text-secondary);
            float: right;
            font-size: 2rem;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover {
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);
}

// Load satellites
async function loadSatellites() {
    try {
        const response = await fetch(`${API_BASE_URL}/satellites`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch satellites');

        const data = await response.json();
        const itemsList = document.querySelector('#satellitesView .items-list');
        
        if (!itemsList) return;

        itemsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(satellite => {
                const card = createSatelliteCard(satellite);
                itemsList.appendChild(card);
            });
        } else {
            itemsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No satellites found</p>';
        }
    } catch (error) {
        console.error('Error loading satellites:', error);
        showToast('Error loading satellites', 'error');
    }
}

// Create satellite card
function createSatelliteCard(satellite) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const statusClass = satellite.status === 'Operational' ? 'active' : 'warning';
    
    card.innerHTML = `
        <span class="badge ${statusClass}">${satellite.status}</span>
        <h3>${satellite.satellite_name}</h3>
        <div class="item-info">
            <p><strong>Type:</strong> ${satellite.satellite_type}</p>
            <p><strong>Status:</strong> ${satellite.status}</p>
            <p><strong>Battery:</strong> ${satellite.current_battery_percentage}%</p>
            <p><strong>Mission:</strong> ${satellite.mission_name || 'N/A'}</p>
        </div>
        <div class="item-footer">
            <span style="font-size: 0.85rem;">Deployed: ${new Date(satellite.launch_date).toLocaleDateString()}</span>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="viewSatelliteDetails(${satellite.satellite_id})">View</button>
                ${currentUser.role === 'admin' ? `
                    <button class="btn btn-small btn-warning" onclick="editSatellite(${satellite.satellite_id})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteSatellite(${satellite.satellite_id})">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// View satellite details
async function viewSatelliteDetails(satelliteId) {
    try {
        const response = await fetch(`${API_BASE_URL}/satellites/${satelliteId}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch satellite details');

        const data = await response.json();
        currentViewData.selectedSatellite = data.data;
        showSatelliteDetailsModal(data.data);
    } catch (error) {
        console.error('Error loading satellite details:', error);
        showToast('Error loading satellite details', 'error');
    }
}

// Show satellite details modal
function showSatelliteDetailsModal(satelliteData) {
    const html = `
        <div id="detailsModal" class="modal" onclick="closeMissionDetailsModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close" onclick="closeMissionDetailsModal()">&times;</span>
                <h2>${satelliteData.satellite.satellite_name}</h2>
                 
                 <h3>Satellite Details</h3>
                <p><strong>Type:</strong> ${satelliteData.satellite.satellite_type}</p>
                <p><strong>Status:</strong> ${satelliteData.satellite.status}</p>
                <p><strong>Battery:</strong> ${satelliteData.satellite.current_battery_percentage}%</p>
                <p><strong>Weight:</strong> ${satelliteData.satellite.weight_kg} kg</p>
                <p><strong>Operational Life:</strong> ${satelliteData.satellite.operational_life_years} years</p>
                
                <h3>Telemetry (${satelliteData.telemetry.length})</h3>
                <div style="overflow-y: auto; max-height: 200px;">
                    ${satelliteData.telemetry.slice(0, 5).map(t => `
                        <p>• Altitude: ${t.altitude} km, Temp: ${t.temperature}°C, Battery: ${t.battery_percentage}%</p>
                    `).join('')}
                </div>
                
                <h3>Anomalies (${satelliteData.anomalies.length})</h3>
                <div style="overflow-y: auto; max-height: 200px;">
                    ${satelliteData.anomalies.length > 0 ? satelliteData.anomalies.map(a => `
                        <p>• ${a.anomaly_type} (${a.severity}) - ${a.is_resolved ? 'Resolved' : 'Unresolved'}</p>
                    `).join('') : '<p>No anomalies</p>'}
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('detailsModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// Load ground stations
async function loadGroundStations() {
    try {
        const response = await fetch(`${API_BASE_URL}/groundstations`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch ground stations');

        const data = await response.json();
        const itemsList = document.querySelector('#groundstationsView .items-list');
        
        if (!itemsList) return;

        itemsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(station => {
                const card = createGroundStationCard(station);
                itemsList.appendChild(card);
            });
        } else {
            itemsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No ground stations found</p>';
        }
    } catch (error) {
        console.error('Error loading ground stations:', error);
        showToast('Error loading ground stations', 'error');
    }
}

// Create ground station card
function createGroundStationCard(station) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const statusClass = station.status === 'Online' || station.status === 'Active' ? 'active' : 'warning';
    
    card.innerHTML = `
        <span class="badge ${statusClass}">${station.status}</span>
        <h3>${station.station_name}</h3>
        <div class="item-info">
            <p><strong>Location:</strong> ${station.country}</p>
            <p><strong>Code:</strong> ${station.station_code}</p>
            <p><strong>Uptime:</strong> ${station.uptime_percentage}%</p>
            <p style="color: var(--accent-cyan);">Connected satellites: ${station.connected_satellites || 0}</p>
        </div>
        <div class="item-footer">
            <span style="font-size: 0.85rem;">Status: ${station.status}</span>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="viewStationDetails(${station.station_id})">Monitor</button>
                ${currentUser.role === 'admin' ? `
                    <button class="btn btn-small btn-warning" onclick="editStation(${station.station_id})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteStation(${station.station_id})">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// View ground station details
async function viewStationDetails(stationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/groundstations/${stationId}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch station details');

        const data = await response.json();
        showStationDetailsModal(data.data);
    } catch (error) {
        console.error('Error loading station details:', error);
        showToast('Error loading station details', 'error');
    }
}

// Show station details modal
function showStationDetailsModal(stationData) {
    const html = `
        <div id="detailsModal" class="modal" onclick="closeMissionDetailsModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close" onclick="closeMissionDetailsModal()">&times;</span>
                <h2>${stationData.station.station_name}</h2>
                 
                 <h3>Ground Station Details</h3>
                <p><strong>Code:</strong> ${stationData.station.station_code}</p>
                <p><strong>Location:</strong> ${stationData.station.country}</p>
                <p><strong>Coordinates:</strong> ${stationData.station.latitude}, ${stationData.station.longitude}</p>
                <p><strong>Antenna Type:</strong> ${stationData.station.antenna_type}</p>
                <p><strong>Status:</strong> ${stationData.station.status}</p>
                <p><strong>Uptime:</strong> ${stationData.station.uptime_percentage}%</p>
                
                <h3>Connected Satellites (${stationData.satellites.length})</h3>
                <div style="overflow-y: auto; max-height: 200px;">
                    ${stationData.satellites.map(s => `<p>• ${s.satellite_name} (${s.satellite_type})</p>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('detailsModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// Load anomalies
async function loadAnomalies() {
    try {
        const response = await fetch(`${API_BASE_URL}/anomalies`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch anomalies');

        const data = await response.json();
        const itemsList = document.querySelector('#anomaliesView .items-list');
        
        if (!itemsList) return;

        itemsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(anomaly => {
                const card = createAnomalyCard(anomaly);
                itemsList.appendChild(card);
            });
        } else {
            itemsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No anomalies found</p>';
        }
    } catch (error) {
        console.error('Error loading anomalies:', error);
        showToast('Error loading anomalies', 'error');
    }
}

// Create anomaly card
function createAnomalyCard(anomaly) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const severityClass = anomaly.severity === 'Critical' ? 'danger' : 
                         anomaly.severity === 'High' ? 'warning' : 'info';
    
    card.innerHTML = `
        <span class="badge ${severityClass}">${anomaly.severity}</span>
        <h3>${anomaly.anomaly_type}</h3>
        <div class="item-info">
            <p><strong>Type:</strong> ${anomaly.anomaly_type}</p>
            <p><strong>Severity:</strong> ${anomaly.severity}</p>
            <p><strong>Detected:</strong> ${new Date(anomaly.detected_at).toLocaleDateString()}</p>
            <p style="color: var(--danger);">${anomaly.description}</p>
        </div>
        <div class="item-footer">
            <span style="font-size: 0.85rem;">ID: ANM-${anomaly.anomaly_id}</span>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="viewAnomalyDetails(${anomaly.anomaly_id})">Investigate</button>
                ${currentUser.role === 'admin' && !anomaly.is_resolved ? `
                    <button class="btn btn-small btn-success" onclick="resolveAnomaly(${anomaly.anomaly_id})">Resolve</button>
                ` : ''}
                ${currentUser.role === 'admin' ? `
                    <button class="btn btn-small btn-danger" onclick="deleteAnomaly(${anomaly.anomaly_id})">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// View anomaly details
async function viewAnomalyDetails(anomalyId) {
    // This could open a modal with more details
    showToast('Anomaly details view - Implementation pending', 'info');
}

// Load crew logs
async function loadCrewLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/crewlogs`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch crew logs');

        const data = await response.json();
        const itemsList = document.querySelector('#crewlogsView .items-list');
        
        if (!itemsList) return;

        itemsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(log => {
                const card = createCrewLogCard(log);
                itemsList.appendChild(card);
            });
        } else {
            itemsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No crew logs found</p>';
        }
    } catch (error) {
        console.error('Error loading crew logs:', error);
        showToast('Error loading crew logs', 'error');
    }
}

// Create crew log card
function createCrewLogCard(log) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
        <h3>Log Entry - ${new Date(log.log_date).toLocaleDateString()}</h3>
        <div class="item-info">
            <p><strong>Date:</strong> ${new Date(log.log_date).toLocaleDateString()} ${log.log_time}</p>
            <p><strong>Crew Member:</strong> ${log.crew_member || 'Unknown'}</p>
            <p><strong>Mission:</strong> ${log.mission_name || 'N/A'}</p>
            <p style="margin-top: 1rem; line-height: 1.8;">${log.log_content}</p>
        </div>
        <div class="item-footer">
            <span style="font-size: 0.85rem;">Entry #${log.log_id}</span>
            ${currentUser.role === 'admin' ? `
                <div class="item-actions">
                    <button class="btn btn-small btn-warning" onclick="editCrewLog(${log.log_id})">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteCrewLog(${log.log_id})">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Load telemetry
async function loadTelemetry() {
    try {
        const response = await fetch(`${API_BASE_URL}/telemetry`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch telemetry data');

        const data = await response.json();
        const itemsList = document.querySelector('#telemetryView .items-list');
        
        if (!itemsList) return;

        itemsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(telemetry => {
                const card = createTelemetryCard(telemetry);
                itemsList.appendChild(card);
            });
        } else {
            itemsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No telemetry data found</p>';
        }
    } catch (error) {
        console.error('Error loading telemetry:', error);
        showToast('Error loading telemetry data', 'error');
    }
}

// Create telemetry card
function createTelemetryCard(telemetry) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
        <h3>${telemetry.satellite_name || 'Unknown'} Telemetry</h3>
        <div class="item-info">
            <p><strong>Altitude:</strong> ${telemetry.altitude} km</p>
            <p><strong>Velocity:</strong> ${telemetry.velocity} m/s</p>
            <p><strong>Temperature:</strong> ${telemetry.temperature}°C</p>
            <p><strong>Power Generation:</strong> ${telemetry.power_generation} W</p>
            <p><strong>Battery:</strong> ${telemetry.battery_percentage}%</p>
            <p><strong>Signal Strength:</strong> ${telemetry.signal_strength} dBm</p>
            <p><strong>Data Rate:</strong> ${telemetry.data_transmission_rate} GB/hour</p>
        </div>
        <div class="item-footer">
            <span style="font-size: 0.85rem;">Last update: ${new Date(telemetry.timestamp).toLocaleString()}</span>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="viewTelemetryDetails(${telemetry.telemetry_id})">Full Report</button>
            </div>
        </div>
    `;
    
    return card;
}

// Delete functions
async function deleteMission(missionId) {
    if (!confirm('Are you sure you want to delete this mission and all related data?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/missions/${missionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to delete mission');

        showToast('Mission deleted successfully', 'success');
        await loadMissions();
    } catch (error) {
        console.error('Error deleting mission:', error);
        showToast('Error deleting mission', 'error');
    }
}

async function deleteSatellite(satelliteId) {
    if (!confirm('Are you sure you want to delete this satellite?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/satellites/${satelliteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to delete satellite');

        showToast('Satellite deleted successfully', 'success');
        await loadSatellites();
    } catch (error) {
        console.error('Error deleting satellite:', error);
        showToast('Error deleting satellite', 'error');
    }
}

async function deleteStation(stationId) {
    if (!confirm('Are you sure you want to delete this ground station?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/groundstations/${stationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to delete ground station');

        showToast('Ground station deleted successfully', 'success');
        await loadGroundStations();
    } catch (error) {
        console.error('Error deleting ground station:', error);
        showToast('Error deleting ground station', 'error');
    }
}

async function deleteAnomaly(anomalyId) {
    if (!confirm('Are you sure you want to delete this anomaly?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/anomalies/${anomalyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to delete anomaly');

        showToast('Anomaly deleted successfully', 'success');
        await loadAnomalies();
    } catch (error) {
        console.error('Error deleting anomaly:', error);
        showToast('Error deleting anomaly', 'error');
    }
}

async function deleteCrewLog(logId) {
    if (!confirm('Are you sure you want to delete this crew log?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/crewlogs/${logId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });

        if (!response.ok) throw new Error('Failed to delete crew log');

        showToast('Crew log deleted successfully', 'success');
        await loadCrewLogs();
    } catch (error) {
        console.error('Error deleting crew log:', error);
        showToast('Error deleting crew log', 'error');
    }
}

// Edit functions (placeholders)
function editMission(missionId) {
    showToast('Edit mission form - Implementation pending', 'info');
}

function editSatellite(satelliteId) {
    showToast('Edit satellite form - Implementation pending', 'info');
}

function editStation(stationId) {
    showToast('Edit ground station form - Implementation pending', 'info');
}

function editCrewLog(logId) {
    showToast('Edit crew log form - Implementation pending', 'info');
}

async function resolveAnomaly(anomalyId) {
    showToast('Resolve anomaly form - Implementation pending', 'info');
}

function viewTelemetryDetails(telemetryId) {
    showToast('Telemetry details - Implementation pending', 'info');
}

// Add mission form
function showAddMissionForm() {
    showToast('Add mission form - Implementation pending', 'info');
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login-new.html';
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
