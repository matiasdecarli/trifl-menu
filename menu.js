var request = require("request");
var pjson = require('./package.json');
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var bodyParser = require('body-parser');
var ended = false;
var votes = [];

app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/menu/', function(req,res){
    if (!req.body || !req.body.token || !pjson.slack_webook_token_menu || (req.body.token !== pjson.slack_webook_token_menu))
        return res.sendStatus(401);

    votes = [];

    request.post({
        url: pjson.trifl_url,
        form: '{"where":{"franchise":{"__type":"Pointer","className":"Franchise","objectId":"PCNSFmlKdN"},"status":"active"},"include":"options,chef,franchise","order":"-createdAt","limit":1,"_method":"GET","_ApplicationId":"OiyqYtObwNjjFvu4MSwptTCNiT2IVbAqGfFUQnIB","_JavaScriptKey":"R71nTJgZN2BwUMA6mnTerqrFSl3lWG0ZfKEq0EIo","_ClientVersion":"js1.2.18","_InstallationId":"c84bba51-6be8-00f2-b1ac-602afeed724a"}'
    }, function(err, response) {
        if (response.statusCode === 200)
            parseMenu(JSON.parse(response.body), function(err) {
                if (err) console.log(err);

                var command = req.body.text;
                var time = command.split('/menu');

                if (time[1]) {
                    ended = false;

                    var timeLimit = addMinutes(new Date(),parseInt(time[1]));

                    postToSlack("Voting enabled: To vote add '+' before your order. Time limit: " +
                        (timeLimit.getHours()-3) + ':' + timeLimit.getMinutes() , function(){
                        setTimeout(function() {
                            if (ended) return;

                            endVoting(function() {
                                return;
                            });
                        }, parseInt(time[1])*60000);
                    })
                }

                return res.sendStatus(200);
            });
        else
            console.log(err);
    });
});

app.post('/voting/', function(req, res) {
    if (!req.body || !req.body.token || !pjson.slack_webook_token_vote || (req.body.token !== pjson.slack_webook_token_vote))
        return res.sendStatus(401);

    votes[req.body.user_name] = req.body.text;

    return res.sendStatus(200);
});

app.post('/voting/end', function(req, res) {
    if (ended || !req.body || !req.body.token || !pjson.slack_webook_token_end || (req.body.token !== pjson.slack_webook_token_end))
        return res.sendStatus(401);

    ended = true;

    endVoting(function(){
        return;
    });
});

var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
});

function addMinutes(date, mins) {
    return new Date(date.getTime() + mins*60000);
}

function endVoting(next) {
    var results = '';

    for (var item in votes) {
        results = results + item + ' : ' + votes[item] + '\n';
    }

    return postToSlack('Time\'s up! :clock1130: Lets order! ' + '\n' + results, function() {
        return next();
    });
}

function parseMenu(body, next) {
    var menu = body.results[0];

    var options = 1;

    var food = '';
    var special_item = 'Extras: ';
    var beverage = 'Bebidas: ';

    for (var i = 0; i < menu.options.length; i++) {
        //if (!menu.options[i].sold_out || menu.options[i].sold_out === false) {
            switch (menu.options[i].type) {
                case 'food':
                    food = food + (options++) + '. ' + menu.options[i].name + ': ' + menu.options[i].description + ' ' + menu.options[i].picture.url + '\n';
                    break;
                case 'beverage':
                    beverage = beverage + menu.options[i].name + '(' + menu.options[i].description + '), ';
                    break;
                case 'special_item':
                    special_item = special_item + menu.options[i].name + '(' + menu.options[i].description + '), ';
                    break
            }
        //}
    };

    var time_slots = 'Horarios Disponibles: ';
    for (var i = 0; i < menu.time_slots.length; i++) {
        if (menu.time_slots[i].sold_out !== true) {
            time_slots = time_slots + menu.time_slots[i].label + ', ';
        }
    };

    var content = ((pjson.send_food) ? food : '') +
        ((pjson.send_beverages) ? beverage.substring(0, beverage.length - 2) + '\n' : '') +
        ((pjson.send_special_item) ? special_item.substring(0, special_item.length - 2) + '\n' : '') +
        ((pjson.send_timeframes) ? time_slots.substring(0, time_slots.length - 2) + '\n' : '');

    return postToSlack(content, next);
};

function postToSlack(payload, next) {
    return request.post({
        url: pjson.slack_base_url,
        form: {
            token: pjson.slack_token,
            channel: pjson.slack_channel,
            text: payload,
            username: pjson.bot_username,
            icon_url: pjson.bot_avatar,
            pretty: 1
        }
    }, function(err, response) {
        if (err) return next(err);

        return next();
    });
};