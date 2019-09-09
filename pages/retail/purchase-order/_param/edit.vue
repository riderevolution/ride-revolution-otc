<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <form id="default_form" class="alternate" @submit.prevent="submissionSuccess()" enctype="multipart/form-data" v-if="loaded">
                <section id="top_content" class="table" v-if="loaded">
                <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                <div class="action_wrapper alternate">
                    <h1 class="header_title">
                        <div class="uppercase">P.O. {{ res.purchase_order_number }}</div>
                        <span class="header_id">ID: {{ res.po_id }}</span>
                        <div class="form_check alternate">
                            <input type="checkbox" id="paid" name="paid" class="action_check" :checked="(res.paid == 1)">
                            <label for="paid">Paid</label>
                        </div>
                    </h1>
                    <div class="action_buttons">
                        <nuxt-link :to="`/${prevRoute}/${lastRoute}/${res.id}/show`" class="action_cancel_btn">Cancel</nuxt-link>
                        <button type="submit" name="submit" class="action_success_btn alternate margin">Update P.O.</button>
                    </div>
                </div>
                <div class="filter_wrapper">
                    <div class="filter_flex" id="filter">
                        <div class="filter_label">Supplier: {{ res.supplier.name }}</div>
                        <div class="filter_label margin">Studio: {{ res.studio.name }}</div>
                        <div class="filter_label margin">Requisition Date: {{ formatDate(res.created_at) }}</div>
                    </div>
                </div>
            </section>
                <section id="content" v-if="loaded">
                <div class="cms_table_input alternate">
                    <div class="header_wrapper">
                        <div class="input_header">Product Name</div>
                        <div class="input_header">SKU ID</div>
                        <div class="input_header">Sellable</div>
                        <div class="input_header">Category</div>
                        <div class="input_header">In Stock</div>
                        <div class="input_header">Qty.</div>
                        <div class="input_header">Unit Price</div>
                        <div class="input_header">Shipping Cost</div>
                        <div class="input_header">Additional Cost</div>
                        <div class="input_header">Cost</div>
                    </div>
                    <div class="content_wrapper" v-if="res.purchase_order_products.length > 0">
                        <purchase-order class="input_content_wrapper" :type="'edit'" :unique="key" :value="data" v-for="(data, key) in res.purchase_order_products" :key="key" />
                        <div class="footer_wrapper">
                            <div class="footer_cost">Total Additional Cost: PHP {{ computeAdditional }}</div>
                            <div class="footer_cost">Total Shipping Cost: PHP {{ computeShipping }}</div>
                            <div class="footer_total_cost">Total: <span class="total_cost">PHP {{ getAllCost }}</span></div>
                        </div>
                    </div>
                </div>
            </section>
            </form>
        </div>
        <transition name="fade">
            <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="`api/inventory/purchase-order-products`" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import PurchaseOrder from '../../../../components/PurchaseOrder'
    import Foot from '../../../../components/Foot'
    import ConfirmDelete from '../../../../components/modals/ConfirmDelete'
    export default {
        components: {
            PurchaseOrder,
            Foot,
            ConfirmDelete
        },
        data () {
            return {
                loaded: false,
                lastRoute: '',
                prevRoute: '',
                variants: [],
                res: [],
                form: {
                    supplier: '',
                    studio: '',
                    additional: [],
                    shipping: [],
                    total: [],
                    total_additional: 0,
                    total_shipping: 0,
                    total_cost: 0
                }
            }
        },
        computed: {
            getAllCost () {
                const me = this
                let total = 0.00
                me.form.total.forEach((item, index) => {
                    if (item.unique !== undefined) {
                        total = total + parseFloat(item.value)
                    }
                })
                me.form.total_cost = total
                return me.totalCount(total)
            },
            computeShipping () {
                const me = this
                let shipping = 0.00
                me.form.shipping.forEach((item, index) => {
                    if (item.unique !== undefined) {
                        shipping = shipping + parseFloat(item.value)
                    }
                })
                me.form.total_shipping = shipping
                return me.totalCount(shipping)
            },
            computeAdditional () {
                const me = this
                let additional = 0.00
                me.form.additional.forEach((item, index) => {
                    if (item.unique !== undefined) {
                        additional = additional + parseFloat(item.value)
                    }
                })
                me.form.total_additional = additional
                return me.totalCount(additional)
            }
        },
        methods: {
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            fetchData () {
                const me = this
                me.$axios.get(`api/inventory/purchase-orders/${me.$route.params.param}`).then(res => {
                    if (res.data) {
                        me.res = res.data.purchaseOrder
                        me.loaded = true
                        if (me.res.purchase_order_products.length > 0) {
                            for (let i = me.form.shipping.length; i < me.res.purchase_order_products.length; i++) {
                                me.form.shipping.push(
                                    {
                                        unique: i,
                                        value: 0.00
                                    }
                                )
                            }
                            for (let j = me.form.additional.length; j < me.res.purchase_order_products.length; j++) {
                                me.form.additional.push(
                                    {
                                        unique: j,
                                        value: 0.00
                                    }
                                )
                            }
                            for (let k = me.form.total.length; k < me.res.purchase_order_products.length; k++) {
                                me.form.total.push(
                                    {
                                        unique: k,
                                        value: 0.00
                                    }
                                )
                            }
                        }
                    }
                })
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        formData.append('po_id', me.randomID)
                        formData.append('total_additional_cost', me.form.total_additional)
                        formData.append('total_shipping_cost',  me.form.total_shipping)
                        formData.append('total_cost', me.form.total_cost)
                        me.loader(true)
                        me.$axios.post(`api/inventory/purchase-orders/${me.$route.params.param}`, formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Updated')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$router.push(`/${me.prevRoute}/${me.lastRoute}`)
                                }
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
							offset: -250
						})
                    }
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>