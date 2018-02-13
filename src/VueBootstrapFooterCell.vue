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

                let params = {
                    'column': this.column,
                    'values': this.values,
                };

                if (typeof this.column.footerComputed === 'function') {
                    result = this.column.footerComputed(params);
                }

                if (typeof this.column.renderFunction === 'function') {
                    return this.column.renderFunction(result, params);
                }

                return result;
            }
        },
        methods: {}
    }


</script>