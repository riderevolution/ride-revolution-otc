<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <form id="default_form" class="alternate" @submit.prevent="submissionSuccess()" v-if="loaded">
                    <section id="top_content" class="table" v-if="loaded">
                        <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                        <div class="action_wrapper alternate">
                            <h1 class="header_title">
                                <div class="uppercase">P.O. {{ res.purchase_order_number }}</div>
                            </h1>
                            <div class="action_buttons">
                                <button type="submit" name="submit" class="action_success_btn alternate margin">Receive</button>
                            </div>
                        </div>
                        <div class="filter_wrapper">
                            <div class="filter_flex" id="filter">
                                <div class="filter_label">ID: {{ res.po_id }}</div>
                                <div class="filter_label margin">Supplier: {{ res.supplier.name }}</div>
                                <div class="filter_label margin">Studio: {{ res.studio.name }}</div>
                            </div>
                        </div>
                    </section>
                    <section id="content" v-if="loaded">
                        <div class="cms_table_input alternate">
                            <div class="header_wrapper">
                                <div class="input_header name">Product Name</div>
                                <div class="input_header">SKU ID</div>
                                <div class="input_header">Qty. Purchased</div>
                                <div class="input_header">Sellable/Non-sellable</div>
                                <div class="input_header">Qty. Received</div>
                            </div>
                            <div class="content_wrapper" v-if="res.purchase_order_products.length > 0">
                                <purchase-order class="input_content_wrapper table" :type="'receive'" :unique="key" :value="data" v-for="(data, key) in res.purchase_order_products" :key="key" />
                            </div>
                        </div>
                    </section>
                </form>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import PurchaseOrder from '../../../components/PurchaseOrder'
    import Foot from '../../../components/Foot'
    export default {
        components: {
            PurchaseOrder,
            Foot
        },
        data () {
            return {
                name: 'Studio Receiving',
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
                        let formData = new FormData(document.getElementById('default_form'))
                        let studio_id = me.$cookies.get('CSID')
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        formData.append('studio_id', studio_id)
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/inventory/purchase-orders/receive/${me.$route.params.param}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Updated')
                                    me.$router.push(`/${me.lastRoute}`)
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
