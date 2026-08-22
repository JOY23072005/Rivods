````markdown
# RIVODS Backend

Backend API for **RIVODS**, an organization-based step tracking and reward management platform.

The backend handles:

- Authentication and authorization
- Organization management
- User management
- Step synchronization
- Reward coins
- Reward catalog
- Reward image uploads
- Reward CSV imports
- Reward redemption and claiming
- Challenges
- Challenge participation and progress
- Challenge reward claiming
- Fraud detection for suspicious step syncing
- Role-based access control
- Organization-level data isolation

---

# 1. Project Overview

RIVODS is built around an organization-based reward system.

Users earn reward coins based on their daily steps.

```text
Steps
  ↓
Daily Step Log
  ↓
Reward Coins
  ↓
Reward Catalog
  ↓
Redemption Request
  ↓
Shopkeeper / Staff
  ↓
Reward Claimed
````

The system also supports challenges where users can join a challenge and earn additional reward coins by completing step-based goals.

---

# 2. Core Architecture

```text
Client / Frontend
       │
       ▼
   Express API
       │
       ├── Authentication Middleware
       │
       ├── Authorization Middleware
       │
       ├── Controllers
       │
       ├── Helpers / Services
       │
       ▼
    MongoDB
       │
       ├── Users
       ├── Organizations
       ├── Rewards
       ├── Daily Step Logs
       ├── Redemptions
       ├── Challenges
       ├── Challenge Progress
       ├── Fraud Events
       └── Refresh Tokens
```

---

# 3. Technology Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Cloudinary
* CSV parser
* Streamifier
* dotenv

Frontend is a separate React/Vite application.

---

# 4. Authentication

Authentication uses:

* Access JWT
* Refresh Token
* Password hashing with bcrypt

Login supports:

* Email
* Phone
* Organization ID / organization identifier

The login query validates both the user identity and organization.

Conceptually:

```text
email OR phone
        +
organizationId
        +
password
```

A user cannot authenticate simply by providing valid credentials from another organization.

---

# 5. Login Flow

```text
POST /auth/login
       │
       ▼
Validate email/phone/password/orgid
       │
       ▼
Find user
       │
       ▼
Check isActive
       │
       ▼
Compare bcrypt password
       │
       ▼
Generate access token
       │
       ▼
Generate refresh token
       │
       ▼
Delete old refresh tokens
       │
       ▼
Store hashed refresh token
       │
       ▼
Return:
    token
    refreshToken
    user
```

Returned user information includes:

```text
id
organizationId
name
email
phone
role
roll
employeeId
profileImage
```

---

# 6. Roles

The system currently uses the following roles:

```text
admin
sub-admin
staff
user
```

General responsibilities:

## Platform Admin

Can manage organizations and platform-wide data.

Platform admin can work across organizations where explicitly supported by the controller.

## Organization Admin

Manages users/rewards/challenges belonging to their organization.

## Sub-admin

Has organization-level administrative capabilities according to authorization rules.

## Staff

Primarily involved in reward claiming/redemption workflows.

## User

Can:

* Sync steps
* View active challenges
* Join challenges
* Claim eligible challenge rewards
* Request rewards

---

# 7. Middleware

## protectRoute

Authenticates the request.

It determines the authenticated user and exposes information such as:

```js
req.userId
```

and the authenticated user's organization information.

Protected endpoints use:

```js
protectRoute
```

---

## authorize

Role-based authorization middleware.

Example:

```js
authorize("admin", "sub-admin")
```

Only users having one of the specified roles can access the endpoint.

---

# 8. Organization Management

Organizations contain information such as:

```text
name
code
category
image
```

Organization code:

```js
code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
}
```

Organization codes are intended to be human-readable identifiers.

Organization MongoDB `_id` values should generally not be exposed to users for manual input where an organization code can be used instead.

---

# 9. Organization Isolation

Organization-level resources are normally scoped using:

```js
organizationId
```

For example, normal organization user queries use:

```js
{
    organizationId: req.user.organizationId
}
```

Platform-level admin endpoints can intentionally operate across organizations.

This distinction is important:

```text
Platform Admin
    ↓
All organizations

Organization Admin / Sub-admin
    ↓
Own organization
```

---

# 10. User Management

Users belong to an organization.

Important user fields include:

```text
organizationId
name
email
phone
password
gender
dob
employeeId
roll
role
profileImage
isActive

totalSteps
rewardCoinsBalance
totalRewardCoinsEarned
totalRewardCoinsRedeemed

lastSyncedAt

stepSyncBlocked
```

---

# 11. Creating Users

User creation supports organization selection.

The organization is determined according to the creator's role.

Conceptually:

```js
const organizationId =
    req.user.role === "admin"
        ? orgId
        : req.user.organizationId;
