// Global state
let currentUser = null;
let isAdmin = false;
let currentEditId = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login-new.html';
        return;
    }

    currentUser = JSON.parse(user);
    isAdmin = currentUser.role === 'admin';

    // Display user info
    document.getElementById('userDisplay').textContent = currentUser.full_name || currentUser.name || 'User';
    document.getElementById('userRole').textContent = isAdmin ? '(Admin)' : '(User)';

    // Show/hide admin controls
    if (isAdmin) {
        document.querySelectorAll('[id^="adminControls"], [id*="Admin"]').forEach(el => {
            el.classList.remove('hidden-admin');
        });
    }

    // Setup navigation
    setupNavigation();

    // Load initial data
    loadDashboardStats();
    setupFormListeners();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            switchView(view, item);
        });
    });
}

function switchView(viewName, clickedItem) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const selectedView = document.getElementById(viewName + 'View');
    if (selectedView) {
        selectedView.classList.add('active');
        // Load data when switching views
        loadViewData(viewName);
    }

    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    if (clickedItem) {
        clickedItem.classList.add('active');
    }
}

async function loadViewData(viewName) {
    switch(viewName) {
        case 'missions':
            await loadMissionsView();
            break;
        case 'satellites':
            await loadSatellitesView();
            break;
        case 'groundstations':
            await loadGroundStationsView();
            break;
        case 'anomalies':
            await loadAnomaliesView();
            break;
        case 'crewlogs':
            await loadCrewLogsView();
            break;
        case 'telemetry':
            await loadTelemetryView();
            break;
        case 'users':
            await loadUsersView();
            break;
    }
}

