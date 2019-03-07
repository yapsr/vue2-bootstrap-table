<template>
    <div>
        <div v-if="message.text" class="message">
            <span :class="message.iconClass" :title="message.text"></span>
        </div>
        <div v-html="rendered" class="input"></div>
    </div>
</template>
<script>

    export default {
        name: "VueBootstrapFooterCell",

        props: ['column', 'values'],
        data:

            function () {
                return {
                    enabled: false,
                    input: "",
                    message: {}
                }
            }

        ,
        computed: {
            value: function () {

                // Set default result
                let result;

                let fn = this.$parent.getExtendedMethod(this.column.footer.computed);
                if (typeof(fn) === 'function') {

                    let params = {
                        'caller': this,
                        'column': this.column,
                        'values': this.values,
                    };

                    result = fn(params);
                }

                // Trigger validation
                // @todo Refactor
                this.validate();

                console.log('footerCell.computed.value()', this.column.name, result);

                return result;

            },
            rendered: function () {

                console.log('VueBootstrapFooterCell.computed.rendered()', this.column.name, this.value);

                // Get value, possibly computed
                let value = this.value;

                // Get render method
                let fn = this.$parent.getExtendedMethod(this.column.footer.render);
                if (typeof fn === 'function') {

                    let params = {
                        'caller': this,
                        'column': this.column,
                        'values': this.values,
                    };

                    return fn(value, params);
                }

                if (typeof value !== 'undefined') {
                    return String(value);
                }

                return '';

            },
        },


        methods: {
            validate: function () {

                console.log('footerCell.methods.validate()', this.column.name);

                // Set default value
                let result = true;

                let fn = this.$parent.getExtendedMethod(this.column.footer.validate);
                if (typeof fn === 'function') {

                    let params = {
                        caller: this,
                        column: this.column,
                        values: this.values
                    };

                    result = fn(params);

                    this.message = result.message;

                    if (result.error === 1) {
                        result = false;
                    }
                }

                this.message = {};

                return result;
            },
        }
    }


</script>