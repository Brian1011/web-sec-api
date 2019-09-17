# web-sec-api

API for a WebSecurity class project.

## Installation

Install [scrypt pre-requisites](https://www.npmjs.com/package/scrypt#pre-requisistes).

Clone the repository

```
git clone https://github.com/MarkNjunge/web-sec-api && cd web-sec-api
```

Install dependencies

```
yarn install
```

Make a `local.json` file based on [default.json](./config/default.json). Obtain `africasTalking` credentials from [AfricasTalking](https://africastalking.com/).

```
cp config/default.json config/local.json
```

Start

```
yarn start
```

## Endpoints

All requests except **register** require `DeviceId` and `DeviceName` headers. DeviceName is meant to be a user facing name e.g. _"Chrome Windows 10"_, _"OnePlus 3 - Android 9"_.

### Register

```
POST /register

{
  "phone": "254xxxxxxxxx",
  "password": "secret"
}
```

### Login

```
POST /login

{
  "phone": "254xxxxxxxxx",
  "password": "secret"
}
```

A sesssion is returned in a `Set-Cookie` header and in the body.  
Since a cookie is set, no further action is needed for further authentication. The session can also be passed in a `session` header.

**NOTE:** A session must be activated before it can be used.

### Activate

```
POST /activate

{
  "activationCode": "6722"
}
```

### Profile

```
GET /Profile
```

### Sessions

```
GET /sessions
```

### Delete session

```
DELETE /session

{
  "sessionId": 3
}
```

### Logout

Delete the current session. Also unsets the cookie

```
POST /logout
```
