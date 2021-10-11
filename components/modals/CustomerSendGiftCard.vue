<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div id="default_form" class="overlay alternate">
            <div class="modal_wrapper">
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_tab_wrapper" id="step1" v-show="nextStep == 1">
                    <div class="right_side">
                        <div class="modal_tab_content">
                            <form id="custom_gift_form" class="alternate_2" data-vv-scope="custom_gift_form" @submit.prevent="submitCustom()">
                                <div class="modal_wrapper">
                                    <div class="modal_main_group alternate">
                                        <div class="nonsense"></div>
                                        <div class="form_main_group">
                                            <div class="form_group" v-if="$store.state.giftCardToAnyone">
                                                <label for="recipient_email">Recipient Email <span>*</span></label>
                                                <input type="email" name="recipient_email" class="default_text" v-model="customGiftCard.customCardRecipientEmail">
                                            </div>
                                            <div class="form_group" v-if="$store.state.giftCardToAnyone">
                                                <label for="recipient_name">Recipient Name <span>*</span></label>
                                                <input type="text" name="recipient_name" class="default_text" v-model="customGiftCard.customCardTo">
                                            </div>
                                            <div class="form_group">
                                                <label for="class_package_sku_id">Card Value <span>*</span></label>
                                                <select class="default_select alternate" name="class_package_sku_id" v-validate="'required'" v-model="customGiftCard.classPackages" @change="getPackagePrice($event)">
                                                    <option value="" disabled selected>Select a Value</option>
                                                    <option :value="classPackage.sku_id" v-for="(classPackage, key) in classPackages" :key="key">{{ classPackage.name }}</option>
                                                </select>
                                                <transition name="slide"><span class="validation_errors" v-if="errors.has('custom_gift_form.class_package_sku_id')">{{ properFormat(errors.first('custom_gift_form.class_package_sku_id')) }}</span></transition>
                                            </div>
                                            <div class="form_group no_margin">
                                                <label for="custom_card_code">Card Code <span>*</span></label>
                                                <input type="text" name="custom_card_code" class="default_text disabled" v-model="customGiftCard.customCardCode">
                                            </div>
                                        </div>
                                        <div class="form_main_group">
                                            <div class="form_group">
                                                <label for="custom_card_predefined_title">Title</label>
                                                <select class="default_select alternate" name="custom_card_predefined_title" v-model="customGiftCard.customCardPredefinedTitle">
                                                    <option value="" disabled selected>Select a Title</option>
                                                    <option :value="predefinedTitle.title" v-for="(predefinedTitle, key) in predefinedTitles" :key="key">{{ predefinedTitle.title }}</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <transition name="fade">
                                                <div class="form_group" v-if="customGiftCard.customCardPredefinedTitle == 'other'">
                                                    <label for="custom_card_custom_title">Custom Title</label>
                                                    <input type="text" name="custom_card_custom_title" autocomplete="off" class="default_text" v-model="customGiftCard.customCardCustomTitle">
                                                </div>
                                            </transition>
                                            <div class="form_group no_margin">
                                                <label for="custom_card_personal_message">Personal Message</label>
                                                <textarea name="custom_card_personal_message" autocomplete="off" rows="8" class="default_text" v-model="customGiftCard.customCardPersonalMessage"></textarea>
                                            </div>
                                        </div>
                                        <div class="form_footer_wrapper">
                                            <div class="button_group">
                                                <button type="button" name="cancel" class="action_cancel_btn alternate margin-right">Cancel</button>
                                                <button type="submit" name="submit" class="action_success_btn alternate">Proceed</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <transition name="fade">
            <prompt-quick-sale v-if="$store.state.promptQuickSaleStatus" :message="message" />
        </transition>
        <transition name="fade">
            <prompt v-if="prompt" :message="`Send this gift card to customer?`" :hasCancel="true" :hasChange="true" />
        </transition>
        <transition name="fade">
            <prompt-gift-card-sent v-if="promptGiftCardSent" :message="message"/>
        </transition>
    </div>
</template>

