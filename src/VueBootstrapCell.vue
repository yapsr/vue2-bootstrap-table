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
                 @keyup.107="onKeyPlus"
                 @keyup.109="onKeyMinus"
                 @keyup="onAnyKey"
                 @blur="onBlur"
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

                let fn = null;

                let params = {
                    column: this.column,
                    entry: this.entry
                };

                if (fn = this.$parent.getExtendedMethod(this.column.computed)) {

                    result = fn(params);

                    // Hack: Set computed value to entry
                    this.entry[this.column.name] = result;

                }

                if (fn = this.$parent.getExtendedMethod(this.column.render)) {
                    return fn(result, params);
                }

                return this.entry[this.column.name];

            }
        }
        ,
        methods: {

            saveThis: function () {
                console.log('cell.saveThis', this.column, this.entry, this.entryValue);
                let originalValue = this.entry[this.column.name];

                // In stead of
                // this.entry[this.column.name] = this.entryValue;
                //
                // use
                //
                // Vue.set(example1.items, indexOfItem, newValue)
                //
                this.$set(this.entry, this.column.name, this.entryValue);

                this.$emit('input', this.entryValue);
                this.$emit('changed-entry', this.entry);
                this.$root.$emit('cellDataModifiedEvent', originalValue, this.entryValue, this.column.name, this.entry);
            },
            cancelThis: function () {
                console.log('cancelThis');
                this.entryValue = this.entry[this.column.name];
                this.enabled = false;
            },
            toggleInput: function () {
                console.log('toggleInput');
                this.enabled = !this.enabled;
                if (this.enabled) {
                    this.entryValue = this.entry[this.column.name];
                    this.$nextTick(() => this.$refs.inputfield.focus())
                }
            },
            onBlur: function (event) {
                // console.log('onBlur', event);
                // if (this.enabled) {
                //     this.saveThis();
                // } else {
                //     this.cancelThis();
                // }
            },
            onKeyEnter: function (event) {
                console.log('onKeyEnter', event);
                this.saveThis();
                this.enabled = false;
                // @todo Move down
            },
            onKeyTab: function (event) {
                console.log('onKeyTab', event);
                this.saveThis();
                this.enabled = false;
                // @todo Move right
            },
            onKeyEsc: function (event) {
                console.log('onKeyEsc', event);
                this.cancelThis();
                this.enabled = false;
            },
            onKeyDown: function (event) {
                console.log('onKeyDown', event);
                this.saveThis();
                this.enabled = false;
                // @todo Move down
            },
            onKeyUp: function (event) {
                console.log('onKeyUp', event);
                this.saveThis();
                this.enabled = false;
                // @todo Move up
            },
            onKeyLeft: function (event) {
                console.log('onKeyLeft', event);
                this.saveThis();
                this.enabled = false;
                // @todo Move left
            },
            onKeyRight: function (event) {
                console.log('onKeyRight', event);
                this.saveThis();
                this.enabled = false;
                // @todo Move right
            },
            onKeyPlus: function (event) {
                console.log('onKeyPlus', event);
                this.entryValue = parseInt(this.entryValue)+1;
                // this.saveThis(); // @todo First fix DOM when sorting
            },
            onKeyMinus: function (event) {
                console.log('onKeyMinus', event);
                this.entryValue = parseInt(this.entryValue)-1;
                // this.saveThis();// @todo First fix DOM when sorting
            },
            onAnyKey: function(event) {
                console.log('onAnyKey', event);
            }

        }
    }


</script>