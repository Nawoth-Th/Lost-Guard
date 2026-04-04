# Lost & Found Mobile Application -- Full Overview

## 1. Project Overview

**Tech Stack:**\
React Native (Frontend), Node.js + Express.js (Backend), MongoDB Atlas
(Database)\
Deployment: Render / Railway / AWS\
Authentication: JWT-based authentication

**Project Idea:**\
A mobile application that enables users to report lost and found items,
search and discover matching items, submit ownership claims, communicate
with other users, and track the recovery lifecycle of items.

**Objectives:** - Provide a centralized platform for lost and found
items\
- Enable secure ownership verification\
- Improve recovery success through smart discovery\
- Track item lifecycle from lost to returned\
- Demonstrate full-stack mobile application development

------------------------------------------------------------------------

## 2. Users & Roles

  ------------------------------------------------------------------------
  User Type            Permissions               Description
  -------------------- ------------------------- -------------------------
  User                 Report items, search,     General user
                       claim, communicate, track 
                       recovery                  

  Admin                Full CRUD on items,       System manager
                       approve/reject claims,    
                       monitor system            

  Guest (Optional)     View items only           Not logged-in user
  ------------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Main Features

### User Features

-   Report lost items\
-   Report found items\
-   Browse all items\
-   Search and filter items\
-   View suggested matching items\
-   Submit claim requests\
-   Communicate with other users\
-   Receive notifications\
-   Track item recovery status

### Admin Features

-   Approve or reject claim requests\
-   Manage items\
-   Remove fake posts\
-   Monitor system

### Shared Features

-   JWT authentication\
-   File upload\
-   REST APIs\
-   Error handling\
-   Mobile UI\
-   Hosted backend

------------------------------------------------------------------------

## 4. Entities & CRUD Modules (4 Members)

  ----------------------------------------------------------------------------
  Member       Module          CRUD      File Upload        Description
  ------------ --------------- --------- ------------------ ------------------
  1            Item Management Create,   Item image         Manage items +
               & Discovery     Read,                        search
                               Update,                      
                               Delete                       

  2            Claim &         Create,   Proof image        Ownership claims
               Verification    Read,                        
                               Update,                      
                               Delete                       

  3            Communication & Create,   Optional           Messaging
               Notification    Read,                        
                               Update,                      
                               Delete                       

  4            Tracking &      Create,   No                 Lifecycle
               Recovery        Read,                        
                               Update,                      
                               Delete                       
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

## 5. Member Functions

### Member 1 -- Item Management

-   CRUD items\
-   Upload images\
-   Search/filter\
-   Matching suggestions

### Member 2 -- Claim System

-   Submit claims\
-   Upload proof\
-   Approve/reject\
-   Track status

### Member 3 -- Communication

-   Messaging\
-   Notifications\
-   Edit/delete messages

### Member 4 -- Tracking

-   Update status\
-   Track lifecycle\
-   Maintain history

------------------------------------------------------------------------

## 6. Database Collections

-   users\
-   items\
-   claims\
-   messages\
-   notifications\
-   statusLogs

------------------------------------------------------------------------

## 7. Business Logic

**Item Lifecycle:**\
Lost → Found → Claimed → Returned

**Claim Flow:**\
Pending → Approved / Rejected

------------------------------------------------------------------------

## 8. Mobile App Logic

-   Navigation\
-   API integration\
-   Validation\
-   JWT protection

------------------------------------------------------------------------

## 9. Deployment & Viva

-   Hosted backend\
-   Live demo\
-   Explain modules, APIs, logic

------------------------------------------------------------------------

## Final Note

This system includes full CRUD modules, advanced features, and follows
assignment requirements.
