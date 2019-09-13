# web-sec-api

## Installation

1. Clone the repository

2. `yarn install`

3. Make a `local.json` file in _/config_ if the values on [default.json](./config/default.json) don't match your environment.

4. `yarn start`

## Endpoints

### Register

```
POST /register

DeviceId: <unique_id_for_device>
DeviceId: <User_facing_name_for_device>

{
  "phone": "254xxxxxxxxx",
  "password": "secret"
}
```
