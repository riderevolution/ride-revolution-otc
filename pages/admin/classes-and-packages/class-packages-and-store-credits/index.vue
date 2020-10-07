<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg" /><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Class Packages &amp; Store Credits</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems((res.classPackages) ? res.classPackages.total : res.storeCredits.total) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <nuxt-link :to="`${$route.path}/store-credits/create`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add Store Credits</nuxt-link>
                        <nuxt-link :to="`${$route.path}/class-packages/create`" class="action_btn margin"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add Class Package</nuxt-link>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess(package_status)">
                            <div class="form_group alternate" v-if="package_status == 1">
                                <label for="q">Find a package</label>
                                <input type="text" name="q" placeholder="Search for a class packages" autocomplete="off" class="default_text search_alternate">
                            </div>
                            <div class="form_group margin" v-if="package_status == 1">
                                <label for="package_type_id">Package Type</label>
                                <select class="default_select alternate" name="package_type_id">
                                    <option value="" selected>All Package Types</option>
                                    <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group" v-if="package_status == 3">
                                <label for="q">Find a credit</label>
                                <input type="text" name="q" placeholder="Search for a credits" autocomplete="off" class="default_text search_alternate">
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin" v-if="package_status != 2">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total: {{ totalItems((res.classPackages) ? res.classPackages.total : res.storeCredits.total) }}</div>
                        <div :class="`status ${(package_status == 1) ? 'active' : ''}`" @click="togglePackages(1)">Regular</div>
                        <div :class="`status ${(package_status == 2) ? 'active' : ''}`" @click="togglePackages(2)">Promo</div>
                        <div :class="`status ${(package_status == 3) ? 'active' : ''}`" @click="togglePackages(3)">Store Credits</div>
                    </div>
                    <table class="cms_table" v-if="res.classPackages && package_status != 3">
                        <thead>
                            <tr>
                                <th class="stick">Package Name</th>
                                <th class="stick">Package ID</th>
                                <th class="stick">Class Count</th>
                                <th class="stick">Price</th>
                                <th class="stick" v-if="package_status == 2">Discounted Price</th>
                                <th class="stick">Estimated Price Per Class</th>
                                <th class="stick">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.classPackages.data.length > 0">
                            <tr v-for="(data, key) in res.classPackages.data" :key="key">
                                <td>{{ data.name }}</td>
                                <td>
                                    <div class="table_actions">
                                        <input class="textbox" :id="`sku_id_${key}`" v-model="data.sku_id" />
                                        <div class="table_action_success link" @click="codeClipboard(data, key)">Copy</div>
                                    </div>
                                </td>
                                <td>{{ (data.class_count_unlimited) ? 'Unlimited' : data.class_count }}</td>
                                <td>PHP {{ totalCount(data.package_price) }}</td>
                                <td v-if="package_status == 2">PHP {{ totalCount(data.discounted_price) }}</td>
                                <td>PHP {{ totalCount(data.estimated_price_per_class) }}</td>
                                <td width="20%">
                                    <div class="table_actions">
                                        <nuxt-link class="table_action_edit" :to="`${$route.path}/class-packages/${data.id}/edit`">Edit</nuxt-link>
                                        <div class="table_action_cancel link" @click.self="toggleStatus(data.id, 0, 'Deactivated')" v-if="status == 1">Deactivate</div>
                                        <div class="table_action_success link" @click.self="toggleStatus(data.id, 1, 'Activated')" v-if="status == 0">Activate</div>
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
                    <table class="cms_table" v-if="res.storeCredits && package_status == 3">
                        <thead>
                            <tr>
                                <th class="stick">Package Name</th>
                                <th class="stick">Package ID</th>
                                <th class="stick">Credit Amount</th>
                                <th class="stick">Created At</th>
                                <th class="stick">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.storeCredits.data.length > 0">
                            <tr v-for="(data, key) in res.storeCredits.data" :key="key">
                                <td>{{ data.name }}</td>
                                <td>{{ data.sku_id }}</td>
                                <td>PHP {{ totalCount(data.amount) }}</td>
                                <td>{{ formatDate(data.created_at) }}</td>
                                <td>
                                    <div class="table_actions">
                                        <nuxt-link class="table_action_edit" :to="`${$route.path}/store-credits/${data.id}/edit`">Edit</nuxt-link>
                                        <div class="table_action_cancel link" @click.self="toggleStatus(data.id, 0, 'Deactivated')" v-if="status == 1">Deactivate</div>
                                        <div class="table_action_success link" @click.self="toggleStatus(data.id, 1, 'Activated')" v-if="status == 0">Activate</div>
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
                    <pagination :apiRoute="(res.classPackages) ? res.classPackages.path : res.storeCredits.path" :current="(res.classPackages) ? res.classPackages.current_page : res.storeCredits.current_page" :last="(res.classPackages) ? res.classPackages.last_page : res.storeCredits.last_page" />
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
            <transition name="fade">
                <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" :packageStatus="package_status" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import Pagination from '../../../../components/Pagination'
    import ConfirmStatus from '../../../../components/modals/ConfirmStatus'
    export default {
        components: {
            Foot,
            Pagination,
            ConfirmStatus,
        },
        data () {
            return {
                name: 'Classes and Packages',
                filter: false,
                access: true,
                loaded: false,
                lastRoute: '',
                rowCount: 0,
                status: 1,
                package_status: 1,
                res: [],
                types: []
            }
        },
        methods: {
            codeClipboard (data, key) {
                const me = this
                let element = document.getElementById(`sku_id_${key}`)
                element.select()
                element.setSelectionRange(0, 99999)
                document.execCommand("copy")
                element.nextElementSibling.innerHTML = 'Copied!'
                setTimeout( () => {
                    element.nextElementSibling.innerHTML = 'Copy'
                }, 500)
            },
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            submissionSuccess (packageStatus) {
                const me = this
                let apiRoute = ''
                me.filter = true
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                switch (packageStatus) {
                    case 1:
                        apiRoute = 'api/packages/class-packages/search'
                        break
                    case 3:
                        apiRoute = 'api/packages/store-credits/search'
                        break
                }
                me.loader(true)
                me.$axios.post(apiRoute, formData).then(res => {
                    if (res.data) {
                        me.res = res.data
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = (me.res.classPackages) ? 'class_packages' : 'store_credits'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = (me.res.classPackages) ? 'class package' : 'store credits'
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
            fetchData (value, packageStatus) {
                const me = this
                let apiRoute = ''
                switch (packageStatus) {
                    case 1:
                        apiRoute = `api/packages/class-packages?enabled=${value}`
                        break
                    case 2:
                        apiRoute = `api/packages/class-packages?enabled=${value}&promo=${packageStatus}`
                        break
                    case 3:
                        apiRoute = `api/packages/store-credits?enabled=${value}`
                        break
                }
                me.loader(true)
                me.$axios.get(apiRoute).then(res => {
                    me.res = res.data
                    me.loaded = true
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 300)
                })
                me.$axios.get(`api/packages/package-types?enabled=1`).then(res => {
                    me.types = res.data.packageTypes.data
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1, 1)
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