// Dashboard Stats
async function loadDashboardStats() {
    try {
        const [missions, satellites, anomalies, stations, crewlogs, telemetry] = await Promise.all([
            fetchMissions(),
            fetchSatellites(),
            fetchAnomalies(),
            fetchGroundStations(),
            fetchCrewLogs(),
            fetchTelemetry()
        ]);

        document.getElementById('totalMissions').textContent = missions.length;
        document.getElementById('totalSatellites').textContent = satellites.length;
        document.getElementById('totalAnomalies').textContent = anomalies.length;
        document.getElementById('totalStations').textContent = stations.length;
        document.getElementById('totalCrewLogs').textContent = crewlogs.length;
        document.getElementById('totalTelemetry').textContent = telemetry.length;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// MISSIONS VIEW
async function loadMissionsView() {
    const container = document.getElementById('missionsList');
    container.innerHTML = '<div class="loading">Loading missions...</div>';

    try {
        const missions = await fetchMissions();
        if (missions.length === 0) {
            container.innerHTML = '<p>No missions found</p>';
            return;
        }

        container.innerHTML = missions.map(mission => createMissionCard(mission)).join('');
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading missions</p>';
    }
}

function createMissionCard(mission) {
    const statusClass = mission.mission_status?.toLowerCase() || 'planning';
    const launchDate = mission.start_date ? new Date(mission.start_date).toLocaleDateString() : 'N/A';
    
    let actions = '<button class="btn btn-small btn-secondary" onclick="viewMissionDetails(' + mission.mission_id + ')">View</button>';
    
    if (isAdmin) {
        actions += `
            <button class="btn-edit" onclick="editMission(${mission.mission_id})">Edit</button>
            <button class="btn-delete" onclick="deleteMissionAction(${mission.mission_id})">Delete</button>
            <button class="btn-edit" onclick="openAddImageModal(${mission.mission_id})">Add Image</button>
        `;
    }

    const imageHtml = mission.image_url ? 
        `<img src="${mission.image_url}" alt="${mission.mission_name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">` 
        : '';

    return `
        <div class="item-card">
            <span class="badge ${statusClass}">${mission.mission_status || 'Planning'}</span>
            <h3>${mission.mission_name}</h3>
            ${imageHtml}
            <div class="item-info">
                <p><strong>Type:</strong> ${mission.mission_type}</p>
                <p><strong>Status:</strong> ${mission.mission_status}</p>
            </div>
            <div class="item-footer">
                <span style="font-size: 0.85rem;">Launched: ${launchDate}</span>
                <div class="action-buttons">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function openAddMissionModal() {
    currentEditId = null;
    document.getElementById('missionForm').reset();
    document.getElementById('missionModalTitle').textContent = 'Add Mission';
    document.getElementById('missionSubmitBtn').textContent = 'Create Mission';
    document.getElementById('missionModal').classList.add('active');
}

function closeMissionModal() {
    document.getElementById('missionModal').classList.remove('active');
    currentEditId = null;
}

async function editMission(missionId) {
    // Fetch mission details
    const missions = await fetchMissions();
    const mission = missions.find(m => m.mission_id === missionId);
    if (!mission) return;

    currentEditId = missionId;
    document.getElementById('mission_name').value = mission.mission_name || '';
    document.getElementById('mission_type').value = mission.mission_type || '';
    document.getElementById('mission_status').value = mission.mission_status || 'Planning';
    document.getElementById('start_date').value = mission.start_date?.split('T')[0] || '';
    document.getElementById('end_date').value = mission.end_date?.split('T')[0] || '';
    document.getElementById('mission_description').value = mission.mission_description || '';
    document.getElementById('budget').value = mission.budget || '';
    document.getElementById('org_id').value = mission.org_id || '';

    document.getElementById('missionModalTitle').textContent = 'Edit Mission';
    document.getElementById('missionSubmitBtn').textContent = 'Update Mission';
    document.getElementById('missionModal').classList.add('active');
}

async function deleteMissionAction(missionId) {
    if (!confirm('Are you sure you want to delete this mission?')) return;
    try {
        await deleteMission(missionId);
        await loadMissionsView();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error:', error);
    }
}

function viewMissionDetails(missionId) {
    window.location.href = 'mission-details.html?id=' + missionId;
}

// SATELLITES VIEW
async function loadSatellitesView() {
    const container = document.getElementById('satellitesList');
    container.innerHTML = '<div class="loading">Loading satellites...</div>';

    try {
        const satellites = await fetchSatellites();
        if (satellites.length === 0) {
            container.innerHTML = '<p>No satellites found</p>';
            return;
        }

        container.innerHTML = satellites.map(sat => createSatelliteCard(sat)).join('');
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading satellites</p>';
    }
}

function createSatelliteCard(satellite) {
    const statusClass = satellite.status?.toLowerCase() || 'operational';
    
    let actions = '<button class="btn btn-small btn-secondary" onclick="viewSatelliteDetails(' + satellite.satellite_id + ')">Details</button>';
    
    if (isAdmin) {
        actions += `
            <button class="btn-edit" onclick="editSatellite(${satellite.satellite_id})">Edit</button>
            <button class="btn-delete" onclick="deleteSatelliteAction(${satellite.satellite_id})">Delete</button>
            <button class="btn-edit" onclick="openAddSatelliteImageModal(${satellite.satellite_id})">Add Image</button>
        `;
    }

    const imageHtml = satellite.image_url ? 
        `<img src="${satellite.image_url}" alt="${satellite.satellite_name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">` 
        : '';

    return `
        <div class="item-card">
            <span class="badge ${statusClass}">${satellite.status || 'Operational'}</span>
            <h3>${satellite.satellite_name}</h3>
            ${imageHtml}
            <div class="item-info">
                <p><strong>Type:</strong> ${satellite.satellite_type || 'N/A'}</p>
                <p><strong>Status:</strong> ${satellite.status || 'N/A'}</p>
                <p><strong>Battery:</strong> ${satellite.current_battery_percentage || 0}%</p>
            </div>
            <div class="item-footer">
                <span style="font-size: 0.85rem;">NORAD ID: ${satellite.norad_id || 'N/A'}</span>
                <div class="action-buttons">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function openAddSatelliteModal() {
    currentEditId = null;
    document.getElementById('satelliteForm').reset();
    document.getElementById('satelliteModalTitle').textContent = 'Add Satellite';
    document.getElementById('satelliteSubmitBtn').textContent = 'Create Satellite';
    document.getElementById('satelliteModal').classList.add('active');
}

function closeSatelliteModal() {
    document.getElementById('satelliteModal').classList.remove('active');
    currentEditId = null;
}

async function editSatellite(satelliteId) {
    const satellites = await fetchSatellites();
    const satellite = satellites.find(s => s.satellite_id === satelliteId);
    if (!satellite) return;

    currentEditId = satelliteId;
    document.getElementById('satellite_name').value = satellite.satellite_name || '';
    document.getElementById('satellite_type').value = satellite.satellite_type || '';
    document.getElementById('norad_id').value = satellite.norad_id || '';
    document.getElementById('status').value = satellite.status || 'Operational';
    document.getElementById('launch_date').value = satellite.launch_date?.split('T')[0] || '';
    document.getElementById('weight_kg').value = satellite.weight_kg || '';
    document.getElementById('current_battery_percentage').value = satellite.current_battery_percentage || '';
    document.getElementById('operational_life_years').value = satellite.operational_life_years || '';
    document.getElementById('mission_id').value = satellite.mission_id || '';

    document.getElementById('satelliteModalTitle').textContent = 'Edit Satellite';
    document.getElementById('satelliteSubmitBtn').textContent = 'Update Satellite';
    document.getElementById('satelliteModal').classList.add('active');
}

async function deleteSatelliteAction(satelliteId) {
    if (!confirm('Are you sure you want to delete this satellite?')) return;
    try {
        await deleteSatellite(satelliteId);
        await loadSatellitesView();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error:', error);
    }
}

function viewSatelliteDetails(satelliteId) {
    window.location.href = 'satellite-details.html?id=' + satelliteId;
}

// GROUND STATIONS VIEW
async function loadGroundStationsView() {
    const container = document.getElementById('groundstationsList');
    container.innerHTML = '<div class="loading">Loading ground stations...</div>';

    try {
        const stations = await fetchGroundStations();
        if (stations.length === 0) {
            container.innerHTML = '<p>No ground stations found</p>';
            return;
        }

        container.innerHTML = stations.map(station => createGroundStationCard(station)).join('');
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading ground stations</p>';
    }
}

function createGroundStationCard(station) {
    const stationId = station.station_id || station.ground_station_id;
    let actions = '<button class="btn btn-small btn-secondary" onclick="viewStationDetails(' + stationId + ')">Investigate</button>';
    
    if (isAdmin) {
        actions += `
            <button class="btn-edit" onclick="editGroundStation(${stationId})">Edit</button>
            <button class="btn-delete" onclick="deleteGroundStationAction(${stationId})">Delete</button>
            <button class="btn-edit" onclick="openAddGroundStationImageModal(${stationId})">Add Image</button>
        `;
    }

    const imageHtml = station.image_url ? 
        `<img src="${station.image_url}" alt="${station.station_name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">` 
        : '';

    return `
        <div class="item-card">
            <span class="badge active">Online</span>
            <h3>${station.station_name}</h3>
            ${imageHtml}
            <div class="item-info">
                <p><strong>Location:</strong> ${station.country || 'N/A'}</p>
                <p><strong>Code:</strong> ${station.station_code || 'N/A'}</p>
                <p><strong>Uptime:</strong> ${station.uptime_percentage || 0}%</p>
            </div>
            <div class="item-footer">
                <span style="font-size: 0.85rem;">Status: ${station.status || 'Active'}</span>
                <div class="action-buttons">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function openAddGroundStationModal() {
    currentEditId = null;
    document.getElementById('groundstationForm').reset();
    document.getElementById('groundstationModalTitle').textContent = 'Add Ground Station';
    document.getElementById('groundstationSubmitBtn').textContent = 'Create Ground Station';
    document.getElementById('groundstationModal').classList.add('active');
}

function closeGroundStationModal() {
    document.getElementById('groundstationModal').classList.remove('active');
    currentEditId = null;
}

async function editGroundStation(stationId) {
    const stations = await fetchGroundStations();
    const station = stations.find(s => (s.station_id || s.ground_station_id) === stationId);
    if (!station) return;

    currentEditId = stationId;
    document.getElementById('station_name').value = station.station_name || '';
    document.getElementById('station_code').value = station.station_code || '';
    document.getElementById('latitude').value = station.latitude || '';
    document.getElementById('longitude').value = station.longitude || '';
    document.getElementById('country').value = station.country || '';
    document.getElementById('antenna_type').value = station.antenna_type || '';
    document.getElementById('gs_status').value = station.status || 'Active';
    document.getElementById('uptime_percentage').value = station.uptime_percentage || '';
    document.getElementById('mission_id_gs').value = station.mission_id || '';

    document.getElementById('groundstationModalTitle').textContent = 'Edit Ground Station';
    document.getElementById('groundstationSubmitBtn').textContent = 'Update Ground Station';
    document.getElementById('groundstationModal').classList.add('active');
}

async function deleteGroundStationAction(stationId) {
    if (!confirm('Are you sure you want to delete this ground station?')) return;
    try {
        await deleteGroundStation(stationId);
        await loadGroundStationsView();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error:', error);
    }
}

function viewStationDetails(stationId) {
    window.location.href = 'groundstation-details.html?id=' + stationId;
}

// ANOMALIES VIEW
async function loadAnomaliesView() {
    const container = document.getElementById('anomaliesList');
    container.innerHTML = '<div class="loading">Loading anomalies...</div>';

    try {
        const anomalies = await fetchAnomalies();
        if (anomalies.length === 0) {
            container.innerHTML = '<p>No anomalies found</p>';
            return;
        }

        container.innerHTML = anomalies.map(anom => createAnomalyCard(anom)).join('');
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading anomalies</p>';
    }
}

function createAnomalyCard(anomaly) {
    const severityClass = anomaly.severity?.toLowerCase() || 'low';
    
    let actions = '<button class="btn btn-small btn-secondary" onclick="viewAnomalyDetails(' + anomaly.anomaly_id + ')">Investigate</button>';
    
    if (isAdmin) {
        actions += `
            <button class="btn-edit" onclick="editAnomaly(${anomaly.anomaly_id})">Edit</button>
            <button class="btn-delete" onclick="deleteAnomalyAction(${anomaly.anomaly_id})">Delete</button>
        `;
    }

    return `
        <div class="item-card">
            <span class="badge ${severityClass}">${anomaly.severity || 'Low'}</span>
            <h3>${anomaly.anomaly_type}</h3>
            <div class="item-info">
                <p><strong>Description:</strong> ${anomaly.description || 'N/A'}</p>
                <p><strong>Severity:</strong> ${anomaly.severity || 'N/A'}</p>
            </div>
            <div class="item-footer">
                <span style="font-size: 0.85rem;">ID: ${anomaly.anomaly_id}</span>
                <div class="action-buttons">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function openAddAnomalyModal() {
    currentEditId = null;
    document.getElementById('anomalyForm').reset();
    document.getElementById('anomalyModalTitle').textContent = 'Add Anomaly';
    document.getElementById('anomalySubmitBtn').textContent = 'Create Anomaly';
    document.getElementById('satellite_id_anom').removeAttribute('readonly');
    document.getElementById('anomalyModal').classList.add('active');
}

function closeAnomalyModal() {
    document.getElementById('anomalyModal').classList.remove('active');
    currentEditId = null;
}

async function editAnomaly(anomalyId) {
     const anomalies = await fetchAnomalies();
     const anomaly = anomalies.find(a => a.anomaly_id === anomalyId);
     if (!anomaly) return;

     currentEditId = anomalyId;
     document.getElementById('anomaly_type').value = anomaly.anomaly_type || '';
     document.getElementById('severity').value = anomaly.severity || 'Low';
     document.getElementById('description').value = anomaly.description || '';
    document.getElementById('mission_id_anom').value = anomaly.mission_id || '';
    document.getElementById('satellite_id_anom').value = anomaly.satellite_id || '';
    document.getElementById('satellite_id_anom').setAttribute('readonly', 'readonly');

    document.getElementById('anomalyModalTitle').textContent = 'Edit Anomaly';
    document.getElementById('anomalySubmitBtn').textContent = 'Update Anomaly';
    document.getElementById('anomalyModal').classList.add('active');
}

async function deleteAnomalyAction(anomalyId) {
    if (!confirm('Are you sure you want to delete this anomaly?')) return;
    try {
        await deleteAnomaly(anomalyId);
        await loadAnomaliesView();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error:', error);
    }
}

function viewAnomalyDetails(anomalyId) {
    window.location.href = 'anomaly-details.html?id=' + anomalyId;
}

// CREW LOGS VIEW
async function loadCrewLogsView() {
    const container = document.getElementById('crewlogsList');
    container.innerHTML = '<div class="loading">Loading crew logs...</div>';

    try {
        const logs = await fetchCrewLogs();
        if (logs.length === 0) {
            container.innerHTML = '<p>No crew logs found</p>';
            return;
        }

        container.innerHTML = logs.map(log => createCrewLogCard(log)).join('');
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading crew logs</p>';
    }
}

function createCrewLogCard(log) {
    let actions = `<button class="btn btn-small btn-primary" onclick="viewCrewLogDetails(${log.log_id})">View Details</button>`;
    if (isAdmin) {
        actions += `
            <button class="btn-edit" onclick="editCrewLog(${log.log_id})">Edit</button>
            <button class="btn-delete" onclick="deleteCrewLogAction(${log.log_id})">Delete</button>
        `;
    }

    const logDate = log.log_date ? new Date(log.log_date).toLocaleDateString() : 'N/A';

    return `
        <div class="item-card">
            <h3>Log Entry - ${log.crew_member_name}</h3>
            <div class="item-info">
                <p><strong>Date:</strong> ${logDate}</p>
                <p><strong>Crew Member:</strong> ${log.crew_member_name || 'N/A'}</p>
                <p><strong>Role:</strong> ${log.crew_member_role || 'N/A'}</p>
                <p><strong>Activity:</strong> ${log.activity_type || 'N/A'}</p>
                <p style="margin-top: 1rem; line-height: 1.8;">${log.log_description || 'No description'}</p>
            </div>
            <div class="item-footer">
                <span style="font-size: 0.85rem;">Entry #${log.log_id}</span>
                <div class="action-buttons">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function viewCrewLogDetails(logId) {
    window.location.href = 'crewlog-details.html?id=' + logId;
}

function openAddCrewLogModal() {
    currentEditId = null;
    document.getElementById('crewlogForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('log_date').value = today;
    document.getElementById('crewlogModalTitle').textContent = 'Add Crew Log';
    document.getElementById('crewlogSubmitBtn').textContent = 'Create Crew Log';
    document.getElementById('crewlogModal').classList.add('active');
}

function closeCrewLogModal() {
    document.getElementById('crewlogModal').classList.remove('active');
    currentEditId = null;
}

async function editCrewLog(logId) {
    const logs = await fetchCrewLogs();
    const log = logs.find(l => l.log_id === logId);
    if (!log) return;

    currentEditId = logId;
    document.getElementById('mission_id_crew').value = log.mission_id || '';
    document.getElementById('satellite_id_crew').value = log.satellite_id || '';
    document.getElementById('crew_member_name').value = log.crew_member_name || '';
    document.getElementById('crew_member_role').value = log.crew_member_role || '';
    document.getElementById('log_date').value = log.log_date?.split('T')[0] || '';
    document.getElementById('log_time').value = log.log_time || '';
    document.getElementById('log_description').value = log.log_description || '';
    document.getElementById('activity_type').value = log.activity_type || '';
    document.getElementById('duration_hours').value = log.duration_hours || '';

    document.getElementById('crewlogModalTitle').textContent = 'Edit Crew Log';
    document.getElementById('crewlogSubmitBtn').textContent = 'Update Crew Log';
    document.getElementById('crewlogModal').classList.add('active');
}

async function deleteCrewLogAction(logId) {
    if (!confirm('Are you sure you want to delete this crew log?')) return;
    try {
        await deleteCrewLog(logId);
        await loadCrewLogsView();
    } catch (error) {
        console.error('Error:', error);
    }
}

// TELEMETRY VIEW
async function loadTelemetryView() {
    const container = document.getElementById('telemetryList');
    container.innerHTML = '<div class="loading">Loading telemetry...</div>';

    try {
        const telemetry = await fetchTelemetry();
        if (telemetry.length === 0) {
            container.innerHTML = '<p>No telemetry data found</p>';
            return;
        }

        container.innerHTML = telemetry.map(telem => createTelemetryCard(telem)).join('');
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading telemetry</p>';
    }
}

function createTelemetryCard(telemetry) {
    let actions = '<button class="btn btn-small btn-secondary" onclick="viewTelemetryDetails(' + telemetry.telemetry_id + ')">Full Report</button>';
    
    if (isAdmin) {
        actions += `
            <button class="btn-edit" onclick="editTelemetry(${telemetry.telemetry_id})">Edit</button>
            <button class="btn-delete" onclick="deleteTelemetryAction(${telemetry.telemetry_id})">Delete</button>
        `;
    }

    return `
        <div class="item-card">
            <h3>Telemetry Data - Satellite ${telemetry.satellite_id}</h3>
            <div class="item-info">
                <p><strong>Altitude:</strong> ${telemetry.altitude || 'N/A'} km</p>
                <p><strong>Velocity:</strong> ${telemetry.velocity || 'N/A'} m/s</p>
                <p><strong>Battery:</strong> ${telemetry.battery_percentage || 'N/A'}%</p>
                <p><strong>CPU Temperature:</strong> ${telemetry.cpu_temperature_celsius || 'N/A'}°C</p>
                <p><strong>Signal Strength:</strong> ${telemetry.signal_strength_dbm || 'N/A'} dBm</p>
            </div>
            <div class="item-footer">
                <span style="font-size: 0.85rem;">Last update: Just now</span>
                <div class="action-buttons">
                    ${actions}
                </div>
            </div>
        </div>
    `;
}

function openAddTelemetryModal() {
    currentEditId = null;
    document.getElementById('telemetryForm').reset();
    document.getElementById('telemetryModalTitle').textContent = 'Add Telemetry';
    document.getElementById('telemetrySubmitBtn').textContent = 'Create Telemetry';
    document.getElementById('satellite_id_telem').removeAttribute('readonly');
    document.getElementById('telemetryModal').classList.add('active');
}

function closeTelemetryModal() {
    document.getElementById('telemetryModal').classList.remove('active');
    document.getElementById('telemetryForm').reset();
    document.getElementById('satellite_id_telem').removeAttribute('readonly');
    currentEditId = null;
}

async function editTelemetry(telemetryId) {
    const telemetry_data = await fetchTelemetry();
    const telemetry = telemetry_data.find(t => t.telemetry_id === telemetryId);
    if (!telemetry) return;

    currentEditId = telemetryId;
    document.getElementById('satellite_id_telem').value = telemetry.satellite_id || '';
    document.getElementById('satellite_id_telem').setAttribute('readonly', 'readonly');
    document.getElementById('altitude').value = telemetry.altitude || '';
    document.getElementById('velocity').value = telemetry.velocity || '';
    document.getElementById('battery_percentage').value = telemetry.battery_percentage || '';
    document.getElementById('cpu_temperature_celsius').value = telemetry.cpu_temperature_celsius || '';
    document.getElementById('signal_strength_dbm').value = telemetry.signal_strength_dbm || '';
    document.getElementById('link_quality_percentage').value = telemetry.link_quality_percentage || '';

    document.getElementById('telemetryModalTitle').textContent = 'Edit Telemetry';
    document.getElementById('telemetrySubmitBtn').textContent = 'Update Telemetry';
    document.getElementById('telemetryModal').classList.add('active');
}

async function deleteTelemetryAction(telemetryId) {
    if (!confirm('Are you sure you want to delete this telemetry?')) return;
    try {
        await deleteTelemetry(telemetryId);
        await loadTelemetryView();
    } catch (error) {
        console.error('Error:', error);
    }
}

function viewTelemetryDetails(telemetryId) {
    window.location.href = `telemetry-details.html?id=${telemetryId}`;
}

// Image Upload Handlers
function setupImageUploadHandlers() {
    // Quick image URL preview in image modal
    const quickImageUrlEl = document.getElementById('quickImageUrl');
    if (quickImageUrlEl) {
        quickImageUrlEl.addEventListener('input', (e) => {
            const url = e.target.value;
            const preview = document.getElementById('quickImagePreview');
            if (url) {
                preview.src = url;
                preview.style.display = 'block';
                preview.onerror = () => {
                    preview.style.display = 'none';
                };
            } else {
                preview.style.display = 'none';
            }
        });
    }
}

function openAddImageModal(missionId) {
    currentEditId = missionId;
    document.getElementById('quickImageUrl').value = '';
    document.getElementById('quickImagePreview').style.display = 'none';
    document.getElementById('imageModal').classList.add('active');
}

function closeImageModal() {
    document.getElementById('imageModal').classList.remove('active');
    document.getElementById('quickImageUrl').value = '';
    document.getElementById('quickImagePreview').style.display = 'none';
    currentEditId = null;
}

async function saveQuickImage() {
    if (!currentEditId) return;
    
    const imageUrl = document.getElementById('quickImageUrl').value;
    if (!imageUrl) {
        showToast('Please enter an image URL', 'error');
        return;
    }

    try {
        const imageModal = document.getElementById('imageModal');
        const type = imageModal.dataset.type || 'mission';
        let updateData = {};
        let successMsg = '';
        let reloadFn = null;

        if (type === 'satellite') {
            updateData = { image_url: imageUrl };
            successMsg = 'Satellite image updated successfully';
            reloadFn = loadSatellitesView;
            await updateSatellite(currentEditId, updateData);
        } else if (type === 'groundstation') {
            updateData = { image_url: imageUrl };
            successMsg = 'Ground station image updated successfully';
            reloadFn = loadGroundStationsView;
            await updateGroundStation(currentEditId, updateData);
        } else {
            // Default to mission
            updateData = { mission_image_url: imageUrl };
            successMsg = 'Mission image updated successfully';
            reloadFn = loadMissionsView;
            await updateMission(currentEditId, updateData);
        }

        closeImageModal();
        if (reloadFn) {
            await reloadFn();
        }
        showToast(successMsg, 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error updating image', 'error');
    }
}

function openAddSatelliteImageModal(satelliteId) {
    currentEditId = satelliteId;
    document.getElementById('quickImageUrl').value = '';
    document.getElementById('quickImagePreview').style.display = 'none';
    document.getElementById('imageModal').classList.add('active');
    document.getElementById('imageModal').dataset.type = 'satellite';
}

function openAddGroundStationImageModal(stationId) {
    currentEditId = stationId;
    document.getElementById('quickImageUrl').value = '';
    document.getElementById('quickImagePreview').style.display = 'none';
    document.getElementById('imageModal').classList.add('active');
    document.getElementById('imageModal').dataset.type = 'groundstation';
}

// Form Listeners
function setupFormListeners() {
     // Setup image uploads
     setupImageUploadHandlers();
     
     // Mission Form
    document.getElementById('missionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            showToast('Only admins can create missions', 'error');
            return;
        }

        const formData = new FormData(document.getElementById('missionForm'));
        const data = Object.fromEntries(formData);
        
        try {
            if (currentEditId) {
                await updateMission(currentEditId, data);
            } else {
                await createMission(data);
            }
            closeMissionModal();
            await loadMissionsView();
            await loadDashboardStats();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Satellite Form
    document.getElementById('satelliteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const formData = new FormData(document.getElementById('satelliteForm'));
        const data = Object.fromEntries(formData);
        
        try {
            if (currentEditId) {
                await updateSatellite(currentEditId, data);
            } else {
                await createSatellite(data);
            }
            closeSatelliteModal();
            await loadSatellitesView();
            await loadDashboardStats();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Ground Station Form
    document.getElementById('groundstationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const formData = new FormData(document.getElementById('groundstationForm'));
        const data = Object.fromEntries(formData);
        
        try {
            if (currentEditId) {
                await updateGroundStation(currentEditId, data);
            } else {
                await createGroundStation(data);
            }
            closeGroundStationModal();
            await loadGroundStationsView();
            await loadDashboardStats();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Anomaly Form
    document.getElementById('anomalyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const formData = new FormData(document.getElementById('anomalyForm'));
        const data = Object.fromEntries(formData);
        
        try {
            if (currentEditId) {
                await updateAnomaly(currentEditId, data);
            } else {
                await createAnomaly(data);
            }
            closeAnomalyModal();
            await loadAnomaliesView();
            await loadDashboardStats();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Crew Log Form
    document.getElementById('crewlogForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const formData = new FormData(document.getElementById('crewlogForm'));
        const data = Object.fromEntries(formData);
        
        try {
            if (currentEditId) {
                await updateCrewLog(currentEditId, data);
            } else {
                await createCrewLog(data);
            }
            closeCrewLogModal();
            await loadCrewLogsView();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Telemetry Form
    document.getElementById('telemetryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const formData = new FormData(document.getElementById('telemetryForm'));
        const data = Object.fromEntries(formData);
        
        try {
            if (currentEditId) {
                // Remove satellite_id from update payload (shouldn't update this field)
                delete data.satellite_id;
                await updateTelemetry(currentEditId, data);
            } else {
                await createTelemetry(data);
            }
            closeTelemetryModal();
            await loadTelemetryView();
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

// USERS VIEW
async function loadUsersView() {
    if (!isAdmin) {
        document.getElementById('usersList').innerHTML = '<p>Access denied. Admin only.</p>';
        return;
    }

    const container = document.getElementById('usersList');
    container.innerHTML = '<div class="loading">Loading users...</div>';

    try {
        const users = await fetchUsers();
        if (users.length === 0) {
            container.innerHTML = '<p>No users found</p>';
            return;
        }

        // Create table HTML
         let html = `
             <table style="width: 100%; border-collapse: collapse; background: white;">
                 <thead>
                     <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                         <th style="padding: 12px; text-align: left; font-weight: 600;">User ID</th>
                         <th style="padding: 12px; text-align: left; font-weight: 600;">Full Name</th>
                         <th style="padding: 12px; text-align: left; font-weight: 600;">Email</th>
                         <th style="padding: 12px; text-align: left; font-weight: 600;">Role</th>
                         <th style="padding: 12px; text-align: left; font-weight: 600;">Status</th>
                     </tr>
                 </thead>
                 <tbody>
         `;

         users.forEach(user => {
             html += `
                 <tr style="border-bottom: 1px solid #eee;">
                     <td style="padding: 12px;">${user.user_id || 'N/A'}</td>
                     <td style="padding: 12px;">${user.full_name || 'N/A'}</td>
                     <td style="padding: 12px;">${user.email || 'N/A'}</td>
                     <td style="padding: 12px;"><span style="padding: 4px 8px; border-radius: 4px; background-color: ${user.role === 'admin' ? '#ff6b6b' : '#4CAF50'}; color: white; font-size: 0.85rem;">${user.role || 'N/A'}</span></td>
                     <td style="padding: 12px;">
                         <button class="btn-edit" onclick="openUpdateRoleModal(${user.user_id}, '${user.role}', '${user.full_name}')">Edit Role</button>
                         <button class="btn-delete" onclick="deleteUserAction(${user.user_id}, '${user.full_name}')">Delete</button>
                     </td>
                 </tr>
             `;
         });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Error loading users</p>';
    }
}

// USER MANAGEMENT FUNCTIONS
function openUpdateRoleModal(userId, currentRole, fullName) {
    document.getElementById('updateRoleUserId').value = userId;
    document.getElementById('updateRoleUserName').textContent = fullName;
    document.getElementById('updateRoleSelect').value = currentRole;
    document.getElementById('updateRoleModal').classList.add('active');
}

function closeUpdateRoleModal() {
    document.getElementById('updateRoleModal').classList.remove('active');
}

async function updateUserRoleAction() {
    const userId = document.getElementById('updateRoleUserId').value;
    const newRole = document.getElementById('updateRoleSelect').value;
    
    try {
        await updateUserRole(userId, newRole);
        closeUpdateRoleModal();
        await loadUsersView();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteUserAction(userId, fullName) {
    if (!confirm(`Are you sure you want to delete user "${fullName}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await deleteUser(userId);
        await loadUsersView();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login-new.html';
}