```

Therefore:

```text
Platform Admin
    → can specify organization

Organization Admin / Sub-admin
    → user belongs to their organization
```

The frontend should preferably send an organization code rather than exposing raw MongoDB organization IDs.

The backend can resolve:

```text
organization code
        ↓
Organization document
        ↓
organization._id
        ↓
User.organizationId
```

---

# 12. User Search / Pagination

User listing supports:

```text
page
limit
search
role
isActive
```

Search currently supports:

```text
name
email
employeeId
```

Pagination returns:

```json
{
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
}
```

---

# 13. Organization Population

Instead of exposing only:

```text
organizationId
```

administrative user responses can populate the referenced Organization document.

The desired representation is:

```text
organization
    ↓
Organization document
    ↓
organization name / code
```

This allows the frontend admin panel to display the organization directly.

---

# 14. User Deletion Rules

User deletion follows role and ownership rules.

General intended behavior:

```text
user
    → can delete only himself

organization admin
    → can delete users belonging to his organization

platform admin
    → can delete users across organizations
```

Authorization must always be enforced server-side.

The frontend must not be trusted for these restrictions.

---

# 15. User Profile Image

User profile images are handled separately from normal user creation/update data.

The frontend can upload an image and call the profile-image endpoint.

The user model stores image information in a structure similar to:

```js
profileImage: {
    url: null,
    publicId: null
}
```

Cloudinary can be used for persistent image storage.

---

# 16. Reward System

The reward system uses a reward catalog.

Each reward belongs to an organization.

Typical reward fields:

```text
organizationId
title
coinCost
image
isActive
createdAt
updatedAt
```

Image:

```js
image: {
    url,
    publicId
}
```

---

# 17. Reward Images

Reward images can be uploaded from the frontend.

Frontend behavior:

```text
Upload Image
    ↓
File input
    ↓
Preview using URL.createObjectURL()
    ↓
Submit form
    ↓
Backend
    ↓
Cloudinary
    ↓
Store image URL/public ID
```

When editing a reward:

* Existing image is displayed
* New image can replace it
* Image can be removed

---

# 18. Reward API

Frontend reward API module is:

```text
api/rewards.js
```

It contains API functions for operations such as:

```text
getRewards
createReward
updateReward
deleteReward
toggleRewardStatus
uploadRewardsCSV
```

CSV upload uses:

```js
const formData = new FormData();

formData.append("file", file);
```

and sends:

```text
POST /reward/upload-csv
```

---

# 19. Reward CSV Upload

Rewards can be bulk-created using CSV.

CSV processing uses:

* Multer
* Streamifier
* CSV parser

The backend reads each row and creates reward documents.

Expected CSV concept:

```csv
organizationCode,title,coinCost,imageUrl
ORG001,Amazon Gift Card,500,https://...
ORG001,Movie Voucher,800,https://...
```

For platform admin uploads, the organization can be determined from the organization code.

For organization-level administrators, rewards should remain scoped to their organization.

---

# 20. Organization Code vs Organization ID

Organization MongoDB IDs should not be required in CSV files.

Instead:

```text
organizationCode
```

should be supplied.

Example:

```csv
organizationCode,title,coinCost,imageUrl
RIVODS,Amazon Gift Card,500,https://...
```

Backend flow:

```text
CSV organizationCode
        ↓
Organization.findOne({ code })
        ↓
organization._id
        ↓
RewardCatalog.organizationId
```

The organization code is uppercase and unique.

---

# 21. Reward Status

Rewards have:

```js
isActive
```

Active rewards can be redeemed.

Inactive rewards cannot be redeemed.

The admin panel supports toggling reward status.

---

# 22. Reward Deletion

A reward delete endpoint exists.

Frontend action:

```text
Actions Menu
    ↓
Delete
    ↓
deleteReward(rewardId)
```

After deletion the rewards list is refreshed.

---

# 23. Reward Frontend

The Rewards page uses reusable components:

```text
DataTable
ActionsMenu
RewardModal
RewardViewer
ToggleSwitch
```

Reward table displays:

```text
Image
Title
Coin Cost
Organization
Status
Created At
Actions
```

Actions:

```text
View
Edit
Delete
```

---

# 24. Reward Redemption

The redemption process is intentionally split into two operations.

```text
User
  │
  │ Request reward
  ▼
Create Redemption
  │
  │ coins deducted immediately
  ▼
PENDING
  │
  │ Staff/shopkeeper verifies
  ▼
CLAIMED
```

This prevents a user from creating unlimited pending redemptions while keeping their coins available.

---

# 25. Important Redemption Rule

Reward coins must be deducted when the redemption request is created.

They must NOT remain available until the reward is physically claimed.

Otherwise:

```text
User has 5000 coins

