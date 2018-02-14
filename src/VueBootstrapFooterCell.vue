<template>
    <div>
        <span v-html="rendered"></span>

        <span v-if="message.text">
            <span :class="message.iconClass" :title="message.text"></span>
        </span>
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
                    entryValue: "",
                    message: {}
                }
            }

        ,
        computed: {
            value: function() {
                let result = "";

                let fn = {};

                let params = {
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
            rendered: function () {

                console.log('footer.rendered()', this.column.name);

                let result = this.value;

                let fn = {};

                let params = {
                    'column': this.column,
                    'values': this.values,
                };

                if (fn = this.$parent.getExtendedMethod(this.column.footer.render)) {
                    return fn(result, params);
                }

                return result;
            },
            isValid: function () {

                let fn = {};

                if (fn = this.$parent.getExtendedMethod(this.column.footer.validate)) {

                    let params = {
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
        },
        methods: {}
    }


</script>