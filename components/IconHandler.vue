<template>
    <div v-if="enabled">
        <div class="form_group">
            <input type="hidden" name="image_id[]" :value="`${(item.id) ? item.id : ''}`">
            <input type="file" class="action_image" :id="`image${unique}`" name="image[]" ref="file" @change="getFile($event)" v-validate="`${(item) ? '' : `required`}|size:20000|image|ext:jpeg,jpg,png|${(dimension.imageWidth == 0) ? '' : `|dimensions:${dimension.imageWidth},${dimension.imageHeight}`}`" :required="item.path == null">
            <label class="action_image_label default_text" :for="`image${unique}`">Choose File</label>
            <transition name="slide"><span class="validation_errors" v-if="errors.has('image[]')">{{ properFormat(errors.first('image[]')) }}</span></transition>
        </div>
        <div class="form_tags_group" v-if="showTags">
            <div class="preview_group">
                <img :id="`preview_image${unique}`" :src="`${(item != null) ? item.path : ''}`" />
            </div>
            <div class="tags_group">
                <div class="form_group">
                    <label :for="`image_title${unique}`">Icon Title</label>
                    <input type="text" name="image_title[]" :id="`image_title${unique}`" autocomplete="off" class="action_form default_text" v-model="dataImage.title">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`image_title[]`)">{{ properFormat(errors.first(`image_title[]`)) }}</span></transition>
                </div>
                <div class="form_group">
                    <label :for="`image_alt${unique}`">Icon Alt</label>
                    <input type="text" name="image_alt[]" :id="`image_alt${unique}`" autocomplete="off" class="action_form default_text" v-model="dataImage.alt">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`image_alt[]`)">{{ properFormat(errors.first(`image_alt[]`)) }}</span></transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            item: {
                default: 0
            },
            unique: {
                type: Number
            },
            parent: {
                type: Number,
                default: 0
            },
            tableName: {
                type: String
            },
            dimension: {
                type: Object,
                default: function () {
                    return {
                        imageWidth: 0,
                        imageHeight: 0
                    }
                }
            }
        },
        inject: ['$validator'],
        data () {
            return {
                showTags: false,
                enabled: true,
                dataImage: {
                    title: '',
                    alt: ''
                }
            }
        },
        methods: {
            getFile (event) {
                let element = event.target
                let me = this
                if (element.files[0]) {
                    element.nextElementSibling.innerText = element.files[0].name
                    me.showTags = true
                    me.$parent.files[me.unique] = me.$refs.file.files[0]
                }
                if (element.files && element.files[0]) {
                    let reader = new FileReader()
                    reader.onload = function () {
                        let image = document.getElementById(`preview_image${me.unique}`)
                        image.src = reader.result
                    }
                    reader.readAsDataURL(element.files[0])
                }
            }
        },
        mounted () {
            let ctr = 0
            setInterval( () => {
                if (ctr < 1 && this.item) {
                    this.dataImage.title = this.item.title
                    this.dataImage.alt = this.item.alt
                    this.showTags = (this.item != 0) ? true : false
                    ctr++
                }
            }, 500)
        }
    }
</script>
