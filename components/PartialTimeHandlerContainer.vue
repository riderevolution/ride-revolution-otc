<template>
	<div class="form_time_group">
		<partial-time-handler v-for="(image, key) in times" :key="key" :unique="key" ref="timePicker" />
		<!-- <button type="button" class="action_image_add" v-if="multiple" @click="addImage()">Add Image</button> -->
	</div>
</template>

<script>
	import PartialTimeHandler from './PartialTimeHandler'
	export default {
		inject: ['$validator'],
		components: {
			PartialTimeHandler
		},
		data () {
			return {
				times: [0],
				showCloser: false
			}
		},
		methods: {
			addImage () {
				this.times.push(0)
                this.determineIfShowCloser()
			},
            determineIfShowCloser () {
				let enabledCount = 0
				setTimeout(() => {
					this.$refs.timePicker.forEach((item, index) => {
						if (item.enabled == true) {
							enabledCount++
						}
					})
					this.showCloser = (enabledCount > 1) ? true : false
				}, 10)
			}
		},
		mounted () {
			setInterval( () => {
				this.determineIfShowCloser()
			}, 500)
		}
	}
</script>