Request reward #1 → 1000
Request reward #2 → 1000
Request reward #3 → 1000
Request reward #4 → 1000
Request reward #5 → 1000

Without immediate deduction:
User could potentially reserve more rewards than their wallet allows.
```

Therefore:

```text
Create Redemption
    ↓
Validate balance
    ↓
Deduct coins
    ↓
Create PENDING redemption
```

Claiming should not deduct the coins again.

---

# 26. Redemption State

Current important state:

```text
PENDING
CLAIMED
```

A pending redemption means:

```text
Coins already reserved/deducted
Reward has not yet been claimed
```

A claimed redemption means:

```text
Staff/shopkeeper has completed the redemption
```

---

# 27. Challenge System

Challenges are organization-specific.

Challenge schema:

```js
{
    organizationId,
    title,
    description,
    challengeType,
    goalType,
    goalValue,
    rewardCoins,
    startDate,
    endDate,
    isActive,
    createdBy
}
```

---

# 28. Challenge Types

Supported challenge types:

```text
daily
weekly
monthly
custom
```

Currently:

```text
goalType = steps
```

There is intentionally no separate "easy / medium / hard" concept.

Difficulty is determined naturally through:

```text
goalValue
rewardCoins
duration
```

---

# 29. Challenge Example

Example:

```text
Title:
10K Step Challenge

Type:
daily

Goal:
10,000 steps

Reward:
100 coins
```

Another challenge can simply have a different goal:

```text
Title:
50K Weekly Challenge

Type:
weekly

Goal:
50,000 steps

Reward:
500 coins
```

No artificial difficulty classification is required.

---

# 30. Challenge Ownership

Every challenge belongs to an organization:

```js
organizationId
```

Every challenge also records its creator:

```js
createdBy
```

Both are MongoDB references.

---

# 31. Challenge References

Challenge references:

```js
organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
}
```

and:

```js
createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}
```

Administrative responses should populate these references so the frontend can display:

```text
Organization Name
Created By User Name
```

instead of only raw MongoDB IDs.

---

# 32. Challenge Indexes

Current indexes include:

```js
challengeSchema.index({
    organizationId: 1,
    isActive: 1,
});
```

and:

```js
challengeSchema.index({
    organizationId: 1,
    startDate: 1,
    endDate: 1,
});
```

These support organization-level challenge filtering and date-based queries.

---

# 33. Challenge Progress

Challenge participation is tracked separately from the challenge itself.

The ChallengeProgress model contains concepts such as:

```text
challengeId
userId
organizationId
currentValue
isCompleted
completedAt
rewardGranted
startingSteps
```

There is a unique compound index for:

```text
challengeId + userId
```

This prevents the same user from having multiple progress records for the same challenge.

---

# 34. Joining Challenges

Users must join a challenge before their steps count toward that challenge.

Flow:

```text
User views challenge
       ↓
Join Challenge
       ↓
ChallengeProgress created
       ↓
User syncs steps
       ↓
Challenge progress calculated
```

---

# 35. Starting Steps

A `startingSteps` value is stored when joining a challenge.

This is necessary when a user joins a challenge after already walking some steps that day.

Example:

```text
Current daily steps = 4,000

User joins challenge

startingSteps = 4,000

Later:
daily steps = 7,000

Challenge progress =
7,000 - 4,000
= 3,000
```

This prevents pre-challenge steps from being incorrectly counted.

---

# 36. Challenge Progress Calculation

A helper exists to calculate challenge progress.

Conceptually:

```text
Current Daily / Challenge Steps
        -
Starting Steps
        =
Challenge Current Value
```

Progress is then compared with:

```text
goalValue
```

Example:

```text
goalValue = 10,000
currentValue = 5,000

progressPercentage = 50%
```

---

# 37. Step Synchronization

The main step synchronization endpoint is responsible for:

* Validating steps
* Updating daily step logs
* Calculating reward coins
* Updating user totals
* Updating challenge progress
* Updating fraud detection information
* Updating last sync time

---

# 38. Step Reward Formula

The reward formula is:

```text
500 steps = 1 reward coin
```

The actual divisor is configured through:

```text
REWARD_STEPS
```

Environment variable.

Coins are calculated using:

```js
Math.floor(steps / REWARD_STEPS)
```

---

# 39. Daily Step Log

Each user has a daily step log.

Important fields include:

```text
userId
organizationId
date
steps
coinsEarned
deviceId
```

The daily log prevents duplicate counting when the frontend repeatedly syncs the same day's total.

---

# 40. Step Sync Logic

If there is no daily log:

```text
Create daily log
Add all steps to user
Calculate earned coins
```

If a daily log already exists:

```text
new steps < previous steps
    → reject

