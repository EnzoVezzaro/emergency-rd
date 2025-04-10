**Prompt: Emergency Response App – Tragedy Info System**

We need to create a **mobile app** and **web dashboard** for a modern emergency alert and hospital coordination system. The goal is to **streamline communication during large-scale tragedies** (e.g., natural disasters, mass accidents, etc.) where victims are taken to hospitals and information is hard to access.

### 🎯 **Core Purpose**
Enable families and citizens to:
- Locate their loved ones during large-scale tragic events.
- Get real-time updates from hospitals.
- Support hospitals with donations (especially blood).

Enable emergency response operators to:
- Upload hospital records (often as paper/image lists).
- Use AI to extract and update name lists from those images.
- Manage hospital data and donation requests.

---

### 📱 Mobile App – For the Public
**Tone:** Simple, modern, calming, easy to navigate – designed for emotional, stressful situations.

**Main Features:**
- 🗺 **Event Map**: View affected hospitals on a map.
- 🏥 **Hospital Directory**:
  - Filter by tragedy/event.
  - See which hospitals are receiving victims.
  - Status indicators (e.g., “receiving patients”, “full”, “needs blood”).
- 📃 **Name Lists**:
  - Per hospital, searchable and constantly updated.
  - See time of last update.
- ❤️ **Donation Requests**:
  - Show blood donation needs or supply needs by hospital.
- 🔎 **Search**:
  - Search for a person by name.
  - View matches with location, hospital, and condition (if available).

---

### 🖥 Web Dashboard – For Emergency Operators
**Main Functions:**
- 🖼 **Image Upload**:
  - Upload hospital patient lists (photos, scanned docs).
  - AI reads image and updates the corresponding hospital patient list in the DB.
- 🏥 **Hospital Management**:
  - Add/Edit hospital locations, capacity, contact info, donation needs.
- 🧑‍🤝‍🧑 **Patient Management**:
  - Review/verify AI-generated lists.
  - Manually edit or add names if needed.
- 🔔 **Event Management**:
  - Create new events.
  - Assign hospitals to specific events.
  - Push updates to public mobile app.

---

### 🗄 Database Notes
- Each hospital should have:
  - Name
  - Geolocation
  - Contact info
  - Donation needs
  - List of victims (per event)
- Each event has:
  - Title
  - Description
  - Date/time
  - Associated hospitals
  - Image uploads
  - Public visibility