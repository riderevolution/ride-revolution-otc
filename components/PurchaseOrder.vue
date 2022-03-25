<template>
    <div>
        <div class="input_wrapper" :data-vv-scope="`purchase_order_form_${unique}`" v-if="type == 'create'">
            <div class="input_info" v-if="value.product_quantities[0].quantity < value.reorder_point">
                <img src="/icons/info-icon.svg" @click="showInfo ^= true" />
                <transition name="slide">
                    <div class="info_text" v-if="showInfo">Low in Stock</div>
                </transition>
            </div>
            <div class="input_content name">{{ value.product.name }} - {{ value.variant }}</div>
            <div class="input_content">{{ value.sku_id }}</div>
            <div class="input_content">{{ (value.sellable) ? 'Yes' : 'No' }}</div>
            <div class="input_content">{{ value.product.category.name }}</div>
            <div class="input_content">{{ value.product_quantities[0].quantity }}</div>
            <div class="input_content">
                <input type="text" name="quantity[]" class="default_text" autocomplete="off" v-validate="'required|numeric|min_value:1|max_value:99999'" :data-vv-name="`purchase_order_form_${unique}.quantity[]`" v-model="quantity" @change="isQuantity = true">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.quantity[]`)">{{ properFormat(errors.first(`purchase_order_form_${unique}.quantity[]`)) }}</span></transition>
            </div>
            <div class="input_content">PHP {{ value.unit_price }}</div>
            <!-- <div class="input_content">
                <input type="text" name="shipping_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="shipping" @input="updateTotal($event, 'shipping', unique)" :data-vv-name="`purchase_order_form_${unique}.shipping_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.shipping_cost[]`)">The shipping cost field is required</span></transition>
            </div> -->
            <!-- <div class="input_content">
                <input type="text" name="additional_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="additional"  @input="updateTotal($event, 'additional', unique)" :data-vv-name="`purchase_order_form_${unique}.additional_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.additional_cost[]`)">The additional cost field is required</span></transition>
            </div> -->
            <div class="input_content alternate">
                <span>PHP</span>
                <input type="text" name="cost[]" class="default_content" v-model="computeTotal">
                <div class="close_wrapper alternate" @click="removeOrder(value, unique)">
                    <div class="close_icon"></div>
                </div>
            </div>
            <input type="hidden" name="variant_id[]" v-model="value.id">
            <input type="hidden" name="product_id[]" v-model="value.product_id">
        </div>
        <div class="input_wrapper" v-if="type == 'show'">
            <div class="input_content name">{{ value.product_variant.product.name }} - {{ value.product_variant.variant }}</div>
            <div class="input_content">{{ value.product_variant.sku_id }}</div>
            <div class="input_content">{{ (value.product_variant.product.sellable == 1) ? 'Yes' : 'No' }}</div>
            <div class="input_content">{{ value.product_variant.product.category.name }}</div>
            <div class="input_content">{{ value.product_variant.product_quantities.quantity }}</div>
            <div class="input_content">{{ value.quantity }}</div>
            <div class="input_content">PHP {{ value.product_variant.unit_price }}</div>
            <!-- <div class="input_content">PHP {{ value.shipping_cost }}</div>
            <div class="input_content">PHP {{ value.additional_cost }}</div> -->
            <div class="input_content alternate">
                <span>PHP</span>
                <input type="text" class="default_content" v-model="value.total_cost">
            </div>
        </div>
        <div class="input_wrapper" :data-vv-scope="`purchase_order_form_${unique}`" v-if="type == 'edit'">
            <div class="input_content name">{{ value.product_variant.product.name }} - {{ value.product_variant.variant }}</div>
            <div class="input_content">{{ value.product_variant.sku_id }}</div>
            <div class="input_content">{{ (value.product_variant.product.sellable == 1) ? 'Yes' : 'No' }}</div>
            <div class="input_content">{{ value.product_variant.product.category.name }}</div>
            <div class="input_content">{{ value.product_variant.product_quantities.quantity }}</div>
            <div class="input_content">
                <input type="text" name="quantity[]" class="default_text" autocomplete="off" v-validate="'required|numeric|min_value:1|max_value:99999'" v-model="quantity = value.quantity" @change="isQuantity = true" :data-vv-name="`purchase_order_form_${unique}.quantity[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.quantity[]`)">{{ properFormat(errors.first(`purchase_order_form_${unique}.quantity[]`)) }}</span></transition>
            </div>
            <div class="input_content">PHP {{ totalCount(value.product_variant.unit_price) }}</div>
            <!-- <div class="input_content">
                <input type="text" name="shipping_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="shipping = value.shipping_cost" @input="updateTotal($event, 'shipping', unique)" :data-vv-name="`purchase_order_form_${unique}.shipping_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.shipping_cost[]`)">The shipping cost field is required</span></transition>
            </div> -->
            <!-- <div class="input_content">
                <input type="text" name="additional_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="additional = value.additional_cost"  @input="updateTotal($event, 'additional', unique)" :data-vv-name="`purchase_order_form_${unique}.additional_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.additional_cost[]`)">The additional cost field is required</span></transition>
            </div> -->
            <div class="input_content alternate">
                <span>PHP</span>
                <input type="text" name="cost[]" class="default_content" v-model="computeTotal">
                <div class="close_wrapper alternate" @click="removeOrder(value, unique)" v-if="$parent.res.purchase_order_products.length > 1">
                    <div class="close_icon"></div>
                </div>
            </div>
            <input type="hidden" name="variant_id[]" v-model="value.variant_id">
            <input type="hidden" name="product_id[]" v-model="value.product_id">
            <input type="hidden" name="id[]" v-model="value.id">
        </div>
        <div class="input_wrapper" :data-vv-scope="`purchase_order_form_${unique}`" v-if="type == 'duplicate'">
            <div class="input_content name">{{ value.product_variant.product.name }} - {{ value.product_variant.variant }}</div>
            <div class="input_content">{{ value.product_variant.sku_id }}</div>
            <div class="input_content">{{ (value.product_variant.product.sellable == 1) ? 'Yes' : 'No' }}</div>
            <div class="input_content">{{ value.product_variant.product.category.name }}</div>
            <div class="input_content">{{ value.product_variant.product_quantities.quantity }}</div>
            <div class="input_content">
                <input type="text" name="quantity[]" class="default_text" autocomplete="off" v-validate="'required|numeric|min_value:1|max_value:99999'" v-model="quantity = value.quantity" @change="isQuantity = true" :data-vv-name="`purchase_order_form_${unique}.quantity[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.quantity[]`)">{{ properFormat(errors.first(`purchase_order_form_${unique}.quantity[]`)) }}</span></transition>
            </div>
            <div class="input_content">PHP {{ totalCount(value.product_variant.unit_price) }}</div>
            <!-- <div class="input_content">
                <input type="text" name="shipping_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="shipping = value.shipping_cost" @input="updateTotal($event, 'shipping', unique)" :data-vv-name="`purchase_order_form_${unique}.shipping_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.shipping_cost[]`)">The shipping cost field is required</span></transition>
            </div> -->
            <!-- <div class="input_content">
                <input type="text" name="additional_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="additional = value.additional_cost"  @input="updateTotal($event, 'additional', unique)" :data-vv-name="`purchase_order_form_${unique}.additional_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.additional_cost[]`)">The additional cost field is required</span></transition>
            </div> -->
            <div class="input_content alternate">
                <span>PHP</span>
                <input type="text" name="cost[]" class="default_content" v-model="computeTotal">
                <div class="close_wrapper alternate" @click="removeOrder(value, unique)" v-if="$parent.res.purchase_order_products.length > 1">
                    <div class="close_icon"></div>
                </div>
            </div>
            <input type="hidden" name="variant_id[]" v-model="value.variant_id">
            <input type="hidden" name="product_id[]" v-model="value.product_id">
            <input type="hidden" name="id[]" v-model="value.id">
        </div>
        <div class="input_wrapper" :data-vv-scope="`purchase_order_form_${unique}`" v-if="type == 'receive'">
            <div class="input_content name">{{ value.product_variant.product.name }} - {{ value.product_variant.variant }}</div>
            <div class="input_content">{{ value.product_variant.sku_id }}</div>
            <div class="input_content">{{ value.quantity }}</div>
            <div class="input_content">{{ (value.product_variant.product.sellable == 1) ? 'Sellable' : 'Non-sellable' }}</div>
            <div class="input_content">
                <input type="text" name="quantity[]" class="default_text" autocomplete="off" v-validate="`required|numeric|min_value:1|max_value:${value.quantity}`" v-model="quantity" @change="isQuantity = true" :data-vv-name="`purchase_order_form_${unique}.quantity[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.quantity[]`)">{{ properFormat(errors.first(`purchase_order_form_${unique}.quantity[]`)) }}</span></transition>
            </div>
            <!-- <div class="input_content">
                <input type="text" name="shipping_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="shipping = value.shipping_cost" @input="updateTotal($event, 'shipping', unique)" :data-vv-name="`purchase_order_form_${unique}.shipping_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.shipping_cost[]`)">The shipping cost field is required</span></transition>
            </div> -->
            <!-- <div class="input_content">
                <input type="text" name="additional_cost[]" :class="`default_text ${(!isQuantity) ? 'disabled' : '' }`" autocomplete="off" v-validate="`{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}`" v-model="additional = value.additional_cost"  @input="updateTotal($event, 'additional', unique)" :data-vv-name="`purchase_order_form_${unique}.additional_cost[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`purchase_order_form_${unique}.additional_cost[]`)">The additional cost field is required</span></transition>
            </div> -->
            <input type="hidden" name="variant_id[]" v-model="value.variant_id">
            <input type="hidden" name="product_id[]" v-model="value.product_id">
            <input type="hidden" name="id[]" v-model="value.id">
        </div>
        <div class="input_wrapper" v-if="type == 'receive-show'">
            <div class="input_content name">{{ value.product_variant.product.name }} - {{ value.product_variant.variant }}</div>
            <div class="input_content">{{ value.product_variant.sku_id }}</div>
            <div class="input_content">{{ value.quantity }}</div>
            <div class="input_content">{{ (value.product_variant.product.sellable == 1) ? 'Sellable' : 'Non-sellable' }}</div>
            <div class="input_content">{{ value.product_variant.product_quantities.quantity }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            type: {
                default: null
            },
            value: {
                default: function () {
                    return 0
                }
            },
            unique: {
                type: Number,
                default: null
            },
        },
        inject: ['$validator'],
        data () {
            return {
                showInfo: false,
                show: true,
                isQuantity: false,
                quantity: 0,
                shipping: 0,
                additional: 0,
                total: 0
            }
        },
        computed: {
            computeTotal () {
                const me = this
                let total = 0
                let quantity = parseFloat(me.quantity)
                let unit_price = 0
                if (me.value.unit_price > 0) {
                    unit_price = parseFloat(me.value.unit_price)
                } else {
                    unit_price = parseFloat(me.value.product_variant.unit_price)
                }
                // let shipping = parseFloat(me.shipping)
                // let additional = parseFloat(me.additional)
                if ((quantity * unit_price) == 0) {
                    total = unit_price
                    // if (shipping != 0 && additional == 0) {
                    //     total = unit_price + shipping
                    // } else if (shipping == 0 && additional != 0) {
                    //     total = unit_price + additional
                    // } else if (shipping != 0 && additional != 0) {
                    //     total = unit_price + additional + shipping
                    // } else {
                    //     total = unit_price
                    // }
                    // if (additional == 0) {
                    //     total = unit_price
                    // } else if (additional != 0) {
                    //     total = unit_price + additional
                    // } else {
                    //     total = unit_price
                    // }
                } else {
                    // total = (quantity * unit_price) + shipping + additional
                    // total = (quantity * unit_price) + additional
                    total = (quantity * unit_price)
                }
                me.$parent.form.total.findIndex((item, index) => {
                    if (item.unique == me.unique) {
                        item.value = total
                    }
                })
                me.total = total
                return me.totalCount(total)
            }
        },
        methods: {
            removeOrder (value, unique) {
                const me = this
                switch (me.type) {
                    case 'create':
                        me.$parent.purchaseOrders.forEach((purchaseOrder, pindex) => {
                            if (unique == pindex) {
                                me.$parent.variants.push(value)
                                me.$parent.purchaseOrders.splice(pindex, 1)
                                // me.$parent.form.shipping.splice(pindex, 1)
                                // me.$parent.form.additional.splice(pindex, 1)
                                me.$parent.form.total.splice(pindex, 1)
                            }
                        })
                        break
                    case 'edit':
                        me.$store.state.deleteStatus = true
                        document.body.classList.add('no_scroll')
                        setTimeout( () => {
                            me.$parent.$refs.delete.contentID = value.id
                        }, 100)
                        break
                }
            },
            updateTotal (event, type, unique) {
                const me = this
                let element = event.target
                switch (type) {
                    // case 'shipping':
                    //     me.$parent.form.shipping.findIndex((item, index) => {
                    //         if (item.unique == unique) {
                    //             item.value = element.value
                    //         }
                    //     })
                    //     break
                    // case 'additional':
                    //     me.$parent.form.additional.findIndex((item, index) => {
                    //         if (item.unique == unique) {
                    //             item.value = element.value
                    //         }
                    //     })
                    //     break
                }
            }
        },
        mounted () {
            const me = this
            switch (me.type) {
                case 'edit':
                case 'duplicate':
                    // me.$parent.form.shipping.findIndex((item, index) => {
                    //     if (item.unique == me.unique) {
                    //         item.value = me.shipping
                    //     }
                    // })
                    me.$parent.form.additional.findIndex((item, index) => {
                        if (item.unique == me.unique) {
                            item.value = me.additional
                        }
                    })
                    break
            }
        }
    }
</script>
