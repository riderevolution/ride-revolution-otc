<template>
    <div :class="`input_content_wrapper ${show ? 'active' : 'not_active'}`" :data-vv-scope="`variant_form_${unique}`">
        <div class="input_wrapper" v-show="show" v-if="type == 0">
            <div class="input_content">
                <input type="text" name="variant[]" autocomplete="off" class="default_text" v-validate="'required'" :data-vv-name="`variant_form_${unique}.variant[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.variant[]`)">The variant field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="sku_id[]" autocomplete="off" class="default_text" v-validate="'required'" :data-vv-name="`variant_form_${unique}.sku_id[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.sku_id[]`)">The sku id field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="quantity[]" autocomplete="off" class="default_text disabled" v-validate="'required|numeric'" value="0" :data-vv-name="`variant_form_${unique}.quantity[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.quantity[]`)">The quantity field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="reorder_point[]" autocomplete="off" class="default_text" v-validate="'required|numeric'" :data-vv-name="`variant_form_${unique}.reorder_point[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.reorder_point[]`)">The reorder point field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="unit_price[]" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}" :data-vv-name="`variant_form_${unique}.unit_price[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.unit_price[]`)">The unit price field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="sale_price[]" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}" :data-vv-name="`variant_form_${unique}.sale_price[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.sale_price[]`)">The sale price field is required</span></transition>
            </div>
            <div class="input_content image_upload" v-if="$parent.showClose">
                <!-- <a href="javascript:void(0)" class="action_btn" @click="toggleVariantImage(unique)"><svg xmlns="http://www.w3.org/2000/svg" width="18.306" height="18.306" viewBox="0 0 18.306 18.306"> <g transform="translate(-1233.873 -1197.248) rotate(-9)"> <g transform="translate(1031 1378)" class="upload_image"> <rect width="16" height="16" rx="2" stroke="none" /> <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" fill="none" /> </g> <path d="M16305.061-1443.824l5.559-4.864,4.563,4.259,2.891-3.014,2.3,3.014" transform="translate(-15273.644 2834.915)" class="upload_image" /> <g transform="translate(1039 1380.909)" class="upload_image"> <circle cx="1.818" cy="1.818" r="1.818" stroke="none" /> <circle cx="1.818" cy="1.818" r="1.318" fill="none" /> </g> </g> </svg>Upload Images ({{ totalUploaded }})</a> -->
                <a href="javascript:void(0)" class="action_cancel_btn" @click="removeVariant()" v-if="$parent.showClose">Remove</a>
            </div>
            <!-- <variant-image-form v-show="showImages" :parentTitle="$parent.form.title" :unique="unique" /> -->
            <input type="hidden" name="is_show[]" :value="`${(show) ? 1 : 0}`">
            <input type="hidden" name="temporary_id[]" :value="tempID">
        </div>
        <div class="input_wrapper" v-show="show" v-else>
            <div class="input_content">
                <input type="text" name="variant[]" autocomplete="off" class="default_text" v-model="value.variant" v-validate="'required'" :data-vv-name="`variant_form_${unique}.variant[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.variant[]`)">The variant field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="sku_id[]" autocomplete="off" class="default_text" v-model="value.sku_id" v-validate="'required'" :data-vv-name="`variant_form_${unique}.sku_id[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.sku_id[]`)">The sku id field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="quantity[]" autocomplete="off" class="default_text disabled" value="0" v-validate="'required|numeric'" :data-vv-name="`variant_form_${unique}.quantity[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.quantity[]`)">The quantity field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="reorder_point[]" autocomplete="off" class="default_text" v-model="value.reorder_point" v-validate="'required|numeric'" :data-vv-name="`variant_form_${unique}.reorder_point[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.reorder_point[]`)">The reorder point field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="unit_price[]" autocomplete="off" class="default_text" v-model="value.unit_price" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}" :data-vv-name="`variant_form_${unique}.unit_price[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.unit_price[]`)">The unit price field is required</span></transition>
            </div>
            <div class="input_content">
                <input type="text" name="sale_price[]" autocomplete="off" class="default_text" v-model="value.sale_price" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$'}" :data-vv-name="`variant_form_${unique}.sale_price[]`">
                <transition name="slide"><span class="validation_errors" v-if="errors.has(`variant_form_${unique}.sale_price[]`)">The sale price field is required</span></transition>
            </div>
            <div class="input_content image_upload" v-if="$parent.showClose">
                <!-- <a href="javascript:void(0)" class="action_btn" @click="toggleVariantImage(unique)"><svg xmlns="http://www.w3.org/2000/svg" width="18.306" height="18.306" viewBox="0 0 18.306 18.306"> <g transform="translate(-1233.873 -1197.248) rotate(-9)"> <g transform="translate(1031 1378)" class="upload_image"> <rect width="16" height="16" rx="2" stroke="none" /> <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" fill="none" /> </g> <path d="M16305.061-1443.824l5.559-4.864,4.563,4.259,2.891-3.014,2.3,3.014" transform="translate(-15273.644 2834.915)" class="upload_image" /> <g transform="translate(1039 1380.909)" class="upload_image"> <circle cx="1.818" cy="1.818" r="1.818" stroke="none" /> <circle cx="1.818" cy="1.818" r="1.318" fill="none" /> </g> </g> </svg>{{ (value.images.length > 0) ? 'Manage Images' : 'Upload Images' }} ({{ totalUploaded }})</a> -->
                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleDelete(value.id)" v-if="$parent.showClose">Remove</a>
            </div>
            <!-- <variant-image-form v-show="showImages" ref="variantImage" :parentTitle="$parent.form.title" :unique="unique" :values="value.images" /> -->
            <input type="hidden" name="is_show[]" :value="`${(show) ? 1 : 0}`">
            <input type="hidden" name="temporary_id[]" v-model="value.temporary_id">
            <input type="hidden" name="variant_id[]" v-model="value.id">
            <transition name="fade">
                <confirm-delete v-if="isDelete" ref="delete" :url="'api/inventory/product-variants'" />
            </transition>
        </div>
    </div>
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
                    return 0
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
