<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Inventory</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems((res.productVariants) ? res.productVariants.total : (res.promos ? res.promos.total : res.giftCards.total )) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <a href="javascript:void(0)" class="action_btn margin"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Physical Count</a>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="category_id">Category</label>
                                <select class="default_select alternate" name="category_id">
                                    <option value="" selected>All Categories</option>
                                    <option :value="category.id" v-for="(category, key) in categories" :key="key">{{ category.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="supplier_id">Supplier</label>
                                <select class="default_select alternate" name="supplier_id">
                                    <option value="" selected>All Suppliers</option>
                                    <option :value="supplier.id" v-for="(supplier, key) in suppliers" :key="key">{{ supplier.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" id="studio_select" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="q">Find a product</label>
                                <input type="text" name="q" autocomplete="off" placeholder="Search for a product" class="default_text search_alternate">
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table" v-if="res.productVariants">
                        <thead>
                            <tr>
                                <th class="stick">Product Name</th>
                                <th class="stick">SKU ID</th>
                                <th class="stick">Category</th>
                                <th class="stick">Studio</th>
                                <th class="stick">Supplier</th>
                                <th class="stick">In Stock</th>
                                <th class="stick">Unit Price</th>
                                <th class="stick">Sale Price</th>
                                <th class="stick">Sellable</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.productVariants.data.length > 0">
                            <tr v-for="(data, key) in res.productVariants.data" :key="key" :class="`${(data.quantity < data.reorder_point) ? 'threshold' : ''}`">
                                <td>{{ data.product.name }} - {{ data.variant }}</td>
                                <td>{{ data.sku_id }}</td>
                                <td>{{ data.product.category.name }}</td>
                                <td>
                                    <div v-for="(studio, key) in data.product.studio_access" :key="key" v-if="data.product.studio_access.length != studios.length">
                                        {{ studio.studio.name }} <br />
                                    </div>
                                    <div v-if="data.product.studio_access.length == studios.length">
                                        All Studios
                                    </div>
                                </td>
                                <td>{{ data.product.supplier.name }}</td>
                                <td>
                                    <p v-for="(productQuantity, key) in data.product_quantities">
                                        <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-if="studioID == ''">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                        <span :class="`${(productQuantity.quantity > 0) ? 'green' : 'red' }`" v-else-if="studioID == productQuantity.studio.id">{{ productQuantity.quantity }}<span> - {{ productQuantity.studio.name }}</span></span>
                                    </p>
                                </td>
                                <td>PHP {{ totalCount(data.unit_price) }}</td>
                                <td>PHP {{ totalCount(data.sale_price) }}</td>
                                <td>{{ (data.product.sellable == 1) ? 'Yes' : 'No' }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                <pagination :apiRoute="res.productVariants.path" :current="res.productVariants.current_page" :last="res.productVariants.last_page" />
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
        <transition name="fade">
            <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" />
        </transition>
        <transition name="fade">
            <import v-if="$store.state.importStatus" :status="status" />
        </transition>
    </div>
    </transition>
</template>

<script>
    import Foot from '../../../components/Foot'
    import Pagination from '../../../components/Pagination'
    import ConfirmStatus from '../../../components/modals/ConfirmStatus'
    import Import from '../../../components/modals/Import'
    export default {
        components: {
            Foot,
            Pagination,
            ConfirmStatus,
            Import
        },
        data () {
            return {
                name: 'Inventory',
                filter: false,
                access: true,
                loaded: false,
                lastRoute: '',
                rowCount: 0,
                status: 1,
                res: [],
                categories: [],
                suppliers: [],
                studios: [],
                classPackages: [],
                studioID: ''
            }
        },
        methods: {
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            submissionSuccess () {
                const me = this
                me.filter = true
                let apiRoute = 'api/inventory/product-variants/search'
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(apiRoute, formData).then(res => {
                    if (res.data) {
                        me.res = res.data
                        if (me.res.productVariants) {
                            me.res.productVariants.data.sort((a, b) => {
                                return a.reached_reorder_point - b.reached_reorder_point
                            })
                        }
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.studioID = document.getElementById('studio_select').value
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = (me.res.promos) ? 'promos' : 'gift_cards'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = (me.res.promos) ? 'promo' : 'gift card'
                }, 100)
                document.body.classList.add('no_scroll')
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            fetchData (status) {
                const me = this
                let apiRoute = `api/inventory/product-variants?enabled=${status}`
                me.loader(true)
                me.$axios.get(apiRoute).then(res => {
                    if (res.data) {
                        me.res = res.data
                        me.loaded = true
                        if (me.res.productVariants) {
                            me.res.productVariants.data.sort((a, b) => {
                                return a.reached_reorder_point - b.reached_reorder_point
                            })
                        }
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
                me.$axios.get('api/suppliers').then(res => {
                    me.suppliers = res.data.suppliers.data
                })
                me.$axios.get('api/inventory/product-categories').then(res => {
                    me.categories = res.data.productCategories
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
