# Quick: Add Mission Images in 5 Minutes

## Current Status
- ✅ Satellites: Images working
- ✅ Ground Stations: Images working
- ⏳ **Missions: Need to add 2 things**

---

## THING 1: Add Image Field to Admin Missions Form

**File**: `frontend/admin-missions.html`

**Find**: Look for this around line 500-600 in the modal form
```html
<div class="form-group">
    <label for="budget">Budget</label>
    <input type="number" id="budget" name="budget" ...
</div>
```

**Add AFTER that form group, BEFORE the buttons**:
```html
<div class="image-upload-group">
    <label for="image_url_input">Mission Image URL</label>
    <p style="margin: 10px 0; color: #666; font-size: 14px;">Paste direct image URL</p>
    
    <input type="url" id="image_url_input" name="image_url_input" 
           placeholder="https://example.com/image.jpg"
           onchange="previewMissionImage(event)">
    
    <div id="imagePreview" class="image-preview"></div>
    <input type="hidden" id="image_url" name="image_url">
</div>
```

---

## THING 2: Add JavaScript Functions

**File**: `frontend/admin-missions.html`

**In the `<script>` section** (around line 700+), add these functions:

### 2A. Preview Function
```javascript
function previewMissionImage(event) {
    const url = event.target.value;
    const preview = document.getElementById('imagePreview');
    
    if (url && isValidUrl(url)) {
        preview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 4px; margin-top: 10px;">`;
        document.getElementById('image_url').value = url;
    } else {
        preview.innerHTML = '';
        document.getElementById('image_url').value = '';
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
```

### 2B. Update saveMission() Function

**Find** the `saveMission(event)` function (around line 750-800).

**Replace the payload object** with this (add `image_url` line):
```javascript
async function saveMission(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const imageUrlInput = document.getElementById('image_url_input').value;
    
    const payload = {
        mission_name: document.getElementById('mission_name').value,
        mission_type: document.getElementById('mission_type').value,
        mission_status: document.getElementById('mission_status').value || 'Planning',
        start_date: document.getElementById('start_date').value,
        end_date: document.getElementById('end_date').value,
        mission_description: document.getElementById('mission_description').value,
        budget: document.getElementById('budget').value || null,
        org_id: document.getElementById('org_id').value,
        image_url: imageUrlInput || null  // <-- ADD THIS LINE
    };

    // REST OF FUNCTION STAYS THE SAME
    try {
        const url = editingMissionId ? `/api/missions/${editingMissionId}` : '/api/missions';
        const method = editingMissionId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showAlert(`Mission ${editingMissionId ? 'updated' : 'created'} successfully!`, 'success');
            closeMissionModal();
            await loadMissions();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error saving mission', 'error');
        }
    } catch (error) {
        console.error('Error saving mission:', error);
        showAlert('Error saving mission: ' + error.message, 'error');
    }
}
```

### 2C. Update editMission() Function

**Find** the `editMission(missionId)` function (around line 850-900).

**Add these lines after populating the form fields** (after the `org_id` line):
```javascript
// ADD THESE LINES FOR IMAGE
document.getElementById('image_url_input').value = mission.image_url || '';
document.getElementById('image_url').value = mission.image_url || '';
if (mission.image_url) {
    document.getElementById('imagePreview').innerHTML = `<img src="${mission.image_url}" alt="Mission" style="max-width: 100%; max-height: 300px; border-radius: 4px; margin-top: 10px;">`;
} else {
    document.getElementById('imagePreview').innerHTML = '';
}
```

### 2D. Update openCreateModal() Function

**Find** the `openCreateModal()` function (around line 700-720).

**Add these lines to clear image fields**:
```javascript
function openCreateModal() {
    editingMissionId = null;
    document.getElementById('modalTitle').textContent = 'Create Mission';
    document.getElementById('missionForm').reset();
    document.getElementById('mission_status').value = 'Planning';
    // ADD THESE LINES
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('image_url').value = '';
    document.getElementById('image_url_input').value = '';
    document.getElementById('missionModal').classList.add('active');
}
```

---

## THING 3: Add Image Display to Mission Details Page

**File**: `frontend/mission-details.html`

### 3A. Add HTML for Image Display

**Find**: The closing tag `</div>` of `<div class="details-header">` (around line 314)

**Add AFTER that closing div**:
```html
<!-- Mission Image Display -->
<div id="missionImageContainer" style="margin-bottom: 2rem;">
    <img 
        id="missionImageElement" 
        class="mission-image" 
        alt="Mission Image"
        style="cursor: pointer;"
        onclick="viewImage(this.src, document.getElementById('missionTitle').textContent)"
    >
</div>
```

### 3B. Update displayMissionDetails() Function

**Find** the `displayMissionDetails(data)` function (around line 389).

**Add these lines right after setting the title** (after the `missionTitle` line):
```javascript
// DISPLAY MISSION IMAGE
const imageContainer = document.getElementById('missionImageContainer');
if (mission.image_url) {
    const img = document.getElementById('missionImageElement');
    img.src = mission.image_url;
    img.style.display = 'block';
} else {
    imageContainer.style.display = 'none';
}
```

---

## TEST IT

1. Open **Admin Panel → Missions**
2. Click **+ Create Mission**
3. Fill in the form
4. Paste this image URL: `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800`
5. You should see a preview
6. Click **Save Mission**
7. Click on the mission to view details
8. You should see the image at the top

---

## EXAMPLE URLS (for testing)

```
https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800
https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800
https://picsum.photos/800/600?random=1
https://picsum.photos/800/600?random=2
```

---

## After Implementation

All three will be complete:
- ✅ Satellites: Images working
- ✅ Ground Stations: Images working
- ✅ **Missions: Images working**

Done in 5 minutes!
