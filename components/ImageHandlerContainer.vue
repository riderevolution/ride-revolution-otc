<template>
	<div class="form_image_group">
        <label>Image <span>*</span> <strong v-if="dimension.imageWidth != 0">( Max: 2MB: Dimension: {{ dimension.imageWidth }} x {{ dimension.imageHeight }} )</strong></label>
		<image-handler v-for="(image, key) in images" :key="key" :unique="key" :item="image" ref="imagePicker" :parent="parent" :tableName="tableName" :dimension="dimension" />
		<!-- <button type="button" class="action_image_add" v-if="multiple" @click="addImage()">Add Image</button> -->
	</div>
</template>

<script>
	import ImageHandler from './ImageHandler'
	export default {
		props: {
			multiple: {
				type: Boolean,
				default: false
			},
			data: {
				default: ''
			},
			parent: {
				type: Number,
				default: 0
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
		components: {
			ImageHandler
		},
		data () {
			return {
				tableName: 'images',
                files: [],
				images: [0],
				showCloser: false
			}
		},
		methods: {
			addImage () {
				this.images.push(0)
                this.determineIfShowCloser()
			},
            determineIfShowCloser () {
				let enabledCount = 0
				setTimeout(() => {
					this.$refs.imagePicker.forEach((item, index) => {
						if (item.enabled == true) {
							enabledCount++
						}
					})
					this.showCloser = (enabledCount > 1) ? true : false
				}, 10)
			}
		},
		mounted () {
			let ctr = 0
			setInterval( () => {
				if (ctr < 1 && this.data != '') {
					this.images = this.data
					this.data.forEach((item, index) => {
						this.files.push(null)
					})
					ctr++
				}
				this.determineIfShowCloser()
			}, 500)
		}
	}
</script>
