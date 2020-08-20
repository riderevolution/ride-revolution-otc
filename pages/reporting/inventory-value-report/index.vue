<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Inventory Value Report</h1>
                            </div>
                            <h2 class="header_subtitle">Expiration details of each product items</h2>
                        </div>
                        <div class="actions">
                            
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" id="studio_select" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <!-- <div class="form_group margin">
                                <label for="value_as_of">Value as of</label>
                                <input type="date" name="value_as_of" v-model="form.value_as_of" class="default_text date" />
                            </div> -->
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tabStatus == convertToSlug(tab.name)) ? 'active' : ''}`" @click="toggleTab(convertToSlug(tab.name), `${(tab.name == 'All') ? 'all-items' : 'specific-items'}`, tab)" v-for="(tab, key) in res.tabs" :key="key">{{ tab.name }}: {{ tab.quantity }}</div>
                    </div>
                    <div v-if="slug == 'all-items'">
                        <table class="cms_table">
                            <thead>
                                <tr>
                                    <th colspan="3" class="cms_table_title">Products</th>
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
                                    <td>
                                        <p v-for="(productQuantity, key) in data.product_quantities">
                                            <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-if="studioID == ''">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                            <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-else-if="studioID == productQuantity.studio.id">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                        </p>
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
                        <table class="cms_table alt">
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
                        <table class="cms_table" v-if="tabStatus != 'gift-cards'">
                            <thead>
                                <tr>
                                    <th colspan="3" class="cms_table_title">Products</th>
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
                                    <td>
                                        <p v-for="(productQuantity, key) in data.product_quantities">
                                            <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-if="studioID == ''">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                            <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-else-if="studioID == productQuantity.studio.id">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                        </p>
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
                        <table class="cms_table alt" v-else>
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
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Inventory Value Report',
                access: true,
                loaded: false,
                rowCount: 0,
                tabStatus: 'all',
                slug: 'all-items',
                res: {
                    tabs: [],
                    variants: [],
                    gift_cards: []
                },
                studios: [],
                categories: [],
                form: {
                    value_as_of: this.$moment().format('YYYY-MM-DD'),
                    product_category_id: ''
                },
                studioID: ''
            }
        },
        methods: {
            submitFilter () {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                if (me.form.product_category_id != '') {
                    formData.append('product_category_id', me.form.product_category_id)
                }
                me.$axios.post('api/reporting/inventory-value-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.tabs = res.data.tabs
                            me.res.variants = res.data.productVariants
                            me.res.gift_cards = res.data.giftCards
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.studioID = document.getElementById('studio_select').value
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            toggleTab (value, slug, data) {
                const me = this
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                if (data.is_product_category) {
                    me.form.product_category_id = data.product_category_id
                    formData.append('product_category_id', data.product_category_id)
                } else {
                    me.form.product_category_id = ''
                }
                me.$axios.post('api/reporting/inventory-value-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.tabs = res.data.tabs
                            me.res.variants = res.data.productVariants
                            me.res.gift_cards = res.data.giftCards
                            me.tabStatus = value
                            me.slug = slug
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                me.$axios.post('api/reporting/inventory-value-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.tabs = res.data.tabs
                            me.res.variants = res.data.productVariants
                            me.res.gift_cards = res.data.giftCards
                            me.$axios.get('api/studios?enabled=1').then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
                                }
                            })
                            me.$axios.get('api/inventory/product-categories?enabled=1').then(res => {
                                if (res.data) {
                                    me.categories = res.data.productCategories
                                }
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                    me.rowCount = document.getElementsByTagName('th').length
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
