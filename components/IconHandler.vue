<template>
    <div v-if="enabled">
        <div class="form_group">
            <input type="hidden" name="image_id[]" :value="`${(item.id) ? item.id : ''}`">
            <input type="file" class="action_image" :id="`image${unique}`" name="image[]" ref="file" @change="getFile($event)" v-validate="`${(item) ? '' : `required`}|size:20000|image|ext:jpeg,jpg,png|${(dimension.imageWidth == 0) ? '' : `|dimensions:${dimension.imageWidth},${dimension.imageHeight}`}`" :required="item.path == null">
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
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`image_title[]`)">{{ errors.first(`image_title[]`) | properFormat }}</span></transition>
                </div>
                <div class="form_group">
                    <label :for="`image_alt${unique}`">Icon Alt</label>
                    <input type="text" name="image_alt[]" :id="`image_alt${unique}`" autocomplete="off" class="action_form default_text" v-model="dataImage.alt">
                    <transition name="slide"><span class="validation_errors" v-if="errors.has(`image_alt[]`)">{{ errors.first(`image_alt[]`) | properFormat }}</span></transition>
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
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('.')
                if (newValue.length > 1) {
                    newValue = newValue[1].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].split('_')
                        if (newValue.length > 1) {
                            let firstValue = ''
                            let lastValue = ''
                            if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                                firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                            }
                            for (let i = 1; i < newValue.length; i++) {
                                if (newValue[i] != 'id') {
                                    lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                                }
                            }
                            newValue = firstValue + ' ' + lastValue
                        } else {
                            newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                        }
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
                    if (message[0].split('file').length > 1) {
                        message = message[0].split('file')[1]
                        return `The ${newValue} field${message}`
                    } else {
                        return `The ${newValue}`
                    }
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
