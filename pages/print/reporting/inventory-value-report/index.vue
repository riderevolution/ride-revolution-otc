<template>
    <div class="print_table" v-if="loaded">
        <div class="text">
            <h2>Inventory Value Report - {{ ($route.query.studio_id.length > 0) ? studio.name : 'All Studios' }} ({{ ($route.query.status == 'all') ? 'All' : ($route.query.status == 'gift-cards' ? 'Gift Cards' : 'Products') }})</h2>
            <h3><span>{{ $moment($route.query.start_date).format('MMMM DD, YYYY') }} - {{ $moment($route.query.end_date).format('MMMM DD, YYYY') }}</span></h3>
        </div>
        <div v-if="$route.query.status == 'all'">
            <table class="cms_table print">
                <thead>
                    <tr>
                        <th colspan="6" class="cms_table_title">Products</th>
                    </tr>
                    <tr>
                        <th>Product Name</th>
                        <th>SKU ID</th>
                        <th>In Stock</th>
                        <th>Price (Per Piece)</th>
                        <th>Total Cost of Good</th>
                        <th>Retail Value</th>
                    </tr>
                </thead>
                <tbody v-if="res.variants.length > 0">
                    <tr v-for="(data, key) in res.variants" :key="key">
                        <td>{{ data.variant }}</td>
                        <td>{{ data.sku_id }}</td>
                        <td v-if="data.product_quantities.length > 0">
                            <p v-for="(productQuantity, key) in data.product_quantities" :key="key">
                                <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-if="studioID == ''">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-else-if="studioID == productQuantity.studio.id">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                            </p>
                        </td>
                        <td v-else>
                            <p>No Stocks</p>
                        </td>
                        <td>Php {{ totalCount(data.unit_price) }}</td>
                        <td>Php {{ totalCount(data.totalCostOfGood) }}</td>
                        <td>Php {{ totalCount(data.sale_price) }}</td>
                    </tr>
                </tbody>
                <tbody class="no_results" v-else>
                    <tr>
                        <td colspan="6">No Result(s) Found.</td>
                    </tr>
                </tbody>
            </table>
            <table class="cms_table print">
                <thead>
                    <tr>
                        <th colspan="3" class="cms_table_title">Gift Cards</th>
                    </tr>
                    <tr>
                        <th>Card Code</th>
                        <th>Class Package</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody v-if="res.gift_cards.length > 0">
                    <tr v-for="(data, key) in res.gift_cards" :key="key">
                        <td>{{ data.card_code }}</td>
                        <td>{{ data.class_package.name }}</td>
                        <td>Php {{ totalCount(data.class_package.package_price) }}</td>
                    </tr>
                </tbody>
                <tbody class="no_results" v-else>
                    <tr>
                        <td colspan="3">No Result(s) Found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else-if="$route.query.status == 'gift-cards'">
            <table class="cms_table print">
                <thead>
                    <tr>
                        <th colspan="3" class="cms_table_title">Gift Cards</th>
                    </tr>
                    <tr>
                        <th>Card Code</th>
                        <th>Class Package</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody v-if="res.gift_cards.length > 0">
                    <tr v-for="(data, key) in res.gift_cards" :key="key">
                        <td>{{ data.card_code }}</td>
                        <td>{{ data.class_package.name }}</td>
                        <td>Php {{ totalCount(data.class_package.package_price) }}</td>
                    </tr>
                </tbody>
                <tbody class="no_results" v-else>
                    <tr>
                        <td colspan="3">No Result(s) Found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <table class="cms_table print">
                <thead>
                    <tr>
                        <th colspan="6" class="cms_table_title">Products</th>
                    </tr>
                    <tr>
                        <th>Product Name</th>
                        <th>SKU ID</th>
                        <th>In Stock</th>
                        <th>Price (Per Piece)</th>
                        <th>Total Cost of Good</th>
                        <th>Retail Value</th>
                    </tr>
                </thead>
                <tbody v-if="res.variants.length > 0">
                    <tr v-for="(data, key) in res.variants" :key="key">
                        <td>{{ data.variant }}</td>
                        <td>{{ data.sku_id }}</td>
                        <td v-if="data.product_quantities.length > 0">
                            <p v-for="(productQuantity, key) in data.product_quantities" :key="key">
                                <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-if="studioID == ''">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-else-if="studioID == productQuantity.studio.id">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                            </p>
                        </td>
                        <td v-else>
                            <p>No Stocks</p>
                        </td>
                        <td>Php {{ totalCount(data.unit_price) }}</td>
                        <td>Php {{ totalCount(data.totalCostOfGood) }}</td>
                        <td>Php {{ totalCount(data.sale_price) }}</td>
                    </tr>
                </tbody>
                <tbody class="no_results" v-else>
                    <tr>
                        <td colspan="6">No Result(s) Found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    export default {
        layout: 'print',
        data () {
            return {
                loaded: false,
                res: {
                    variants: [],
                    gift_cards: []
                },
                studio: [],
                studioID: '',
                form: {
                    studio_id: ''
                }
            }
        },
        methods: {
            initial () {
                const me = this
                let formData = new FormData()

                if (me.$route.query.studio_id) {
                    me.studioID = me.$route.query.studio_id
                    me.form.studio_id = me.$route.query.studio_id
                    formData.append('studio_id', me.$route.query.studio_id)
                }
                if (me.$route.query.id.length > 0) {
                    formData.append('product_category_id', me.$route.query.id)
                }

                me.$axios.post('api/reporting/inventory-value-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.variants = res.data.productVariants
                            me.res.gift_cards = res.data.giftCards

                            if (me.form.studio_id != '') {
                                me.$axios.get(`api/studios/${me.$route.query.studio_id}`).then(res => {
                                    me.studio = res.data.studio
                                })
                            }
                            me.loaded = true
                            setTimeout( () => {
                                window.print()
                            }, 1000)
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                })
            }
        },
        mounted () {
			const me = this
            me.initial()
            window.onafterprint = function(){
                window.close()
            }
		}
    }
</script>
