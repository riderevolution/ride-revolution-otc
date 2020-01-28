<template>
    <div>
        <div :class="`modal_tab_content_wrapper ${(value.isGiftShow) ? 'no_qty' : '' }`" v-show="(isSearched) ? (value.isProductShow == true) ? $parent.toCompare.product == value.product.product_category_id : (value.isGiftShow == true ? true : (value.isCreditShow == true) ? true : false) : false">
            <div class="form_check">
                <input type="checkbox" :id="`product_${value.id}_${unique}`" name="product[]" class="action_check" @change="toggleChecked(value, value.id, unique, (value.isProductShow) ? value.sale_price : (value.isGiftShow ? value.class_package.package_price : value.amount ))" :checked="value.isChecked">
                <label :for="`product_${value.id}_${unique}`">{{ (!value.isGiftShow) ? (value.product ? `${value.product.name} - ${value.variant}` : (!value.isCreditShow ? value.variant : value.name)) : value.card_code }}</label>
            </div>
            <div class="total_price">{{ `${(value.isGiftShow) ? `${value.class_package.name} - ` : ''}` }}PHP {{ totalCount((value.isProductShow) ? value.sale_price : (value.isGiftShow ? value.class_package.package_price : value.amount )) }}</div>
            <div class="form_group" v-if="!value.isGiftShow">
                <label>Qty.</label>
                <div class="form_flex_input">
                    <input type="text" name="quantity[]" :id="`quantity_${unique}`" class="default_text number" maxlength="2" autocomplete="off" v-model="quantity" v-validate="`numeric|min_value:1|${(value.product_quantities) ? `max_value:${value.product_quantities[0].quantity}` : '' }`" @input="recomputeTotal(value.id, unique, (value.isProductShow) ? value.sale_price : (value.isGiftShow ? value.class_package.package_price : value.amount ))">
                    <div class="up" @click="addCount(value.id, unique, (value.isProductShow) ? value.sale_price : (value.isGiftShow ? value.class_package.package_price : value.amount ))"></div>
                    <div class="down" @click="subtractCount(value.id, unique, (value.isProductShow) ? value.sale_price : (value.isGiftShow ? value.class_package.package_price : value.amount ))"></div>
                    <transition name="slide"><span class="validation_errors" v-if="errors.has('product_form.quantity[]')">{{ errors.first('product_form.quantity[]') | properFormat }}</span></transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            unique: {
                type: Number,
                default: 0
            },
            value: {
                default: function() {
                    return 0
                }
            }
        },
        data () {
            return {
                quantity: 1,
                isSearched: true
            }
        },
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                } else {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
            }
        },
        methods: {
            recomputeTotal (id, key, price) {
                const me = this
                let element = document.getElementById(`product_${id}_${key}`)
                let quantity = document.getElementById(`quantity_${key}`).value
                if (element.checked) {
                    me.$parent.totalPrice.forEach((data, index) => {
                        if (data.id == key) {
                            data.quantity = quantity
                            data.price =  parseInt(quantity) * price
                        }
                    })
                }
            },
            addCount (id, key, price) {
                const me = this
                let element = document.getElementById(`product_${id}_${key}`)
                let data
                data = parseInt(me.quantity)
                if (data != 99) {
                    data != 0 && (me.quantity = 0)
                    me.quantity = (data += 1)
                    if (element.checked) {
                        me.$parent.totalPrice.forEach((data, index) => {
                            if (data.id == key) {
                                data.quantity = me.quantity
                                data.price =  parseInt(me.quantity) * price
                            }
                        })
                    }
                }
            },
            subtractCount (id, key, price) {
                const me = this
                let element = document.getElementById(`product_${id}_${key}`)
                let data
                data = parseInt(me.quantity)
                data > 1 && (me.quantity = (data -= 1))
                if (element.checked) {
                    me.$parent.totalPrice.forEach((data, index) => {
                        if (data.id == key) {
                            data.quantity = me.quantity
                            data.price =  parseInt(me.quantity) * price
                        }
                    })
                }
            },
            toggleChecked (data, id, key, price) {
                const me = this
                let element = document.getElementById(`product_${id}_${key}`)
                let quantity = (me.value.isGiftShow) ? 1 : (me.value.isProductShow || me.value.isCreditShow ? document.getElementById(`quantity_${key}`).value : 1 )
                if (element.checked) {
                    me.$parent.totalPrice.push(
                        {
                            id: key,
                            quantity: quantity,
                            item: {
                                id: data.id,
                                sku: (me.value.isProductShow) ? data.sku_id : (me.value.isGiftShow ? data.class_package_sku_id : data.sku_id),
                                name: (me.value.isProductShow) ? data.variant : (me.value.isGiftShow ? data.card_code : data.name),
                                origPrice: (me.value.isProductShow) ? data.sale_price : (me.value.isGiftShow ? data.class_package.package_price : data.amount),
                                product: data
                            },
                            type: (data.type) ? data.type : 'product',
                            price: parseInt(quantity) * price
                        }
                    )
                } else {
                    me.$parent.totalPrice.forEach((data, index) => {
                        if (data.id == key) {
                            me.$parent.totalPrice.splice(index, 1)
                        }
                    })
                }
                me.$parent.products[key].isChecked ^= true
            }
        }
    }
</script>