<script>
    import PromptQuickSale from './PromptQuickSale'
    import Prompt from './Prompt'
    import PromptGiftCardSent from './PromptGiftCardSent'
    export default {
        components: {
            PromptQuickSale,
            Prompt,
            PromptGiftCardSent
        },
        data () {
            return {
                hasStoreCredits: true,
                nextStep: 1,
                status: 0,
                total: 0,
                products: [],
                classPackages: [],
                predefinedTitles: [],
                menus: [
                    {
                        id: 0,
                        name: 'Digital Gift Card',
                        type: 'custom-gift-card'
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
                promo_applied: false,
                message: '',
                customGiftCard: {
                    classPackages: '',
                    classPackagePrice: 0,
                    customCardCode: '',
                    customCardFrom: '',
                    customCardTo: '',
                    customCardPredefinedTitle: '',
                    customCardCustomTitle: '',
                    customCardPersonalMessage: '',
                    customCardRecipientEmail: ''
                },
                isProduct: true,
                toCompare: {
                    product: 0,
                    giftCard: 0
                },
                unique: 0,
                totalPrice: [],
                toCheckout: [],
                cardType: '',
                promoApplied: false,
                prompt: false,
                promptGiftCardSent: false
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
            },
            showProducts () {
                const me = this
                let products = []
                switch (me.toCompare.giftCard) {
                    case 0:
                        me.products.forEach((product, index) => {
                            if (product.type == 'gift-card') {
                                product.isGiftShow = false
                            } else if (product.type == 'store-credit') {
                                product.isCreditShow = false
                            } else {
                                product.isProductShow = true
                            }
                        })
                        break
                    case 1:
                        me.products.forEach((product, index) => {
                            if (product.type == 'gift-card') {
                                product.isGiftShow = true
                            } else if (product.type == 'store-credit') {
                                product.isCreditShow = false
                            } else {
                                product.isProductShow = false
                            }
                        })
                        break
                    case 3:
                        me.products.forEach((product, index) => {
                            if (product.type == 'gift-card') {
                                product.isGiftShow = false
                            } else if (product.type == 'store-credit') {
                                product.isCreditShow = true
                            } else {
                                product.isProductShow = false
                            }
                        })
                        break
                }
                products = me.products
                return products
            }
        },
        methods: {
            submissionSuccess () {
                let me = this

                let toSubmit = { ...me.customGiftCard, ...{
                    customer_id: (this.$store.state.giftCardToAnyone) ? null : me.$route.params.param
                }}

                me.$axios.post(`api/inventory/gift-cards/send-from-admin`, toSubmit).then(res => {
                    if (res.data) {
                        me.message = 'Gift Card sent'

                        setTimeout(() => {
                            me.showErrors = false
                            me.promptGiftCardSent = true
                        }, 10)
                    }
                }).catch(err => {
                    console.log(err)
                })
            },
            submitCustom () {
                const me = this
                let customIndex = null
                me.$validator.validateAll('custom_gift_form').then(valid => {
                    if (valid) {
                        me.prompt = true
                        return
                    } else {
                        me.showErrors = true
                        setTimeout( () => {
                            document.querySelector('.validation_errors').scrollIntoView({block: 'center', behavior: 'smooth'})
                        }, 10)
                    }
                })
            },
            removeOrder (key, id) {
                const me = this
                me.products.forEach((data, index) => {
                    if (data.id == id) {
                        me.products[index].isChecked = false
                    }
                })
                me.totalPrice.splice(key, 1)
            },
            recomputeTotal (id, quantity, key, price) {
                const me = this
                me.totalPrice.forEach((data, index) => {
                    if (data.id == id) {
                        data.quantity = quantity
                        data.price =  parseInt(quantity) * price
                    }
                })
            },
            addCount (id, quantity, key, price) {
                const me = this
                let data
                data = parseInt(quantity)
                if (data != 99) {
                    data != 0 && (quantity = 0)
                    quantity = (data += 1)
                    me.totalPrice.forEach((data, index) => {
                        if (data.id == id) {
                            data.quantity = quantity
                            data.price = parseInt(quantity) * price
                        }
                    })
                }
            },
            subtractCount (id, quantity, key, price) {
                const me = this
                let data
                data = parseInt(quantity)
                data > 1 && (quantity = (data -= 1))
                me.totalPrice.forEach((data, index) => {
                    if (data.id == id) {
                        data.quantity = quantity
                        data.price =  parseInt(quantity) * price
                    }
                })
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
                formData.append('studio_id', me.$store.state.user.current_studio_id)
                formData.append('user_id', me.$store.state.customerID)
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
                                    if (me.$route.params.slug == 'packages') {
                                        document.getElementById('packages').click()
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
                                if (me.$route.params.slug != 'transactions' || me.$route.name != 'customers-param-slug') {
                                    me.loader(false)
                                }
                                if (!me.$store.state.errorQuickSaleStatus) {
                                    me.$store.state.customerSendGiftCardStatus = false
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
                        me.nextStep = 1
                        document.getElementById('step1').classList.add('slide_in')
                        document.getElementById('step2').classList.remove('slide_in')
                        break
                    case 2:
                        if (me.totalPrice.length > 0) {
                            if (document.querySelector('#product_form .validation_errors') == null) {
                                me.totalPrice.forEach((data, index) => {
                                    if (data.type == "store-credit") {
                                        ctr++
                                    }
                                })
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
                if (ctr > 0) {
                    me.hasStoreCredits = false
                } else {
                    me.hasStoreCredits = true
                }
            },
            getPackagePrice (event) {
                const me = this
                let sku = event.target.value
                me.classPackages.forEach((classPackage, index) => {
                    if (classPackage.sku_id == sku) {
                        me.customGiftCard.classPackagePrice = classPackage.package_price
                    }
                })
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
            submitFilter () {
                const me = this
                let ctr  = 0
                me.loader(true)
                switch (me.toCompare.giftCard) {
                    case 0:
                        me.$refs.quickSale.forEach((product, qindex) => {
                            if (product.value.product) {
                                if (product.value.product.product_category_id == me.toCompare.product) {
                                    let variant = product.value.variant.toLowerCase()
                                    if (me.form.search != '') {
                                        if (variant.includes(me.form.search.toLowerCase())) {
                                            ctr++
                                            product.isSearched = true
                                        } else {
                                            product.isSearched = false
                                        }
                                    } else {
                                        ctr++
                                        product.isSearched = true
                                    }
                                } else {
                                    product.isSearched = false
                                }
                            }
                        })
                        break
                    case 1:
                        me.$refs.quickSale.forEach((product, qindex) => {
                            if (product.value.type == 'gift-card') {
                                let card_code = product.value.card_code.toLowerCase()
                                if (me.form.search != '') {
                                    if (card_code.includes(me.form.search.toLowerCase())) {
                                        ctr++
                                        product.isSearched = true
                                    } else {
                                        product.isSearched = false
                                    }
                                } else {
                                    ctr++
                                    product.isSearched = true
                                }
                            } else {
                                product.isSearched = false
                            }
                        })
                        break
                    case 3:
                        me.$refs.quickSale.forEach((product, qindex) => {
                            if (product.value.type == 'store-credit') {
                                let creditName = product.value.name.toLowerCase()
                                if (me.form.search != '') {
                                    if (creditName.includes(me.form.search.toLowerCase())) {
                                        ctr++
                                        product.isSearched = true
                                    } else {
                                        product.isSearched = false
                                    }
                                } else {
                                    ctr++
                                    product.isSearched = true
                                }
                            } else {
                                product.isSearched = false
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
                me.$store.state.customerSendGiftCardStatus = false
                me.$store.state.giftCardToAnyone = false
                document.body.classList.remove('no_scroll')
            },
            countTotalItems (type) {
                const me = this
                let count = 0
                switch (type) {
                    case 'category':
                        me.products.forEach((product, index) => {
                            if (product.product) {
                                if (me.toCompare.product == product.product.product_category_id) {
                                    count++
                                }
                            }
                        })
                        break
                    case 'physical-gift-card':
                        me.products.forEach((product, index) => {
                            if (product.type == 'gift-card') {
                                count++
                            }
                        })
                        break
                    case 'store-credit':
                        me.products.forEach((product, index) => {
                            if (product.type == 'store-credit') {
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
                    case 'category':
                        me.isProduct = true
                        me.toCompare.product = id
                        me.toCompare.giftCard = 0
                        me.countTotalItems('category')
                        break
                    case 'physical-gift-card':
                        me.isProduct = true
                        me.toCompare.giftCard = 1
                        me.countTotalItems('physical-gift-card')
                        break
                    case 'custom-gift-card':
                        me.isProduct = false
                        me.toCompare.giftCard = 2
                        break
                    case 'store-credit':
                        me.isProduct = true
                        me.toCompare.giftCard = 3
                        me.countTotalItems('store-credit')
                        break
                }
            },
            fetchTabContents () {
                return false
                const me = this
                me.$axios.get('api/inventory/product-categories').then(res => {
                    if (res.data) {
                        res.data.productCategories.forEach((productCategory, index) => {
                            me.menus.unshift(
                                {
                                    id: res.data.productCategories[res.data.productCategories.length - (index + 1)].id,
                                    name: res.data.productCategories[res.data.productCategories.length - (index + 1)].name,
                                    type: 'category'
                                }
                            )
                        })
                        me.toCompare.product = me.menus[0].id
                        me.countTotalItems('category')
                    }
                })
            },
            fetchData () {
                const me = this
                me.$axios.get(`api/inventory/product-variants-for-quick-sale?studio_id=${me.$store.state.user.current_studio_id}`).then(res => {
                    if (res.data) {
                        res.data.productVariants.forEach((product, index) => {
                            product.isChecked = false
                            me.products.push(product)
                        })
                        me.fetchTabContents()
                        me.$axios.get('api/inventory/gift-cards?enabled=1&status=0').then(res => {
                            if (res.data) {
                                res.data.giftCards.data.forEach((data, index) => {
                                    data.isChecked = false
                                    data.type = 'gift-card'
                                    me.products.push(data)
                                })
                            }
                        })
                        me.$axios.get('api/packages/store-credits').then(res => {
                            if (res.data) {
                                res.data.storeCredits.data.forEach((data, index) => {
                                    data.isChecked = false
                                    data.type = 'store-credit'
                                    me.products.push(data)
                                })
                            }
                        })
                        me.$axios.get('api/extras/class-packages-for-gift-cards').then(res => {
                            me.classPackages = res.data.classPackages
                        })
                        me.$axios.get('api/extras/gift-card-titles').then(res => {
                            me.predefinedTitles = res.data.giftCardTitles
                        })
                    }
                })
                me.customGiftCard.customCardCode = `GC-${me.randomCode()}`
                me.form.id = me.randomString()
            }
        },
        mounted () {
            const me = this
            me.fetchData()
        }
    }
</script>

<style scoped lang="stylus">
    #default_form.overlay.alternate
        max-width: 768px
    .default_modal #default_form .modal_wrapper .modal_tab_wrapper .right_side
        padding: 50px 30px 20px
        flex: 0 0 100%
    .margin-right
        margin-right: 15px
</style>