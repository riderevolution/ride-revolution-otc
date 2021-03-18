<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div id="default_form" class="overlay alternate">
            <div class="modal_wrapper">
                <div class="form_close" @click="toggleClose()"></div>
                <form class="modal_tab_wrapper alternate" id="step2" data-vv-scope="checkout_form" v-show="nextStep == 2">
                    <div class="header_side">
                        <h2 class="header_title">Checkout</h2>
                        <div class="header_subtitle">
                            <span>ID: {{ value.payment_code }}</span>
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
                            <!-- <div class="form_radio">
                                <input type="radio" id="conversion" value="conversion" name="payment_method" class="action_radio" @change="checkPayment('conversion')">
                                <label for="conversion">Conversion</label>
                            </div> -->
                            <div class="form_radio" v-if="hasStoreCredits">
                                <input type="radio" id="store_credits" value="store-credits" name="payment_method" class="action_radio" @change="checkPayment('store-credits')">
                                <label for="store_credits">Store Credits</label>
                            </div>
                        </div>
                        <div class="form_main_group" v-if="form.paymentType == 0 || form.paymentType == 2">
                            <div class="form_group">
                                <label for="bank">Bank<span>*</span></label>
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
                                <label for="comp_reason">Comp Reason<span>*</span></label>
                                <select class="default_select alternate" name="comp_reason" key="comp_reason" v-validate="'required'" v-model="form.comp">
                                    <option value="" selected disabled>Select a Reason</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Cross deal">Cross deal</option>
                                    <option value="Prize">Prize</option>
                                    <option value="Redemption">Redemption</option>
                                    <option value="Conversion">Conversion</option>
                                    <option value="Internal team">Internal team</option>
                                    <option value="Shareholder">Shareholder</option>
                                    <option value="Complaint">Complaint</option>
                                    <option value="Special deal">Special deal</option>
                                    <option value="Other">Other</option>
                                </select>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.comp_reason')">{{ properFormat(errors.first('checkout_form.comp_reason')) }}</span></transition>
                            </div>
                            <transition name="fade">
                                <div class="form_group" v-if="form.comp == 'Other'">
                                    <label for="indicate_reason">Indicate Reason <span>*</span></label>
                                    <input type="text" name="indicate_reason" class="default_text" v-validate="'required'" key="indicate_reason">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.indicate_reason')">{{ properFormat(errors.first('checkout_form.indicate_reason')) }}</span></transition>
                                </div>
                            </transition>
                            <div class="form_group">
                                <label for="note">Note <span>*</span></label>
                                <input type="text" name="note" class="default_text" key="note" v-validate="{ required: true }">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.note')">{{ properFormat(errors.first('checkout_form.note')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group" v-else-if="form.paymentType == 4">
                            <div class="form_group">
                                <label for="cash_tendered">Cash Tendered (PHP)<span>*</span></label>
                                <input type="text" name="cash_tendered" class="default_text" key="cash_tendered" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', min_value: form.total, max_value: 9999999}" v-model="form.change">
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
                        <div class="form_main_group" v-else-if="form.paymentType == 6">
                            <div class="form_group">
                                <label for="note">Note <span>*</span></label>
                                <input type="text" name="note" class="default_text" key="note" v-validate="{ required: true }">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('checkout_form.note')">{{ properFormat(errors.first('checkout_form.note')) }}</span></transition>
                            </div>
                        </div>
                        <div class="form_main_group">
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
                                    </tr>
                                </thead>
                                <tbody v-if="totalPrice.length > 0">
                                    <tr v-for="(data, key) in showBreakDown" :key="key">
                                        <td class="item_name" width="35%">({{ data.quantity }}) {{ (data.item.product) ? (data.item.product.product ? `${data.item.product.product.name} - ${data.item.name}` : data.item.name) : data.item.name }}</td>
                                        <td width="15%">
                                            <div class="form_flex_input" :data-vv-scope="`breakdown_${key}`">
                                                <input type="text" name="quantity" :id="`quantity_${key}`" :class="`disabled ${(data.type == 'gift-card' || data.type == 'custom-gift-card') ? 'disabled' : ''} default_text number`" maxlength="2" autocomplete="off" :data-vv-name="`breakdown_${key}.quantity`" v-model="data.quantity" v-validate="`numeric|min_value:1|${(data.type != 'custom-gift-card') ? (data.item.product.product_quantities ? `max_value:${data.item.product.product_quantities[0].quantity}` : '') : '' }`">
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
                            <button type="button" class="action_cancel_btn" @click="takePayment(1)">Cancel</button>
                            <button type="button" class="action_success_btn alternate margin" @click.prevent="submitQuickSale()">Place Order</button>
                        </div>
                    </div>
                    <form id="custom_gift_form"></form>
                    <form id="product_form"></form>
                </form>
            </div>
        </div>
        <transition name="fade">
            <prompt v-if="$store.state.promptStatus" :message="message" />
        </transition>
        <transition name="fade">
            <prompt-promo v-if="$store.state.promptPromoStatus" :message="message" />
        </transition>
    </div>
