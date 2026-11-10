// API Helper Functions
const API_BASE = 'http://localhost:5000/api';

function getAuthToken() {
    const user = localStorage.getItem('user');
    if (!user) return null;
    const userData = JSON.parse(user);
    return userData.token;
}

function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ORGANIZATIONS API
async function fetchOrganizations() {
    try {
        const response = await fetch(`${API_BASE}/organizations`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

// MISSIONS API
async function fetchMissions() {
    try {
        const response = await fetch(`${API_BASE}/missions`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching missions:', error);
        showToast('Error loading missions', 'error');
        return [];
    }
}

async function createMission(missionData) {
    try {
        const response = await fetch(`${API_BASE}/missions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(missionData)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to create mission');
        }
        const data = await response.json();
        showToast('Mission created successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error creating mission:', error);
        showToast(`Error: ${error.message}`, 'error');
        throw error;
    }
}

async function updateMission(missionId, missionData) {
    try {
        // Build update payload with only non-empty fields
        const updateData = {};
        
        // Handle standard fields
        const standardFields = ['mission_name', 'mission_type', 'mission_status', 'end_date', 'mission_description', 'budget'];
        standardFields.forEach(field => {
            if (missionData[field] !== undefined && missionData[field] !== '') {
                if (field === 'budget' && missionData[field]) {
                    updateData[field] = parseFloat(missionData[field]);
                } else {
                    updateData[field] = missionData[field];
                }
            }
        });
        
        console.log('Update data being sent:', updateData);
        
        if (Object.keys(updateData).length === 0) {
            showToast('No fields to update', 'warning');
            return;
        }
        
        const response = await fetch(`${API_BASE}/missions/${missionId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        console.log('Update response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || `API error: ${response.status}`);
        }
        
        showToast('Mission updated successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error updating mission:', error);
        showToast(`Error: ${error.message}`, 'error');
        throw error;
    }
}

async function deleteMission(missionId) {
    try {
        const response = await fetch(`${API_BASE}/missions/${missionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        showToast('Mission deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting mission:', error);
        showToast('Error deleting mission', 'error');
        throw error;
    }
}

// SATELLITES API
async function fetchSatellites() {
    try {
        const response = await fetch(`${API_BASE}/satellites`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching satellites:', error);
        showToast('Error loading satellites', 'error');
        return [];
    }
}

// @permission allow create_satellite
async function createSatellite(satelliteData) {
    try {
        // Ensure numeric fields are properly typed
        const cleanData = { ...satelliteData };
        if (cleanData.weight_kg) cleanData.weight_kg = parseFloat(cleanData.weight_kg);
        if (cleanData.current_battery_percentage) cleanData.current_battery_percentage = parseFloat(cleanData.current_battery_percentage);
        if (cleanData.operational_life_years) cleanData.operational_life_years = parseFloat(cleanData.operational_life_years);
        if (cleanData.mission_id) cleanData.mission_id = parseInt(cleanData.mission_id);
        
        console.log('Creating satellite with data:', cleanData);
        
        const response = await fetch(`${API_BASE}/satellites`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(cleanData)
        });
        
        const data = await response.json();
        console.log('Create satellite response:', data);
        
        if (!response.ok) throw new Error(data.message || data.error || `API error: ${response.status}`);
        showToast('Satellite created successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error creating satellite:', error);
        showToast(`Error: ${error.message}`, 'error');
        throw error;
    }
}

// @permission allow update_satellite
async function updateSatellite(satelliteId, satelliteData) {
    try {
        const response = await fetch(`${API_BASE}/satellites/${satelliteId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(satelliteData)
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        showToast('Satellite updated successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error updating satellite:', error);
        showToast('Error updating satellite', 'error');
        throw error;
    }
}

// @permission allow delete_satellite
async function deleteSatellite(satelliteId) {
    try {
        const response = await fetch(`${API_BASE}/satellites/${satelliteId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        showToast('Satellite deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting satellite:', error);
        showToast('Error deleting satellite', 'error');
        throw error;
    }
}

// GROUND STATIONS API
async function fetchGroundStations() {
    try {
        const response = await fetch(`${API_BASE}/groundstations`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching ground stations:', error);
        showToast('Error loading ground stations', 'error');
        return [];
    }
}

// @permission allow create_groundstation
async function createGroundStation(stationData) {
    try {
        const response = await fetch(`${API_BASE}/groundstations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(stationData)
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        showToast('Ground station created successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error creating ground station:', error);
        showToast('Error creating ground station', 'error');
        throw error;
    }
}

// @permission allow update_groundstation
async function updateGroundStation(stationId, stationData) {
    try {
        const response = await fetch(`${API_BASE}/groundstations/${stationId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(stationData)
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        showToast('Ground station updated successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error updating ground station:', error);
        showToast('Error updating ground station', 'error');
        throw error;
    }
}

// @permission allow delete_groundstation
async function deleteGroundStation(stationId) {
    try {
        const response = await fetch(`${API_BASE}/groundstations/${stationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        showToast('Ground station deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting ground station:', error);
        showToast('Error deleting ground station', 'error');
        throw error;
    }
}

// ANOMALIES API
async function fetchAnomalies() {
    try {
        const response = await fetch(`${API_BASE}/anomalies`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching anomalies:', error);
        showToast('Error loading anomalies', 'error');
        return [];
    }
}

async function createAnomaly(anomalyData) {
     try {
         const payload = {
             satellite_id: anomalyData.satellite_id_anom || anomalyData.satellite_id,
             mission_id: anomalyData.mission_id_anom || anomalyData.mission_id,
             anomaly_type: anomalyData.anomaly_type,
             severity: anomalyData.severity,
             description: anomalyData.description
         };

         const response = await fetch(`${API_BASE}/anomalies`, {
             method: 'POST',
             headers: getAuthHeaders(),
             body: JSON.stringify(payload)
         });
         if (!response.ok) throw new Error(`API error: ${response.status}`);
         const data = await response.json();
         showToast('Anomaly created successfully', 'success');
         return data;
     } catch (error) {
         console.error('Error creating anomaly:', error);
         showToast('Error creating anomaly', 'error');
         throw error;
     }
}

async function updateAnomaly(anomalyId, anomalyData) {
     try {
         const payload = {
             anomaly_type: anomalyData.anomaly_type,
             severity: anomalyData.severity,
             description: anomalyData.description,
             is_resolved: anomalyData.is_resolved ? parseInt(anomalyData.is_resolved) : 0
         };

         const response = await fetch(`${API_BASE}/anomalies/${anomalyId}`, {
             method: 'PUT',
             headers: getAuthHeaders(),
             body: JSON.stringify(payload)
         });
         if (!response.ok) throw new Error(`API error: ${response.status}`);
         const data = await response.json();
         showToast('Anomaly updated successfully', 'success');
         return data;
     } catch (error) {
         console.error('Error updating anomaly:', error);
         showToast('Error updating anomaly', 'error');
         throw error;
     }
}

async function deleteAnomaly(anomalyId) {
    try {
        const response = await fetch(`${API_BASE}/anomalies/${anomalyId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        showToast('Anomaly deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting anomaly:', error);
        showToast('Error deleting anomaly', 'error');
        throw error;
    }
}

// CREW LOGS API
async function fetchCrewLogs() {
    try {
        const response = await fetch(`${API_BASE}/crewlogs`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching crew logs:', error);
        showToast('Error loading crew logs', 'error');
        return [];
    }
}

async function createCrewLog(logData) {
    try {
        const payload = {
            mission_id: logData.mission_id,
            satellite_id: logData.satellite_id,
            crew_member_name: logData.crew_member_name,
            crew_member_role: logData.crew_member_role,
            log_date: logData.log_date,
            log_time: logData.log_time,
            log_description: logData.log_description,
            activity_type: logData.activity_type,
            duration_hours: logData.duration_hours
        };
        
        const response = await fetch(`${API_BASE}/crewlogs`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to create crew log');
        }
        const data = await response.json();
        showToast('Crew log created successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error creating crew log:', error);
        showToast(`Error: ${error.message}`, 'error');
        throw error;
    }
}

async function updateCrewLog(logId, logData) {
    try {
        const payload = {
            crew_member_name: logData.crew_member_name,
            crew_member_role: logData.crew_member_role,
            log_description: logData.log_description,
            activity_type: logData.activity_type,
            duration_hours: logData.duration_hours
        };
        
        const response = await fetch(`${API_BASE}/crewlogs/${logId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        showToast('Crew log updated successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error updating crew log:', error);
        showToast('Error updating crew log', 'error');
        throw error;
    }
}

async function deleteCrewLog(logId) {
    try {
        const response = await fetch(`${API_BASE}/crewlogs/${logId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        showToast('Crew log deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting crew log:', error);
        showToast('Error deleting crew log', 'error');
        throw error;
    }
}

// TELEMETRY API
async function fetchTelemetry() {
    try {
        const response = await fetch(`${API_BASE}/telemetry`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching telemetry:', error);
        showToast('Error loading telemetry', 'error');
        return [];
    }
}

async function createTelemetry(telemetryData) {
    try {
        // Map and clean form data to match backend schema
        const payload = {
            satellite_id: parseInt(telemetryData.satellite_id_telem || telemetryData.satellite_id),
            altitude: telemetryData.altitude ? parseFloat(telemetryData.altitude) : null,
            velocity: telemetryData.velocity ? parseFloat(telemetryData.velocity) : null,
            battery_percentage: telemetryData.battery_percentage ? parseFloat(telemetryData.battery_percentage) : null,
            cpu_temperature_celsius: telemetryData.cpu_temperature_celsius ? parseFloat(telemetryData.cpu_temperature_celsius) : null,
            signal_strength_dbm: telemetryData.signal_strength_dbm ? parseFloat(telemetryData.signal_strength_dbm) : null,
            link_quality_percentage: telemetryData.link_quality_percentage ? parseFloat(telemetryData.link_quality_percentage) : null
        };
        
        console.log('Creating telemetry with data:', payload);
        
        const response = await fetch(`${API_BASE}/telemetry`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log('Create telemetry response:', data);
        
        if (!response.ok) throw new Error(data.message || data.error || `API error: ${response.status}`);
        showToast('Telemetry created successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error creating telemetry:', error);
        showToast('Error creating telemetry', 'error');
        throw error;
    }
}

async function updateTelemetry(telemetryId, telemetryData) {
    try {
        // Map and clean form data to match backend schema
        const payload = {};
        
        // Only include fields that have actual values
        const fieldsToUpdate = [
            'altitude', 'velocity', 'battery_percentage', 
            'cpu_temperature_celsius', 'signal_strength_dbm', 'link_quality_percentage'
        ];
        
        for (const field of fieldsToUpdate) {
            const value = telemetryData[field];
            if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    payload[field] = numValue;
                }
            }
        }
        
        // Ensure we have at least one field to update
        if (Object.keys(payload).length === 0) {
            showToast('Please enter at least one value to update', 'warning');
            throw new Error('No fields provided for update');
        }
        
        console.log('Updating telemetry with data:', payload);
        
        const response = await fetch(`${API_BASE}/telemetry/${telemetryId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log('Update telemetry response:', data);
        
        if (!response.ok) throw new Error(data.message || data.error || `API error: ${response.status}`);
        showToast('Telemetry updated successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error updating telemetry:', error);
        showToast('Error updating telemetry', 'error');
        throw error;
    }
}

async function deleteTelemetry(telemetryId) {
    try {
        const response = await fetch(`${API_BASE}/telemetry/${telemetryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        showToast('Telemetry deleted successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error deleting telemetry:', error);
        showToast('Error deleting telemetry', 'error');
        throw error;
    }
}

// USERS API
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        showToast('Error loading users', 'error');
        return [];
    }
}

async function updateUserRole(userId, role) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role })
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        showToast('User role updated successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error updating user role:', error);
        showToast('Error updating user role', 'error');
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        showToast('User deleted successfully', 'success');
        return data;
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user', 'error');
        throw error;
    }
}
