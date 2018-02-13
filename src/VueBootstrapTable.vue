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
                        <li v-for="(column, index) in displayCols">
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
                    <th v-for="(column, index) in displayColsVisible" @click="sortBy($event, column.name)" :class="getColumnClasses(column)">
                        {{ column.title }}
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(entry, index) in filteredValuesSorted" x-track-by="id" @click="fireRowClickedEvent(entry)">
                    <td v-for="column in displayColsVisible" v-show="column.visible" :class="getCellClasses(column, entry)" @click="fireCellClickedEvent(column, entry)">
                        <vue-bootstrap-cell :column="column" :entry="entry" @changed-entry="changedEntry"></vue-bootstrap-cell>
                    </td>
                </tr>
                <tr class="footer">
                    <td v-for="(column, index) in displayColsVisible" v-show="column.visible" :class="getCellClasses(column)" @click="fireFooterCellClickedEvent(column)">
                        <vue-bootstrap-footer-cell :column="column" :values="filteredValuesSorted"></vue-bootstrap-footer-cell>
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
                    <button v-for="(pageNumber, index) in validPageNumbers"
                            type="button" class="btn btn-default"
                            :class="{ active: page===pageNumber }"
                            @click="page=pageNumber">
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
<script>

    import axios from 'axios';
    import qs from 'qs';
    import lodashorderby from 'lodash.orderby';
    import lodashincludes from 'lodash.includes';
    import lodashfindindex from 'lodash.findindex';
    import vueBootstrapCell from './VueBootstrapCell.vue';
    import vueBootstrapFooterCell from './VueBootstrapFooterCell.vue';



    export default {
        name: "VueBootstrapTable",
        components: {
            'vue-bootstrap-cell': vueBootstrapCell,
            'vue-bootstrap-footer-cell': vueBootstrapFooterCell,
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
                type: Array,
                required: false,
                default: function () {
                    return [];
                }
            }

        },
        data: function () {
            return {
                filterKey: "",
                sortKeys: [],
                sortOrders: [],
                columnMenuOpen: false,
                displayCols: [],
                filteredValues: [],
                page: 1,
                echo: 0,
                loading: false,
            };
        },
        mounted: function () {
            console.log('table.mounted');

            this.loading = true;
            this.setComputedValues();
            this.setSorting();
            this.setColumns();
            this.filterKey = this.defaultFilterKey;

            this.loading = false;
        },
        created: function () {
            console.log('table.created');

            this.$on('cellDataModifiedEvent', this.fireCellDataModifiedEvent);
        },
        beforeDestroy: function () {
            this.$off('cellDataModifiedEvent', this.fireCellDataModifiedEvent);
        },
        watch: {
            filteredValues: function() {
                console.log('watch: filteredValues');
            },
            values: function () {
                console.log('watch: values');
                this.processFilter();
            },
            columns: function () {
                console.log('watch: columns');
                this.setColumns();
            },
            showFilter: function () {
                // this.filterKey = "";
            },
            showColumnPicker: function () {
                console.log('watch: showColumnPicker');

                this.columnMenuOpen = false;

                this.displayCols.forEach(function (column) {
                    column.visible = true;
                });
            },
            filterKey: function () {
                console.log('watch: filterKey');
                // filter was updated, so resetting to page 1
                this.page = 1;
                this.processFilter();
            },
            sortKeys: function () {
                console.log('watch: sortKeys');
                this.processFilter();
            },
            sortOrders: function () {
                console.log('watch: sortOrders');
                this.processFilter();
            },
            page: function () {
                console.log('watch: page');
                this.processFilter();
            },
            paginated: function () {
                console.log('watch: paginated');
                this.processFilter();
            },
            loading: function () {
                console.log('watch: loading');
            },
            extraComputed: function() {
                console.log('watch: extraComputed');
            }
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
            filteredSize: function() {
                return this.values.length;
            },
            hasDefaultSorting: function () {
                return this.defaultSortKeys.length > 0;
            },

        },
        methods: {
            changedEntry: function(entry) {
                console.log('table.changedEntry', entry);

                let obj = this.values;
                let key = this.getKeyFromEntryId(this.values, entry);
                let val = entry;
                this.$set(obj, key, val);

                this.setComputedValues();
                this.processFilter();

            },
            getKeyFromEntryId: function(values, entry) {
                for(let i in values) {
                    if (values[i].id === entry.id) {
                        return i;
                    }
                }
            },
            fireCellDataModifiedEvent: function (originalValue, newValue, columnTitle, entry) {
                this.$parent.$emit('cellDataModifiedEvent', originalValue, newValue, columnTitle, entry);
            },
            sortFilteredValues: function () {
                return lodashorderby(this.filteredValues, this.sortKeys, this.sortOrders);
            },
            setComputedValues: function() {
                // set all computed column values
                for(var i in this.columns) {
                    if (typeof this.columns[i].computed === 'function') {
                        for (var j in this.values) {
                            var obj = this.values;
                            var prop = j;
                            var entry = this.values[j];
                            var name = this.columns[i].name;

                            var params = {
                                column: this.columns[i],
                                entry: entry
                            };
                            // var value = this.getExtraComputed( this.columns[i].computed, params);
                            var value = this.columns[i].computed(params);

                            entry[ name ] = value;

                            this.$set(obj, prop, entry);
                            //console.log('$set', obj[j], name, value);
                            //this.$set(obj[j], name, value);
                        }
                    }
                }


            },
            processFilter: function () {
                let self = this;

                if (this.loading) {
                    return;
                }

                if (this.ajax.enabled && this.ajax.delegate) {
                    this.fetchData(function (data) {
                        self.values = data.values;
                        self.filteredValues = data.filteredValues;
                        self.loading = false;
                    });
                } else {

                    let q = self.filterKey + "";

                    if (q) {

                        console.log('Filtering on ', q);
                        this.filteredValues = this.values.filter(entry => {

                            let i = 0;
                            let haystack = "";
                            let column = [];

                            if (!self.filterCaseSensitive) {
                                q = q.toLowerCase();
                            }

                            for (let i in self.displayColsVisible) {

                                column = self.displayColsVisible[i];

                                haystack = entry[column.name] || "";

                                if (!self.filterCaseSensitive && typeof haystack === 'string') {
                                    haystack = haystack.toLowerCase();
                                }

                                // console.log('lodashincludes', haystack, q);
                                if (lodashincludes(haystack, q)) {
                                    return true;
                                }
                            }
                            return false;
                        });
                    } else {

                        console.log('No filtering');
                        this.filteredValues = this.values;
                    }


                    // Pagination
                    if (this.paginated) {
                        let startIndex = (this.page - 1) * this.pageSize;
                        let index = 0;
                        let result = [];
                        while (index < this.pageSize) {
                            if (typeof this.filteredValues[startIndex + index] !== "undefined") {
                                result.push(this.filteredValues[startIndex + index]);
                            }
                            index++;
                        }
                        this.filteredValues = result;
                    }

                    this.loading = false;
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
                this.displayCols = [];
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


