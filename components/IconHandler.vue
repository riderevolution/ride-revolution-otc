<template>
    <div v-if="enabled">
        <div class="form_group">
            <input type="file" class="action_image" :id="`image${unique}`" name="image[]" ref="file" @change="getFile($event)" v-validate="`required|size:1000|image|ext:jpeg,jpg,png|${(dimension.imageWidth == 0) ? '' : `|dimensions:${dimension.imageWidth},${dimension.imageHeight}`}`" :required="item.path == null">
            <label class="action_image_label default_text" :for="`image${unique}`">Choose File</label>
            <transition name="slide"><span class="validation_errors" v-if="errors.has('image[]')">{{ errors.first('image[]') | properFormat }}</span></transition>
        </div>
        <div class="form_tags_group" v-if="showTags">
            <div class="preview_group">
                <img :id="`preview_image${unique}`" :src="`${(item != null) ? item.path : ''}`" />
            </div>
            <div class="tags_group">
                <div class="form_group">
                    <label :for="`image_title${unique}`">Icon Title</label>
                    <input type="text" name="image_title[]" :id="`image_title${unique}`" autocomplete="off" class="action_form default_text" v-model="dataImage.title">
                </div>
                <div class="form_group">
                    <label :for="`image_alt${unique}`">Icon Alt</label>
                    <input type="text" name="image_alt[]" :id="`image_alt${unique}`" autocomplete="off" class="action_form default_text" v-model="dataImage.alt">
                    <input type="hidden" name="image_id[]" :value="`${(item.id) ? item.id : ''}`">
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
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1) + ' ' + newValue[1].charAt(0).toUpperCase() + newValue[1].slice(1)
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                } else {
                    message = message[0].split('image[]')[1]
                }
                return `The ${newValue} field${message}`
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
        async mounted () {
            await setTimeout( () => {
                if (this.item) {
                    this.dataImage.title = this.item.title
                    this.dataImage.alt = this.item.alt
                    this.showTags = (this.item != 0) ? true : false
                }
            }, 300)
        }
    }
</script>
