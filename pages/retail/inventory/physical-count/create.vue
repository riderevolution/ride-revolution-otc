<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link to="/retail/inventory/physical-count" class="action_back_btn"><img src="/icons/back-icon.svg"><span>Physical Count</span></nuxt-link>
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Physical Count for {{ studio.name }}</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                        </div>
                        <div class="action_buttons">
                            <div class="action_cancel_btn" @click="resetVariantQuantities()">Reset Quantities</div>
                            <div class="action_btn alternate" @click="submit('open')">Save</div>
                            <div class="action_success_btn margin alternate" @click="submit('closed')">Save &amp; Update Inventory</div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent>
                            <div class="form_group alternate">
                                <label for="q">Find a variant</label>
                                <input type="text" name="q" autocomplete="off" @input="submitFilter()" v-model="form.search" placeholder="Search for a variant" class="default_text search_alternate">
                            </div>
                        </form>
                    </div>
                </section>
                <form id="content" @submit.prevent>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">SKU ID</th>
                                <th class="sticky">Variant Name</th>
                                <th class="sticky">Product Name</th>
                                <th class="sticky">Current Qty.</th>
                                <th class="sticky">Deduct Qty.</th>
                                <th class="sticky">Computed Qty.</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0 && !no_search_found">
                            <tr v-for="(data, key) in populateVariants" :key="key" v-show="data.searched" :data-vv-scope="`variant_form_${key}`">
                                <td>{{ data.sku_id }}</td>
                                <td>{{ data.variant }}</td>
                                <td>{{ data.product.name }}</td>
                                <td>{{ data.product_quantities[0].quantity }}</td>
                                <td width="20%">
                                    <div class="form_group no_margin">
                                        <input type="text" name="deduct_quantity[]" autocomplete="off" v-model="data.deduct_qty" @input="computeQty(data)" class="default_text" :data-vv-name="`variant_form_${key}.deduct_quantity[]`" v-validate="{numeric: true, min_value: 0, max_value: data.product_quantities[0].quantity}" value="0">

                                        <input type="hidden" name="sku_id[]" :value="data.sku_id">
                                        <input type="hidden" name="product_quantity_id[]" :value="data.product_quantities[0].id">
                                        <input type="hidden" name="computed_quantity[]" :value="data.computed_qty">

                                        <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${key}.deduct_quantity[]`)">{{ properFormat(errors.first(`variant_form_${key}.deduct_quantity[]`)) }}</span></transition>
                                    </div>
                                </td>
                                <td>{{ data.computed_qty }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td colspan="6">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '~/components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Physical Count',
                access: true,
                loaded: false,
                no_search_found: false,
                res: [],
                studio: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: 0,
                    search: ''
                }
            }
        },
        computed: {
            populateVariants () {
                const me = this
                let result = []
                me.res.forEach((data, index) => {
                    result.push(data)
                })
                return result
            }
        },
        methods: {
            submit (type) {
                const me = this
                let formData = new FormData(document.getElementById('content'))
                if (type == 'open') {
                    formData.append('status', 1)
                } else {
                    formData.append('status', 0)
                }
                formData.append('studio_id', me.studio.id)
                me.loader(true)
                me.$axios.post('api/inventory/physical-count', formData).then(res => {
                    setTimeout( () => {
                        if (res.data) {
                            console.log(res.data);
                            // me.$router.push(`/${me.prevRoute}/${me.lastRoute}`)
                        }
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
            resetVariantQuantities () {
                const me = this
                me.res.forEach((data, index) => {
                    data.deduct_qty = 0
                    data.computed_qty = 0
                })
            },
            submitFilter () {
                const me = this
                let ctr = 0
                me.res.forEach((data, index) => {
                    let name = data.variant.toLowerCase()
                    if (me.form.search != '') {
                        if (name.includes(me.form.search.toLowerCase())) {
                            data.searched = true
                        } else {
                            ctr++
                            data.searched = false
                        }
                    } else {
                        data.searched = true
                    }
                })
                if (ctr == me.res.length) {
                    me.no_search_found = true
                } else {
                    me.no_search_found = false
                }
                me.rowCount = document.getElementsByTagName('th').length
            },
            computeQty (data) {
                const me = this
                data.computed_qty = parseInt(data.product_quantities[0].quantity) - parseInt(data.deduct_qty)
                if (data.computed_qty < 0) {
                    data.computed_qty = 0
                }
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/inventory/product-variants?studio_id=${me.form.studio_id}&for_reporting=1`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            res.data.productVariants.forEach((data, index) => {
                                data.searched = true
                                data.deduct_qty = 0
                                data.computed_qty = 0
                                me.res.push(data)
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.rowCount = document.getElementsByTagName('th').length
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
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data != 0) {
                        me.$axios.get(`api/studios/${res.data.user.current_studio_id}`).then(res => {
                            me.studio = res.data.studio
                            me.form.studio_id = me.studio.id
                        })
                        setTimeout( () => {
                            me.fetchData()
                        }, 500)
                    }
                }).catch(err => {
                    console.log(err);
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
