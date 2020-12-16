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
                            <a :href="`/print/reporting/inventory-value-report?status=${tabStatus}&studio_id=${form.studio_id}&id=${form.product_category_id}`" target="_blank" class="action_btn alternate">Print</a>
                            <download-csv
                                v-if="tabStatus == 'all' && res.variants.length > 0 && res.gift_cards.length > 0"
                                class="action_btn alternate margin"
                                :data="inventoryValueReportProductsAttributes"
                                :name="`inventory-value-report-all-products-items-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                            <download-csv
                                v-else-if="tabStatus == 'gift-cards' && res.gift_cards.length > 0"
                                class="action_btn alternate margin"
                                :data="inventoryValueReportCardsAttributes"
                                :name="`inventory-value-report-gift-cards-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                            <download-csv
                                v-else
                                class="action_btn alternate margin"
                                :data="inventoryValueReportProductsAttributes"
                                :name="`inventory-value-report-${tabStatus}-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group alternate">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" id="studio_select" name="studio_id" v-model="form.studio_id">
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
                        <table class="cms_table alt">
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
                    <div v-else>
                        <table class="cms_table alt" v-if="tabStatus != 'gift-cards'">
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
            const variant_values = []
            const card_values = []
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
                card_values: [],
                variant_values: [],
                studios: [],
                categories: [],
                form: {
                    studio_id: '',
                    value_as_of: this.$moment().format('YYYY-MM-DD'),
                    product_category_id: ''
                },
                studioID: ''
            }
        },
        computed: {
            inventoryValueReportProductsAttributes () {
                const me = this
                return [
                    ...me.variant_values.map(value => ({
                        'Studio': me.getStudio(),
                        'Product Name': value.variant,
                        'SKU ID': value.sku_id,
                        'In Stock': me.stocksPerStudio(value),
                        'Price (Per Piece)': `Php ${me.totalCount(value.unit_price)}`,
                        'Total Cost of Good': `Php ${me.totalCount(value.totalCostOfGood)}`,
                        'Retail Value': `Php ${me.totalCount(value.sale_price)}`,
                    }))
                ]
            },
            inventoryValueReportCardsAttributes () {
                const me = this
                return [
                    ...me.card_values.map(value => ({
                        'Studio': me.getStudio(),
                        'Card Code': value.card_code,
                        'Class Package': value.class_package.name,
                        'Price': `Php ${me.totalCount(value.class_package.package_price)}`
                    }))
                ]
            }
        },
        methods: {
            stocksPerStudio (value) {
                const me = this
                let result = ''
                if (value.product_quantities.length > 0) {
                    value.product_quantities.forEach((item, key) => {
                        result += `
                            ${item.quantity} - ${item.studio.name}
                        `
                    })
                } else {
                    result = 'No Stocks'
                }

                return result
            },
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != '') {
                    me.studios.forEach((studio, index) => {
                        if (studio.id == me.form.studio_id) {
                            result = studio.name
                        }
                    })
                } else {
                    result = 'All Studios'
                }
                return result
            },
            submitFilter () {
                const me = this
                me.variant_values = []
                me.card_values = []
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

                            res.data.giftCards.forEach((card, key) => {
                                me.card_values.push(card)
                            })

                            res.data.productVariants.forEach((variant, key) => {
                                me.variant_values.push(variant)
                            })

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
                me.variant_values = []
                me.card_values = []
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

                            res.data.giftCards.forEach((card, key) => {
                                me.card_values.push(card)
                            })

                            res.data.productVariants.forEach((variant, key) => {
                                me.variant_values.push(variant)
                            })

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
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.loader(true)
                let formData = new FormData()
                if (me.form.studio_id != '') {
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post('api/reporting/inventory-value-report', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res.tabs = res.data.tabs
                            me.res.variants = res.data.productVariants
                            me.res.gift_cards = res.data.giftCards

                            res.data.giftCards.forEach((card, key) => {
                                me.card_values.push(card)
                            })

                            res.data.productVariants.forEach((variant, key) => {
                                me.variant_values.push(variant)
                            })

                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
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
