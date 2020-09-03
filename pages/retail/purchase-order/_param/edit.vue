<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <form id="default_form" class="alternate" @submit.prevent="submissionSuccess()" v-if="loaded">
                    <section id="top_content" class="table" v-if="loaded">
                        <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                        <div class="action_wrapper alternate">
                            <h1 class="header_title">
                                <div class="uppercase">P.O. {{ res.purchase_order_number }}</div>
                                <span class="header_id">ID: {{ res.po_id }}</span>
                                <div class="form_check alternate">
                                    <input type="checkbox" id="validate" name="paid" class="action_check" :checked="(res.paid == 1)" @change="tickPaid(res.paid)">
                                    <label for="validate">Paid</label>
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
                                <div class="input_header name">Product Name</div>
                                <div class="input_header">SKU ID</div>
                                <div class="input_header">Sellable</div>
                                <div class="input_header">Category</div>
                                <div class="input_header">In Stock</div>
                                <div class="input_header">Qty.</div>
                                <div class="input_header">Unit Price</div>
                                <!-- <div class="input_header">Shipping Cost</div> -->
                                <!-- <div class="input_header">Additional Cost</div> -->
                                <div class="input_header">Cost</div>
                            </div>
                            <div class="content_wrapper" v-if="res.purchase_order_products.length > 0">
                                <purchase-order class="input_content_wrapper table" :type="'edit'" :unique="key" :value="data" v-for="(data, key) in res.purchase_order_products" :key="key" />
                                <div class="footer_wrapper">
                                    <div class="footer_form_group">
                                        <label for="name">Shipping Cost:</label>
                                        <div class="footer_input">
                                            <input type="text" name="shipping" class="default_text" autocomplete="off" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}" v-model="form.total_shipping">
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has(`shipping`)">{{ properFormat(errors.first('shipping')) }}</span></transition>
                                        </div>
                                    </div>
                                    <!-- <div class="footer_cost">Total Additional Cost: PHP {{ computeAdditional }}</div> -->
                                    <div class="footer_cost">Total Shipping Cost: PHP {{ computeShipping }}</div>
                                    <div class="footer_total_cost">Total: <span class="total_cost">PHP {{ getAllCost }}</span></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
            <transition name="fade">
                <prompt-validate v-if="$store.state.promptValidateStatus" :message="message" :category="'purchase-order'" />
            </transition>
            <transition name="fade">
                <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="`api/inventory/purchase-order-products`" />
            </transition>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import PromptValidate from '../../../../components/modals/PromptValidate'
    import PurchaseOrder from '../../../../components/PurchaseOrder'
    import Foot from '../../../../components/Foot'
    import ConfirmDelete from '../../../../components/modals/ConfirmDelete'
    export default {
        components: {
            PromptValidate,
            PurchaseOrder,
            Foot,
            ConfirmDelete
        },
        data () {
            return {
                name: 'Purchase Order',
                access: true,
                loaded: false,
                lastRoute: '',
                prevRoute: '',
                variants: [],
                res: [],
                message: '',
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
                // let shipping = 0.00
                // me.form.shipping.forEach((item, index) => {
                //     if (item.unique !== undefined) {
                //         shipping = shipping + parseFloat(item.value)
                //     }
                // })
                // me.form.total_shipping = shipping
                return me.totalCount(me.form.total_shipping)
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
            tickPaid (status) {
                const me = this
                if (status) {
                    event.target.checked = true
                    me.message = 'Are you sure that this is unpaid? Please confirm.'
                } else {
                    event.target.checked = false
                    me.message = 'Are you sure that this has been paid? Please confirm.'
                }
                me.$store.state.promptValidateStatus = true
                document.body.classList.add('no_scroll')
            },
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
                            // for (let i = me.form.shipping.length; i < me.res.purchase_order_products.length; i++) {
                            //     me.form.shipping.push(
                            //         {
                            //             unique: i,
                            //             value: 0.00
                            //         }
                            //     )
                            // }
                            // for (let j = me.form.additional.length; j < me.res.purchase_order_products.length; j++) {
                            //     me.form.additional.push(
                            //         {
                            //             unique: j,
                            //             value: 0.00
                            //         }
                            //     )
                            // }
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
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        formData.append('total_additional_cost', me.form.total_additional)
                        formData.append('total_shipping_cost',  me.form.total_shipping)
                        formData.append('total_cost', me.form.total_cost)
                        me.loader(true)
                        me.$axios.post(`api/inventory/purchase-orders/${me.$route.params.param}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Updated')
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
                        setTimeout( () => {
                            me.$scrollTo('.validation_errors', {
                                offset: -250
                            })
                        }, 10)
                    }
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
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
