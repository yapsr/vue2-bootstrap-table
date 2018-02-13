# yapsr-vue2-bootstrap-table

yapsr-vue2-bootstrap-table is a sortable and searchable table, with Bootstrap styling, for VueJs 2+.

## Features

* Sortable
* Multicolumn Sorting
* Searchable
* Select display columns
* Pagination
* On Table Editing
* Remote data loading
* Remote data processing
* Events


## Requirements

* Vue 2.* (tested with 2.5.13)
* Bootstrap 3 css


## Installation

Install the vue-bootstrap-table [package](https://www.npmjs.org/package/vue2-bootstrap-table2) package using [npm](https://www.npmjs.com/):

	npm install yapsr-vue2-bootstrap-table2



## Usage

```javascript

    new Vue({
        el: '#app',
        components: {
            VueBootstrapTable: VueBootstrapTable
        },
        data: {
            columns: [
                {
                    title:"id",
                },
                {
                    title:"name",
                    visible: true,
                    editable: true,
                },
                {
                    title:"age",
                    visible: true,
                    editable: true,
                },
                {
                    title:"country",
                    visible: true,
                    editable: true,
                }
            ],
            values: [
                {
                    "id": 1,
                    "name": "John",
                    "country": "UK",
                    "age": 25,
                },
                {
                    "id": 2,
                    "name": "Mary",
                    "country": "France",
                    "age": 30,
                },
                {
                    "id": 3,
                    "name": "Ana",
                    "country": "Portugal",
                    "age": 20,
                }
            ]
        },
    });
```` 


````html

    <vue-bootstrap-table
            :columns="columns"
            :values="values"
            :show-filter="true"
            :show-column-picker="true"
            :sortable="true"
            :paginated="true"
            :multi-column-sortable=true
            :filter-case-sensitive=false

    >
    </vue-bootstrap-table>
```` 

## Configuration Props

```javascript

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
            required: true,
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
         * Enable/disable input filter, optional, default false
         */
        showFilter: {
            type: Boolean,
            required: false,
            default: false,
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
    },

```

### Column Array Definition

The `columns` array takes object of type:

```javascript
{
    title: String,              // Mandatory: Title to be presented on the Table
    name: String,               // Optional: The name of the "data" property. If nothing, title is used.
    visible: Boolean,              // Optional: column visible? (Default: true)
    editable: Boolean,            // Optional: column cells editable? (Default: false)
    columnClasses: String         // Optional: styles to be applied to the Column Header
    cellClasses: String           // Optional: styles to be applied to the Cells of this column
    render: Function    // Optional: Function that receives as input the column name and entry, and returns an HTML String for drawing cell
}
```

#### Column Definition Examples

Column with Title "Id" , which is visible but not editable:

```javascript
{
    title:"Id",
}
```
Column with Title "Name" , which is visible and editable:

```javascript
{
    title:"Name",
    visible: true,
    editable: true,
}
```

#### Render Function Example

For a Column definition like so:

```javascript
columns: [
    {
        title: "Test",
        visible: true,
        render: myTestRender
    }
],
```

There must be a javascript function called `myTestRender`  :

```javascript
<script>
    var myTestRender = function (colname, entry) {
        return '<div class="btn-group" role="group" >'+
            '  <button type="button" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>'+
            '  <button type="button" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
            '</div><span>'+JSON.stringify(entry)+'</span>';
    };
</script>
```


Where event in the `MouseEvent` and `entry` e the complete entry corresponding to the row.

### AJAX Configuration

Ajax Object properties:

* enabled : to enable loading through ajax call, enable this
* url: the URL where to request the data
* methods: GET and POST are the valid methods allowed
* delegate: False = just get all the data and do processing on browser;  True = Ask for data as needed, and all processing is done on the server side.
* axiosConfig: check [Axios Page](https://github.com/mzabriskie/axios) for information regarding Method Config.

#### Example AJAX config for Remote Loading

This configuration will only make one request to the server, to get all the data and load it straight into the browser.

```javascript
ajax: {
    enabled: true,
    url: "http://localhost:9430/data/test",
    method: "GET",
    delegate: false,
    axiosConfig: {}
},
```

#### Example AJAX config for Remote Processing

This configuration will only make many requests to the server, each time data ir needed, or any processing is required: for filtering, ordering, pagniation, changes of page size, etc.

```javascript
ajax: {
    enabled: true,
    url: "http://localhost:9430/data/test",
    method: "GET",
    delegate: true,
    axiosConfig: {
        headers: {
            'Authorization': 'Bearer TESTTESTTESTTESTTEST'
        }
    }
},
```

### Ajax Request and Expected Response

#### Ajax Request Parameters Sent

When Ajax is enabled, the following parameters are sent with each request for the URL specified:

 - `sortcol` : Array of String columns to sort (only sent when `delegate` is true, otherwise will be null)
 - `sortdir` : Array of sorting directions for each column on sortcol, "ASC" or "DESC" (only sent when `delegate` is true, otherwise will be null)
 - `filter` : The filter to be used  (only sent when `delegate` is true, otherwise will be null)
 - `page` : The number of the page being requested ( when delegate is false, it will always be 1 )
 - `pagesize` : The number of records being requested.
 - `echo` : A unique number for the request.

##### When using GET

 - `sortcol` : is sent in the following format  `sortcol[]=COLNAME&sortcol[]=COLNAME`
 - `sortdir` : is sent in the following format  `sortdir[]=ASC&sortdir[]=DESC`

This is performed automatically by AXIOS

##### When using POST

 - `sortcol` : is sent in the following format  `sortcol[0]=COLNAME ; sortcol[1]=COLNAME; `
 - `sortdir` : is sent in the following format  `sortdir[0]=ASC ; sortdir[1]=DESC`

This is performed automatically by AXIOS

#### Ajax Expected Response

For all requests, vue-bootstrap-table expects an object of the following type:

```javascript
{
    echo: INTEGER,
    filtered: INTEGER,
    data: [OBJECT],
},
```

Where:

- `echo` : is the same integer the request provided.
- `filtered` : is the total amount of entries for the request, and is used for pagination
- `data` : is an Array of Object with the entries.

Example:

```javascript
{
    echo: 1,
    filtered: 2000,
    data: [
        {
            id: 1,
            name: "Rui"
        },
        {
            id: 2,
            name: "Gustavo"
        },
    ],
},
```

## Events

* `cellDataModifiedEvent` - When a cell is edited, an `cellDataModifiedEvent` event is dispatched.
* `ajaxLoadedEvent` -  When ajax call is executed successfully an `ajaxLoadedEvent` event is dispatched.
* `ajaxLoadingError` - When ajax call is executed unsuccessfully an  `ajaxLoadingError` event is dispatched.
* `columnToggledEvent` - When a column was toggled 
* `filterModifiedEvent` - When a filter was changed
* `sortOrderModifiedEvent` - When the sorting order was changed
* `rowClickedEvent` - When a row is clicked  
* `cellClickedEvent` - When a cell is clicked


### Handling Events

Examples:

```javascript
    created: function () {
        this.$on('cellDataModifiedEvent',
            function( originalValue, newValue, columnTitle, entry) {
                console.log("cellDataModifiedEvent - Original Value : " + originalValue +
                                         " | New Value : " + newValue +
                                         " | Column : " + columnTitle +
                                         " | Complete Entry : " +  entry );
            }
        );
        this.$on('ajaxLoadedEvent',
            function( data ) {
                console.log("ajaxLoadedEvent - data : " + data );
            }
        );
        this.$on('ajaxLoadingError',
            function( error ) {
                console.log("ajaxLoadingError - error : " + error );
            }
        );
    },
```

## Contribute

If you have a feature request, please add it as an issue or make a pull request.


## TODO List

- [x] Basic table
- [x] Sorting
- [x] Multicolumn Sorting
- [x] Filter
- [x] Column picker
- [x] Pagination
- [x] Editing
- [x] Ajax
- [x] Basic events
- [ ] Responsive
- [ ] Dates sorting
- [ ] Keyboard navigation


## Changelog

### 1.2.0 

* Altered behaviour when clicking / blurring on editable field
* Added events
* Renamed some methods
* Deleted row handler function, replaced by onCellClickedEvent

### 1.1.8

* Forked from jbaysolution/vue2-bootstrap-table

