<template>
    <div>
        <div class="form_flex_radio_alternate new" v-for="(data, key) in schedules" :key="key">
            <label>{{ data.schedule.start_time }} - {{ data.schedule.class_type.name }}</label>
            <div class="radio_wrapper">
                <div class="form_radio">
                    <input type="radio" :id="`status_${key}_av`" value="1" :name="`status_${key}_av`" class="action_radio" checked @change="toggleRemarks(data, 1)">
                    <label :for="`status_${key}_av`">Available</label>
                </div>
                <div class="form_radio">
                    <input type="radio" :id="`status_${key}_uav`" value="0" :name="`status_${key}_av`" class="action_radio" @change="toggleRemarks(data, 0)">
                    <label :for="`status_${key}_uav`">Unavailable</label>
                </div>
            </div>
            <div class="form_group full" v-show="!data.checked">
                <label for="remarks">Remarks <span>*</span></label>
                <textarea name="remarks[]" rows="2" id="remarks" class="default_text" placeholder="Enter your remarks"></textarea>
            </div>
            <input type="hidden" name="scheduled_date_id[]" :value="data.id">
        </div>
    </div>
</template>

<script>
    export default {
        inject: ['$validator'],
        props: {
            schedules: {
                default: null
            }
        },
        data () {
            return {
                show: true,
                options: []
            }
        },
        methods: {
            toggleRemarks (data, status) {
                const me = this
                if (status) {
                    data.checked = true
                } else {
                    data.checked = false
                }
                me.options = me.schedules
            }
        },
        mounted () {
            const me = this
            me.options = me.schedules
        }
    }
</script>
