import VueBootstrapTable from './VueBootstrapTable.vue';

var myJSONFunction = function () {
    return JSON.stringify(arguments);
};

var myCalculationFunction = function ({column, entry}) {
    return Number(entry.id) * Number(entry.amount);
};

var mySumFunction = function ({column, values}) {
    let result = 0;
    for (let i in values) {
        result = result + (values[i][ column.name ]*1);
    };
    return result;
};

var myMoneyFunction = function (value, {column, entry}) {
    if (value>0 || value<0) {
        return '&euro;'+value;
    }
    return "";
};


Vue.config.debug = true;
Vue.config.devtools = true;

new Vue({
    el: '#app',
    components: {
        VueBootstrapTable,
    },
    data: {
        logging: [],
        showFilter: true,
        showPicker: true,
        paginated: true,
        multiColumnSortable: true,
        defaultFilterKey: "",
        defaultSortKeys: ['amount', 'id'],
        defaultSortOrders: ['desc', 'asc'],
        extendedMethods: {
            'calculation': myCalculationFunction,
            'sum': mySumFunction,
            'money': myMoneyFunction
        },
        ajax: {
            enabled: false,
            url:
                "http://localhost:9430/data/test",
            method:
                "GET",
            delegate:
                true,
            axiosConfig:
                {
                    headers: {
                        'Authorization':
                            'Bearer TESTTESTTESTTESTTEST'
                    }
                }
        }
        ,
        columns: [
            {
                title: "Id",
                name: "id",
                columnClasses: "columnClassesTest",
                cellClasses: "cellClassesTest"
            },
            {
                title: "Name",
                name: "title",
                visible: true,
                editable: true,
            },
            {
                title: "Price",
                name: "price",
                visible: true,
                editable: true,
                render: myMoneyFunction,
            },
            {
                title: "Amount",
                name: "amount",
                visible: true,
                editable: true,
                footer: 'sum',
            },
            {
                name: "json",
                title: "JSON",
                visible: false,
                render: myJSONFunction
            },
            {
                name: "computed",
                title: "Computed",
                visible: true,
                computed: 'calculation',
                footer: 'sum',
            },
            {
                name: "computed_and_rendered",
                title: "Computed and rendered",
                visible: true,
                computed: myCalculationFunction,
                footer: mySumFunction,
                render: 'return "&euro;"+(arguments[0]);',
            }
        ],
        values:
            [

                {
                    "id": 1,
                    "title": "mary",
                    "price": 0.00,
                    "amount": 12
                },
                {
                    "id": 2,
                    "title": "jack",
                    "price": 1.00,
                    "amount": 12
                },
                {
                    "id": 3,
                    "title": "joe",
                    "price": 1.50,
                    "amount": 87
                },
                {
                    "id": 4,
                    "title": "ana",
                    "price": 2.220,
                    "amount": 21
                },
                {
                    "id": 5,
                    "title": "rita",
                    "price": 4.20,
                    "amount": 87
                },
                {
                    "id": 6,
                    "title": "mario",
                    "price": 1000.01,
                    "amount": 12
                },
                {
                    "id": 7,
                    "title": "luigi",
                    "price": 2000,
                    "amount": 87
                },
                {
                    "id": 8,
                    "title": "mickey",
                    "price": 500.55,
                    "amount": 12
                },
                {
                    "id": 9,
                    "title": "donald",
                    "price": 80,
                    "amount": 12
                },
                {
                    "id": 10,
                    "title": "juliet",
                    "price": 99.95,
                    "amount": 0
                },
                {
                    "id": 11,
                    "title": "paul",
                    "price": 9.95,
                    "amount": 5
                }

            ]
    },
    mounted: function() {
    },
    created: function () {



        this.$on('cellDataModifiedEvent',
            function (originalValue, newValue, columnTitle, entry) {
                this.logging.push("cellDataModifiedEvent - Original Value : " + originalValue +
                    " | New Value : " + newValue +
                    " | Column : " + columnTitle +
                    " | Complete Entry : " + entry);
            }
        );

        this.$on('ajaxLoadedEvent',
            function (data) {
                this.logging.push("ajaxLoadedEvent - data : " + data);
            }
        );

        this.$on('ajaxLoadingError',
            function (error) {
                this.logging.push("ajaxLoadingError - error : " + error);
            }
        );

        this.$on('columnToggledEvent', function (column, visibleColumns) {
            this.logging.push('Column toggled ' + column.name +
                " | Visible columns : " + JSON.stringify(visibleColumns))
        });

        this.$on('filterModifiedEvent', function (value) {
            this.logging.push('Filter modified : ' + value)
        });

        this.$on('sortModifiedEvent', function (keys, orders) {
            this.logging.push('Sort modified: ' + keys + ', ' + orders)
        });

        this.$on('rowClickedEvent', function (entry) {
            this.logging.push('Row clicked: ' + JSON.stringify(entry)
            )
        });

        this.$on('cellClickedEvent', function (entry, column) {
            this.logging.push('Cell clicked: ' + column +
                ' | entry: ' + JSON.stringify(entry.name)
            )
        });

    }
    ,
    methods: {
        addItem: function () {
            var item = {
                "id": this.values.length + 1,
                "name": "name " + (this.values.length + 1)
            };
            this.values.push(item);
        }
        ,
        toggleFilter: function () {
            this.showFilter = !this.showFilter;
        }
        ,
        togglePicker: function () {
            this.showPicker = !this.showPicker;
        }
        ,
        togglePagination: function () {
            this.paginated = !this.paginated;
        }
    }
    ,
})
;