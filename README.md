# trifl-menu
a way to bring the [trifl](http://gettrifl.com) menu to Slack, and get the orders from the dudes & dudettes on your team

# installation
1- `npm install` to install the dependencies
2- open the file `package.json` and complete with your slack info [Slack API](https://api.slack.com/), and preferences
3- run `npm start` or `node menu.js` to start the app.

# post the menu
just put a webhook like `/menu`. if there's a number after the `/menu` it will start a voting with the selected time. /menu{time in minutes}

# voting feature
to use the voting feature you must turn on `voting_enabled`, create an outgoing webook in [Slack API - Webhooks](https://api.slack.com/outgoing-webhooks) and point the URL to `/voting`. Also you need to configure the token, and the trigger.

if you want a hook to finish voting, same story than before with url pointing to `URL/voting/end`.

# package.json vars
`slack_base_url` Slack base url. I wouldnt touch this one  
`slack_token` The Slack Token (for the user posting data)   
`slack_webook_token_vote` The token of the webook trigger that count votes  
`slack_webook_token_end` The token of the webook trigger that end voting  
`slack_channel` The channel in which Slak will post the menu  
`bot_username` The name of the bot that will be posting the menu  
`bot_avatar` The avatar url of the bot that will be posting the menu  
`trifl_url` The url of Trifl. Again, dont touch this unless you know what you're doing  
`send_food` This enables the Food part of the menu  
`send_beverages` This enables the Beverage part of the menu  
`send_special_item` This enables the Special Item part of the menu  
`send_timeframes` This enables the Time window part of the menu  
