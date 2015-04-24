var request = require("request");
var pjson = require('./package.json');

request.post({
    url: pjson.trifl_url,
    form: '{"where":{"franchise":{"__type":"Pointer","className":"Franchise","objectId":"PCNSFmlKdN"},"status":"active"},"include":"options,chef,franchise","order":"-createdAt","limit":1,"_method":"GET","_ApplicationId":"OiyqYtObwNjjFvu4MSwptTCNiT2IVbAqGfFUQnIB","_JavaScriptKey":"R71nTJgZN2BwUMA6mnTerqrFSl3lWG0ZfKEq0EIo","_ClientVersion":"js1.2.18","_InstallationId":"c84bba51-6be8-00f2-b1ac-602afeed724a"}'
}, function(err, response) {
    if (response.statusCode === 200) {
        parseMenu(JSON.parse(response.body));
    } else {
        console.log(err);
    }
});

function parseMenu(body) {
    var menu = body.results[0];

    var options = 1;

    var food = '';
    var special_item = 'Extras: ';
    var beverage = 'Bebidas: ';

    for (var i = 0; i < menu.options.length; i++) {
        if (!menu.options[i].sold_out || menu.options[i].sold_out === false) {
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
        }
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
    
    postToSlack(content);
};

function postToSlack(payload) {
    request.post({
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
        if (err) console.log(err);
    });
};