new steps == previous steps
    → no additional steps

new steps > previous steps
    → calculate difference

extraSteps =
newSteps - oldSteps
```

Only the additional steps are added to the user's lifetime totals.

---

# 41. Coin Calculation During Sync

Daily coins are recalculated based on the total steps for the day.

Example:

```text
REWARD_STEPS = 500

Day starts:
500 steps
→ 1 coin

Later:
1000 steps
→ 2 coins

Extra coins:
2 - 1
= 1 additional coin
```

This prevents duplicate coin generation on repeated sync calls.

---

# 42. Step Sync Response

The endpoint returns information such as:

```json
{
    "success": true,
    "message": "Steps synced successfully",
    "totalSteps": 10000,
    "rewardCoinsBalance": 50,
    "totalRewardCoinsEarned": 50
}
```

---

# 43. Device-Based Fraud Detection

A major issue was identified with health-step integrations.

Frontend obtains steps from services such as:

```text
Google Fit
Apple Health
```

Potential abuse:

```text
Account A
    ↓
Device X
    ↓
Sync 10,000 steps

Logout

Account B
    ↓
Same Device X
    ↓
Sync same 10,000 steps

Account C
    ↓
Same Device X
    ↓
Sync same steps
```

The same physical activity could therefore generate rewards for multiple accounts.

---

# 44. Fraud Detection Strategy

A full permanent device-binding system was intentionally avoided because it introduces problems for legitimate device changes.

Instead, the current strategy is:

```text
Detect suspicious device sharing
        ↓
Increase fraud score
        ↓
Create FraudEvent
        ↓
Apply threshold
        ↓
Temporarily block step syncing
```

This is preferable to permanently binding an account to one device.

---

# 45. Device ID

The frontend sends:

```text
deviceId
```

with step synchronization.

The daily step log stores the device ID.

Example:

```js
{
    userId,
    organizationId,
    date,
    steps,
    coinsEarned,
    deviceId
}
```

---

# 46. Device Sharing Detection

The system checks whether the same device ID is being associated with multiple accounts.

Conceptually:

```text
Device X
    │
    ├── Account A
    ├── Account B
    └── Account C
```

This is suspicious because one physical device is being used to submit steps for multiple accounts.

---

# 47. Fraud Events

Fraud events are stored separately.

A fraud event contains information related to suspicious activity and a fraud score.

The fraud system uses a threshold rather than immediately banning users after one suspicious occurrence.

This was intentionally chosen to avoid false positives.

---

# 48. Fraud Score

A user's suspicious activity increases their fraud score when suspicious device-sharing behavior is detected.

The system can therefore distinguish:

```text
One suspicious occurrence
        ↓
Low score

Repeated suspicious activity
        ↓
Higher score

Score reaches threshold
        ↓
Step syncing blocked
```

---

# 49. Step Sync Blocking

Users have a field:

```text
stepSyncBlocked
```

Before syncing steps:

```js
if (user.stepSyncBlocked || !user.isActive) {
    return 403;
}
```

Response:

```text
Step syncing has been temporarily disabled due to suspicious activity.
```

This does not necessarily require disabling the entire account.

The objective is specifically to stop fraudulent step/reward generation.

---

# 50. Fraud Detection Philosophy

The current fraud system is intentionally lightweight.

It does NOT attempt to create:

* Complex device fingerprint databases
* Permanent device ownership
* Large fraud-management infrastructure
* Aggressive one-event bans

Instead:

```text
Suspicion
   ↓
Score
   ↓
Threshold
   ↓
Step-sync restriction
```

This keeps the database and maintenance requirements manageable.

---

# 51. Challenge Reward Claiming

Challenges can award coins after completion.

General flow:

```text
Join challenge
      ↓
Sync steps
      ↓
Challenge progress updates
      ↓
Goal reached
      ↓
isCompleted = true
      ↓
Claim challenge reward
      ↓
Reward coins granted
```

The progress record tracks:

```text
rewardGranted
```

to prevent repeatedly claiming the same challenge reward.

---

# 52. Challenge Admin API

Administrative challenge operations include:

```text
Create challenge
Update challenge
Delete challenge
Get admin challenges
```

There is also a user-facing:

```text
Get active challenges
Get challenge by ID
Join challenge
Claim challenge reward
```

---

# 53. Challenge Routes

Current challenge routes:

```text
POST   /challenge/
PATCH  /challenge/:challengeId
DELETE /challenge/:challengeId

GET    /challenge/active

GET    /challenge/:challengeId

POST   /challenge/:challengeId/join

POST   /challenge/:challengeId/claim

