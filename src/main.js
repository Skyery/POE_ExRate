class POE_ExRate {
    constructor(pre, nex, searchBtn, store, items) {
        this.JSON_default = {
            "query": {
                "status": {
                    "option": "online"
                },
                "type": "崇高石",
                "stats": [{
                    "type": "and",
                    "filters": []
                }],
                "filters": {
                    "trade_filters": {
                        "filters": {
                            "sale_type": {
                                "option": "priced"
                            },
                            "price": {
                                "option": "chaos",
                                "min": 1
                            }
                        }
                    }
                }
            },
            "sort": {
                "price": "asc"
            }
        }
        this.id = '';
        this.total = '';
        this.result = [];
        this.wisper = [];
        this.pre = pre;
        this.nex = nex;
        this.searchBtn = searchBtn;
        this.store = store;
        this.items = items;
    }
    setup() {
        this.searchJSON();
        this.addListener();
    }
    addListener() {
        this.pre.addEventListener('change', () => {
            this.handleSelectChange(this.pre.value);
        })
        this.nex.addEventListener('change', () => {
            this.handleSelectChange('', this.nex.value);
        })
        this.searchBtn.addEventListener('click', () => {
            this.resetAll();
            this.postAPI();
        })
    }
    postAPI() {
        axios.post(`https://web.poe.garena.tw/api/trade/search/祭祀聯盟`, this.JSON_default)
            .then((res) => {
                res.status === 200 ? this.resultFilter(res.data) : console.log(res.status);
            })
            .catch((err) => {
                console.log(err);
            })
    }
    getAPI(result) {
        axios.get(`https://web.poe.garena.tw/api/trade/fetch/${result}?query=${this.id}`)
            .then((res) => {
                res.status === 200 ? this.dataFilter(res.data.result) : console.log(res.status);
            })
            .catch((err) => {
                console.log(err);
            })
    }
    searchJSON() {
        this.JSON_default.query.type = this.pre.value;
        this.JSON_default.query.filters.trade_filters.filters.price.option = this.nex.value;
    }
    handleSelectChange(pre = '', nex = '') {
        if (pre) {
            this.pre.value = pre;
        } else {
            this.nex.value = nex;
        }
        this.searchJSON();
    }
    resultFilter(data) {
        if (data.total === 0) this.store.classList.add('close');

        this.id = data.id;
        this.total = data.total;
        data.result.forEach((el, index) => {
            let idx = index <= 9 ? 0 : parseInt((index % 100) / 10);
            if (!Array.isArray(this.result[idx])) {
                this.result[idx] = [];
            }
            this.result[idx].push(el);
        });
        this.result.forEach(el => {
            this.getAPI(el);
        })
    }
    dataFilter(data) {
        data.sort((a, b) => {
            return a.listing.price.amount - b.listing.price.amount;
        })

        // https://web.poe.garena.tw/trade/search/祭祀聯盟/${this.id}   ~* 官方賣場 *~
        this.store.href = `https://web.poe.garena.tw/trade/search/祭祀聯盟/${this.id}`;
        this.store.classList.remove('close');

        // data[0].listing.price.amount                                ~* 價格 *~
        // data[0].listing.whisper                                     ~* 密語 *~
        data.forEach(el => {
            let item = document.createElement('div');
            let innerHTML = `
            <p>報價：</p>
            <div class="price">${el.listing.price.amount} x</div>
            <img src="./images/${this.nex.value}.png">
            <a href="#" class="wisper"><i class="fa fa-comment"></i></a>
            `;
            item.className = 'item';
            item.innerHTML = innerHTML;
            this.items.appendChild(item);

            this.wisper.push(el.listing.whisper);
        })
        this.wisperSelector();
    }
    wisperSelector() {
        const wispers = document.querySelectorAll('.wisper');
        wispers.forEach((el, index) => {
            el.addEventListener('click', () => {
                let copy = document.createElement('input');
                document.body.appendChild(copy);
                copy.value = this.wisper[index];
                copy.select();
                document.execCommand('copy');
                document.body.removeChild(copy);
            })
        })
    }
    resetAll() {
        Array.from(this.items.children).forEach(el => {
            el.remove();
        })
        this.wisper.length = 0;
        this.result.length = 0;
    }
}


(function () {
    const searchBtn = document.querySelector('.searchBtn');
    const pre = document.querySelector('#pre_currencies');
    const nex = document.querySelector('#nex_currencies');
    const store = document.querySelector('.store');
    const items = document.querySelector('.items');

    const app = new POE_ExRate(pre, nex, searchBtn, store, items);

    app.setup();
})()