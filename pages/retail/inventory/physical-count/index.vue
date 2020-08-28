<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <h1 class="header_title">Physical Count</h1>
                        <div class="actions">
                            <div class="total">Total: {{ totalItems(res.physicalCounts.data.length) }}</div>
                            <div class="toggler">
                                <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Open</div>
                                <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Closed</div>
                            </div>
                        </div>
                    </div>
                    <div class="action_buttons">
                        <nuxt-link :to="`${$route.path}/create?studio_id=${form.studio_id}`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>New Physical Count</nuxt-link>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio_id">
                                    <option value="" selected disabled>Select a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Status</th>
                                <th class="stick">Date Started</th>
                                <th class="stick">Date Closed</th>
                                <th class="stick">Action</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.physicalCounts.data.length > 0">
                            <tr v-for="(data, key) in res.physicalCounts.data" :key="key">
                                <td :class="`${(data.status) ? 'green' : 'red'}`">{{ (data.status) ? 'Open' : 'Closed' }}</td>
                                <td>{{ $moment(data.created_at).format('MMMM DD, YYYY hh:mm A') }}</td>
                                <td>{{ (data.status) ? '-' : $moment(data.updated_at).format('MMMM DD, YYYY hh:mm A') }}</td>
                                <td width="25%">
                                    <div class="table_actions">
                                        <nuxt-link :to="`/retail/inventory/physical-count/${data.id}/edit`" class="table_action_edit link" v-if="data.status">Edit</nuxt-link>
                                        <nuxt-link :to="`/retail/inventory/physical-count/${data.id}/view`" class="table_action_edit link" v-if="!data.status">View</nuxt-link>
                                        <download-csv
                                            class="table_action_success link"
                                            :data="exportData(data)"
                                            :name="`physical-count-${$moment(data.created_at).format('MM-DD-YY-hh-mm')}.csv`">
                                            Export
                                        </download-csv>
                                        <div class="table_action_cancel link" v-if="data.status" @click="toggleDelete(data.id)">Delete</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="4">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.physicalCounts.path" :current="res.physicalCounts.current_page" :last="res.physicalCounts.last_page" />
                </section>
            </div>
            <transition name="fade">
                <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="`api/inventory/physical-count`" />
            </transition>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '~/components/Foot'
    import Pagination from '~/components/Pagination'
    import ConfirmDelete from '~/components/modals/ConfirmDelete'
    export default {
        components: {
            Foot,
            Pagination,
            ConfirmDelete
        },
        data () {
            return {
                name: 'Physical Count',
                filter: false,
                access: true,
                loaded: false,
                status: 1,
                res: [],
                studios: [],
                form:{
                    studio_id: ''
                }
            }
        },
        methods: {
            exportData (data) {
                const me = this
                let result = []
                data.physical_count_variant_deductions.forEach((variant, index) => {
                    result.push(
                        {
                            'Physical Count ID': data.id,
                            'Studio': data.studio.name,
                            'SKU ID': variant.product_quantity.product_variant.sku_id,
                            'Variant Name': variant.product_quantity.product_variant.variant,
                            'Starting Quantity': parseInt(variant.product_quantity.quantity) + parseInt(variant.deduction),
                            'Deducted Quantity': parseInt(variant.deduction),
                            'Computed Quantity': parseInt(variant.product_quantity.quantity),
                            'Product Name': variant.product_quantity.product_variant.product.name,
                            'Product Description': variant.product_quantity.product_variant.product.description,
                            'Supplier': variant.product_quantity.product_variant.product.supplier.name
                        }
                    )
                })
                return result
            },
            toggleDelete (id) {
                const me = this
                me.$store.state.deleteStatus = true
                document.body.classList.add('no_scroll')
                setTimeout( () => {
                    me.$refs.delete.contentID = id
                }, 100)
            },
            submitFilter () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('status', me.status)
                me.filter = true

                me.loader(true)
                me.$axios.get(`api/inventory/physical-count?studio_id=${me.form.studio_id}&status=${me.status}`).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            },
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
            },
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/inventory/physical-count?studio_id=${me.form.studio_id}&status=${value}`).then(res => {
                    setTimeout( () => {
                        me.res = res.data
                        me.loaded = true
                    }, 500)
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let studio_id = me.$cookies.get('CSID')

                me.$axios.get('api/studios', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                        me.form.studio_id = studio_id
                        me.fetchData(1)
                    }
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
