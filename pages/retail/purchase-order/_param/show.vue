<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
                <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                <div class="action_wrapper alternate">
                    <h1 class="header_title">
                        <div class="uppercase">P.O. {{ res.purchase_order_number }}</div>
                        <span class="header_id">ID: {{ res.po_id }}</span>
                        <span :class="`${(res.paid == 1) ? 'green' : 'red'}`">{{ (res.paid == 1) ? 'Paid' : 'Unpaid' }}</span>
                    </h1>
                    <div class="action_buttons">
                        <nuxt-link :to="`/${prevRoute}/${lastRoute}/${res.id}/duplicate`" class="action_btn">Duplicate P.O.</nuxt-link>
                        <nuxt-link :to="`/${prevRoute}/${lastRoute}/${res.id}/edit`" class="action_btn alternate margin">Edit P.O.</nuxt-link>
                        <div class="action_cancel_btn margin" @click="toggleDelete($route.params.param)" v-if="res.paid == 0">Delete P.O.</div>
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
                        <purchase-order class="input_content_wrapper table" :type="'show'" :unique="key" :value="data" v-for="(data, key) in res.purchase_order_products" :key="key" />
                        <div class="footer_wrapper">
                            <!-- <div class="footer_cost">Total Additional Cost: PHP {{ totalCount(res.total_additional_cost) }}</div> -->
                            <div class="footer_cost">Total Shipping Cost: PHP {{ totalCount(res.total_shipping_cost) }}</div>
                            <div class="footer_total_cost">Total: <span class="total_cost">PHP {{ totalCount(res.total_cost) }}</span></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <transition name="fade">
            <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="`api/inventory/purchase-orders`" />
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
                purchase_order: true
            }
        },
        methods: {
            toggleDelete (id) {
                const me = this
                me.$store.state.deleteStatus = true
                document.body.classList.add('no_scroll')
                setTimeout( () => {
                    me.$refs.delete.contentID = id
                }, 100)
            },
            formatDate (value) {
                if (value) {
                    return this.$moment(value).format('MMM DD, YYYY')
                }
            },
            fetchShowData () {
                const me = this
                me.$axios.get(`api/inventory/purchase-orders/${me.$route.params.param}`).then(res => {
                    if (res.data) {
                        me.res = res.data.purchaseOrder
                        me.loaded = true
                    }
                })
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        me.loader(true)
                        me.$axios.post('api/inventory/purchase-orders', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
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
            me.fetchShowData()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
