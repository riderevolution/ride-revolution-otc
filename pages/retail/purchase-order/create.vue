<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <form id="default_form" class="alternate" @submit.prevent="submissionSuccess()" enctype="multipart/form-data" v-if="loaded">
                <section id="top_content" class="table" v-if="loaded">
                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">
                            <div>New Purchase Orders</div>
                            <span class="header_id">ID: {{ randomID }}</span>
                            <div class="form_check alternate">
                                <input type="checkbox" id="validate" name="paid" class="action_check" @change="tickPaid($event)">
                                <label for="validate">Paid</label>
                            </div>
                        </h1>
                    </div>
                    <div class="filter_wrapper">
                        <div class="filter_flex" id="filter">
                            <div class="form_group">
                                <label for="supplier_id">Supplier</label>
                                <select class="default_select alternate" name="supplier_id" @change="searchVariants()" v-model="form.supplier">
                                    <option value="" selected disabled>Select a Supplier</option>
                                    <option :value="supplier.id" v-for="(supplier, key) in suppliers" :key="key">{{ supplier.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="studio_id">Studio</label>
                                <select :class="`default_select alternate ${(!isSupplier) ? 'disabled' : (purchaseOrders.length > 0 ? 'disabled' : '') }`" name="studio_id" v-model="form.studio" @change="searchVariants()">
                                    <option value="" selected disabled>Select a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="po_number">P.O. Number</label>
                                <input type="text" name="po_number" placeholder="Enter P.O. Number" autocomplete="off" :class="`uppercase default_text ${(!isStudio) ? 'disabled' : '' }`" v-validate="'required|max:25'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('po_number')">{{ errors.first('po_number') || properFormat }}</span></transition>
                            </div>
                            <div class="form_group margin alternate" v-click-outside="closeMe">
                                <label>Search a Product</label>
                                <input type="text" autocomplete="off" placeholder="Add a product name only" :class="`default_text search_alternate ${(!isStudio) ? 'disabled' : '' }`" @click="autocomplete ^= true" @input="filterVariants($event)">
                                <div :class="`cms_autocomplete ${(variants.length >= 8) ? 'scrollable' : ''}`" v-if="autocomplete">
                                    <div class="autocomplete_title" v-for="(variant, key) in variants" :key="key" @click="addVariant(variant)" v-if="variants.length > 0">{{ variant.product.name }} - {{ variant.variant }}</div>
                                    <div class="autocomplete_title" v-if="variants.length == 0">No Product(s) Found.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="content" v-if="loaded">
                    <div class="cms_table_input alternate" v-if="isSupplier && isStudio">
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
                        <div class="content_wrapper" v-if="purchaseOrders.length > 0">
                            <purchase-order :type="'create'" :class="`input_content_wrapper ${(data.product_quantities[0].quantity < data.reorder_point) ? 'threshold' : ''}`" ref="orders" :unique="key" :value="data" v-for="(data, key) in purchaseOrders" :key="key" />
                            <div class="footer_wrapper">
                                <div class="footer_form_group">
                                    <label for="name">Shipping Cost:</label>
                                    <div class="footer_input">
                                        <input type="text" name="shipping" class="default_text" autocomplete="off" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}" v-model="form.total_shipping">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has(`shipping`)">{{ errors.first('shipping') || properFormat }}</span></transition>
                                    </div>
                                </div>
                                <!-- <div class="footer_cost">Total Additional Cost: PHP {{ computeAdditional }}</div> -->
                                <div class="footer_cost">Total Shipping Cost: PHP {{ computeShipping }}</div>
                                <div class="footer_total_cost">Total: <span class="total_cost">PHP {{ getAllCost }}</span></div>
                            </div>
                        </div>
                        <div class="no_results" v-if="purchaseOrders.length == 0">
                            No Variant(s) Found. Please add a variant.
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="button_group">
                                <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                <button type="submit" name="submit" class="action_btn alternate margin">Create P.O.</button>
                            </div>
                        </div>
                    </div>
                    <div class="no_contents" v-else>
                        Select a supplier &amp; studio before entering any products.
                    </div>
                </section>
            </form>
        </div>
        <transition name="fade">
            <prompt-validate v-if="$store.state.promptValidateStatus" :message="message" :category="'purchase-order'" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import PromptValidate from '../../../components/modals/PromptValidate'
    import PurchaseOrder from '../../../components/PurchaseOrder'
    import Foot from '../../../components/Foot'
    export default {
        components: {
            PromptValidate,
            PurchaseOrder,
            Foot
        },
        provide () {
            return {
                $validator: this.$validator
            }
        },
        data () {
            return {
                isSupplier: false,
                isStudio: false,
                autocomplete: false,
                loaded: false,
                randomID: 0,
                lastRoute: '',
                prevRoute: '',
                status: 1,
                suppliers: [],
                studios: [],
                variants: [],
                purchaseOrders: [],
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
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        let lastValue = ''
                        for (let i = 1; i < newValue.length; i++) {
                            lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
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
                me.form.total_cost = total + parseFloat(me.form.total_shipping)
                return me.totalCount(total + parseFloat(me.form.total_shipping))
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
            tickPaid (event) {
                const me = this
                if (event.target.checked) {
                    event.target.checked = false
                    me.message = 'Are you sure that this has been paid? Please confirm.'
                } else {
                    event.target.checked = true
                    me.message = 'Are you sure that this is unpaid? Please confirm.'
                }
                me.$store.state.promptValidateStatus = true
                document.body.classList.add('no_scroll')
            },
            closeMe () {
                const me = this
                me.autocomplete = false
            },
            addVariant (data) {
                const me = this
                me.purchaseOrders.push(data)
                me.fetchItems()
                me.autocomplete = false
            },
            fetchItems () {
                const me = this
                if (me.purchaseOrders.length > 0) {
                    me.purchaseOrders.forEach((purchaseOrder, pindex) => {
                        me.variants.forEach((variant, vindex) => {
                            if (purchaseOrder.id == variant.id) {
                                me.variants.splice(vindex, 1)
                            }
                        })
                    })
                    // for (let i = me.form.shipping.length; i < me.purchaseOrders.length; i++) {
                    //     me.form.shipping.push(
                    //         {
                    //             unique: i,
                    //             value: 0.00
                    //         }
                    //     )
                    // }
                    // for (let j = me.form.additional.length; j < me.purchaseOrders.length; j++) {
                    //     me.form.additional.push(
                    //         {
                    //             unique: j,
                    //             value: 0.00
                    //         }
                    //     )
                    // }
                    for (let k = me.form.total.length; k < me.purchaseOrders.length; k++) {
                        me.form.total.push(
                            {
                                unique: k,
                                value: 0.00
                            }
                        )
                    }
                }
            },
            filterVariants () {
                const me = this
                let value = event.target.value
                me.$axios.get(`api/extras/purchase-orders-products-filter?supplier_id=${me.form.supplier}&studio_id=${me.form.studio}&q=${value}`).then(res => {
                    me.variants = res.data.productVariants
                    me.purchaseOrders = []
                    me.variants.forEach((variant, vindex) => {
                        if (variant.quantity < variant.reorder_point) {
                            me.purchaseOrders.push(variant)
                        }
                    })
                    me.fetchItems()
                })
            },
            searchVariants () {
                const me = this
                if (me.isSupplier) {
                    me.$axios.get(`api/extras/purchase-orders-products-filter?supplier_id=${me.form.supplier}&studio_id=${me.form.studio}`).then(res => {
                        me.variants = res.data.productVariants
                        me.purchaseOrders = []
                        me.variants.forEach((variant, vindex) => {
                            if (variant.quantity < variant.reorder_point) {
                                me.purchaseOrders.push(variant)
                            }
                        })
                        me.fetchItems()
                        me.isStudio = true
                    })
                } else {
                    me.isSupplier = true
                }
            },
            fetchData () {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
                me.$axios.get('api/suppliers').then(res => {
                    me.suppliers = res.data.suppliers.data
                })
                me.$axios.get('api/extras/random-string').then(res => {
                    me.randomID = res.data.randomString
                })
                me.loaded = true
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('po_id', me.randomID)
                        // formData.append('total_additional_cost', me.form.total_additional)
                        formData.append('total_shipping_cost',  me.form.total_shipping)
                        formData.append('total_cost', me.form.total_cost)
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
            me.fetchData()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
