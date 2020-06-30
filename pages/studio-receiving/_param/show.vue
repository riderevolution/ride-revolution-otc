<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <form id="default_form" class="alternate">
                    <section id="top_content" class="table">
                        <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                        <div class="action_wrapper alternate">
                            <h1 class="header_title">
                                <div class="uppercase">P.O. {{ res.purchase_order_number }}</div>
                            </h1>
                        </div>
                        <div class="filter_wrapper">
                            <div class="filter_flex" id="filter">
                                <div class="filter_label">ID: {{ res.po_id }}</div>
                                <div class="filter_label margin">Supplier: {{ res.supplier.name }}</div>
                                <div class="filter_label margin">Studio: {{ res.studio.name }}</div>
                            </div>
                        </div>
                    </section>
                    <section id="content">
                        <div class="cms_table_input alternate">
                            <div class="header_wrapper">
                                <div class="input_header name">Product Name</div>
                                <div class="input_header">SKU ID</div>
                                <div class="input_header">Qty. Purchased</div>
                                <div class="input_header">Sellable/Non-sellable</div>
                                <div class="input_header">Qty. Received</div>
                            </div>
                            <div class="content_wrapper" v-if="res.purchase_order_products.length > 0">
                                <purchase-order class="input_content_wrapper table" :type="'receive-show'" :unique="key" :value="data" v-for="(data, key) in res.purchase_order_products" :key="key" />
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
        filters: {
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    let nextValue = newValue[0].split('_')
                    if (nextValue.length > 1) {
                        newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                    } else {
                        newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = ''
                        let lastValue = ''
                        if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                            firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                        for (let i = 1; i < newValue.length; i++) {
                            if (newValue[i] != 'id') {
                                lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                            }
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
					if (message[0].split('file').length > 1) {
                        message = message[0].split('file')[1]
                        return `The ${newValue} field${message}`
                    } else {
                        return `The ${newValue}`
                    }
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
