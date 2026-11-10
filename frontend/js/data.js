// Data Management System
const DataManager = {
    // Initialize default data
    init() {
        if (!localStorage.getItem('missions')) {
            localStorage.setItem('missions', JSON.stringify([
                {
                    id: 1,
                    name: 'Operation Skynet',
                    type: 'Earth Orbit Deployment',
                    status: 'Active',
                    progress: 67,
                    launched: 'Jan 15, 2024',
                    nextCheckpoint: '2 days',
                    description: 'Advanced Earth observation and communication system deployment',
                    image: null
                },
                {
                    id: 2,
                    name: 'Luna Station',
                    type: 'Lunar Surface Mission',
                    status: 'Active',
                    progress: 43,
                    launched: 'Dec 20, 2023',
                    nextCheckpoint: '5 days',
                    description: 'Lunar surface exploration and research facility',
                    image: null
                },
                {
                    id: 3,
                    name: 'Mars Rover Alpha',
                    type: 'Planetary Exploration',
                    status: 'Planning',
                    progress: 0,
                    launched: 'July 2024',
                    nextCheckpoint: '6 months',
                    description: 'Mars surface exploration rover',
                    image: null
                }
            ]));
        }

        if (!localStorage.getItem('satellites')) {
            localStorage.setItem('satellites', JSON.stringify([
                {
                    id: 1,
                    name: 'SatLink-01',
                    orbit: 'LEO (500 km altitude)',
                    type: 'Communications',
                    status: 'Operational',
                    signal: 'Strong',
                    battery: 92,
                    deployed: '2 years ago',
                    description: 'Advanced communication satellite',
                    image: null
                },
                {
                    id: 2,
                    name: 'WeatherEye-02',
                    orbit: 'MEO (2000 km altitude)',
                    type: 'Weather Monitoring',
                    status: 'Operational',
                    signal: 'Strong',
                    battery: 78,
                    deployed: '1 year ago',
                    description: 'Weather monitoring satellite',
                    image: null
                },
                {
                    id: 3,
                    name: 'NavStar-03',
                    orbit: 'GEO (36,000 km altitude)',
                    type: 'Navigation System',
                    status: 'Maintenance',
                    signal: 'Weak',
                    battery: 45,
                    deployed: '3 years ago',
                    description: 'Navigation system satellite',
                    image: null
                }
            ]));
        }

        if (!localStorage.getItem('groundstations')) {
            localStorage.setItem('groundstations', JSON.stringify([
                {
                    id: 1,
                    name: 'Cape Canaveral Station',
                    location: 'Florida, USA',
                    code: 'CC-001',
                    uptime: '99.8%',
                    connectedSatellites: 7,
                    description: 'Primary launch and control facility',
                    image: null
                },
                {
                    id: 2,
                    name: 'Houston Control Center',
                    location: 'Texas, USA',
                    code: 'HC-002',
                    uptime: '99.9%',
                    connectedSatellites: 12,
                    description: 'Mission control center',
                    image: null
                },
                {
                    id: 3,
                    name: 'Baikonur Relay Station',
                    location: 'Kazakhstan',
                    code: 'BR-003',
                    uptime: '98.5%',
                    connectedSatellites: 5,
                    description: 'Eastern hemisphere relay station',
                    image: null
                }
            ]));
        }
    },

    // MISSIONS
    getMissions() {
        return JSON.parse(localStorage.getItem('missions') || '[]');
    },

    addMission(mission) {
        const missions = this.getMissions();
        mission.id = Date.now();
        missions.push(mission);
        localStorage.setItem('missions', JSON.stringify(missions));
        return mission;
    },

    updateMission(id, updatedData) {
        const missions = this.getMissions();
        const index = missions.findIndex(m => m.id == id);
        if (index !== -1) {
            missions[index] = { ...missions[index], ...updatedData };
            localStorage.setItem('missions', JSON.stringify(missions));
            return missions[index];
        }
    },

    deleteMission(id) {
        const missions = this.getMissions().filter(m => m.id != id);
        localStorage.setItem('missions', JSON.stringify(missions));
    },

    // SATELLITES
    getSatellites() {
        return JSON.parse(localStorage.getItem('satellites') || '[]');
    },

    addSatellite(satellite) {
        const satellites = this.getSatellites();
        satellite.id = Date.now();
        satellites.push(satellite);
        localStorage.setItem('satellites', JSON.stringify(satellites));
        return satellite;
    },

    updateSatellite(id, updatedData) {
        const satellites = this.getSatellites();
        const index = satellites.findIndex(s => s.id == id);
        if (index !== -1) {
            satellites[index] = { ...satellites[index], ...updatedData };
            localStorage.setItem('satellites', JSON.stringify(satellites));
            return satellites[index];
        }
    },

    deleteSatellite(id) {
        const satellites = this.getSatellites().filter(s => s.id != id);
        localStorage.setItem('satellites', JSON.stringify(satellites));
    },

    // GROUND STATIONS
    getGroundStations() {
        return JSON.parse(localStorage.getItem('groundstations') || '[]');
    },

    addGroundStation(station) {
        const stations = this.getGroundStations();
        station.id = Date.now();
        stations.push(station);
        localStorage.setItem('groundstations', JSON.stringify(stations));
        return station;
    },

    updateGroundStation(id, updatedData) {
        const stations = this.getGroundStations();
        const index = stations.findIndex(s => s.id == id);
        if (index !== -1) {
            stations[index] = { ...stations[index], ...updatedData };
            localStorage.setItem('groundstations', JSON.stringify(stations));
            return stations[index];
        }
    },

    deleteGroundStation(id) {
        const stations = this.getGroundStations().filter(s => s.id != id);
        localStorage.setItem('groundstations', JSON.stringify(stations));
    }
};

// Initialize on load
DataManager.init();
