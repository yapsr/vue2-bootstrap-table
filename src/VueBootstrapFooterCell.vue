<template>
    <div v-html="rendered"></div>
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
                }
            }

        ,
        computed: {
            rendered: function () {

                console.log('footer.rendered()', this.column.name);

                let result = "";

                let fn = {};

                let params = {
                    'column': this.column,
                    'values': this.values,
                };

                if (fn = this.$parent.getExtendedMethod( this.column.footer )) {
                    result = fn(params);
                }

                if (fn = this.$parent.getExtendedMethod( this.column.render )) {
                    return fn(result, params);
                }

                return result;
            }
        },
        methods: {
        }
    }


</script>