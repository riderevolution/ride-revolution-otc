<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
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
                <div class="action_buttons" v-if="package_status == 1">
                    <nuxt-link :to="`${$route.path}/class-packages/create`" class="action_btn margin"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Physical Count</nuxt-link>
                </div>
                <div class="action_buttons" v-if="package_status == 3">
                    <a href="javascript:void(0)" class="action_btn alternate" @click="$store.state.importStatus = true">Import Gift Cards</a>
                </div>
                <div class="filter_wrapper">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess(package_status)" v-if="package_status == 1">
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
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess(package_status)" v-if="package_status == 2">
                        <div class="form_group">
                            <label for="q">Find a Promo</label>
                            <input type="text" name="q" autocomplete="off" placeholder="Search for a promo" class="default_text search_alternate">
                        </div>
                        <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                    </form>
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess(package_status)" v-if="package_status == 3">
                        <div class="form_group">
                            <label for="class_package_sku_id">Value</label>
                            <select class="default_select alternate" name="class_package_sku_id">
                                <option value="" selected>All Values</option>
                                <option :value="classPackage.sku_id" v-for="(classPackage, key) in classPackages" :key="key">{{ classPackage.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="q">Find a gift card</label>
                            <input type="text" name="q" autocomplete="off" placeholder="Search for a gift card" class="default_text search_alternate">
                        </div>
                        <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                    </form>
                </div>
            </section>
            <section id="content" v-if="loaded">
                <!-- <div class="cms_table_toggler">
                    <div :class="`status ${(package_status == 1) ? 'active' : ''}`" @click="togglePackages(1)">Products</div>
                    <div :class="`status ${(package_status == 2) ? 'active' : ''}`" @click="togglePackages(2)">Promotions</div>
                    <div :class="`status ${(package_status == 3) ? 'active' : ''}`" @click="togglePackages(3)">Gift Cards</div>
                </div> -->
                <table class="cms_table" v-if="res.productVariants && package_status == 1">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>SKU ID</th>
                            <th>Category</th>
                            <th>Studio</th>
                            <th>Supplier</th>
                            <th>In Stock</th>
                            <th>Unit Price</th>
                            <th>Sale Price</th>
                            <th>Sellable</th>
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
                <table class="cms_table" v-if="res.promos && package_status == 2">
                    <thead>
                        <tr>
                            <th>Promo Name</th>
                            <th>Discount</th>
                            <th>Promo Code</th>
                            <th>Start date</th>
                            <th>End Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.promos.data.length > 0">
                        <tr v-for="(data, key) in res.promos.data" :key="key">
                            <td>{{ data.name }}</td>
                            <td>{{ (data.discount_type == 'percent') ? `${data.discount_percent}  %` : `PHP ${totalCount(data.discount_flat_rate)}` }}</td>
                            <td>{{ data.promo_code }}</td>
                            <td>{{ formatDate(data.start_date) }}</td>
                            <td>{{ formatDate(data.end_date) }}</td>
                            <td>
                                <div class="table_actions">
                                    <nuxt-link class="table_action_edit" :to="`${$route.path}/promotions/${data.id}/edit`">Edit</nuxt-link>
                                    <a class="table_action_cancel" @click.self="toggleStatus(data.id, 0, 'Deactivated')" href="javascript:void(0)" v-if="status == 1">Deactivate</a>
                                    <a class="table_action_success" @click.self="toggleStatus(data.id, 1, 'Activated')" href="javascript:void(0)" v-if="status == 0">Activate</a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
                <table class="cms_table" v-if="res.giftCards && package_status == 3">
                    <thead>
                        <tr>
                            <th>Card Code</th>
                            <th>Starting Value</th>
                            <th>Date Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody v-if="res.giftCards.data.length > 0">
                        <tr v-for="(data, key) in res.giftCards.data" :key="key">
                            <td>{{ data.card_code }}</td>
                            <td>PHP {{ totalCount(data.class_package.package_price) }} - {{ data.class_package.name }}</td>
                            <td>{{ formatDate(data.created_at) }}</td>
                            <td>
                                <div class="table_actions">
                                    <a class="table_action_cancel" @click.self="toggleStatus(data.id, 0, 'Deactivated')" href="javascript:void(0)" v-if="status == 1">Deactivate</a>
                                    <a class="table_action_success" @click.self="toggleStatus(data.id, 1, 'Activated')" href="javascript:void(0)" v-if="status == 0">Activate</a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
                <pagination :apiRoute="(res.productVariants) ? res.productVariants.path : (res.promos ? res.promos.path : res.giftCards.path)" :current="(res.productVariants) ? res.productVariants.current_page : (res.promos ? res.promos.current_page : res.giftCards.current_page)" :last="(res.productVariants) ? res.productVariants.last_page : (res.promos ? res.promos.last_page : res.giftCards.last_page)" />
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
        <transition name="fade">
            <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" :packageStatus="package_status" />
        </transition>
        <transition name="fade">
            <import v-if="$store.state.importStatus" :status="status" />
        </transition>
    </div>
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
                loaded: false,
                lastRoute: '',
                rowCount: 0,
                status: 1,
                package_status: 1,
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
            submissionSuccess (packageStatus) {
                const me = this
                let apiRoute = ''
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                switch (packageStatus) {
                    case 1:
                        apiRoute = 'api/inventory/product-variants/search'
                        break
                    case 2:
                        apiRoute = 'api/inventory/promos/search'
                        break
                    case 3:
                        apiRoute = 'api/inventory/gift-cards/search'
                        break
                }
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
                me.fetchData(value, me.package_status)
            },
            togglePackages (value) {
                const me = this
                me.package_status = value
                me.fetchData(me.status, value)
            },
            fetchData (status, packageStatus) {
                const me = this
                let apiRoute = ''
                switch (packageStatus) {
                    case 1:
                        apiRoute = `api/inventory/product-variants?enabled=${status}`
                        break
                    case 2:
                        apiRoute = `api/inventory/promos?enabled=${status}`
                        break
                    case 3:
                        apiRoute = `api/inventory/gift-cards?enabled=${status}&status=0`
                        break
                }
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
                switch (packageStatus) {
                    case 1:
                        me.$axios.get('api/studios').then(res => {
                            me.studios = res.data.studios
                        })
                        me.$axios.get('api/suppliers').then(res => {
                            me.suppliers = res.data.suppliers.data
                        })
                        me.$axios.get('api/inventory/product-categories').then(res => {
                            me.categories = res.data.productCategories
                        })
                        break
                    case 3:
                        me.$axios.get('api/extras/class-packages-for-gift-cards').then(res => {
                            me.classPackages = res.data.classPackages
                        })
                        break
                }

            }
        },
        async mounted () {
            const me = this
            me.fetchData(1, 1)
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
