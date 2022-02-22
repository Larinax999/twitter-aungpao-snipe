process.env['NODE_ENV'] = 'production';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // no verify ssl
process.setMaxListeners(Infinity);
console.error=()=>{}; // remove warn memory leak

import fetch from 'node-fetch'
import chalk from 'chalk'
import https from 'https'

const agent = new https.Agent({ rejectUnauthorized: false,keepAlive: true }); // no verify ssl and ...idk

var _m = "";
var amount_baht = 0;
const _o = new Set();
const phonepacket = JSON.stringify({
    mobile: "0123456789" // phone number here
});
const voucher_regex = /(?<=gift.truemoney.com\/campaign\/\?v=)[A-z0-9]+/gi;

let redeem1 = async(t = "") => {
    // you need to change ip here every 1 week i think. https://check-host.net/check-dns?host=gift.truemoney.com
    let o = await fetch(`https://18.141.5.53/campaign/vouchers/${t}/redeem`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: phonepacket,
        agent: agent
    }).then(res=>res.json());
    return o
};

let redeem2 = async(t = "") => {
    // you need to change ip here every 1 week i think. https://check-host.net/check-dns?host=gift.truemoney.com
    let o = await fetch(`https://18.141.90.203/campaign/vouchers/${t}/redeem`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: phonepacket,
        agent: agent
    }).then(res=>res.json());
    return o
};

async function _r(link) {
    let res;
    while (!_o.has(link)) {
        res = await redeem1(link).catch(e=>'b');
        if(res){
            if(res == 'b') break;
            // server is processing try to start new request as fast as possible
            if(res.status.code == 'RESERVED_TICKET') continue;
            if(res.status.code == 'SUCCESS') {
                process.title = `[*] eiei [*] baht: ${(amount_baht+= parseFloat( res.data.my_ticket.amount_baht))}`;
                console.log(chalk.greenBright(res.status.code,res.data.my_ticket.amount_baht,link))
                break;
            }
            console.log(res.status.code);
            if(res.status.code == 'INTERNAL_ERROR' || res.status.code == 'TARGET_USER_REDEEMED') break;
            if(res.status.code == "VOUCHER_OUT_OF_STOCK" || res.status.code == "VOUCHER_EXPIRED") {
                _o.add(link)
                break;
            }
        }
    }
}

async function _r2(link) {
    let res;
    while (!_o.has(link)) {
        res = await redeem2(link).catch(e=>'b');
        if(res){
            if(res == 'b') break;
            // server is processing try to start new request as fast as possible
            if(res.status.code == 'RESERVED_TICKET') continue;
            if(res.status.code == 'SUCCESS') {
                process.title = `[*] eiei [*] baht: ${(amount_baht+= parseFloat( res.data.my_ticket.amount_baht))}`;
                console.log(chalk.greenBright(res.status.code,res.data.my_ticket.amount_baht,link))
                break;
            }
            console.log(res.status.code);
            if(res.status.code == 'INTERNAL_ERROR') break;
            if(res.status.code == "VOUCHER_OUT_OF_STOCK" || res.status.code == "VOUCHER_EXPIRED" || res.status.code == 'TARGET_USER_REDEEMED') {
                _o.add(link)
                break;
            }
        }
    }
}

async function checkvoucher(link) {
    if(link != _m){
        // try to bug da truemoney :)
        _r(link);
        _r2(link);
        _m=link;
    }
}

let check = async() => {
    try {
        const data_raw = await fetch("https://twitter.com/i/api/2/search/adaptive.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&send_error_codes=true&simple_quoted_tweet=true&q=gift.truemoney.com&tweet_search_mode=live&count=3&query_source=typed_query&pc=1&spelling_corrections=1&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CsuperFollowMetadata", {
            "headers": {
              "accept": "*/*",
              "accept-language": "en-US,en;q=0.9,th;q=0.8",
              "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
              "x-csrf-token": "X_TOKEN_HERE",
              "cookie": "auth_token=AUTH_TOKEN_HERE; ct0=X_TOKEN_HERE; lang=en"
            },
            "method": "GET"
          }).then(res=>res.json())
        for(const data in data_raw.globalObjects.tweets){
            checkvoucher(data_raw.globalObjects.tweets[data].entities.urls[0].expanded_url.match(voucher_regex)[0]);
        }
    } catch (error) {}
}

(async()=>{
    process.title = "[*] eiei [*] baht: 0"
    console.log("[*] eiei");
    setInterval(check,15);
})();
