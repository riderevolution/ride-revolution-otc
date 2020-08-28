<template>
    <tbody :class="`${show ? 'active' : 'not_active'}`">
        <tr v-show="show">
            <td>
                <div class="form_group">
                    <input type="text" name="variant[]" autocomplete="off" class="default_text" v-model="value.variant" v-validate="'required|max:50'" :data-vv-name="`variant_form_${unique}.variant[]`">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.variant[]`)">{{ properFormat(errors.first(`variant_form_${unique}.variant[]`)) }}</span></transition>
                </div>
            </td>
            <td>
                <div class="form_group">
                    <input type="text" name="sku_id[]" autocomplete="off" class="default_text" v-model="value.sku_id" v-validate="'required|max:25'" :data-vv-name="`variant_form_${unique}.sku_id[]`">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.sku_id[]`)">{{ properFormat(errors.first(`variant_form_${unique}.sku_id[]`)) }}</span></transition>
                </div>
            </td>
            <td>
                <div class="form_group">
                    <input type="text" name="quantity[]" autocomplete="off" readonly class="default_text disabled" v-validate="'required|numeric|min_value:0|max_value:99'" value="0" :data-vv-name="`variant_form_${unique}.quantity[]`">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.quantity[]`)">{{ properFormat(errors.first(`variant_form_${unique}.quantity[]`)) }}</span></transition>
                </div>
            </td>
            <td>
                <div class="form_group">
                    <input type="text" name="reorder_point[]" autocomplete="off" class="default_text" v-model="value.reorder_point" v-validate="'required|numeric|min_value:1|max_value:99'" :data-vv-name="`variant_form_${unique}.reorder_point[]`">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.reorder_point[]`)">{{ properFormat(errors.first(`variant_form_${unique}.reorder_point[]`)) }}</span></transition>
                </div>
            </td>
            <td>
                <div class="form_group">
                    <input type="text" name="unit_price[]" autocomplete="off" class="default_text" v-model="value.unit_price" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}" :data-vv-name="`variant_form_${unique}.unit_price[]`">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.unit_price[]`)">{{ properFormat(errors.first(`variant_form_${unique}.unit_price[]`)) }}</span></transition>
                </div>
            </td>
            <td>
                <div class="form_group">
                    <input type="text" name="sale_price[]" autocomplete="off" class="default_text" v-model="value.sale_price" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}" :data-vv-name="`variant_form_${unique}.sale_price[]`">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.sale_price[]`)">{{ properFormat(errors.first(`variant_form_${unique}.sale_price[]`)) }}</span></transition>
                    <input type="hidden" name="is_show[]" :value="`${(show) ? 1 : 0}`">
                    <input type="hidden" name="temporary_id[]" :value="tempID">
                    <input type="hidden" name="variant_id[]" v-model="value.id">
                </div>
            </td>
            <td>
                <div class="form_check">
                    <input type="checkbox" :id="`refundable_${unique}`" :name="`refundable[${unique}]`" class="action_check" :checked="(value.refundable == 1) ? true : false">
                    <label :for="`refundable_${unique}`">Refundable</label>
                </div>
            </td>
            <td v-if="$parent.showClose">
                <div class="table_actions" v-if="type == 0">
                    <div class="table_action_cancel link" @click="removeVariant()" v-if="$parent.showClose">Remove</div>
                </div>
                <div class="table_actions" v-else>
                    <div class="table_action_cancel link" @click="toggleDelete(value.id)" v-if="$parent.showClose">Remove</div>
                </div>
                <transition name="fade">
                    <confirm-delete v-if="isDelete" ref="delete" :url="'api/inventory/product-variants'" />
                </transition>
            </td>
        </tr>
    </tbody>
</template>

<script>
    import VariantImageForm from './modals/VariantImageForm'
    import ConfirmDelete from './modals/ConfirmDelete'
    export default {
        props: {
            type: {
                type: Number,
                default: 0
            },
            unique: {
                type: Number,
                default: null
            },
            value: {
                default: function () {
                    return {}
                }
            }
        },
        components: {
            VariantImageForm,
            ConfirmDelete
        },
        inject: ['$validator'],
        data () {
            return {
                isDelete: false,
                tempID: '',
                show: true,
                showImages: false,
                totalUploaded: 0,
                parentID: 0
            }
        },
        methods: {
            toggleDelete (id) {
                const me = this
                if (id !== undefined) {
                    me.$store.state.deleteStatus = true
                    me.isDelete = true
                    document.body.classList.add('no_scroll')
                    setTimeout( () => {
                        me.$refs.delete.contentID = id
                    }, 100)
                } else {
                    me.removeVariant()
                }
            },
            toggleVariantImage (key) {
                const me = this
                me.showImages = true
                document.getElementById(`key_${key}`).classList.remove('fade_out')
                document.getElementById(`key_${key}`).classList.add('fade_in')
                document.body.classList.add('no_scroll')
            },
            removeVariant () {
                const me = this
                me.show = false
                me.$parent.determineIfShowCloser()
            },
            fetchData (status) {
                const me = this
                me.$parent.fetchData()
            }
        },
        mounted () {
            const me = this
            if (me.value.temporary_id) {
                me.tempID = me.value.temporary_id
            } else {
                me.tempID = me.randomString()
            }
            if (me.value.id) {
                me.parentID = me.value.id
                // me.totalUploaded = me.$refs.variantImage.images.length
            }
        }
    }
</script>