GET    /challenge/admin
```

Important:

`/admin` must be declared before:

```text
/:challengeId
```

Otherwise Express may interpret:

```text
/admin
```

as:

```text
challengeId = "admin"
```

Correct ordering:

```js
router.get("/admin", ...);

router.get("/:challengeId", ...);
```

---

# 54. Challenge Authorization

Administrative challenge endpoints use:

```js
authorize("admin", "sub-admin")
```

Users can access user-facing challenge endpoints through authentication.

---

# 55. Challenge Delete Rules

Challenge deletion is intentionally restricted.

An organization administrator should not be able to delete challenges belonging to another organization.

Platform-level administration and organization-level administration must remain separated.

Challenge queries and mutations must therefore verify organization ownership.

---

# 56. Challenge Images

Challenge images are planned around a reusable visual theme rather than difficulty levels.

The intended design is:

```text
Challenge
    ↓
Theme-based image
```

The visual style should remain consistent across challenges while showing a human performing/contextualizing the challenge.

Images should use:

* Solid background
* Human subject
* Clear challenge context
* Consistent visual language
* Non-animated / non-cartoon appearance

The current design does not require separate easy/medium/hard image categories.

---

# 57. Frontend Challenge Module

The frontend challenge module should reuse existing shared components wherever possible.

Existing reusable components include:

```text
DataTable
ErrorDisplay
ActionsMenu
ToggleSwitch
```

The frontend should not duplicate table, action menu, loading, error, and status-toggle implementations unnecessarily.

---

# 58. Frontend Reward Module

The reward module similarly uses reusable components.

Important components:

```text
DataTable
ActionsMenu
ToggleSwitch
RewardModal
RewardViewer
```

---

# 59. Frontend Routing

Current frontend routes include:

```text
/dashboard
/organizations
/users
/rewards
/challenges
/redemptions
```

Role protection is applied through `ProtectedRoute`.

Examples:

```text
/dashboard
    admin
    sub-admin

/organizations
    admin

/users
    admin
    sub-admin

/rewards
    admin
    sub-admin

/challenges
    admin
    sub-admin

/redemptions
    admin
    sub-admin
    staff
```

---

# 60. Frontend Authentication Protection

`ProtectedRoute` checks:

```text
isAuthenticated
user.role
```

If the user is not authenticated:

```text
→ /login
```

If the user's role is not allowed:

```text
→ /login
```

Therefore the backend login response must contain the correct user's role.

---

# 61. Important Authentication Debugging Note

The backend login implementation was previously investigated because a frontend login appeared to always resolve to the same user.

The backend logs confirmed the importance of checking:

```text
email
phone
organizationId
```

and verifying the actual MongoDB query result.

The backend login query is intended to use:

```js
{
    $or: [
        { email },
        { phone }
    ],
    organizationId: orgid
}
```

The response must be constructed from the actual matched user.

---

# 62. API Organization

Frontend API modules are separated by feature.

Examples:

```text
api/rewards.js
api/challenge.js
```

This keeps API calls out of UI components.

Recommended structure:

```text
src/
├── api/
│   ├── auth.js
│   ├── organizations.js
│   ├── users.js
│   ├── rewards.js
│   └── challenge.js
│
├── components/
├── pages/
├── layouts/
├── routes/
└── context/
```

---

# 63. Important Data Relationships

## User → Organization

```text
User.organizationId
        ↓
Organization._id
```

## Reward → Organization

```text
Reward.organizationId
        ↓
Organization._id
```

## Challenge → Organization

```text
Challenge.organizationId
        ↓
Organization._id
```

## Challenge → Creator

```text
Challenge.createdBy
        ↓
User._id
```

## Challenge Progress → Challenge

```text
ChallengeProgress.challengeId
        ↓
Challenge._id
```

## Challenge Progress → User

```text
ChallengeProgress.userId
        ↓
User._id
```

## Redemption → User

```text
Redemption.userId
        ↓
User._id
```

## Redemption → Reward

```text
Redemption.rewardId
        ↓
RewardCatalog._id
```

---

# 64. Security Principles

The backend must never trust frontend role or organization information.

The following must always be verified server-side:

```text
Authentication
Authorization
Organization ownership
Resource ownership
Wallet balance
Reward status
Challenge ownership
Challenge participation
Fraud restrictions
```

Frontend role checks are only for UI/UX.

They are not security controls.

---

# 65. Organization Isolation Rule

For organization-level controllers:

```js
organizationId: req.user.organizationId
```

should be used wherever appropriate.

Never allow a normal organization administrator to simply provide another organization's MongoDB ID and access that organization's data.

For platform-admin operations, cross-organization access can be explicitly supported.

---

# 66. Wallet Accounting

Important user wallet fields:

```text
rewardCoinsBalance
totalRewardCoinsEarned
totalRewardCoinsRedeemed
```

When earning coins:

```text
rewardCoinsBalance += earnedCoins
totalRewardCoinsEarned += earnedCoins
```

When redeeming:

```text
rewardCoinsBalance -= coinsUsed
totalRewardCoinsRedeemed += coinsUsed
```

The same coins must never be deducted twice.

---

# 67. Reward Redemption Accounting

Correct intended accounting:

```text
User requests reward
        ↓
