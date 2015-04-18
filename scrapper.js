var request = require("request");

request.post({
    url: 'https://api.parse.com/1/classes/IterationModel',
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

    var special_item = '';
    var beverage = '';

    for (var i = 0; i < menu.options.length; i++) {
        if (!menu.options[i].sold_out || menu.options[i].sold_out === false) {
            switch (menu.options[i].type) {
                case 'food':
                    postToSlack((options++) + '. ' + menu.options[i].name + ': ' + menu.options[i].description + ' ' + menu.options[i].picture.url);
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

    postToSlack('Extras: ' + special_item.substring(0, special_item.length - 2) + ', Bebidas: ' + beverage.substring(0, beverage.length - 2));

    var time_slots = '';
    for (var i = 0; i < menu.time_slots.length; i++) {
        if (menu.time_slots[i].sold_out !== true) {
            time_slots = time_slots + menu.time_slots[i].label + ', ';
        }
    };
    postToSlack('Horarios Disponibles: ' + time_slots.substring(0, time_slots.length - 2));
};

function postToSlack(payload) {
    var slack_base_url = 'https://slack.com/api/chat.postMessage';
    var slack_token = //YOUR SLACK TOKEN;
    var slack_channel = '#feeds';

    request.post({
        url: slack_base_url,
        form: {
            token: slack_token,
            channel: slack_channel,
            text: payload,
            username: 'Trifl',
            icon_url: 'https://pbs.twimg.com/profile_images/507563941078114304/0Ub4z1AG_400x400.png',
            pretty: 1
        }
    }, function(err, response) {
        if (err) console.log(err);
    });
};