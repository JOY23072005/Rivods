# RIVODS Backend

Backend API for the RIVODS step-based employee rewards platform.

## Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- Cloudinary for images
- CSV upload support

## Main Modules

### Authentication
- Login using email/phone + organization ID/code
- Access token + refresh token
- Role-based authorization
- Active/inactive account handling

### Organizations
- Platform-level organization management
- Organization code used for identifying organizations
- Organization reference stored using MongoDB ObjectId

### Users
- User CRUD
- Roles:
  - `admin`
  - `sub-admin`
  - `staff`
  - `user`
- Organization-based access control
- Profile image support
- Pagination and search
- Search by name, email and employee ID

### Steps & Rewards

Users sync daily steps from their health platform.

Reward formula:

`500 Steps = 1 Reward Coin`

Daily step logs prevent duplicate counting by storing the user's daily step total.

### Fraud Detection

Fraud detection is currently based on device sharing.

- Daily step log stores `deviceId`
- Multiple accounts using the same device can increase fraud score
- Fraud events are stored separately
- Fraud thresholds can temporarily block step syncing
- `stepSyncBlocked` prevents further step synchronization
- This is a detection/mitigation system, not perfect device identification

### Reward Catalog

Admins can:

- Create rewards
- Update rewards
- Toggle reward active/inactive status
- Delete rewards
- Upload rewards through CSV
- Assign rewards to organizations

Reward images are supported through Cloudinary.

CSV organization assignment uses the **organization code**, not MongoDB ObjectId.

### Challenges

Challenges support:

- Daily
- Weekly
- Monthly
- Custom

Current goal type:

`steps`

Challenge fields include:

- Title
- Description
- Goal value
- Reward coins
- Start/end dates
- Active status
- Organization
- Creator

Users can:

- View active challenges
- Join challenges
- Track progress
- Claim challenge rewards

Challenge progress is maintained separately from the challenge definition.

### Redemptions

Reward redemption has two stages:

1. User creates redemption request
2. Staff/shopkeeper claims the redemption

**Important:** Coins are deducted when the redemption request is created, not when the shopkeeper claims it.

This prevents users from creating unlimited pending redemptions with the same wallet balance.

## Access Rules

### Platform Admin
- Can manage organizations
- Can manage users across organizations
- Can manage rewards/challenges across organizations

### Organization Admin / Sub-admin
- Can manage resources belonging to their organization
- Cannot manage resources belonging to other organizations

### Staff
- Handles reward redemption/claim workflow

### User
- Syncs steps
- Earns coins
- Joins challenges
- Redeems rewards

## Important Design Decisions

- Organization references use MongoDB `ObjectId`
- Organization codes are used for user/admin input and CSV imports
- Organization/user references should be populated when returning API data
- Challenges cannot be arbitrarily deleted across organizations
- Fraud detection is intentionally kept simple to avoid excessive database complexity
- Daily step logs are the source for daily step tracking
- Wallet balance is updated when rewards/challenges are actually earned or redeemed

## API Structure

Typical routes:

```text
/auth
/organizations
/users
/rewards
/challenges
/redemptions
/steps
````

Protected routes use JWT authentication:

```text
protectRoute
authorize(...)
```

## Current Frontend Integration

Frontend uses API modules such as:

```text
api/rewards.js
api/challenge.js
api/users.js
```

The frontend uses reusable components such as:

```text
DataTable
ErrorDisplay
ActionsMenu
ToggleSwitch
```

for admin management screens.

## Current Status

Implemented:

* Authentication
* Organization management
* User management
* Step synchronization
* Reward coins
* Reward catalog
* CSV reward upload
* Reward redemption
* Challenge management
* Challenge joining/progress
* Challenge reward claiming
* Fraud/device-sharing detection
* Role-based authorization
* Organization-level isolation