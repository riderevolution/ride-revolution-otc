<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
                <div class="action_wrapper">
                    <h1 class="header_title">Physical Gift Cards</h1>
                    <div class="actions">
                        <div class="total">Total: {{ totalItems(res.giftCards.total) }}</div>
                        <div class="toggler">
                            <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                            <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                        </div>
                    </div>
                </div>
                <div class="action_buttons">
                    <a href="javascript:void(0)" class="action_btn alternate" @click="$store.state.importStatus = true">Import Gift Cards</a>
                </div>
                <div class="filter_wrapper">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
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
                <table class="cms_table">
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
                <pagination :apiRoute="res.giftCards.path" :current="res.giftCards.current_page" :last="res.giftCards.last_page" />
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
                prevRoute: '',
                rowCount: 0,
                status: 1,
                res: [],
                classPackages: []
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
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post('api/inventory/gift-cards/search', formData).then(res => {
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
                    me.$refs.enabled.confirm.table_name = 'gift_cards'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'gift card'
                }, 100)
                document.body.classList.remove('no_scroll')
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/inventory/gift-cards?enabled=${value}&status=0`).then(res => {
                    if (res.data) {
                        me.res = res.data
                        me.loaded = true
                        me.$axios.get('api/extras/class-packages-for-gift-cards').then(res => {
                            me.classPackages = res.data.classPackages
                        })
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
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
