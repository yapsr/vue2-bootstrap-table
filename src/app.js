import VueBootstrapTable from './VueBootstrapTable.vue';

var myRenderJSONFunction = function (column, entry) {
    return JSON.stringify(entry);
};

var myCalculationFunction = function (column, entry) {
    return Number(entry.id) * Number(entry.votes);
};

var myCalculationSumFunction = function (column, filteredEntries, allEntries) {
    let result = 0;
    for (let i in filteredEntries) {
        result += Number(filteredEntries[i][ column.name ]);
    };
    return result;
};

var myRenderMoneyFunction = function (value, column, entry) {
    return '&euro;'+value;
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
        defaultSortKeys: ['votes', 'id'],
        defaultSortOrders: ['desc', 'asc'],
        extraComputed: {
            'calculation': myCalculationFunction,
            'calculationSum': myCalculationSumFunction
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
                title: "Votes",
                name: "votes",
                visible: true,
                editable: true,
                footerComputed: 'calculationSum'
            },
            {
                name: "json",
                title: "JSON",
                visible: false,
                renderFunction: myRenderJSONFunction
            },
            {
                name: "computed",
                title: "Computed",
                visible: true,
                computed: 'calculation',
                footerComputed: 'calculationSum',
            },
            {
                name: "computed_and_rendered",
                title: "Computed and rendered",
                visible: true,
                computed: 'calculation',
                renderFunction: myRenderMoneyFunction,
                footerComputed: 'calculationSum',
                footerRenderFunction: myRenderMoneyFunction
            }
        ],
        values:
            [

                {
                    "id": 1,
                    "title": "mary",
                    "votes": 12
                },
                {
                    "id": 2,
                    "title": "jack",
                    "votes": 12
                },
                {
                    "id": 3,
                    "title": "joe",
                    "votes": 87
                },
                {
                    "id": 4,
                    "title": "ana",
                    "votes": 21
                },
                {
                    "id": 5,
                    "title": "rita",
                    "votes": 87
                },
                {
                    "id": 6,
                    "title": "mario",
                    "votes": 12
                },
                {
                    "id": 7,
                    "title": "luigi",
                    "votes": 87
                },
                {
                    "id": 8,
                    "title": "mickey",
                    "votes": 12
                },
                {
                    "id": 9,
                    "title": "donald",
                    "votes": 12
                },
                {
                    "id": 10,
                    "title": "juliet",
                    "votes": 0
                },
                {
                    "id": 11,
                    "title": "paul",
                    "votes": 5
                }

            ]
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