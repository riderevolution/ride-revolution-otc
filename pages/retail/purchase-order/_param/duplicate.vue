<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <form id="default_form" class="alternate" @submit.prevent="submissionSuccess()" enctype="multipart/form-data" v-if="loaded">
                <section id="top_content" class="table" v-if="loaded">
                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper alternate">
                        <h1 class="header_title">
                            <div>New Purchase Orders</div>
                            <span class="header_id">ID: {{ randomID }}</span>
                            <div class="form_check alternate">
                                <input type="checkbox" id="validate" name="paid" class="action_check" :checked="(res.paid == 1)" @change="tickPaid(res.paid)">
                                <label for="validate">Paid</label>
                            </div>
                        </h1>
                        <div class="action_buttons">
                            <nuxt-link :to="`/${prevRoute}/${lastRoute}/${res.id}/show`" class="action_cancel_btn">Cancel</nuxt-link>
                            <button type="submit" name="submit" class="action_btn alternate margin">Create P.O.</button>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <div class="filter_flex" id="filter">
                            <div class="form_group">
                                <label for="supplier_id">Supplier</label>
                                <select class="default_select alternate" name="supplier_id" v-model="form.supplier = res.supplier_id">
                                    <option value="" disabled>Select a Supplier</option>
                                    <option :value="supplier.id" v-for="(supplier, key) in suppliers" :key="key">{{ supplier.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id" v-model="form.studio = res.studio_id">
                                    <option value="" selected disabled>Select a Studio</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="po_number">P.O. Number</label>
                                <input type="text" name="po_number" placeholder="Enter P.O. Number" autocomplete="off" class="uppercase default_text" v-validate="'required|max:25'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('po_number')">{{ errors.first('po_number') | properFormat }}</span></transition>
                            </div>
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
                            <purchase-order :type="'duplicate'" class="input_content_wrapper" ref="orders" :unique="key" :value="data" v-for="(data, key) in res.purchase_order_products" :key="key" />
                            <div class="footer_wrapper">
                                <div class="footer_form_group">
                                    <label for="name">Shipping Cost:</label>
                                    <div class="footer_input">
                                        <input type="text" name="shipping" class="default_text" autocomplete="off" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}" v-model="form.total_shipping">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has(`shipping`)">{{ errors.first('shipping') | properFormat }}</span></transition>
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
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import PromptValidate from '../../../../components/modals/PromptValidate'
    import PurchaseOrder from '../../../../components/PurchaseOrder'
    import Foot from '../../../../components/Foot'
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
            fetchShowData () {
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
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
                me.$axios.get('api/suppliers').then(res => {
                    me.suppliers = res.data.suppliers.data
                })
                me.$axios.get('api/extras/random-string').then(res => {
                    me.randomID = res.data.randomString
                })
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('po_id', me.randomID)
                        formData.append('total_additional_cost', me.form.total_additional)
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
            me.fetchShowData()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
