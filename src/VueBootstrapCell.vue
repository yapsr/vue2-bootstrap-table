<template>
    <div>
        <div :class="getClasses">
            <div v-if="message.text" class="message">
                <span :class="message.iconClass" :title="message.text"></span>
                <!--<span class="text">{{ message.text}}</span>-->
            </div>

            <div v-if="!column.editable" v-html="rendered" class="value"></div>
            <div v-else-if="!enabled" @click="toggle" v-html="rendered" class="toggible"></div>
            <div v-else class="editing">
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
                /></div>
        </div>
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
                // console.log('watch enabled', this.enabled);
            },
            entryValue: function () {
                // console.log('watch: input', this.input);
            }
        },
        computed: {
            getClasses: function () {
                // let result = 'input';
                // if (this.column.enabled) {
                //     result = result + ' enabled';
                // }
                // if (this.column.editable) {
                //     result = result + ' editable';
                // }
                // return result;
            },
            value: function () {

                let fn = {};

                let result = this.entry[this.column.name];

                if (fn = this.$parent.getExtendedMethod(this.column.computed)) {

                    let params = {
                        caller: this,
                        column: this.column,
                        entry: this.entry
                    };

                    result = fn(params);

                    // Hack: Set computed value to entry
                    this.entry[this.column.name] = result;
                    // console.log('computed', this.column.name, this.column.computed, result);

                }

                // trigger validation
                let valid = this.validate();
                // console.log('value.isValid()', this.column.name, valid);

                return result;

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
            step: function ({up, down, value}) {

                let fn = {};

                let result = parseInt(value); // @todo Fix for type=decimal|money

                if (fn = this.$parent.getExtendedMethod(this.column.step)) {

                    let params = {
                        caller: this,
                        column: this.column,
                        entry: this.entry,
                        value: value,
                        up: up,
                        down: down
                    };

                    result = fn(params);

                } else {
                    if (up) {
                        result += 1;
                    } else {
                        result -= 1;
                    }
                }

                return result;

            },
            validate: function () {

                let fn = {};

                if (fn = this.$parent.getExtendedMethod(this.column.validate)) {

                    let params = {
                        caller: this,
                        column: this.column,
                        entry: this.entry
                    };

                    let result = fn(params);

                    // console.log('validate', this.column.name, this.column.validate, params, result, (result.error===1));


                    this.message = result.message;

                    if (result.error === 1) {
                        return false;
                    } else {
                        return true;
                    }
                }

                // console.log('no validation', this.column.name);

                this.message = {};

                return true;
            },
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
                let params = {
                    up: true,
                    down: false,
                    value: this.input.slice(0, -1),
                    event: event
                };
                this.input = this.step(params);
            },
            onKeyMinus: function (event) {
                console.log('onKeyMinus', event);
                let params = {
                    up: false,
                    down: true,
                    value: this.input.slice(0, -1),
                    event: event
                };
                this.input = this.step(params);
            },
            onAnyKey: function (event) {
                // console.log('onAnyKey', event);
            }

        }
    }


</script>