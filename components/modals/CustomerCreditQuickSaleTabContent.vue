<template>
    <div>
        <div class="modal_tab_content_wrapper no_qty" v-show="(isSearched) ? (value.isClassPackageShow) ? true : (value.isPromoPackageShow ? true : false) : false">
            <div class="form_check">
                <input type="checkbox" :id="`product_${value.id}_${unique}`" name="product[]" class="action_check" @change="toggleChecked(value, value.id, unique, value.package_price)" :checked="(value.isChecked == false) ? false : true ">
                <label :for="`product_${value.id}_${unique}`">{{ value.name }}</label>
            </div>
            <div class="total_price">PHP {{ totalCount(value.package_price) }}</div>
            <div class="form_group" v-if="value.id == 0">
                <label>Qty.</label>
                <div class="form_flex_input">
                    <input type="text" name="quantity[]" :id="`quantity_${unique}`" class="default_text number" maxlength="1" autocomplete="off" v-model="quantity" v-validate="'numeric|min_value:1|max_value:1'" @input="recomputeTotal(value.id, unique, value.package_price)">
                    <div class="up" @click="addCount(value.id, unique, value.package_price)"></div>
                    <div class="down" @click="subtractCount(value.id, unique, value.package_price)"></div>
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
        inject: ['$validator'],
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
                let quantity = me.quantity
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
                let quantity = me.quantity
                if (element.checked) {
                    me.$parent.totalPrice.push(
                        {
                            id: key,
                            quantity: quantity,
                            item: {
                                id: data.id,
                                sku: data.sku_id,
                                name: data.name,
                                origPrice: data.package_price,
                                product: data
                            },
                            type: (me.value.isPromoPackageShow) ? 'promo-package' : 'class-package',
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