Check reward is active
        ↓
Check sufficient balance
        ↓
Check duplicate pending redemption
        ↓
Deduct coins
        ↓
Create PENDING redemption
```

Then:

```text
Staff claims reward
        ↓
Validate PENDING state
        ↓
Mark CLAIMED
        ↓
Set claimedBy
```

No second wallet deduction occurs during claiming.

---

# 68. Duplicate Pending Redemption

A user should not be able to create multiple pending redemptions for the same reward.

Current controller checks:

```js
{
    userId,
    rewardId,
    status: "PENDING"
}
```

If such a redemption exists:

```text
Reward already awaiting claim
```

is returned.

---

# 69. Error Handling

Controllers generally return JSON responses such as:

```json
{
    "message": "..."
}
```

Successful operations generally include:

```json
{
    "success": true
}
```

Errors should be handled consistently and should not expose sensitive internal information.

Server logs can contain technical error information.

Client responses should contain safe messages.

---

# 70. Environment Variables

Important configuration values include:

```text
MONGODB_URI
JWT_SECRET
JWT_REFRESH_SECRET
ACCESS_TOKEN_EXPIRY
REFRESH_TOKEN_EXPIRES_DAYS
REWARD_STEPS
CLOUDINARY configuration
```

Exact variable names should follow the existing `.env` / configuration implementation.

Do not hardcode secrets.

---

# 71. Cloudinary

Cloudinary is used for persistent image storage where configured.

Image objects generally use:

```js
{
    url,
    publicId
}
```

The `publicId` is important because it allows the backend to remove or replace the corresponding Cloudinary asset later.

---

# 72. File Uploads

For image uploads:

```text
Frontend
    ↓
multipart/form-data
    ↓
Multer
    ↓
Controller
    ↓
Cloudinary
    ↓
MongoDB image metadata
```

For CSV uploads:

```text
Frontend
    ↓
multipart/form-data
    ↓
Multer buffer
    ↓
Streamifier
    ↓
CSV parser
    ↓
Validation
    ↓
MongoDB
```

---

# 73. CSV Validation

CSV reward rows should be validated before insertion.

At minimum:

```text
title exists
coinCost is numeric
organization code resolves to an organization
```

Invalid rows should not create malformed reward documents.

---

# 74. Database Design Philosophy

The project intentionally avoids unnecessary database complexity.

Prefer:

```text
Simple schema
+
Indexes
+
References
+
Targeted helpers
+
Server-side validation
```

over creating unnecessary collections or complicated relationships.

Fraud detection follows the same philosophy.

---

# 75. Fraud Database Philosophy

The current fraud implementation intentionally uses:

```text
DailyStepLog
+
FraudEvent
+
User fraud/block state
```

rather than creating a large device-management system.

The objective is to detect suspicious activity rather than perfectly identify a physical device.

---

# 76. Known Limitation: Step Source Trust

The backend ultimately relies on the frontend/mobile health integration to provide step totals.

The backend cannot independently prove that:

```text
10,000 reported steps
```

were actually walked unless the platform provides a trusted verification mechanism.

Therefore the backend fraud layer focuses on detecting suspicious patterns such as:

```text
Same device
+
Multiple accounts
+
Repeated suspicious syncing
```

---

# 77. Current Fraud Strategy

The current strategy is:

```text
Normal user
    ↓
Normal sync
    ↓
No fraud action

Suspicious device sharing
    ↓
Fraud score increases

Repeated suspicious activity
    ↓
Fraud score increases further

Threshold reached
    ↓
stepSyncBlocked = true
```

This is intentionally a threshold-based system rather than immediate account suspension.

---

# 78. Challenge Progress + Step Sync Integration

Step syncing updates challenge progress after daily steps are updated.

General flow:

```text
syncSteps
    ↓
Update DailyStepLog
    ↓
Update User wallet/statistics
    ↓
updateChallengeProgress(userId)
    ↓
Recalculate joined challenge progress
    ↓
Mark completed challenges
    ↓
