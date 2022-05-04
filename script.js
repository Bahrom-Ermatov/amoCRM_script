
const jsdom = require('jsdom');
const dom = new jsdom.JSDOM("");
const jquery = require('jquery')(dom.window);

let corsProxy = "https://cors-anywhere.herokuapp.com/";
let headers;
let url;
let method;
let data;
let page = 1;
let limit = 25;

//Отправка AJAX запроса
function sendAJAXReqest(corsProxy, url, data, method, headers) {
    jquery.ajax({
        url: corsProxy + url,
        data: data,
        method: method,
        headers: headers
     }).done(function (response) {
        console.log(response);
        return response;
    }).fail(function(data) {
        console.log(data);
        return data;
    });   
};

//Функция для создания задачи
function createTask(entity_id) {
    url = "https://bahromermatov3.amocrm.ru/api/v4/tasks";
    method = "POST";
    data = JSON.stringify({
        "text" : {
        text: "Контакт без сделок",
        complete_till: 1651578240,
        entity_id: entity_id,
        entity_type: "contacts"
    }});
    sendAJAXReqest(corsProxy, url, data, method, headers);
}


//Функция для проверки контактов
function checkContacts (page) {
    url = "https://bahromermatov3.amocrm.ru/api/v4/contacts";
    data = {
        limit: limit,
        with: 'leads',
        page: page
    };
    method = "GET";
    
    //Список контактов
    jquery.ajax({
        url: corsProxy + url,
        data: data,
        method: method,
        headers: headers
     }).done(function (response) {
        if (response) {
            for (let contact of response._embedded.contacts) {
                //Если у контакта нет сделки
                if (contact._embedded.leads.length==0) {
                    createTask(contact.id);
                }
            };
            if (response._embedded.contacts.length==limit) {
                page = page + 1;
                checkContacts (page);
            };
        }

    }).fail(function(data) {
        console.log(data);
    });    
}

//Проходим авторизацию и затем запускаем проверку контактов
url = 'https://bahromermatov3.amocrm.ru/oauth2/access_token';
method = 'POST';
data = {
    client_id : 'fb259c87-6fca-4bb6-aad1-6863cb62f109', //ID интеграции
    client_secret : 'utcx48z2ZdsT8nOAA499wUKgcYfTafGdeYhuUp7mUgV2f1ZpWX0GlLu7SoEUuOGb', //Секретный ключ
    grant_type : 'authorization_code',
    code : 'def5020020e62f29e4968f55d8f3854840535365a387df81edaa4d1ec61bd2ad58d0c63ca6efb8f5a401f31244b459abb248bc3725c8dc8d628f2b229d33b54ce57e88f1e97a57a5b9c63a4d735048375b5471262d4f5390c0f20f3ce2e5ebfef7132f1f14d8901a78c2190dac6db1fc6fb2b37a7690db8a2c0edc791e80c9b2b811d13ea163c7ad6d3c2eddeb5ac50089bf28827616f5b7cb2153b2be198544ec18c71115cdf2f7f8d266ba1145638082bedd2e12f9008c4af29a7edc75dcbcdc897ff5f4f935d7e16b95cf565fcb2c7fb6598f1cb0adca59086b5b51fbfdfafea56da156c34ab6512f0aff9563cd4dd226d84db35b679cffbe962040d1a4bffa5bccd6acc1b1f4d0b7644929728e50f513a9b5472479d692d63968b9ebba7a9f231580a1fe3647d80cf3ba04ed10ec098e053c5b3256da0b37e8d006e09e578527ca18baa7d18fa6013889fc4842cbf216701ce2a4f5a83d17e83471543a78426371027c3b3b6d1b5a2a1f5930011148bba0d2c2f525ae1defc4b8bcb1ecde1da240df13b3532b0d532510de48e0d08e1caeea9ec184306a476675779a824a4d5bf0661ddf4a8128a0ad0c4e134d10839553c4e2916ab2416a463ce311aab3b96b217afd3fb86aada2c772', //Код авторизации
    redirect_uri : 'https://43b4-217-8-42-203.ngrok.io', //Адрес с кторого будет идти запрос (получаем из приложения ngrok)
};

jquery.ajax({
    url: corsProxy + url,
    method: method,
    data: data
}).done(function(data) {
    headers = {
        "Authorization": "Bearer " + data.access_token,
        "Content-Type": "application/json",
    };
    checkContacts (page);
}).fail(function(data) {
    console.log(data);
})


