# Match-It-Backend

## How to Start the Server

### App runs on http://localhost:8080

1. Please be sure to install the node modules.
```
npm install
```
2. You will need access to the Google Secret SA file to launch the server. Please be sure that you are an owner on the Google Cloud project (match-it-system) and download your JSON secret file (...or ask me for the file). 
3. Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the secret file.
```ruby
export GOOGLE_APPLICATION_CREDENTIALS='/path-to-file/'
```
4. Run the server.
```
node server.js
```

## API Documentation
The information for the available APIs are in Postman listed under the project called match-it. They have also been listed and described below:

**GET** /matches/

## Test Accounts

## Dev & Prod Versions

## Features & Services
Here are the services and features that are available by this system. I have marked which have been completed and which still needs work.

- [ ] Card & Finance (Save card information for users)
- [ ] Stripe integration
- [X] Retrieve a bulk feed of stylists 
- [X] Create matches with stylists
- [X] Approve matches by stylists 
- [ ] **Live** messaging & video chats
- [X] Store chat information in database
- [X] Create profiles for users (private vs. public information)
- [X] Create outfits & store in database
- [X] Create calendar invites & store in database
- [ ] Google/Outlook/Apple Calendar Integration
- [ ] Match-making & questionnaire microservice

