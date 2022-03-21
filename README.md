# Match-It-Backend

## How to Start Server

1. Please be sure to install the node modules.
```node
npm install
```
2. You will need access to the Google Secret SA file to launch the server. Please be sure you are an owner on the Google Cloud project (match-it-system) and download the JSON secret file (...or ask me). 
3. Set environment variable to the secret file.
```node
export GOOGLE_APPLICATION_CREDENTIALS='/path-to-file/'
```
4. Run the server.
```node
node server.js
```

```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```
