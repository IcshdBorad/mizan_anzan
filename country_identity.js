/*
 * MIZAN ANZAN — Global Country Identity v2
 * Smart searchable country picker + ISO 3166-1 alpha-2 persistence.
 * UI accepts search text only; the application persists the canonical ISO code.
 */
(function (global) {
    'use strict';

    const ISO_CODES = Object.freeze(["AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"]);

    const ENGLISH_NAMES = Object.freeze({
        "AD":"Andorra","AE":"United Arab Emirates","AF":"Afghanistan","AG":"Antigua and Barbuda","AI":"Anguilla","AL":"Albania","AM":"Armenia","AO":"Angola","AQ":"Antarctica","AR":"Argentina","AS":"American Samoa","AT":"Austria","AU":"Australia","AW":"Aruba","AX":"Åland Islands","AZ":"Azerbaijan","BA":"Bosnia and Herzegovina","BB":"Barbados","BD":"Bangladesh","BE":"Belgium","BF":"Burkina Faso","BG":"Bulgaria","BH":"Bahrain","BI":"Burundi","BJ":"Benin","BL":"Saint Barthélemy","BM":"Bermuda","BN":"Brunei Darussalam","BO":"Bolivia, Plurinational State of","BQ":"Bonaire, Sint Eustatius and Saba","BR":"Brazil","BS":"Bahamas","BT":"Bhutan","BV":"Bouvet Island","BW":"Botswana","BY":"Belarus","BZ":"Belize","CA":"Canada","CC":"Cocos (Keeling) Islands","CD":"Congo, The Democratic Republic of the","CF":"Central African Republic","CG":"Congo","CH":"Switzerland","CI":"Côte d’Ivoire","CK":"Cook Islands","CL":"Chile","CM":"Cameroon","CN":"China","CO":"Colombia","CR":"Costa Rica","CU":"Cuba","CV":"Cabo Verde","CW":"Curaçao","CX":"Christmas Island","CY":"Cyprus","CZ":"Czechia","DE":"Germany","DJ":"Djibouti","DK":"Denmark","DM":"Dominica","DO":"Dominican Republic","DZ":"Algeria","EC":"Ecuador","EE":"Estonia","EG":"Egypt","EH":"Western Sahara","ER":"Eritrea","ES":"Spain","ET":"Ethiopia","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands (Malvinas)","FM":"Micronesia, Federated States of","FO":"Faroe Islands","FR":"France","GA":"Gabon","GB":"United Kingdom","GD":"Grenada","GE":"Georgia","GF":"French Guiana","GG":"Guernsey","GH":"Ghana","GI":"Gibraltar","GL":"Greenland","GM":"Gambia","GN":"Guinea","GP":"Guadeloupe","GQ":"Equatorial Guinea","GR":"Greece","GS":"South Georgia and the South Sandwich Islands","GT":"Guatemala","GU":"Guam","GW":"Guinea-Bissau","GY":"Guyana","HK":"Hong Kong","HM":"Heard Island and McDonald Islands","HN":"Honduras","HR":"Croatia","HT":"Haiti","HU":"Hungary","ID":"Indonesia","IE":"Ireland","IL":"Israel","IM":"Isle of Man","IN":"India","IO":"British Indian Ocean Territory","IQ":"Iraq","IR":"Iran, Islamic Republic of","IS":"Iceland","IT":"Italy","JE":"Jersey","JM":"Jamaica","JO":"Jordan","JP":"Japan","KE":"Kenya","KG":"Kyrgyzstan","KH":"Cambodia","KI":"Kiribati","KM":"Comoros","KN":"Saint Kitts and Nevis","KP":"North Korea","KR":"South Korea","KW":"Kuwait","KY":"Cayman Islands","KZ":"Kazakhstan","LA":"Lao People’s Democratic Republic","LB":"Lebanon","LC":"Saint Lucia","LI":"Liechtenstein","LK":"Sri Lanka","LR":"Liberia","LS":"Lesotho","LT":"Lithuania","LU":"Luxembourg","LV":"Latvia","LY":"Libya","MA":"Morocco","MC":"Monaco","MD":"Moldova, Republic of","ME":"Montenegro","MF":"Saint Martin (French part)","MG":"Madagascar","MH":"Marshall Islands","MK":"North Macedonia","ML":"Mali","MM":"Myanmar","MN":"Mongolia","MO":"Macao","MP":"Northern Mariana Islands","MQ":"Martinique","MR":"Mauritania","MS":"Montserrat","MT":"Malta","MU":"Mauritius","MV":"Maldives","MW":"Malawi","MX":"Mexico","MY":"Malaysia","MZ":"Mozambique","NA":"Namibia","NC":"New Caledonia","NE":"Niger","NF":"Norfolk Island","NG":"Nigeria","NI":"Nicaragua","NL":"Netherlands","NO":"Norway","NP":"Nepal","NR":"Nauru","NU":"Niue","NZ":"New Zealand","OM":"Oman","PA":"Panama","PE":"Peru","PF":"French Polynesia","PG":"Papua New Guinea","PH":"Philippines","PK":"Pakistan","PL":"Poland","PM":"Saint Pierre and Miquelon","PN":"Pitcairn","PR":"Puerto Rico","PS":"Palestine","PT":"Portugal","PW":"Palau","PY":"Paraguay","QA":"Qatar","RE":"Réunion","RO":"Romania","RS":"Serbia","RU":"Russian Federation","RW":"Rwanda","SA":"Saudi Arabia","SB":"Solomon Islands","SC":"Seychelles","SD":"Sudan","SE":"Sweden","SG":"Singapore","SH":"Saint Helena, Ascension and Tristan da Cunha","SI":"Slovenia","SJ":"Svalbard and Jan Mayen","SK":"Slovakia","SL":"Sierra Leone","SM":"San Marino","SN":"Senegal","SO":"Somalia","SR":"Suriname","SS":"South Sudan","ST":"Sao Tome and Principe","SV":"El Salvador","SX":"Sint Maarten (Dutch part)","SY":"Syrian Arab Republic","SZ":"Eswatini","TC":"Turks and Caicos Islands","TD":"Chad","TF":"French Southern Territories","TG":"Togo","TH":"Thailand","TJ":"Tajikistan","TK":"Tokelau","TL":"Timor-Leste","TM":"Turkmenistan","TN":"Tunisia","TO":"Tonga","TR":"Türkiye","TT":"Trinidad and Tobago","TV":"Tuvalu","TW":"Taiwan","TZ":"Tanzania, United Republic of","UA":"Ukraine","UG":"Uganda","UM":"United States Minor Outlying Islands","US":"United States","UY":"Uruguay","UZ":"Uzbekistan","VA":"Vatican City","VC":"Saint Vincent and the Grenadines","VE":"Venezuela, Bolivarian Republic of","VG":"Virgin Islands, British","VI":"Virgin Islands, U.S.","VN":"Viet Nam","VU":"Vanuatu","WF":"Wallis and Futuna","WS":"Samoa","YE":"Yemen","YT":"Mayotte","ZA":"South Africa","ZM":"Zambia","ZW":"Zimbabwe"
    });

    const ALIASES = Object.freeze({
        IQ: ['iraq','العراق','irak','iraq republic'],
        SA: ['saudi','saudi arabia','السعودية','المملكة العربية السعودية'],
        AE: ['uae','emirates','الإمارات','الامارات','الإمارات العربية المتحدة'],
        EG: ['egypt','مصر','misr','masr','egypte'],
        FR: ['france','فرنسا'],
        US: ['usa','united states','america','الولايات المتحدة','امريكا','أمريكا'],
        GB: ['uk','united kingdom','britain','بريطانيا','المملكة المتحدة'],
        MA: ['morocco','المغرب','maroc'],
        DZ: ['algeria','الجزائر','algérie'],
        TN: ['tunisia','تونس','tunisie'],
        JO: ['jordan','الأردن','الاردن'],
        QA: ['qatar','قطر'],
        KW: ['kuwait','الكويت'],
        BH: ['bahrain','البحرين'],
        OM: ['oman','عمان'],
        TR: ['turkey','türkiye','تركيا'],
        IR: ['iran','إيران','ايران'],
        IQ: ['العراق','iraq']
    });

    const flagFor = code => code.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
    const normalize = value => String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'`]/g,'').replace(/[^\p{L}\p{N}\s-]/gu,' ').replace(/\s+/g,' ').trim();

    function activeLanguage() {
        return String(global.I18n?.currentLang?.() || global.AppState?.lang || document.documentElement.lang || 'en').replace('_','-');
    }

    function displayName(code, lang) {
        const locale = String(lang || activeLanguage()).replace('_','-');
        try {
            if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
                const name = new Intl.DisplayNames([locale], {type:'region'}).of(code);
                if (name && name !== code) return name;
            }
        } catch (_) {}
        return ENGLISH_NAMES[code] || code;
    }

    function searchText(code) {
        const local = displayName(code);
        const english = ENGLISH_NAMES[code] || '';
        const aliases = ALIASES[code] || [];
        return normalize([code, local, english, ...aliases].join(' '));
    }

    function createPicker() {
        const root = document.querySelector('[data-country-picker]');
        if (!root || root.dataset.ready === 'true') return;
        const hidden = root.querySelector('#reg-country');
        const input = root.querySelector('#reg-country-search');
        const options = root.querySelector('#mizan-country-options');
        const selected = root.querySelector('#mizan-country-selected');
        const clear = root.querySelector('#mizan-country-clear');
        if (!hidden || !input || !options || !selected) return;

        let activeIndex = -1;
        let filtered = ISO_CODES.slice();

        const t = (key, fallback) => typeof global.t === 'function' ? global.t(key, fallback) : fallback;

        function render(query = '') {
            const q = normalize(query);
            filtered = q ? ISO_CODES.filter(code => normalize([code, displayName(code), ENGLISH_NAMES[code] || '', ...(ALIASES[code] || [])].join(' ')).includes(q)) : ISO_CODES.slice();
            options.replaceChildren();
            activeIndex = -1;
            if (!filtered.length) {
                const empty = document.createElement('div');
                empty.className = 'mizan-country-empty';
                const lang = activeLanguage().split('-')[0];
                const emptyText = lang === 'ar' ? 'لم يتم العثور على دولة مطابقة.' : lang === 'fr' ? 'Aucun pays correspondant.' : 'No matching country found.';
                empty.textContent = emptyText;
                options.appendChild(empty);
                return;
            }
            filtered.forEach((code, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'mizan-country-option';
                button.setAttribute('role','option');
                button.dataset.code = code;
                button.setAttribute('aria-selected', String(code === hidden.value));
                button.innerHTML = `<span class="mizan-country-option-main"><span aria-hidden="true">${flagFor(code)}</span><span class="mizan-country-option-name"></span></span><span class="mizan-country-option-code">${code}</span>`;
                button.querySelector('.mizan-country-option-name').textContent = displayName(code);
                button.addEventListener('mousedown', event => event.preventDefault());
                button.addEventListener('click', () => select(code));
                options.appendChild(button);
                if (index === 0) activeIndex = 0;
            });
        }

        function select(code) {
            if (!ISO_CODES.includes(code)) return;
            hidden.value = code;
            input.value = displayName(code);
            selected.textContent = `${flagFor(code)} ${displayName(code)} · ${code}`;
            selected.classList.remove('hidden');
            clear?.classList.remove('hidden');
            input.setAttribute('aria-expanded','false');
            options.classList.add('hidden');
            root.dataset.value = code;
            root.dispatchEvent(new CustomEvent('mizanCountryChanged', {bubbles:true, detail:{code}}));
        }

        function clearSelection() {
            hidden.value = '';
            input.value = '';
            selected.textContent = '';
            selected.classList.add('hidden');
            clear?.classList.add('hidden');
            root.dataset.value = '';
            render('');
            open();
        }

        function open() {
            render(input.value && hidden.value ? '' : input.value);
            options.classList.remove('hidden');
            input.setAttribute('aria-expanded','true');
        }

        input.addEventListener('focus', open);
        input.addEventListener('input', () => {
            if (hidden.value && normalize(input.value) !== normalize(displayName(hidden.value))) hidden.value = '';
            selected.classList.add('hidden');
            clear?.classList.remove('hidden');
            open();
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown') { event.preventDefault(); open(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); }
            else if (event.key === 'ArrowUp') { event.preventDefault(); open(); activeIndex = Math.max(activeIndex - 1, 0); }
            else if (event.key === 'Enter' && activeIndex >= 0 && filtered[activeIndex]) { event.preventDefault(); select(filtered[activeIndex]); }
            else if (event.key === 'Escape') { options.classList.add('hidden'); input.setAttribute('aria-expanded','false'); }
        });
        clear?.addEventListener('click', clearSelection);
        document.addEventListener('click', event => { if (!root.contains(event.target)) { options.classList.add('hidden'); input.setAttribute('aria-expanded','false'); } });

        root.dataset.ready = 'true';
        render('');
    }

    function refresh() {
        const root = document.querySelector('[data-country-picker]');
        if (!root) return;
        const hidden = root.querySelector('#reg-country');
        const input = root.querySelector('#reg-country-search');
        const selected = root.querySelector('#mizan-country-selected');
        if (!hidden || !input || !selected) return;
        const code = String(hidden.value || '').toUpperCase();
        if (ISO_CODES.includes(code)) {
            input.value = displayName(code);
            selected.textContent = `${flagFor(code)} ${displayName(code)} · ${code}`;
            selected.classList.remove('hidden');
        }
        root.querySelector('#mizan-country-options')?.classList.add('hidden');
    }

    global.MizanCountry = Object.freeze({ISO_CODES,names:ENGLISH_NAMES,displayName,normalize,init:createPicker,refresh});
    document.addEventListener('DOMContentLoaded', createPicker);
    global.addEventListener('mizanLanguageChanged', () => { createPicker(); refresh(); });
})(window);
