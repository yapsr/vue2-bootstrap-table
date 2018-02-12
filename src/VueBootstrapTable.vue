<template>
    <div id="maindiv" @click="closeDropdown" @keyup.esc="closeDropdown">
        <div class="col-sm-6">
            <div v-if="showFilter" style="padding-top: 10px;padding-bottom: 10px;">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Filter" v-model="filterKey">
                    <div class="input-group-addon">
                        <i class="glyphicon glyphicon-search"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <div v-if="showColumnPicker" style="padding-top: 10px;padding-bottom: 10px;float:right;">
                <div class="btn-group" :class="{'open' : columnMenuOpen}">
                    <button @click.stop.prevent="columnMenuOpen = !columnMenuOpen" @keyup.esc="columnMenuOpen = false"
                            type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true">
                        Columns <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                        <li v-for="column in displayCols">
                            <a href="#" @click.stop.prevent="toggleColumn(column)">
                                <i v-if="column.visible" class="glyphicon glyphicon-ok"></i> {{column.title}}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="col-sm-12">
            <div id="loadingdiv" :class="{'vue-table-loading': this.loading , 'vue-table-loading-hidden': !this.loading}">
                <div class="spinner"></div>
            </div>
            <table class="table table-bordered table-hover table-condensed table-striped vue-table">
                <thead>
                <tr>
                    <th v-for="column in displayColsVisible" @click="sortBy($event, column.name)"
                        track-by="column"
                        :class="getColumnClasses(column)">
                        {{ column.title }}
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="entry in filteredValuesSorted " track-by="entry" @click="fireRowClickedEvent(entry)">
                    <td v-for="column in displayColsVisible" track-by="column" v-show="column.visible" :class="getCellClasses(column, entry)" @click="fireCellClickedEvent(column, entry)">
                        <value-field-section :column="column" :entry="entry"></value-field-section>
                    </td>
                </tr>
                <tr class="footer">
                    <td v-for="column in displayColsVisible" track-by="column" v-show="column.visible" :class="getCellClasses(column)" @click="fireFooterCellClickedEvent(column)">
                        <span v-html="footerRendered(column)"></span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div v-if="paginated" class="col-sm-12">
            <div class="btn-toolbar" role="toolbar" aria-label="pagination bar">
                <div class="btn-group" role="group" aria-label="first page">
                    <button type="button" class="btn btn-default" @click="page=1">&laquo;</button>
                </div>
                <div class="btn-group" role="group" aria-label="pages">
                    <button v-for="index in validPageNumbers"
                            type="button" class="btn btn-default"
                            :class="{ active: page===index }"
                            @click="page=index">
                        {{index}}
                    </button>
                </div>
                <div class="btn-group" v-if="showPaginationEtc">...</div>
                <div class="btn-group" role="group" aria-label="last page">
                    <button type="button" class="btn btn-default" @click="page=maxPage">&raquo;</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    .vue-table {

    }

    /*#maindiv {
        content: " ";
        box-sizing: border-box;
        display:
        table; width: 100%;
    }
*/
    .vue-table-loading .spinner {
        border: 16px solid #f3f3f3; /* Light grey */
        border-top: 16px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
        position: absolute;
        left: 50%;
        top: 50%;
        margin: -60px 0 0 -60px;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .vue-table-loading {
        position: absolute;
        z-index: 99;
        background-color: #ddd;
        opacity: 0.5;
        width: 100%;
        height: 100%;
    }

    .vue-table-loading-hidden {
        display: none;
    }

    table.vue-table thead > tr > th {
        cursor: pointer;
        padding-right: 30px !important;
    }

    /*.vue-table th.active {
        color: red;
    }*/

    .vue-table .arrow {
        opacity: 1;
        position: relative;
    }

    .vue-table .arrow:after {
        position: absolute;
        bottom: 8px;
        right: 8px;
        display: block;
        font-family: 'Glyphicons Halflings';
        content: "\e150";
        /*
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 0;
        margin-left: 5px;
        opacity: 0.66;*/
    }

    .vue-table .arrow.asc:after {
        content: "\e155";
        /*
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 4px solid #000;
        */
    }

    .vue-table .arrow.desc:after {
        content: "\e156";
    }

    .vue-table td.editable {
        cursor: pointer;
    }

    .vue-table div.editable {
        width: 100%;
    }

    /*
    .vue-table .selected-cell {
        background-color: #F7C072;
    }

    .vue-table .selected-row {
        background-color: #FAE1BE !important;
    }
    */
</style>
<script>

    import axios from 'axios';
    import qs from 'qs';
    import lodashorderby from 'lodash.orderby';
    import lodashincludes from 'lodash.includes';
    import lodashfindindex from 'lodash.findindex';


    /* Field Section used for displaying and editing value of cell */
    let valueFieldSection = {
        template: '<div>' +
        '<span v-if="!column.editable" v-html="rendered"></span>' +
        '<span v-else-if="!enabled" @click="toggleInput" v-html="rendered"></span>' +
        '<span v-else>' +
        '  <input type="text" ref="inputfield"  class="form-control" v-model="datavalue" ' +
        '   @blur="saveThis" ' +
        '   @keyup.enter="saveThis" ' +
        '   @keyup.tab="saveThis" ' +
        '   @keyup.esc="cancelThis" ' +
        '   @keyup.down="onKeyDown" ' +
        '   @keyup.up="onKeyUp" ' +
        '   @keyup.left="onKeyLeft" ' +
        '   @keyup.right="onKeyRight"' +
        '></span></div>',
        props: ['column', 'entry'],
        data: function () {
            return {
                enabled: false,
                datavalue: "",
            }
        },
        computed: {
            rendered: function () {
                let value = this.$parent.sortValue(this.column, this.entry);
                if (typeof this.column.renderFunction==='function') {
                    return this.column.renderFunction(value, this.column, this.entry);
                } else {
                    return value;
                }
            }
        },
        methods: {
            saveThis: function () {
                let originalValue = this.entry[this.column.name];
                this.entry[this.column.name] = this.datavalue;
                this.enabled = !this.enabled;
                this.$parent.$emit('cellDataModifiedEvent', originalValue, this.datavalue, this.column.name, this.entry);
            },
            cancelThis: function () {
                console.log('cancelThis');
                this.datavalue = this.entry[this.column.name];
                this.enabled = false;
            },
            toggleInput: function () {
                console.log('toggleInput');
                this.enabled = !this.enabled;
                if (this.enabled) {
                    this.datavalue = this.entry[this.column.name];
                    this.$nextTick(() => this.$refs.inputfield.focus())
                }
            },
            onKeyDown: function () {
                console.log('onKeyDown');
                this.saveThis();
//                this.enabled = false;
            },
            onKeyUp: function () {
                console.log('onKeyUp');
                this.saveThis();
                //            this.enabled = !this.enabled;
            },
            onKeyLeft: function () {
                console.log('onKeyLeft');
                this.saveThis();
                //              this.enabled = !this.enabled;
            },
            onKeyRight: function () {
                console.log('onKeyRight');
                this.saveThis();
//                this.enabled = !this.enabled;
            },

        }
    };

    export default {
        name: "VueBootstrapTable",
        components: {
            'value-field-section': valueFieldSection,
        },
        props: {

            /**
             * The column titles, required
             */
            columns: {
                type: Array,
                required: true,
            },

            /**
             * The rows, an Array of objects
             */
            values: {
                type: Array,
                required: false,
            },

            /**
             * Enable/disable table sorting, optional, default true
             */
            sortable: {
                type: Boolean,
                required: false,
                default: true,
            },
            /**
             * Enable/disable table multicolumn sorting, optional, default false.
             * Also sortable must be enabled for this function to work.
             */
            multiColumnSortable: {
                type: Boolean,
                required: false,
                default: false,
            },

            /**
             * Array of sort keys to start with
             *
             * Example: ['votes'] or ['votes', 'id']
             *
             */
            defaultSortKeys: {
                type: Array,
                required: false,
                default: function () {
                    return [];
                }
            },

            /**
             * Array of sort orders to start with, corresponding with defaultSortKeys
             *
             * Example: ['asc'] or ['desc', 'asc']
             *
             */
            defaultSortOrders: {
                type: Array,
                required: false,
                default: function () {
                    return [];
                }
            },


            /**
             * Enable/disable input filter, optional, default false
             */
            showFilter: {
                type: Boolean,
                required: false,
                default: false,
            },
            /**
             * Default filter key value
             */
            defaultFilterKey: {
                type: String,
                required: false,
                default: "",
            },

            /**
             * Define if Filter search field is to work in a case Sensitive way. Default: true
             */
            filterCaseSensitive: {
                type: Boolean,
                required: false,
                default: true,
            },

            /**
             * Enable/disable column picker to show/hide table columns, optional, default false
             */
            showColumnPicker: {
                type: Boolean,
                required: false,
                default: false,
            },

            /**
             * Enable/disable pagination for the table, optional, default false
             */
            paginated: {
                type: Boolean,
                required: false,
                default: false,
            },

            /**
             * If pagination is enabled defining the page size, optional, default 10
             */
            pageSize: {
                type: Number,
                required: false,
                default: 10,
            },

            /**
             * If loading of table is to be done through ajax, then this object must be set
             */
            ajax: {
                type: Object,
                required: false,
                default: function () {
                    return {
                        enabled: false,
                        url: "",
                        method: "GET",
                        delegate: false,
                        axiosConfig: {}
                    }
                }
            },

            extraComputed: {
                type: Object,
                required: false,
                default: function () {
                    return {};
                }
            }

        },
        data: function () {
            return {
                filteredSize: 0,
                filterKey: "",
                sortKeys: [],
                sortOrders: {},
                sortChanged: 1,
                columnMenuOpen: false,
                displayCols: [],
                filteredValues: [],
                page: 1,
                echo: 0,
                loading: false,
            };
        },
        mounted: function () {

            let self = this;

            this.loading = true;

            this.filterKey = this.defaultFilterKey;

            this.setSorting();

            this.setColumns();

            if (this.ajax.enabled) {
                if (!this.ajax.delegate) {
                    this.loading = true;
                    this.fetchData(function (data) {
                        self.values = data.data;
                        self.processFilter();
                    });
                } else {
                    this.processFilter();
                }
            } else {
                this.processFilter();
            }

        },
        created: function () {
            this.$on('cellDataModifiedEvent', this.fireCellDataModifiedEvent);
        },
        beforeDestroy: function () {
            this.$off('cellDataModifiedEvent', this.fireCellDataModifiedEvent);
        },
        watch: {
            values: function () {
                this.processFilter();
            },
            columns: function () {
                let self = this;
                this.displayCols = [];
                this.columns.forEach(function (column) {
                    let obj = self.buildColumnObject(column);
                    self.displayCols.push(obj);
                });
            },
            showFilter: function () {
                // this.filterKey = "";
            },
            showColumnPicker: function () {
                this.columnMenuOpen = false;

                this.displayCols.forEach(function (column) {
                    column.visible = true;
                });
            },
            filterKey: function () {
                // filter was updated, so resetting to page 1
                this.page = 1;
                this.processFilter();
            },
            sortKeys: function () {
                this.processFilter();
            },
            sortChanged: function () {
                this.processFilter();
            },
            page: function () {
                this.processFilter();
            },
            paginated: function () {
                this.processFilter();
            },
            loading: function () {
            },
        },
        computed: {
            filteredValuesSorted: function () {
                return this.sortFilteredValues()
            },

            displayColsVisible: function () {
                let displayColsVisible = [];
                for (let a in this.displayCols) {
                    if (this.displayCols[a].visible)
                        displayColsVisible.push(this.displayCols[a]);
                }
                return displayColsVisible;
            },

            validPageNumbers: function () {
                // 5 page max
                let result = [];
                let start = 1;
                if (this.page > 3)
                    start = this.page - 2;
                for (let i = 0; start <= this.maxPage && i < 5; start++) {
                    result.push(start);
                    i++;
                }
                return result;
            },
            maxPage: function () {
                return Math.ceil(this.filteredSize / this.pageSize);
            },
            showPaginationEtc: function () {
                let temp = 1;
                if (this.page > 3)
                    temp = this.page - 2;
                return ((temp + 4) < this.maxPage);
            },
            hasDefaultSorting: function () {
                return this.defaultSortKeys.length > 0;
            },

        },
        methods: {
            footerRendered: function(column) {

                let value = null;

                if (column.footerComputed) {
                    value = this.extraComputed[column.footerComputed](column, this.filteredValues, this.values);
                }

                if (typeof value !=='undefined') {
                    if (typeof column.footerRenderFunction === 'function') {
                        return column.footerRenderFunction(value, column, this.filteredValues, this.values);
                    } else {
                        return value;
                    }
                }

            },
            sortValue: function (column, entry) {
                let result = '';
                if (column.computed) {
                    result = this.getExtraComputed(column, entry);
                } else {
                    result = entry[column.name];
                }
                // console.log('sortValue', column.name, entry, result);
                return result;
            },
            getExtraComputed(column, entry) {
                return this.extraComputed[column.computed](column, entry);
            },
            fireCellDataModifiedEvent: function (originalValue, newValue, columnTitle, entry) {
                this.$parent.$emit('cellDataModifiedEvent', originalValue, newValue, columnTitle, entry);
            },
            sortFilteredValues: function () {
                return lodashorderby(this.filteredValues, this.sortKeys, this.sortOrders);
            },
            processFilter: function () {
                let self = this;
                let result = [];

                this.loading = true;

                if (this.ajax.enabled && this.ajax.delegate) {
                    this.fetchData(function (data) {
                        self.filteredSize = data.filtered;
                        self.filteredValues = data.data;
                        self.loading = false;
                    });
                } else {

                    let column = [];
                    let computedColumnName;
                    let computedColumnValue;

                    for (let i in this.values) {
                        for (let j in self.displayColsVisible) {
                            column = self.displayColsVisible[j];
                            this.values[i][ column.name ] = this.sortValue(column, this.values[i]);;
                        }
                    }

                    result = this.values;

                    let result = this.values.filter(entry => {

                        let i = 0;
                        let haystack = "";
                        let column = [];
                        let q = self.filterKey + "";
                        if (!self.filterCaseSensitive) {
                            q = q.toLowerCase();
                        }

                        for (let i in self.displayColsVisible) {
                            column = self.displayColsVisible[i];
                            haystack = self.sortValue(column, entry) || "";
                            // console.log(i, column, entry, haystack);
                            if (!self.filterCaseSensitive && typeof haystack === 'string') {
                                haystack = haystack.toLowerCase();
                            }

                            if (lodashincludes(haystack, q)) {
                                return true;
                            }
                        }
                        return false;
                    })

                    this.filteredSize = result.length;
                    if (this.paginated) {
                        let startIndex = (this.page - 1) * this.pageSize;
                        let tIndex = 0;
                        let tempResult = [];
                        while (tIndex < this.pageSize) {
                            if (typeof result[startIndex + tIndex] !== "undefined")
                                tempResult.push(result[startIndex + tIndex]);
                            tIndex++;
                        }
                        this.filteredValues = tempResult;
                    } else {
                        this.filteredValues = result;
                    }

                    self.loading = false;
                }

                this.fireFilterModifiedEvent(this.filterKey);

            },
            fetchData: function (dataCallBackFunction) {
                let self = this;
                let ajaxParameters = {
                    params: {}
                };
                this.echo++;
                if (this.ajax.enabled && this.ajax.delegate) {
                    if (this.ajax.method === "GET") {
                        //COPY
                        ajaxParameters = JSON.parse(JSON.stringify(this.ajax.axiosConfig));
                        ajaxParameters.params = {};
                        ajaxParameters.params.sortcol = this.sortKeys;
                        ajaxParameters.params.sortdir = this.sortOrders;
                        ajaxParameters.params.filter = this.filterKey;
                        if (self.paginated) {
                            ajaxParameters.params.page = this.page;
                            ajaxParameters.params.pagesize = this.pageSize;
                        } else {
                            ajaxParameters.params.page = 1;
                            ajaxParameters.params.pagesize = null;
                        }
                        ajaxParameters.params.echo = this.echo;
                    }
                    if (this.ajax.method === "POST") {
                        ajaxParameters.sortcol = this.sortKeys;
                        ajaxParameters.sortdir = this.sortOrders;
                        ajaxParameters.filter = this.filterKey;
                        if (self.paginated) {
                            ajaxParameters.page = this.page;
                            ajaxParameters.pagesize = this.pageSize;
                        } else {
                            ajaxParameters.page = 1;
                            ajaxParameters.pagesize = null;
                        }
                        ajaxParameters.echo = this.echo;
                    }
                }
                if (this.ajax.enabled && !this.ajax.delegate) {
                    if (this.ajax.method === "GET") {
                        //COPY
                        ajaxParameters = JSON.parse(JSON.stringify(this.ajax.axiosConfig));
                        ajaxParameters.params = {};
                    }
                    if (this.ajax.method === "POST") {
                        // Do nothing at this point !
                    }
                }
                if (this.ajax.enabled && this.ajax.method === "GET") {
                    axios.get(self.ajax.url, ajaxParameters)
                        .then(response => {
                            if (this.ajax.delegate) {
                                if (response.data.echo !== self.echo) {
                                    return;
                                }
                            }
                            dataCallBackFunction(response.data);
                            this.$parent.$emit('ajaxLoadedEvent', response.data);
                        })
                        .catch(e => {
                            this.$parent.$emit('ajaxLoadingError', e);
                        });
                }
                if (this.ajax.enabled && this.ajax.method === "POST") {
                    axios.post(self.ajax.url, qs.stringify(ajaxParameters), this.ajax.axiosConfig)
                        .then(response => {
                            if (this.ajax.delegate) {
                                if (response.data.echo !== self.echo) {
                                    return;
                                }
                            }

                            dataCallBackFunction(response.data);
                            this.$parent.$emit('ajaxLoadedEvent', response.data);

                        })
                        .catch(e => {
                            this.$parent.$emit('ajaxLoadingError', e);
                        });
                }
            },
            buildColumnObject: function (column) {
                let obj = {};
                obj.title = column.title;
                if (typeof column.name !== "undefined")
                    obj.name = column.name;
                else
                    obj.name = column.title;
                if (typeof column.visible !== "undefined")
                    obj.visible = column.visible;
                else
                    obj.visible = true;
                if (typeof column.editable !== "undefined")
                    obj.editable = column.editable;
                else
                    obj.editable = false;
                if (typeof column.renderFunction !== "undefined")
                    obj.renderFunction = column.renderFunction;
                else
                    obj.renderFunction = false;
                if (typeof column.computed !== "undefined")
                    obj.computed = column.computed;
                else
                    obj.computed = false;
                if (typeof column.footerComputed !== "undefined")
                    obj.footerComputed = column.footerComputed;
                else
                    obj.footerComputed = false;
                if (typeof column.footerRenderFunction !== "undefined")
                    obj.footerRenderFunction = column.footerRenderFunction;
                else
                    obj.footerRenderFunction = false;
                if (typeof column.columnClasses !== "undefined")
                    obj.columnClasses = column.columnClasses;
                else
                    obj.columnClasses = "";
                if (typeof column.cellClasses !== "undefined")
                    obj.cellClasses = column.cellClasses;
                else
                    obj.cellClasses = "";

                return obj;
            },
            setColumns: function () {
                let self = this;
                this.columns.forEach(function (column) {
                    let obj = self.buildColumnObject(column);
                    self.displayCols.push(obj);
                });
            },
            setSorting: function () {
                if (this.hasDefaultSorting) {
                    this.setDefaultSorting();
                } else {
                    this.sortKeys = [];
                    this.sortOrders = [];
                }
            },

            /**
             * Example: { "votes":"desc", "id":"asc" }
             *
             * Sets
             * this.sortKeys = ['votes', 'id']
             * this.sortOrders = ['desc', 'asc']
             */
            setDefaultSorting: function () {
                this.sortKeys = this.defaultSortKeys;
                this.sortOrders = this.defaultSortOrders;
            },
            resetSortOrders: function () {
                this.sortOrders = [];
            },
            sortBy: function (event, key) {

                if (this.sortable) {

                    let pos = 0;

                    if (!this.multiColumnSortable || (this.multiColumnSortable && !event.shiftKey)) {
                        this.sortKeys = [key];
                        // this.columns.forEach(function (column) {
                        //     if (column.name !== key) {
                        //         self.sortOrders[column.name] = "";
                        //     }
                        // });
                    } else {
                        if (lodashfindindex(this.sortKeys, function (o) {
                                return o === key;
                            }) === -1) {
                            this.sortKeys.push(key);
                        }
                        pos = this.sortKeys.indexOf(key);
                    }

                    if (pos > this.sortKeys.length - 1) {
                        this.sortKeys[pos] = "asc"
                    } else if (this.sortOrders[pos] === "asc") {
                        this.sortOrders[pos] = "desc";
                    } else {
                        this.sortOrders[pos] = "asc";
                    }

                    this.sortChanged = this.sortChanged * -1;

                    this.fireSortModifiedEvent(this.sortKeys, this.sortOrders);

                }
            },
            getColumnClasses: function (column) {
                let classes = [column.columnClasses];
                let key = column.name;
                if (this.sortable) {
                    classes.push("arrow");
                    /*if (this.sortKeys === key) {
                        classes.push("active");
                    }*/
                    if (lodashfindindex(this.sortKeys, function (o) {
                            return o === key;
                        }) !== -1) {
                        classes.push("active");
                    }

                    let pos = this.sortKeys.indexOf(key);
                    if (this.sortOrders[[pos]] === "asc") {
                        classes.push("asc");
                    } else if (this.sortOrders[pos] === "desc") {
                        classes.push("desc");
                    }
                }
                return classes;
            },
            getCellClasses: function (column, entry) {
                let result = column.cellClasses;
                if (column.editable) {
                    result = result + " editable";
                }
                return result;
            },
            toggleColumn: function (column) {
                column.visible = !column.visible;
                this.fireColumnToggledEvent(column);
            },
            closeDropdown: function () {
                this.columnMenuOpen = false;
            },
            fireColumnToggledEvent: function (column) {
                this.$parent.$emit('columnToggledEvent', column, this.displayColsVisible);
            },
            fireFilterModifiedEvent: function (filter, sort) {
                this.$parent.$emit('filterModifiedEvent', filter, sort);
            },
            fireSortModifiedEvent: function (sortKeys, sortOrders) {
                this.$parent.$emit('sortModifiedEvent', sortKeys, sortOrders)
            },
            fireRowClickedEvent: function (entry) {
                this.$parent.$emit('rowClickedEvent', entry);
            },
            fireCellClickedEvent: function (entry, column) {
                this.$parent.$emit('cellClickedEvent', entry, column);
            },
            fireFooterCellClickedEvent: function (column) {
                this.$parent.$emit('footerCellClickedEvent', column);
            }
        },
        events: {}
    }
</script>