Save user
```

This keeps challenge progress synchronized with step activity.

---

# 79. Important Implementation Rules

When modifying the backend:

### Rule 1

Always enforce organization boundaries server-side.

### Rule 2

Never trust frontend role information.

### Rule 3

Never use MongoDB IDs as human-facing identifiers when a unique organization code can be used.

### Rule 4

Do not deduct reward coins twice.

### Rule 5

Do not allow step totals to decrease within a daily log.

### Rule 6

Do not count steps toward a challenge before the user joins it.

### Rule 7

Use `startingSteps` when a challenge is joined after steps have already been recorded that day.

### Rule 8

Do not immediately suspend a user because of one suspicious device match.

### Rule 9

Use fraud scoring and thresholds.

### Rule 10

Prefer reusable frontend components rather than duplicating UI logic.

---

# 80. Current Main Modules

The backend currently consists conceptually of:

```text
Authentication
│
├── Login
├── Access Tokens
└── Refresh Tokens

Organizations
│
├── Create
├── Update
├── List
└── Management

Users
│
├── Create
├── List
├── Search
├── Pagination
├── Role Management
├── Profile Image
└── Delete

Steps
│
├── Daily Step Logs
├── Step Sync
├── Coin Calculation
└── Fraud Detection

Rewards
│
├── Reward Catalog
├── Create
├── Update
├── Delete
├── Toggle Active
├── Image Upload
└── CSV Import

Redemptions
│
├── Create Redemption
└── Claim Reward

Challenges
│
├── Create
├── Update
├── Delete
├── Admin Listing
├── Active Listing
├── Get By ID
├── Join
├── Progress
└── Claim Reward
```

---

# 81. Challenge Routes Reference

```js
router.post(
    "/",
    protectRoute,
    authorize("admin", "sub-admin"),
    createChallenge
);

router.patch(
    "/:challengeId",
    protectRoute,
    authorize("admin", "sub-admin"),
    updateChallenge
);

router.delete(
    "/:challengeId",
    protectRoute,
    authorize("admin", "sub-admin"),
    deleteChallenge
);

router.get(
    "/active",
    protectRoute,
    getActiveChallenges
);

router.get(
    "/admin",
    protectRoute,
    authorize("admin", "sub-admin"),
    getAdminChallenges
);

router.get(
    "/:challengeId",
    protectRoute,
    getChallengeById
);

router.post(
    "/:challengeId/join",
    protectRoute,
    joinChallenge
);

router.post(
    "/:challengeId/claim",
    protectRoute,
    claimChallengeReward
);
```

Route ordering matters.

Static routes such as:

```text
/admin
/active
```

must be declared before:

```text
/:challengeId
```

---

# 82. Challenge Admin Listing

`getAdminChallenges` is intended for administrative views.

Conceptually:

```text
Platform Admin
    ↓
Can see challenges across organizations

Organization Admin / Sub-admin
    ↓
Can see challenges belonging to their organization
```

The backend should determine the appropriate query from the authenticated user's role.

Search/filter/pagination can be applied to the administrative listing.

---

# 83. Formatting Referenced Documents

When formatting challenge data for administrative responses:

```text
createdBy
```

should resolve to the referenced user's name.

```text
organizationId
```

should resolve to the referenced organization's information.

The frontend should receive a convenient representation such as:

```json
{
    "createdBy": {
        "name": "Admin Name"
    },
    "organization": {
        "name": "Organization Name",
        "code": "ORG001"
    }
}
```

rather than forcing the frontend to make additional requests solely to display names.

---

# 84. Recommended Controller Pattern

Controllers should generally follow:

```text
connectDB
    ↓
read request
    ↓
validate input
    ↓
identify authenticated user
    ↓
check permissions
    ↓
resolve organization/resource
    ↓
perform operation
    ↓
return response
```

For mutations:

```text
Validate
    ↓
Authorization
    ↓
Ownership
    ↓
Mutation
    ↓
