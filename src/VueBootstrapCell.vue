<template>
    <div>
        <span v-if="!column.editable" v-html="rendered"></span>
        <span v-else-if="!enabled" @click="toggle" v-html="rendered"></span>
        <span v-else>
              <input type="text" ref="input" class="form-control" v-model="input"
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
              /></span>
        <span v-if="message.text">
            <span :class="message.iconClass" :title="message.text"></span>
        </span>

    </div>
</template>

<script>

    export default {
        name: "VueBootstrapCell",

        props: ['column', 'entry'],
        data: function () {
            return {
                enabled: false,
                input: "",
                message: {}
            }
        },
        watch: {
            enabled: function () {
                console.log('watch enabled', this.enabled);
            },
            entryValue: function () {
                // console.log('watch: input', this.input);
            }
        },
        computed: {
            value: function () {

                let result = this.entry[this.column.name];

                let fn = {};

                let params = {
                    caller: this,
                    column: this.column,
                    entry: this.entry
                };

                if (fn = this.$parent.getExtendedMethod(this.column.computed)) {

                    result = fn(params);

                    // Hack: Set computed value to entry
                    this.entry[this.column.name] = result;

                }

                // trigger validation
                let valid = this.isValid;

                return result;

            },
            isValid: function () {

                let fn = {};

                if (fn = this.$parent.getExtendedMethod(this.column.validate)) {

                    let params = {
                        caller: this,
                        column: this.column,
                        entry: this.entry
                    };

                    let result = fn(params);

                    this.message = result.message;

                    if (result.error === 1) {
                        return false;
                    } else {
                        return true;
                    }
                }

                this.message = {};

                return true;
            },
            rendered: function () {

                let fn = {};

                if (fn = this.$parent.getExtendedMethod(this.column.render)) {

                    let params = {
                        caller: this,
                        column: this.column,
                        entry: this.entry
                    };

                    return String(fn(this.value, params));
                }

                if (this.value === null) {
                    return '';
                } else if (this.value === undefined) {
                    return '';
                } else if (typeof this.value === 'object') {
                    return '[...]';
                } else {
                    return String(this.value);
                }

            }
        }
        ,
        methods: {

            save: function () {
                console.log('cell.save', this.column, this.entry, this.input);
                let originalValue = this.entry[this.column.name];
                this.input = this.$parent.castToType(this.input, this.column.type);
                this.$set(this.entry, this.column.name, this.input);
                this.$emit('input', this.input);

                this.$emit('cell-data-modified', this.column, this.entry, this.input);
            },
            cancel: function () {
                console.log('cancel');
                this.input = this.entry[this.column.name];
                this.enabled = false;
            },
            enable: function () {
                console.log('enable');
                this.enabled = true;
                this.input = this.entry[this.column.name];
                this.$nextTick(() => this.$refs.input.focus())
            },
            disable: function () {
                this.enabled = false;
                console.log('disable');
            },
            toggle: function () {
                console.log('toggle');
                if (this.enabled) {
                    this.disable();
                } else {
                    this.enable();
                }

            },
            onBlur: function (event) {
                // console.log('onBlur', event);
                // if (this.enabled) {
                //     this.save();
                // } else {
                //     this.cancel();
                // }
            },
            onKeyEnter: function (event) {
                console.log('onKeyEnter', event);
                this.save();
                this.enabled = false;
                this.$emit('down', event);
            },
            onKeyTab: function (event) {
                console.log('onKeyTab', event);
                this.save();
                this.enabled = false;
                this.$emit('right', event);

            },
            onKeyEsc: function (event) {
                console.log('onKeyEsc', event);
                this.cancel();
                this.enabled = false;
            },
            onKeyDown: function (event) {
                console.log('onKeyDown', event);
                this.save();
                this.enabled = false;
                this.$emit('down', event);
            },
            onKeyUp: function (event) {
                console.log('onKeyUp', event);
                this.save();
                this.enabled = false;
                this.$emit('up', event);
            },
            onKeyLeft: function (event) {
                console.log('onKeyLeft', event);
                this.save();
                this.enabled = false;
                this.$emit('left', event);
            },
            onKeyRight: function (event) {
                console.log('onKeyRight', event);
                this.save();
                this.enabled = false;
                this.$emit('right', event);
            },
            onKeyPlus: function (event) {
                console.log('onKeyPlus', event);
                if (this.column.type === 'integer') {
                    this.input = parseInt(this.input) + 1;
                } else if (this.column.type === 'decimal') {
                    this.input = this.$parent.castToType(this.input, 'decimal') + 1;
                } else if (this.column.type === 'money') {
                    this.input = this.$parent.castToType(this.input, 'decimal') + 1;
                }
            },
            onKeyMinus: function (event) {
                console.log('onKeyMinus', event);
                if (this.column.type === 'integer') {
                    this.input = parseInt(this.input) - 1;
                } else if (this.column.type === 'decimal') {
                    this.input = this.$parent.castToType(this.input, 'decimal') - 1;
                } else if (this.column.type === 'money') {
                    this.input = this.$parent.castToType(this.input, 'decimal') - 1;
                }
            },
            onAnyKey: function (event) {
                // console.log('onAnyKey', event);
            }

        }
    }


</script>