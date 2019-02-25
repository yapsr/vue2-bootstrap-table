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
                let result = "";

                let fn = {};

                let params = {
                    'caller': this,
                    'column': this.column,
                    'values': this.values,
                };

                if (fn = this.$parent.getExtendedMethod(this.column.footer.computed)) {
                    result = fn(params);
                }

                // trigger validation
                let valid = this.isValid;

                return result;

            },
            isValid: function () {

                let fn = this.$parent.getExtendedMethod(this.column.footer.validate);

                if (typeof fn === 'function') {

                    let params = {
                        caller: this,
                        column: this.column,
                        values: this.values
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

                console.log('footer.rendered()', this.column.name);

                let value = this.value;

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


        methods: {}
    }


</script>