</template>

<script>
    import PromptPromo from './PromptPromo'
    import Prompt from './Prompt'
    export default {
        components: {
            PromptPromo,
            Prompt
        },
        props: {
            value: {
                default: null
            }
        },
        data () {
            return {
                hasStoreCredits: true,
                nextStep: 2,
                status: 0,
                total: 0,
                products: [],
                classPackages: [],
                predefinedTitles: [],
                form: {
                    search: '',
                    paymentType: 0,
                    id: '',
                    change: 0,
                    comp: '',
                    total: 0
                },
                promo_applied: false,
                showErrors: false,
                message: '',
                isProduct: true,
                unique: 0,
                totalPrice: [],
                toCheckout: [],
                cardType: '',
                promoApplied: false
            }
        },
        computed: {
            showBreakDown () {
                const me = this
                let result = me.totalPrice
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
                            total += data.discounted_price
                        } else {
                            total += data.price
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
                        total += data.discounted_price
                    } else {
                        total += data.price
                    }
                })
                me.form.total = total
                return me.totalCount(total)
            }
        },
        methods: {
            applyPromo () {
                const me = this
                if (document.getElementsByName("promo_code")[0].value != "") {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    let formData = new FormData()
                    let total = 0
                    let customGiftCard = new FormData(document.getElementById('custom_gift_form'))
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

                    formData.append('customGiftCard', JSON.stringify(Object.fromEntries(customGiftCard)))
                    formData.append('productForm', JSON.stringify(Object.fromEntries(productForm)))
                    formData.append('checkout', JSON.stringify(Object.fromEntries(checkout)))
                    formData.append('studio_id', me.value.studio_id)
                    formData.append('user_id', me.$store.state.customerID)
                    formData.append('payment_id', me.value.id)
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
                                me.$store.state.promptStatus = true
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
                    me.$store.state.promptStatus = true
                    me.message = 'Please enter a promo code.'
                }
            },
            submitQuickSale () {
                const me = this
                let formData = new FormData()
                let total = 0
                let customGiftCard = new FormData(document.getElementById('custom_gift_form'))
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

                formData.append('customGiftCard', JSON.stringify(Object.fromEntries(customGiftCard)))
                formData.append('productForm', JSON.stringify(Object.fromEntries(productForm)))
                formData.append('checkout', JSON.stringify(Object.fromEntries(checkout)))
                formData.append('studio_id', me.value.studio_id)
                formData.append('user_id', me.$store.state.customerID)
                formData.append('payment_id', me.value.id)
                formData.append('payCredit', 1)
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
                                me.loader(false)
                                if (!me.$store.state.errorQuickSaleStatus) {
                                    me.$store.state.customerPendingQuickSaleStatus = false
                                }
                                if (me.$store.state.pendingCustomerID != 0) {
                                    me.$parent.getSeats()
                                    me.$store.state.pendingCustomerID = 0
                                }
                            }, 500)
                        })
                    } else {
                        setTimeout( () => {
                            document.querySelector('.validation_errors').scrollIntoView({block: 'center', behavior: 'smooth'})
                        }, 10)
                    }
                })
            },
            takePayment (step) {
                const me = this
                let ctr = 0
                switch (step) {
                    case 1:
                        me.$store.state.customerPendingQuickSaleStatus = false
                        document.body.classList.remove('no_scroll')
                        break
                    case 2:
                        if (me.totalPrice.length > 0) {
                            me.totalPrice.forEach((data, index) => {
                                if (data.type == "store-credit") {
                                    ctr++
                                }
                            })
                            me.nextStep = 2
                            document.getElementById('step2').classList.add('slide_in')
                            // document.getElementById('step1').classList.remove('slide_in')
                        } else {
                            me.message = 'Please select a product before taking payment.'
                            me.$store.state.promptStatus = true
                        }
                        break
                }
                if (ctr > 0) {
                    me.hasStoreCredits = false
                } else {
                    me.hasStoreCredits = true
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
                    case 'store-credits':
                        me.form.paymentType = 9999
                        break
                }
                me.cardType = ''
                me.form.change = 0
            },
            toggleClose () {
                const me = this
                me.$store.state.customerPendingQuickSaleStatus = false
                document.body.classList.remove('no_scroll')
            }
        },
        mounted () {
            const me = this
            me.totalPrice = me.parser(me.value.for_later)
            me.takePayment(2)
            me.form.id = me.value.payment_code
        }
    }
</script>
