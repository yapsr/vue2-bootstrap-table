<template>
    <span v-if="!column.editable" v-html="rendered"></span>
    <span v-else-if="!enabled" @click="toggleInput" v-html="rendered"></span>
    <span v-else>
          <input type="text" ref="inputfield" class="form-control" v-model="entryValue"
                 @keyup.enter="onKeyEnter"
                 @keyup.tab="onKeyTab"
                 @keyup.esc="onKeyEsc"
                 @keyup.down="onKeyDown"
                 @keyup.up="onKeyUp"
                 @keyup.left="onKeyLeft"
                 @keyup.right="onKeyRight"
                 @x-blur="onBlur"
          ></span>
</template>

<script>

    export default {
        name: "VueBootstrapCell",

        props: ['column', 'entry'],
        data:

            function () {
                return {
                    enabled: false,
                    entryValue: "",
                }
            }

        ,
        computed: {
            rendered: function () {

                let result = "";

                let params = {
                    column: this.column,
                    entry: this.entry
                }

                if (typeof this.column.computed === 'function') {
                    result = this.column.computed(params);

                    // Hack: Set computed value to entry
                    this.entry[ this.column.name ] = result;

                } else {
                    result = this.entry[this.column.name];
                }

                if (typeof this.column.renderFunction === 'function') {
                    return this.column.renderFunction(result, params);
                } else {
                    return result;
                }
            }
        }
        ,
        methods: {

            saveThis: function () {
                console.log('cell.saveThis', this.column, this.entry, this.entryValue);
                let originalValue = this.entry[this.column.name];

                this.entry[this.column.name] = this.entryValue;

                // Vue.set(example1.items, indexOfItem, newValue)
                // Vue.set(this.entry, this.column.name, this.entryValue);

                this.enabled = false;
                this.$emit('input', this.entryValue);
                this.$emit('changed-entry', this.entry);
                this.$root.$emit('cellDataModifiedEvent', originalValue, this.entryValue, this.column.name, this.entry);
            }
            ,
            cancelThis: function () {
                console.log('cancelThis');
                this.entryValue = this.entry[this.column.name];
                this.enabled = false;
            }
            ,
            toggleInput: function () {
                console.log('toggleInput');
                this.enabled = !this.enabled;
                if (this.enabled) {
                    this.entryValue = this.entry[this.column.name];
                    this.$nextTick(() => this.$refs.inputfield.focus())
                }
            }
            ,
            onBlur: function (event) {
                console.log('onBlur', event);
                if (this.enabled) {
                    this.saveThis();
                } else {
                    this.cancelThis();
                }
            }
            ,
            onKeyEnter: function (event) {
                console.log('onKeyEnter', event);
                this.saveThis();
                // @todo Move down
            }
            ,
            onKeyTab: function (event) {
                console.log('onKeyTab', event);
                this.saveThis();
                // @todo Move right
            }
            ,
            onKeyEsc: function (event) {
                console.log('onKeyEsc', event);
                this.cancelThis();
            }
            ,
            onKeyDown: function (event) {
                console.log('onKeyDown', event);
                this.saveThis();
                // @todo Move down
            }
            ,
            onKeyUp: function (event) {
                console.log('onKeyUp', event);
                this.saveThis();
                // @todo Move up
            }
            ,
            onKeyLeft: function (event) {
                console.log('onKeyLeft', event);
                this.saveThis();
                // @todo Move left
            }
            ,
            onKeyRight: function (event) {
                console.log('onKeyRight', event);
                this.saveThis();
                // @todo Move right
            }
            ,

        }
    }


</script>