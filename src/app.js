import VueBootstrapTable from './VueBootstrapTable.vue';

var myJSONFunction = function () {
    return JSON.stringify(arguments);
};

var myCalculationFunction = function ({column, entry}) {
    return Math.round(entry.price * entry.amount*100)/100;
};

//  0              900         1000
//    ... success ... warning ... danger
var myValidationFunction = function({column, entry}) {

    var result = {};

    var min = 0;
    var threshold = 900;
    var max = 1000;

    var value = entry[column.name];

    if (value<min) {
        result = {
            'error': 1,
            'message': {
                'text': 'Lower than '+min,
                'class': 'alert alert-warning',
                'iconClass': 'glyphicon glyphicon-warning-sign'
            }
        }
    } else if (value>max) {
        result = {
            'error': 1,
            'message': {
                'text': 'Higher than '+max,
                'class': 'alert alert-warning',
                'iconClass': 'glyphicon glyphicon-warning-sign'
            }
        }
    } else if (value<threshold) {
        result = {
            'error': 0,
            'message': {
                'text': 'Ok',
                'class': 'alert alert-success',
                'iconClass': 'glyphicon glyphicon-ok'
            }
        }
    } else {
        result = {
            'error': 0,
            'message': {
                'text': 'Watch out, you are between '+threshold+' and '+max,
                'class': 'alert alert-warning',
                'iconClass': 'glyphicon glyphicon-exclamation-sign'
            }
        }
    }

    // console.log('myValidationFunction', arguments, result);

    return result;
}

var mySumFunction = function ({column, values}) {
    let result = 0;
    for (let i in values) {
        result = result + (values[i][ column.name ]*1);
    };
    return result;
};

var myMoneyFunction = function (value, {column, entry}) {
    if (value>0 || value<0) {
        return '&euro;'+value.toFixed(2).replace('.',',');
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
        messages: [
            {
                'text':'Welcome',
                'class':'alert alert-success',
                'render':function() {
                    return 'Welcome!';
                }
            }
        ],
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
                type: 'money'
            },
            {
                title: "Amount",
                name: "amount",
                visible: true,
                editable: true,
                footer: 'sum',
                type: 'integer'
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
                type: 'decimal',
                footer: 'sum',
            },
            {
                name: "computed_and_rendered_and_validated",
                title: "Computed, validated and rendered",
                visible: true,
                computed: myCalculationFunction,
                footer: mySumFunction,
                validate: myValidationFunction,
                render: 'return "&euro;"+(arguments[0]).toFixed(2);',
                type: 'decimal',
            }
        ],
        values:
            [

                {
                    // "id": 2,
                    "title": "jack",
                    "price": 1.00,
                    "amount": 12
                },
                {
                    "id": 4,
                    "title": "ana",
                    "price": 2.220,
                    "amount": 21
                },
                {
                    "id": 8,
                    "title": "mickey",
                    "price": 500.55,
                    "amount": 12
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
                    "id": 3,
                    "title": "joe",
                    "price": 1.50,
                    "amount": 87
                },
                {
                    "id": 7,
                    "title": "luigi",
                    "price": 2000,
                    "amount": 87
                },
                {
                    "id": 1,
                    "title": "mary",
                    "price": 0.00,
                    "amount": 12
                },
                {
                    "id": 11,
                    "title": "paul",
                    "price": 9.95,
                    "amount": 5
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