<template>
    <div>
        <div class="form_flex_radio_alternate new" v-for="(data, key) in schedules" :key="key">
            <label>{{ data.schedule.start_time }} - {{ data.schedule.class_type.name }}</label>
            <div class="radio_wrapper">
                <div class="form_radio">
                    <input type="radio" :id="`status_${key}_av`" value="1" name="status[]" class="action_radio" checked @change="toggleRemarks(1)">
                    <label :for="`status_${key}_av`">Available</label>
                </div>
                <div class="form_radio">
                    <input type="radio" :id="`status_${key}_uav`" value="0" name="status[]" class="action_radio" @change="toggleRemarks(0)">
                    <label :for="`status_${key}_uav`">Unavailable</label>
                </div>
            </div>
            <div class="form_group full" v-if="!show">
                <label for="remarks">Remarks <span>*</span></label>
                <textarea name="remarks[]" rows="2" id="remarks" class="default_text" v-validate="'required|max:500'" placeholder="Enter your remarks"></textarea>
                <transition name="slide"><span class="validation_errors" v-if="errors.has('remarks')">{{ errors.first('remarks') | properFormat }}</span></transition>
            </div>
            <input type="hidden" name="scheduled_date_id[]" :value="data.id">
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            schedules: {
                default: null
            }
        },
        data () {
            return {
                show: true
            }
        },
        methods: {
            toggleRemarks (status) {
                const me = this
                if (status) {
                    me.show = true
                } else {
                    me.show = false
                }
            }
        }
    }
</script>
