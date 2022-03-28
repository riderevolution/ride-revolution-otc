<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div id="default_form" class="overlay alternate">
            <div class="modal_wrapper">
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_tab_wrapper" id="step1" v-show="nextStep == 1">
                    <div class="left_side">
                        <div class="overlay">
                            <h2 class="total_title">Buy Credits</h2>
                            <div class="total_price">Total: PHP {{ computeTotal }}</div>
                        </div>
                        <div class="modal_tab">
                            <div :class="`modal_tab_title ${(key == 0) ? 'active' : '' }`" v-for="(menu, key) in menus" :key="key" @click="toggleStatus(status = key, menu.type, menu.id)">{{ menu.name }}</div>
                        </div>
                    </div>
                    <div class="right_side">
                        <div class="modal_tab_content_header">
                            <div :class="`tab_content_flex ${(toCompare.package == 99999) ? 'alternate' : ''}`">
                                <div class="form_flex">
                                    <div class="form_group" v-if="toCompare.package != 99999">
                                        <label for="q">Search a Credit</label>
                                        <input type="text" name="q" autocomplete="off" placeholder="Search for a credits" v-model="form.search" class="default_text search_alternate">
                                    </div>
                                    <div class="button_group">
                                        <button type="button" class="action_btn alternate margin" v-if="toCompare.package != 99999" @click="submitFilter()">Search</button>
                                    </div>
                                </div>
                                <div class="button_group">
                                    <button type="button" class="action_btn alternate" @click="takePayment(2)">Take Payment</button>
                                </div>
                            </div>
                            <div class="total_items" v-if="toCompare.package != 99999">{{ totalItems(total) }} <span>items</span></div>
                        </div>
                        <div class="modal_tab_content">
                            <form id="product_form" data-vv-scope="product_form" v-show="isProduct">
                                <customer-credit-quick-sale-tab-content ref="quickSale" :value="value" :unique="index" v-for="(value, index) in showProducts" :key="`${unique}_${value.id}`" />
                            </form>
                            <div class="no_results" v-if="total == 0">
                                No Result(s) Found.
                            </div>
                        </div>
                    </div>
                </div>
                <form class="modal_tab_wrapper alternate" id="step2" data-vv-scope="checkout_form" v-show="nextStep == 2">
                    <div class="header_side">
                        <h2 class="header_title">Checkout</h2>
                        <div class="header_subtitle">
                            <span>ID: {{ form.id }}</span>
                        </div>
                    </div>
                    <div class="left_side">
                        <h2 class="left_title">Payment Method</h2>
                        <div class="form_flex_radio">
                            <div class="form_radio">
                                <input type="radio" id="debit_card" value="debit-card" name="payment_method" class="action_radio" checked @change="checkPayment('debit')">
                                <label for="debit_card">Debit Card</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="check" value="check" name="payment_method" class="action_radio" @change="checkPayment('check')">
                                <label for="check">Check</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="credit_card" value="credit-card" name="payment_method" class="action_radio" @change="checkPayment('credit')">
                                <label for="credit_card">Credit Card</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="comp" value="comp" name="payment_method" class="action_radio" @change="checkPayment('comp')">
                                <label for="comp">Comp</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="gcash" value="gcash" name="payment_method" class="action_radio" @change="checkPayment('gcash')">
                                <label for="gcash">GCash</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="cash" value="cash" name="payment_method" class="action_radio" @change="checkPayment('cash')">
                                <label for="cash">Cash</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="conversion" value="conversion" name="payment_method" class="action_radio" @change="checkPayment('conversion')">
                                <label for="conversion">Conversion</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="third_party_platform" value="third_party_platform" name="payment_method" class="action_radio" @change="checkPayment('third_party_platform')">
                                <label for="third_party_platform">Third Party Platform</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="class_pass" value="class_pass" name="payment_method" class="action_radio" @change="checkPayment('class_pass')">
                                <label for="class_pass">ClassPass</label>
                            </div>
                            <div class="form_radio">
                                <input type="radio" id="store_credits" value="store-credits" name="payment_method" class="action_radio" @change="checkPayment('store-credits')">
                                <label for="store_credits">Store Credits</label>
                            </div>
                        </div>
                        <div class="form_main_group" v-if="form.paymentType == 0 || form.paymentType == 2">
                            <div class="form_group">
                                <label for="bank">Bank <span>*</span></label>
                                <select class="default_select alternate" name="bank" key="bank" v-validate="'required'">
                                    <option value="" selected disabled>Select a Bank</option>
                                    <option value="bpi">Bank of the Philippines Islands</option>
                                    <option value="bdo">Banco de Oro</option>
                                    <option value="psbank">PSBank</option>
                                    <option value="metrobank">MetroBank</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.bank')">{{ properFormat(errors.first('checkout_form.bank')) }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="terminal">Terminal <span>*</span></label>
                                <select class="default_select alternate" name="terminal" key="terminal" v-validate="'required'" v-model="cardType">
                                    <option value="" selected disabled>Select Terminal</option>
                                    <option value="paymaya">Paymaya</option>
                                    <option value="bdo">BDO</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.terminal')">{{ properFormat(errors.first('checkout_form.terminal')) }}</span></transition>
                            </div>
                            <div class="form_group" v-if="cardType == 'others'">
                                <label for="others">Others <span>*</span></label>
                                <input type="text" name="others" class="default_text" key="others" v-validate="'required'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.others')">{{ properFormat(errors.first('checkout_form.others')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group" v-else-if="form.paymentType == 1">
                            <div class="form_group">
                                <label for="bank">Bank<span>*</span></label>
                                <input type="text" name="bank" class="default_text" key="bank" v-validate="'required'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.bank')">{{ properFormat(errors.first('checkout_form.bank')) }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="check_number">Check Number<span>*</span></label>
                                <input type="text" name="check_number" class="default_text" key="check_number" v-validate="'required'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.check_number')">{{ properFormat(errors.first('checkout_form.check_number')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group" v-else-if="form.paymentType == 3">
                            <div class="form_group">
                                <label for="comp_reason">Comp Reason <span>*</span></label>
                                <select class="default_select alternate" name="comp_reason" v-validate="'required'" key="comp_reason" v-model="form.comp">
                                    <option value="" selected disabled>Select a Reason</option>
                                    <option value="Guest">Guest</option>
                                    <option value="Bike Purchase">Bike Purchase</option>
                                    <option value="Bike Rental">Bike Rental</option>
                                    <option value="Ride Along">Ride Along</option>
                                    <option value="Customer Complaint">Customer Complaint</option>
                                    <option value="Special Deal (Promo)">Special Deal (Promo)</option>
                                    <option value="Prize (Event/Campaign)">Prize (Event/Campaign)</option>
                                    <option value="X Deal">X Deal</option>
                                    <option value="RR Team">RR Team</option>
                                    <option value="RR Investor/Shareholder">RR Investor/Shareholder</option>
                                    <option value="Other">Other</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.comp_reason')">{{ properFormat(errors.first('checkout_form.comp_reason')) }}</span></transition>
                            </div>
                            <transition name="fade">
                                <div class="form_group" v-if="reasonType">
                                    <label for="indicate_reason">Details Required <span>*</span></label>
                                    <input type="text" name="indicate_reason" class="default_text" v-validate="'required'" key="indicate_reason">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.indicate_reason')">{{ properFormat(errors.first('checkout_form.indicate_reason')) }}</span></transition>
                                </div>
                            </transition>
                            <div class="form_group">
                                <label for="remarks">Notes/Remarks <span>*</span></label>
                                <textarea name="remarks" rows="8" id="remarks" class="default_text" key="remarks" placeholder="Enter remarks" v-validate="{ required: true }"></textarea>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.remarks')">{{ properFormat(errors.first('checkout_form.remarks')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group" v-else-if="form.paymentType == 4">
                            <div class="form_group">
                                <label for="cash_tendered">Cash Tendered (PHP)<span>*</span></label>
                                <input type="text" name="cash_tendered" class="default_text" key="cash_tendered" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', min_value: form.total, max_value: 9999999}"  v-model="form.change">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.cash_tendered')">{{ properFormat(errors.first('checkout_form.cash_tendered')) }}</span></transition>
                            </div>
                            <div class="form_group">
                                <label for="change">Change (PHP)</label>
                                <input type="text" name="change" class="default_text disabled" v-model="computeChange" v-validate="'required'">
                            </div>
                        </div>
                        <div class="form_main_group" v-else-if="form.paymentType == 5">
                            <div class="form_group">
                                <label for="reference_number">Reference Number <span>*</span></label>
                                <input type="text" name="reference_number" class="default_text" v-validate="'required'" key="reference_number">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.reference_number')">{{ properFormat(errors.first('checkout_form.reference_number')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group" v-else-if="form.paymentType == 6 || form.paymentType == 7 || form.paymentType == 8">
                            <div class="form_group">
                                <label for="note">Note <span>*</span></label>
                                <input type="text" name="note" class="default_text" key="note" v-validate="{ required: true }">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.note')">{{ properFormat(errors.first('checkout_form.note')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group" v-if="form.paymentType != 3">
                            <template v-if="form.paymentType == 9999">
                                <div class="form_group">
                                    <label>Remaining Store Credits</label>
                                    <input type="text" readonly disabled class="default_text disabled" key="store" :value="(customer.store_credits) ? totalItems(customer.store_credits.amount) : 0">
                                </div>
                            </template>
                            <div class="form_group">
                                <label for="remarks">Remarks</label>
                                <textarea name="remarks" rows="8" id="remarks" class="default_text" placeholder="Enter remarks"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="right_side">
                        <div class="breakdown_wrapper">
                            <table class="breakdown_table">
                                <thead>
                                    <tr>
                                        <th>Items</th>
                                        <th>Qty.</th>
                                        <th>Price Per Item</th>
                                        <th>Computed Price</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody v-if="totalPrice.length > 0">
                                    <tr v-for="(data, key) in showBreakDown" :key="key">
                                        <td class="item_name" width="35%">({{ data.quantity }}) {{ (data.item.product.product) ? `${data.item.product.product.name} - ${data.item.name}` : data.item.name }}</td>
                                        <td width="15%">
                                            <div class="form_flex_input" :data-vv-scope="`breakdown_${key}`">
                                                <input type="text" name="quantity" :id="`quantity_${key}`" @input="computeQuantity(data.id, data.quantity, key, parseFloat(data.item.product.package_price))" :class="`default_text number ${(data.item.product.allow_multiple_purchase == 1) ? '' : 'disabled'}`" maxlength="2" autocomplete="off" :data-vv-name="`breakdown_${key}.quantity`" v-model="data.quantity" v-validate="'required|numeric|min_value:1|max_value:99'">
                                                <div class="up" @click="computeQuantity(data.id, data.quantity + 1, key, parseFloat(data.item.product.package_price))" v-if="data.item.product.allow_multiple_purchase == 1"></div>
                                                <div class="down" @click="computeQuantity(data.id, data.quantity - 1, key, parseFloat(data.item.product.package_price))" v-if="data.item.product.allow_multiple_purchase == 1"></div>
                                                <transition name="slide"><span class="validation_errors" v-if="errors.has(`breakdown_${key}.quantity`)">The quantity field is required</span></transition>
                                            </div>
                                        </td>
                                        <td class="item_price" width="25%">PHP {{ totalCount(data.item.origPrice) }}</td>
                                        <td class="item_price" width="25%" v-if="!promo_applied">
                                            <p>PHP {{ totalCount(data.price) }}</p>
                                        </td>
                                        <td class="item_price" width="25%" v-else>
                                            <p class="prev_price" >PHP {{ totalCount(data.price) }}</p>
                                            <p>PHP {{ totalCount(data.discounted_price) }}</p>
                                        </td>
                                        <td>
                                            <div class="close_wrapper alternate" @click="removeOrder(key, data.item.id)">
                                                <div class="close_icon"></div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody class="no_results" v-else>
                                    <tr>
                                        <td colspan="4">No Product(s) Found.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="breakdown_total">
                            <div class="promo">
                                <div class="form_group">
                                    <label for="promo_code">Promo Code</label>
                                    <input type="text" name="promo_code" :class="`default_text ${(promoApplied) ? 'disabled' : ''}`">
                                </div>
                                <button type="button" :class="`${(promoApplied) ? 'disabled' : ''} action_btn alternate`" @click="applyPromo()">Apply</button>
                            </div>
                            <div class="total_wrapper">
                                <div class="total_title">Total</div>
                                <div class="total_price">PHP {{ computeTotal }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="footer_side">
                        <div class="form_group_disclaimer">
                            <div class="form_disclaimer"><img src="/icons/disclaimer-icon.svg" /> <span>Note: Promo code won’t be applicable to promo products/packages.</span></div>
                        </div>
                        <div class="button_group">
                            <button type="button" class="action_btn" @click="takePayment(1)">Go Back</button>
                            <button type="button" class="action_success_btn alternate margin" @click.prevent="submitQuickSale()">Place Order</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <transition name="fade">
            <prompt-quick-sale v-if="$store.state.promptQuickSaleStatus" :message="message" />
        </transition>
        <transition name="fade">
            <prompt-promo v-if="$store.state.promptPromoStatus" :message="message" />
        </transition>
        <transition name="fade">
            <confirm-status v-if="$store.state.confirmStatus" ref="enabled" />
        </transition>
    </div>
</template>

<script>
    import CustomerCreditQuickSaleTabContent from './CustomerCreditQuickSaleTabContent'
    import PromptPromo from './PromptPromo'
    import PromptQuickSale from './PromptQuickSale'
    import ConfirmStatus from '~/components/modals/quicksale/ConfirmStatus'
    export default {
        components: {
            CustomerCreditQuickSaleTabContent,
            PromptPromo,
            PromptQuickSale,
            ConfirmStatus
        },
        data () {
            return {
                customer: null,
                user: [],
                nextStep: 1,
                status: 0,
                total: 0,
                products: [],
                menus: [
                    {
                        id: 99999,
                        name: 'Promos',
                        type: 'promo-package'
                    }
                ],
                form: {
                    search: '',
                    paymentType: 0,
                    id: '',
                    change: 0,
                    comp: '',
                    total: 0
                },
                showErrors: false,
                message: '',
                isProduct: true,
                promo_applied: false,
                toCompare: {
                    package: 0
                },
                unique: 0,
                totalPrice: [],
                toCheckout: [],
                cardType: '',
                promoApplied: false
            }
        },
        computed: {
            reasonType () {
                const me = this
                let result = false

                switch (me.form.comp) {
                    case 'Customer Complaint':
                    case 'Special Deal (Promo)':
                    case 'Prize (Event/Campaign)':
                    case 'X Deal':
                    case 'Other':
                        result = true
                        break
                    default:
                        result = false
                }

                return result
            },
            showBreakDown () {
                const me = this
                let result = []
                me.totalPrice.forEach((item, index) => {
                    result.push(item)
                })
                return result
            },
            computeChange () {
                const me = this
                let value = (me.form.change == '') ? 0 : parseFloat(me.form.change)
                let total = 0
                let change = 0
                if (value != 0) {
                    me.totalPrice.forEach((data, index) => {
                        if (me.promo_applied) {
                            total += parseFloat(data.discounted_price)
                        } else {
                            if (data.item.product.discounted_price) {
                                total += parseFloat(data.item.product.discounted_price)
                            } else {
                                total += parseFloat(data.price)
                            }
                        }
                    })
                } else {
                    change = 0
                }
                change = value - parseFloat(total)
                return me.totalCount(change)
            },
            computeTotal () {
                const me = this
                let total = 0
                me.totalPrice.forEach((data, index) => {
                    if (me.promo_applied) {
                        total += parseFloat(data.discounted_price)
                    } else {
                        if (data.item.product.discounted_price) {
                            total += parseFloat(data.item.product.discounted_price)
                        } else {
                            total += parseFloat(data.price)
                        }
                    }
                })
                me.form.total = total
                return me.totalCount(total)
            },
            showProducts () {
                const me = this
                let products = []
                let status = true
                switch (me.toCompare.package) {
                    case 99999:
                        me.products.forEach((product, index) => {
                            if (product.is_promo == 1) {
                                product.isPromoPackageShow = true
                            } else {
                                product.isClassPackageShow = false
                            }

                        })
                        break
                    default:
                        me.products.forEach((product, index) => {
                            if (product.is_promo == 0) {
                                if (me.toCompare.package == product.package_type_id) {
                                    product.isClassPackageShow = true
                                } else {
                                    product.isClassPackageShow = false
                                }
                            } else {
                                product.isPromoPackageShow = false
                            }
                        })
                        break
                }
                me.products.forEach((item, i) => {
                    if (me.toCompare.package == 99999) {
                        if (item.isPromoPackageShow) {
                            products.push(item)
                        }
                    } else {
                        if (item.isClassPackageShow) {
                            products.push(item)
                        }
                    }
                })

                products.sort((a, b) => {
                    return parseInt(a.quick_sale_sequence) - parseInt(b.quick_sale_sequence)
                })

                return products
            }
        },
        methods: {
            toggleDeactivate (id) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'class_packages'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = 0
                    me.$refs.enabled.confirm.type = 'class package'
                }, 100)
            },
            computeQuantity (id, quantity, key, price) {
                const me = this
                if (quantity != '') {
                    if (parseInt(quantity) != 99) {
                        me.totalPrice.forEach((data, index) => {
                            if (data.id == id) {
                                data.quantity = parseInt(quantity)
                                data.price = parseInt(parseInt(quantity)) * price
                            }
                        })
                    }
                }
            },
            applyPromo () {
                const me = this
                if (document.getElementsByName("promo_code")[0].value != "") {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    let formData = new FormData()
                    let total = 0
                    let productForm = new FormData(document.getElementById('product_form'))
                    let checkout = new FormData(document.getElementById('step2'))

                    me.totalPrice.forEach((data, index) => {
                        if (data.discounted_price) {
                            total += data.discounted_price
                        } else {
                            total += data.price
                        }
                    })

                    checkout.append('total', total)
                    checkout.append('transaction_id', me.form.id)
                    productForm.append('items', JSON.stringify(me.totalPrice))

                    formData.append('productForm', JSON.stringify(Object.fromEntries(productForm)))
                    formData.append('checkout', JSON.stringify(Object.fromEntries(checkout)))
                    formData.append('studio_id', me.$store.state.user.current_studio_id)
                    formData.append('user_id', me.$store.state.customerID)
                    if (me.promoApplied) {
                        me.$axios.post('api/quick-sale/apply-promo', formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            if (res.data != 0) {
                                me.totalPrice = res.data.items
                                me.promo_applied = true
                            } else {
                                me.promoApplied = false
                                me.$store.state.promptQuickSaleStatus = true
                                me.message = 'This promo code is not available anymore.'
                            }
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorQuickSaleStatus = true
                            me.promoApplied = false
                        })
                    } else {
                        me.message = 'Are you sure you want to use this promo code?'
                        me.$store.state.promptPromoStatus = true
                    }
                } else {
                    me.promoApplied = false
                    me.$store.state.promptQuickSaleStatus = true
                    me.message = 'Please enter a promo code.'
                }
            },
            removeOrder (key, id) {
                const me = this
                me.products.forEach((data, index) => {
                    if (data.id == id) {
                        me.products[index].isChecked = false
                        console.log(me.products[index].isChecked)
                    }
                })
                me.totalPrice.splice(key, 1)
            },
            submitQuickSale () {
                const me = this
                let formData = new FormData()
                let total = 0
                let productForm = new FormData(document.getElementById('product_form'))
                let checkout = new FormData(document.getElementById('step2'))
                let token = me.$cookies.get('70hokcotc3hhhn5')

                me.totalPrice.forEach((data, index) => {
                    if (data.discounted_price) {
                        total += data.discounted_price
                    } else {
                        total += data.price
                    }
                })

                checkout.append('total', total)
                checkout.append('transaction_id', me.form.id)
                checkout.append('promo_applied', me.promoApplied)
                productForm.append('items', JSON.stringify(me.totalPrice))

                formData.append('productForm', JSON.stringify(Object.fromEntries(productForm)))
                formData.append('checkout', JSON.stringify(Object.fromEntries(checkout)))
                formData.append('studio_id', me.$store.state.user.current_studio_id)
                formData.append('user_id', me.$store.state.customerID)
                if (me.totalPrice.length > 0) {
                    me.$validator.validateAll('checkout_form').then(valid => {
                        if (valid) {
                            me.loader(true)
                            me.$axios.post('api/quick-sale', formData, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                setTimeout( () => {
                                    if (res.data) {
                                        me.$store.state.successfulStatus = true
                                        if (me.$route.params.slug == 'packages') {
                                            document.getElementById('packages').click()
                                        }
                                        if (me.$route.params.slug == 'transactions') {
                                            document.getElementById('transactions').click()
                                        }
                                    } else {
                                        me.$store.state.errorList.push('Sorry, Something went wrong')
                                        me.$store.state.errorQuickSaleStatus = true
                                    }
                                }, 500)
                            }).catch(err => {
                                me.$store.state.errorList = err.response.data.errors
                                me.$store.state.errorQuickSaleStatus = true
                            }).then(() => {
                                setTimeout( () => {
                                    if (me.$route.params.slug != 'packages') {
                                        me.loader(false)
                                    }
                                    if (!me.$store.state.errorQuickSaleStatus) {
                                        me.$store.state.customerCreditQuickSaleStatus = false
                                    }
                                }, 500)
                            })
                        } else {
                            setTimeout( () => {
                                document.querySelector('.validation_errors').scrollIntoView({block: 'center', behavior: 'smooth'})
                            }, 10)
                        }
                    })
                } else {
                    me.message = 'Please select a product before placing your order'
                    me.$store.state.promptQuickSaleStatus = true
                }
            },
            takePayment (step) {
                const me = this
                switch (step) {
                    case 1:
                        me.nextStep = 1
                        document.getElementById('step1').classList.add('slide_in')
                        document.getElementById('step2').classList.remove('slide_in')
                        break
                    case 2:
                        if (me.totalPrice.length > 0) {
                            if (document.querySelector('#product_form .validation_errors') == null) {
                                me.nextStep = 2
                                document.getElementById('step2').classList.add('slide_in')
                                document.getElementById('step1').classList.remove('slide_in')
                            } else {
                               me.message = 'Please check products before taking payment.'
                               me.$store.state.promptQuickSaleStatus = true
                               setTimeout( () => {
                                   document.querySelector('.validation_errors').scrollIntoView({block: 'center', behavior: 'smooth'})
                               }, 10)
                            }
                        } else {
                            me.message = 'Please select a product before taking payment.'
                            me.$store.state.promptQuickSaleStatus = true
                        }
                        break
                }
            },
            checkPayment (type) {
                const me = this
                switch (type) {
                    case 'debit':
                        me.form.paymentType = 0
                        break
                    case 'check':
                        me.form.paymentType = 1
                        break
                    case 'credit':
                        me.form.paymentType = 2
                        break
                    case 'comp':
                        me.form.paymentType = 3
                        break
                    case 'cash':
                        me.form.paymentType = 4
                        break
                    case 'gcash':
                        me.form.paymentType = 5
                        break
                    case 'conversion':
                        me.form.paymentType = 6
                        break
                    case 'third_party_platform':
                        me.form.paymentType = 7
                        break
                    case 'class_pass':
                        me.form.paymentType = 8
                        break
                    case 'store-credits':
                        me.form.paymentType = 9999
                        break
                }
                me.cardType = ''
                me.form.change = 0
            },
            submitFilter () {
                const me = this
                let ctr  = 0
                me.loader(true)
                switch (me.toCompare.package) {
                    case 99999:
                        me.$refs.quickSale.forEach((promoPackage, qindex) => {
                            if (promoPackage.value.is_promo == 1) {
                                let product = promoPackage.value.name.toLowerCase()
                                if (me.form.search != '') {
                                    if (product.includes(me.form.search.toLowerCase())) {
                                        ctr++
                                        promoPackage.isSearched = true
                                    } else {
                                        promoPackage.isSearched = false
                                    }
                                } else {
                                    ctr++
                                    promoPackage.isSearched = true
                                }
                            } else {
                                promoPackage.isSearched = false
                            }
                        })
                        break
                    default:
                        me.$refs.quickSale.forEach((classPackage, qindex) => {
                            if (classPackage.value.is_promo == 0) {
                                if (classPackage.value.package_type_id == me.toCompare.package) {
                                    let product = classPackage.value.name.toLowerCase()
                                    if (me.form.search != '') {
                                        if (product.includes(me.form.search.toLowerCase())) {
                                            ctr++
                                            classPackage.isSearched = true
                                        } else {
                                            classPackage.isSearched = false
                                        }
                                    } else {
                                        ctr++
                                        classPackage.isSearched = true
                                    }
                                } else {
                                    classPackage.isSearched = false
                                }
                            } else {
                                classPackage.isSearched = false
                            }
                        })
                        break
                }
                setTimeout( () => {
                    me.loader(false)
                }, 300)
                me.total = ctr
            },
            toggleClose () {
                const me = this
                me.$store.state.customerCreditQuickSaleStatus = false
                document.body.classList.remove('no_scroll')
            },
            countTotalItems (type) {
                const me = this
                let count = 0
                switch (type) {
                    case 'class-package':
                        me.products.forEach((product, index) => {
                            if (product.is_promo == 0) {
                                if (me.toCompare.package == product.package_type_id) {
                                    count++
                                }
                            }
                        })
                        break
                    case 'promo-package':
                        me.products.forEach((product, index) => {
                            if (product.is_promo == 1) {
                                count++
                            }
                        })
                        break
                }
                me.total = count
            },
            toggleStatus (unique, type, id) {
                const me = this
                me.unique = unique
                const elements = document.querySelectorAll('.modal_tab .modal_tab_title')
                let formData = new FormData()
                elements.forEach((element, index) => {
                    if (unique == index) {
                        element.classList.add('active')
                    } else {
                        element.classList.remove('active')
                    }
                })
                setTimeout( () => {
                    me.form.search = ''
                }, 10)
                switch (type) {
                    case 'class-package':
                        me.toCompare.package = id
                        me.countTotalItems('class-package')
                        break
                    case 'promo-package':
                        me.toCompare.package = 99999
                        me.countTotalItems('promo-package')
                        break
                }
            },
            fetchData () {
                const me = this
                me.products = []
                me.menus = [
                    {
                        id: 99999,
                        name: 'Promos',
                        type: 'promo-package'
                    }
                ]

                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    me.user = res.data.user
                    me.$axios.get(`api/packages/class-packages/for-buy-credits?studio_id=${me.$store.state.user.current_studio_id}&user_id=${(me.$route.params.param) ? me.$route.params.param : me.$store.state.customerID}`).then(res => {
                        if (res.data) {

                            res.data.classPackages.forEach((classPackage, index) => {
                                classPackage.isChecked = false
                                classPackage.isClassPackageShow = false
                                me.products.push(classPackage)
                            })

                            me.$axios.get(`api/packages/package-types?enabled=1&no_paginate=1`).then(res => {
                                res.data.packageTypes.forEach((packageType, index) => {
                                    me.menus.unshift(
                                        {
                                            id: res.data.packageTypes[res.data.packageTypes.length - (index + 1)].id,
                                            name: res.data.packageTypes[res.data.packageTypes.length - (index + 1)].name,
                                            type: 'class-package'
                                        }
                                    )
                                })
                                me.toCompare.package = me.menus[0].id
                                // me.toggleStatus(0, 'class-package', me.menus[0].id)
                                me.countTotalItems('class-package')
                            })

                            me.$axios.get(`api/packages/class-packages/for-buy-credits?studio_id=${me.$store.state.user.current_studio_id}&user_id=${(me.$route.params.param) ? me.$route.params.param : me.$store.state.customerID}&is_promo=1`).then(res => {
                                if (res.data) {
                                    res.data.classPackages.forEach((promoPackage, index) => {
                                        promoPackage.isChecked = false
                                        me.products.push(promoPackage)
                                    })
                                }
                            })

                            me.$axios.get(`api/customers/${me.$store.state.customerID}`).then(res => {
                                me.customer = res.data.user
                            })
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorQuickSaleStatus = true
                    }).then(() => {
                        me.countTotalItems('class-package')
                    })
                    me.form.id = me.randomString()
                })
            }
        },
        mounted () {
            const me = this
            me.fetchData()
        }
    }
</script>
