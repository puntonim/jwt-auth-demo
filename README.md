# JWT-AUTH-DEMO

This project demos how to use JWT for auth.

## Install 
- Install MongoDB on macos:
```bash
$ brew tap mongodb/brew
$ brew install mongodb-community@4.2
# Start the service with:
$ brew services start mongodb/brew/mongodb-community
```

- Install npm libs:
```bash
$ npm i
```

- Run the webserver:
```bash
$ npm run dev
```

## Example of auth flow

- Create a new user - a new JWT is generated and returned:
```bash
$ curl  http://localhost:3000/users -H "Content-Type: application/json" --data '{"name":"john","age":25,"email":"john@foo.bar","password":"mysecretword123"}' | jq
{
  "user": {
    "age": 25,
    "_id": "5e8c87aecdc23a40770b844b",
    "name": "john",
    "email": "john@foo.bar",
    "createdAt": "2020-04-07T14:01:18.705Z",
    "updatedAt": "2020-04-07T14:01:18.764Z",
    "__v": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZThjODdhZWNkYzIzYTQwNzcwYjg0NGIiLCJpYXQiOjE1ODYyNjgwNzgsImV4cCI6MTU4Njg3Mjg3OH0.kCWUuRJQGD2qK5sgWabILlueK5t2G9XjAGzWl3JqNaM"
}
```

- Hit an endpoint that requires auth:
```bash
$ curl  http://localhost:3000/users/me -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZThjODdhZWNkYzIzYTQwNzcwYjg0NGIiLCJpYXQiOjE1ODYyNjgwNzgsImV4cCI6MTU4Njg3Mjg3OH0.kCWUuRJQGD2qK5sgWabILlueK5t2G9XjAGzWl3JqNaM" | jq
{
  "age": 25,
  "_id": "5e8c87aecdc23a40770b844b",
  "name": "john",
  "email": "john@foo.bar",
  "createdAt": "2020-04-07T14:01:18.705Z",
  "updatedAt": "2020-04-07T14:01:18.764Z",
  "__v": 1
}
```

## Code insights

- JWT creation on login: ...
- JWT verification when hitting an endpoint that requires auth: ...