Response
```

---

# 85. Recommended Future Changes

Potential future improvements include:

* Better fraud scoring rules
* More robust device/health-source verification
* Atomic wallet transactions
* More detailed redemption states
* Challenge image management
* Better audit logs
* More comprehensive admin filtering
* Rate limiting
* Request validation with a schema library
* Database transactions for critical wallet operations

These are future improvements and should not be added automatically unless required.

---

# 86. Important Architectural Constraint

Do not change the existing architecture unnecessarily.

Before adding a new feature:

1. Check whether an existing controller already handles the required operation.
2. Check whether an existing helper can be reused.
3. Check whether an existing model already contains the required data.
4. Reuse existing API patterns.
5. Reuse existing frontend components.
6. Add new collections only when genuinely necessary.

Avoid introducing unnecessary abstractions.

---

# 87. Development Principle

The backend should remain:

```text
Secure
+
Organization-aware
+
Role-aware
+
Simple to maintain
+
Consistent
+
Scalable enough for the current application
```

Do not optimize for theoretical complexity at the expense of maintainability.

---

# 88. Current System Flow

The complete high-level flow is:

```text
                    ┌─────────────────┐
                    │  Authentication │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      User       │
                    └────────┬────────┘
                             │
               ┌─────────────┼──────────────┐
               │             │              │
               ▼             ▼              ▼
          Step Sync      Challenges      Rewards
               │             │              │
               ▼             ▼              ▼
        Daily Step Log  ChallengeProgress  Reward Catalog
               │             │              │
               ▼             ▼              ▼
          Reward Coins   Challenge Reward  Redemption
               │                            │
               │                            ▼
               │                       PENDING
               │                            │
               │                            ▼
               │                         STAFF
               │                            │
               │                            ▼
               │                         CLAIMED
               │
               ▼
        Fraud Detection
               │
               ▼
        Fraud Score / Event
               │
               ▼
       Step Sync Blocking
```

---

# 89. Source of Truth

This README should be treated as the reference document for the backend implementation **as of the current development stage**.

When modifying the project:

```text
Existing implementation
        +
This README
        +
New explicit requirements
```

should be considered together.

If the actual code has changed after this README was written, the actual code is the final source of truth and this README should be updated accordingly.

---

# 90. Change Tracking

When a significant backend feature is completed, update this README with:

```text
1. New model
2. New controller
3. New route
4. Authorization rules
5. Organization-scoping rules
6. Request parameters
7. Response structure
8. Important business logic
9. Frontend API function
10. Important edge cases
```

This keeps the README usable as the long-term project reference.

---

# 91. Current Completion Status

## Authentication

* [x] Login
* [x] Password hashing
* [x] JWT access token
* [x] Refresh token
* [x] Role information
* [x] Organization-aware login

## Organizations

* [x] Organization management
* [x] Organization code
* [x] Organization categories
* [x] Organization image handling
* [x] Organization-aware data isolation

## Users

* [x] Create user
* [x] Update user
* [x] Role management
* [x] User listing
* [x] Search
* [x] Pagination
* [x] Active/inactive filtering
* [x] Profile images
* [x] Organization reference/population
* [x] Role-based deletion rules

## Steps

* [x] Daily step logs
* [x] Step synchronization
* [x] Incremental step calculation
* [x] Reward coin calculation
* [x] User wallet updates
* [x] Device ID tracking
* [x] Fraud events
* [x] Fraud scoring
* [x] Step-sync blocking

## Rewards

* [x] Reward catalog
* [x] Create reward
* [x] Update reward
* [x] Delete reward
* [x] Toggle status
* [x] Reward images
* [x] CSV upload
* [x] Organization-code based CSV organization lookup

## Redemptions

* [x] Create redemption
* [x] Pending state
* [x] Immediate coin deduction
* [x] Duplicate pending protection
* [x] Staff claiming
* [x] Claimed state

## Challenges

* [x] Challenge model
* [x] Create challenge
* [x] Update challenge
* [x] Active status handling
* [x] Admin challenge listing
* [x] Organization scoping
* [x] Challenge deletion restrictions
* [x] Active challenge listing
* [x] Challenge details
* [x] Join challenge
* [x] Challenge progress
* [x] Starting-step handling
* [x] Challenge reward claiming
* [x] Challenge reward protection
* [x] Created-by reference
* [x] Organization reference

---

# 92. Do Not Break These Rules

Before changing existing functionality, verify that the change does not break:

```text
Organization isolation
Role authorization
Wallet accounting
Daily step accounting
Challenge startingSteps
Challenge progress
Reward status
Redemption state
Fraud detection
Fraud blocking
Refresh token handling
```

Especially do not change wallet or step accounting logic without checking all related flows.

---

# 93. Final Architecture Summary

RIVODS is currently an:

```text
Organization-based
Step-tracking
Reward-management
Challenge
Redemption
Fraud-aware
REST API
```

with the following core relationship:

```text
Organization
    │
    ├── Users
    │     ├── Steps
    │     ├── Wallet
    │     ├── Fraud State
    │     └── Challenge Progress
    │
    ├── Rewards
    │     └── Redemptions
    │
    └── Challenges
          └── Challenge Progress
```

The most important business rule is:

```text
Trusted enough step activity
        ↓
Coins
        ↓
Rewards / Challenges
```

while suspicious step activity is monitored through:

```text
Device sharing
        ↓
Fraud Events
        ↓
Fraud Score
        ↓
Threshold
        ↓
Step Sync Block
```

This is the current baseline architecture and should be preserved unless a future requirement explicitly requires a structural change.

```
```